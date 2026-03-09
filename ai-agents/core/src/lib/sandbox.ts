import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

const execAsync = promisify(exec);

export class AISandbox {
  private sessionId: string;
  private tempWorkspaceDir: string;
  private rootRepoDir: string;

  constructor(rootRepoDir: string) {
    this.sessionId = uuidv4();
    this.tempWorkspaceDir = path.join('/tmp', `ai-sandbox-${this.sessionId}`);
    this.rootRepoDir = rootRepoDir;
  }

  /**
   * Initialize sandbox by syncing the monorepo to an ephemeral temporary directory,
   * isolating the AI-generated execution from the host's actual source code.
   */
  async setup() {
    logger.info(`[Sandbox] Setting up isolated workspace at ${this.tempWorkspaceDir}`);
    await fs.mkdir(this.tempWorkspaceDir, { recursive: true });
    
    // Copy all basic files except unneeded node_modules (forces clean install inside)
    const rsyncCmd = `rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='.next' ${this.rootRepoDir}/ ${this.tempWorkspaceDir}/`;
    try {
      await execAsync(rsyncCmd);
    } catch (e: any) {
      // Graceful fallback if rsync isn't available
      logger.warn(`[Sandbox] rsync failed, using standard cp (${e.message})`);
      await execAsync(`cp -r ${this.rootRepoDir}/* ${this.tempWorkspaceDir}/`);
    }
  }

  /**
   * Inject the AI-generated code patch directly into the sandbox file tree.
   */
  async injectFilePath(filepath: string, content: string) {
    logger.info(`[Sandbox] Injecting AI file changes -> ${filepath}`);
    const fullPath = path.join(this.tempWorkspaceDir, filepath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }

  /**
   * Run commands in the Docker Sandbox.
   * If docker is not present (e.g. CI runner), it gracefully executes directly inside the temp folder.
   */
  async executeAction(commandAction: 'install' | 'build' | 'test' | 'custom', customCmd?: string) {
    let cmd = '';
    switch (commandAction) {
      case 'install':
        cmd = 'pnpm install --frozen-lockfile=false';
        break;
      case 'build':
        cmd = 'pnpm build';
        break;
      case 'test':
        cmd = 'pnpm test';
        break;
      case 'custom':
        cmd = customCmd || 'echo no-op';
        break;
    }

    try {
      // Ensure Docker runs standard limits
      const dockerRun = `docker run --rm \\
        -v ${this.tempWorkspaceDir}:/workspace \\
        --memory="1g" \\
        --cpus="1.5" \\
        ai-sandbox:latest \\
        sh -c "${cmd}"`;

      logger.info(`[Sandbox] Executing inside Docker image: ${cmd}`);
      const { stdout, stderr } = await execAsync(dockerRun, { timeout: 120000 });
      return { success: true, stdout, stderr };

    } catch (error: any) {
      // Docker missing / failed -> Fallback to Host Isolation for demonstration compatibility
      if (error.message.includes('command not found') || error.message.includes('Cannot connect')) {
         logger.warn(`[Sandbox] Docker not available on host. Falling back to Host Node execution in tmp folder for ${cmd}`);
         try {
           const { stdout, stderr } = await execAsync(`cd ${this.tempWorkspaceDir} && ${cmd}`, { timeout: 120000 });
           return { success: true, stdout, stderr };
         } catch (hostError: any) {
           return { success: false, stdout: hostError.stdout || '', stderr: hostError.stderr || hostError.message };
         }
      }

      return { 
        success: false, 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message 
      };
    }
  }

  /**
   * Clean up the session resources.
   */
  async cleanup() {
    logger.info(`[Sandbox] Cleaning up workspace ${this.tempWorkspaceDir}`);
    await fs.rm(this.tempWorkspaceDir, { recursive: true, force: true }).catch(() => {});
  }
}
