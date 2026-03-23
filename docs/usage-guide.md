# 🚀 AI 自主编码循环平台（AI Autonomous Coding Loop）使用指南

欢迎使用 AI 自主编码循环平台！本工程是一个基于 Node.js 和 PNPM Workspaces 的生产级单体仓库 (Monorepo)，核心理念是通过多种 AI Agent（如开发、测试、文档编写协作）来完成端到端的自动化软件开发生命周期核心闭环。

---

## 🏗 工程目录结构解读


- **`apps/`**: 面向终端用户的应用（例如 Web 控制台 Dashboard 和 CLI 命令行工具）。
- **`services/`**: 后端微服务（例如 API 网关、数据库处理服务等）。
- **`packages/`**: 跨端共享代码库（包含共享业务逻辑、数据库 Prisma 模型定义、UI 组件库、工具库等）。
- **`ai-runtime/`**: **核心大脑**，负责调度各大 AI Agent 的任务流转、状态维护和消息队列（基于 BullMQ + Redis）。
- **`ai-agents/`**: 专业化的 AI 子代理集合（例如 `DevAgent` 负责写代码，`QAAgent` 负责在沙盒中跑测试，`DocAgent` 负责自动写文档）。
- **`docs/`**: 系统文档与部署指南等。

---

## 🛠 本地环境与核心依赖准备

在开始上手之前，请确保您的开发机器已经安装了以下底层软件：
1. **Node.js** (>= 20.0.0) 和 **PNPM** (>= 9.0.0)。
2. **Docker**: `QAAgent` 强依赖 Docker 来创建独立沙盒 (Sandbox) 执行并测试 AI 生成的代码。
3. **Redis**: `ai-runtime` 的任务队列分发需要基于 Redis。
4. **大语言模型环境 (二选一)**:
   - *在线模式*：准备好 OpenAI API Key 或者任何兼容的云端 API（如 DeepSeek/智谱等）。
   - *离线/本地模式*：安装并运行 [Ollama](https://ollama.com/)，并在本地拉取大模型（推荐 `qwen:7b` 或 `deepseek-coder`）。

---

## ⚙️ 快速初始化与配置

### 1. 基础服务启动
如果你是在本地开发环境，首先启动全局的 Redis 支撑任务队列：
```bash
docker run -d --name local-redis -p 6379:6379 redis
```

### 2. LLM 与 AI Agent 环境配置
在 `ai-agents/core/` 目录下复制配置文件：
```bash
cd ai-agents/core
cp .env.example .env
```
根据你的网络情况，编辑 `.env` 文件：
```ini
# [在线模式] 如果你网络畅通，配置在线模型
OPENAI_API_KEY=sk-xxxxxx
OPENAI_MODEL=gpt-4o

# [本地/断网模式] 如果你想在高铁上或者不触网开发，配置本地 Ollama
LOCAL_OPENAI_BASE_URL=http://localhost:11434/v1
LOCAL_OPENAI_MODEL=qwen:7b

# 想强制屏蔽外网 API 请求，仅使用本地模型时，设置为 true
OFFLINE_MODE=true
```
*(注：系统内置了**智能 Fallback 机制**。即便是优先走外网，如果外网超时断掉，它也会毫秒级切回本地的 Ollama 处理后续开发任务。)*

### 3. 安装依赖与构建
在工程根目录 (`Monorepo/`) 下执行安装：
```bash
pnpm install
pnpm build
```

---

## 🚀 平台启动与使用演示

### 1. 启动完整的微服务与 AI 引擎
在根目录执行：
```bash
pnpm run dev
```
此时：
- `ai-runtime` 将开始监听 Redis 中的构建任务需求。
- 各大前端 Web App 和后端 Service 开始监听端口。

### 2. 它是如何自动写代码的？(Agent 交互流转)
当你（通过 HTTP 请求或者 CLI 工具）向系统发布一个新需求（Task）时：

1. **🕵️规划与拆解**：系统会将你的需求拆分成具体的结构化任务。
2. **💻 开发 Agent (`DevAgent`)**：读取你的上下文，调用大语言模型（在线 GPT-4o 或本地 Qwen/DeepSeek），定位到需要修改的具体 `targetFile`，直接注入新代码，并顺手帮你写好 `Vitest` 或 `Playwright` 自动化测试。
3. **🧪 质检 Agent (`QAAgent`)**：DevAgent 写完后，将代码流转给 QAAgent。QAAgent 会利用本机的 `Docker` 瞬间启动一个安全隔离的沙盒（Sandbox），把代码挂载进去跑 `pnpm test`。
   - *测试通过 ✅*: 发给代码审查审查 Agent 和 文档 Agent。
   - *测试失败 ❌*: 抓取报错的 StdErr 日志，打回给 DevAgent，让大语言模型自我修复 Bug，直到测试通过为止！
4. **📝 文档 Agent (`DocAgent`)**：代码就绪后，它会自动阅读变更 Diff，更新项目的 README 或者 API 文档。

这就是本平台的强大之处 —— 将人类从“编写-测试-修Bug-写文档”的重复劳动中解放出来，变成一个完全闭环流水线！

---

## 💡 进阶：如何添加新的 Agent？

若想让系统支持新的专业化角色（比如一个专门做代码审查的 `ReviewAgent`），请参照遵循以下步骤：
1. 进入 `ai-agents/core/src/` 创建新的文件夹，继承 `BaseAgent` 类。
2. 在 `execute(task: AgentTask)` 方法中编写业务逻辑。如果涉及大语言模型，可以使用 `import { generateWithFallback } from '../lib/llm'`，享受内置的离线切换特性。
3. 在 `ai-runtime` 的任务分配器（Queue Orchestrator）中注册你新 Agent 的队列 Topic。
