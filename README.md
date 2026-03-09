# AI CTO SaaS Starter

[English](#english) | [中文](#中文)

---

<a id="english"></a>

## English

### Overview

A monorepo SaaS template designed for **AI-driven development**. This project provides a complete full-stack scaffolding for building multi-tenant SaaS applications, with built-in AI agent support to accelerate the development workflow.

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | Server Components, built-in routing |
| Mobile | Expo (managed workflow) | Cross-platform mobile app |
| Backend | Node.js | API services |
| Database | PostgreSQL + Prisma | Type-safe ORM with migrations |
| Auth | JWT + Refresh Tokens | Stateless, works for API + mobile |
| Payments | Stripe | Subscriptions & billing |
| Testing | Vitest | Fast, ESM-native testing |
| Monorepo | pnpm workspaces | Lightweight workspace management |

### Project Structure

```
ai-cto-saas-starter/
├── apps/                   # Frontend applications
│   ├── web/                #   Next.js web app
│   ├── mobile/             #   Expo mobile app
│   ├── admin/              #   Admin dashboard
│   └── api/                #   API gateway
├── services/               # Backend services
│   ├── api/                #   Core API service
│   ├── ai-service/         #   AI integration service
│   └── worker/             #   Background job processor
├── packages/               # Shared packages
│   ├── ui/                 #   Component library
│   ├── auth/               #   Authentication module
│   ├── database/           #   Prisma schema & client
│   ├── ai-sdk/             #   AI SDK wrapper
│   ├── payments/           #   Stripe integration
│   ├── analytics/          #   Analytics module
│   ├── config/             #   Shared configuration
│   └── utils/              #   Utility functions
├── ai-system/              # AI agents & module generator
├── infrastructure/         # Deployment & infra configs
├── tests/                  # Integration & E2E tests
└── docs/                   # Project documentation
```

### Getting Started

#### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL

#### Installation

```bash
# Clone the repo
git clone <repo-url>
cd ai-cto-saas-starter

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, API keys, etc.

# Run development server
pnpm dev
```

#### Environment Variables

```env
# Root .env (dev only, never commit)
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...

# apps/web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/mobile (.env)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Lint the codebase
pnpm lint

# Add a dependency to a specific package
pnpm --filter <package-name> add <dependency>
```

### Current Status

- ✅ Monorepo structure & package scaffolding
- ✅ AI module generation system
- ✅ Prompt templates
- 🔄 Module generator implementation
- ❌ Auth flow (login, register, JWT refresh)
- ❌ Stripe payment integration
- ❌ Admin dashboard
- ❌ CI/CD pipeline

### License

MIT

---

<a id="中文"></a>

## 中文

### 概述

一个为 **AI 驱动开发** 而设计的 Monorepo SaaS 模板。本项目提供完整的全栈脚手架，用于构建多租户 SaaS 应用，并内置 AI 代理支持以加速开发流程。

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | Server Components，内置路由 |
| 移动端 | Expo (托管工作流) | 跨平台移动应用 |
| 后端 | Node.js | API 服务 |
| 数据库 | PostgreSQL + Prisma | 类型安全的 ORM，支持迁移 |
| 认证 | JWT + Refresh Tokens | 无状态，适用于 API 和移动端 |
| 支付 | Stripe | 订阅与计费 |
| 测试 | Vitest | 快速、原生 ESM 测试 |
| Monorepo | pnpm workspaces | 轻量级工作区管理 |

### 项目结构

```
ai-cto-saas-starter/
├── apps/                   # 前端应用
│   ├── web/                #   Next.js Web 应用
│   ├── mobile/             #   Expo 移动应用
│   ├── admin/              #   管理后台
│   └── api/                #   API 网关
├── services/               # 后端服务
│   ├── api/                #   核心 API 服务
│   ├── ai-service/         #   AI 集成服务
│   └── worker/             #   后台任务处理器
├── packages/               # 共享包
│   ├── ui/                 #   组件库
│   ├── auth/               #   认证模块
│   ├── database/           #   Prisma Schema 与客户端
│   ├── ai-sdk/             #   AI SDK 封装
│   ├── payments/           #   Stripe 集成
│   ├── analytics/          #   数据分析模块
│   ├── config/             #   共享配置
│   └── utils/              #   工具函数
├── ai-system/              # AI 代理与模块生成器
├── infrastructure/         # 部署与基础设施配置
├── tests/                  # 集成与端到端测试
└── docs/                   # 项目文档
```

### 快速开始

#### 环境要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL

#### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd ai-cto-saas-starter

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库地址、API 密钥等

# 启动开发服务器
pnpm dev
```

#### 环境变量

```env
# 根目录 .env（仅开发环境，不要提交）
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...

# apps/web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/mobile (.env)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 开发指南

```bash
# 以开发模式运行所有应用
pnpm dev

# 构建所有包
pnpm build

# 代码检查
pnpm lint

# 为特定包添加依赖
pnpm --filter <package-name> add <dependency>
```

### 当前进度

- ✅ Monorepo 结构与包脚手架
- ✅ AI 模块生成系统
- ✅ Prompt 模板
- 🔄 模块生成器实现中
- ❌ 认证流程（登录、注册、JWT 刷新）
- ❌ Stripe 支付集成
- ❌ 管理后台
- ❌ CI/CD 流水线

### 开源协议

MIT
