# Cursor 中通过 MCP 驱动工作流（SaaS 后端）

`@repo/mcp-workflow` 提供 **stdio MCP 服务**，与 Web 控制台、`@repo/workflow`、`ai-runtime` **共用同一数据库与 Redis 队列**。你在 **Cursor 聊天**里让模型调用 Tools，即可创建/推进工作流，无需打开浏览器。

## 前提

与 [README 工作流验证](../README.md) 相同：

- PostgreSQL + Redis（可用 `docker-compose.workflow.yml`）
- 已 `prisma db push`，根目录 `.env` 含 `DATABASE_URL`、`REDIS_*`、LLM 相关变量
- **`pnpm -F @repo/ai-runtime dev` 常驻**（消费 PM / ARCHITECT / DEV / QA 等任务）
- 已执行 `pnpm build`（生成 `packages/mcp-workflow/dist/index.js`）

## 在 Cursor 里注册 MCP

1. 打开 **Cursor Settings → MCP**（或 **Features → MCP**），添加 **New MCP Server**。
2. 使用 **stdio** 方式，命令指向本仓库构建产物，**工作目录**设为 monorepo 根目录（以便读取 `.env`；也可在 `env` 里显式写 `DATABASE_URL`）。

示例（请把 `REPO` 换成你的本机绝对路径）：

```json
{
  "mcpServers": {
    "autonomous-workflow": {
      "command": "node",
      "args": ["REPO/packages/mcp-workflow/dist/index.js"],
      "cwd": "REPO",
      "env": {
        "DATABASE_URL": "postgresql://dev:dev@localhost:5432/autonomous_loop",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "MONOREPO_ROOT": "REPO"
      }
    }
  }
}
```

> 不同 Cursor 版本 MCP 配置的存放位置可能为 **项目级** 或 **用户级 JSON**；若界面与上述字段略有差异，以当前版本的「Stdio / Command / Args / Cwd / Env」为准。

## 提供的 Tools（名称）

| Tool | 作用 |
|------|------|
| `workflow_status_help` | 返回状态机说明，便于模型选对下一步 |
| `workflow_list` | 列出最近工作流 |
| `workflow_create` | 创建草稿工作流 |
| `workflow_get` | 拉取详情（含 PRD、架构、消息、失败原因） |
| `workflow_start_pm` | 入队生成 PRD |
| `workflow_append_user_message` | 追加用户讨论消息 |
| `workflow_request_pm_reply` | 入队 PM 回复（需先有用户消息） |
| `workflow_supplement_and_regenerate_prd` | 补充需求并重生成 PRD |
| `workflow_approve_prd` | 确认 PRD → 入队架构 |
| `workflow_approve_spec` | 确认方案 → 入队开发 |
| `workflow_uat_confirm` | 验收通过 → `COMPLETED` |

## 本地调试（不经 Cursor）

```bash
cd /path/to/project-root
pnpm mcp:workflow
```

进程从 stdin 读 MCP JSON-RPC；直接跑不会输出交互提示，仅用于确认无启动错误。

## 与 Web 的关系

- **同一 `Workflow` 表**：在 Cursor 里创建的工作流可在 `http://localhost:3000/workflows` 查看。
- **对话在 Cursor、状态在 DB**：模型推理在 Cursor；落库与队列入队由 MCP → `@repo/workflow` 完成。
