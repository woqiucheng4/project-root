#!/usr/bin/env node
/**
 * MCP server: Cursor（或其他 MCP 客户端）通过 Tools 调用本仓库的 @repo/workflow，
 * 与 Web SaaS 共用同一套 Postgres + Redis + ai-runtime 流水线。
 *
 * 使用前请配置 DATABASE_URL（及可选 REDIS_*），并确保 ai-runtime 在消费队列。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as wf from '@repo/workflow';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findMonorepoRoot(): string {
  if (process.env.MONOREPO_ROOT) {
    return path.resolve(process.env.MONOREPO_ROOT);
  }
  let dir = __dirname;
  for (let i = 0; i < 20; i++) {
    const marker = path.join(dir, 'pnpm-workspace.yaml');
    if (fs.existsSync(marker)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function loadDotenv() {
  const root = findMonorepoRoot();
  loadEnv({ path: path.join(root, '.env') });
}

function ok(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function fail(message: string) {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: message }],
  };
}

async function main() {
  loadDotenv();

  const server = new McpServer({
    name: 'autonomous-loop-workflow',
    version: '1.0.0',
  });

  server.registerTool(
    'workflow_list',
    {
      description:
        '列出最近的工作流（id、title、status、updatedAt）。用于在对话中查看有哪些任务。',
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).optional().describe('最多返回条数，默认 30'),
      }),
    },
    async (args) => {
      try {
        const limit = args.limit ?? 30;
        const rows = await wf.listWorkflows(limit);
        return ok(rows);
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_create',
    {
      description: '创建新工作流（草稿）。返回 workflow id，后续工具都使用该 id。',
      inputSchema: z.object({
        requirementsText: z.string().min(1).describe('产品需求原文'),
        title: z.string().optional().describe('可选标题'),
      }),
    },
    async (args) => {
      try {
        const row = await wf.createWorkflow(args.title ?? null, args.requirementsText);
        return ok(row);
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_get',
    {
      description:
        '获取单个工作流详情（含消息列表、PRD/架构正文、todosJson、失败原因等）。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        const row = await wf.getWorkflow(args.workflowId);
        if (!row) return fail('Workflow not found');
        return ok(row);
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_start_pm',
    {
      description:
        '启动 PM 生成 PRD（入队）。需 ai-runtime 运行且 Redis 可用。状态变为 PM_RUNNING，完成后为 PRD_REVIEW。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        const row = await wf.getWorkflow(args.workflowId);
        if (!row) return fail('Workflow not found');
        await wf.enqueuePmPrdJob(args.workflowId, row.requirementsText, {
          workflowTitle: row.title,
        });
        return ok({ ok: true, workflowId: args.workflowId, note: 'PM job enqueued' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_append_user_message',
    {
      description: '向工作流追加一条用户侧讨论消息（role=USER）。可与 PM 讨论配合使用。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
        content: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        const msg = await wf.appendWorkflowMessage(args.workflowId, 'USER', args.content);
        return ok(msg);
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_request_pm_reply',
    {
      description:
        '请求 PM 基于当前消息列表生成一条回复（入队 PM_REPLY）。需先有用户消息。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        const row = await wf.getWorkflow(args.workflowId);
        if (!row) return fail('Workflow not found');
        if (!row.messages.length) {
          return fail('请先使用 workflow_append_user_message 至少发送一条用户消息');
        }
        await wf.enqueuePmReplyJob(args.workflowId);
        return ok({ ok: true, workflowId: args.workflowId, note: 'PM reply job enqueued' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_supplement_and_regenerate_prd',
    {
      description: '把补充说明合并进需求并入队重新生成 PRD。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
        supplement: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        await wf.mergeSupplementAndEnqueuePm(args.workflowId, args.supplement);
        return ok({ ok: true, workflowId: args.workflowId, note: 'Supplement merged; PM PRD job enqueued' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_approve_prd',
    {
      description: '在 PRD_REVIEW 状态下确认 PRD，并入队架构设计（ARCHITECT）。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        await wf.enqueueArchitectJob(args.workflowId);
        return ok({ ok: true, workflowId: args.workflowId, note: 'Architect job enqueued' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_approve_spec',
    {
      description: '在 SPEC_REVIEW 状态下确认技术方案与 TODO，并入队开发（DEV）。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        await wf.enqueueDevelopmentFromApprovedSpec(args.workflowId);
        return ok({ ok: true, workflowId: args.workflowId, note: 'Development job enqueued' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_uat_confirm',
    {
      description: '在 UAT_REVIEW 状态下确认验收通过，将状态标记为 COMPLETED。',
      inputSchema: z.object({
        workflowId: z.string().min(1),
      }),
    },
    async (args) => {
      try {
        await wf.confirmUat(args.workflowId);
        return ok({ ok: true, workflowId: args.workflowId, status: 'COMPLETED' });
      } catch (e) {
        return fail(e instanceof Error ? e.message : String(e));
      }
    }
  );

  server.registerTool(
    'workflow_status_help',
    {
      description: '返回工作流状态机说明（纯文本，供模型理解何时该调用哪个工具）。',
      inputSchema: z.object({}),
    },
    async () => {
      const text = `
工作流状态（WorkflowStatus）与典型下一步：
- DRAFT: 可 workflow_start_pm
- PM_RUNNING / ARCHITECT_RUNNING: 等待队列处理，可 workflow_get 轮询
- PRD_REVIEW: 可 workflow_append_user_message / workflow_request_pm_reply / workflow_supplement_and_regenerate_prd / workflow_approve_prd
- SPEC_REVIEW: 可 workflow_approve_spec
- DEVELOPMENT / QA_FIXING: 自动 Dev→QA 循环，可 workflow_get 查看
- UAT_REVIEW: 可 workflow_uat_confirm
- COMPLETED / FAILED: 流程结束；FAILED 可看 failReason

前提：PostgreSQL 已迁移、Redis 可用、pnpm -F @repo/ai-runtime dev 常驻消费队列；LLM 密钥已配置给 ai-agents。
`.trim();
      return ok({ help: text });
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
