# AI公考上岸助手 - 架构设计

## 一、系统架构总览

```
┌─────────────────────────────────────────────────────┐
│                    前端 (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  首页     │  │  结果页   │  │  支付页   │           │
│  │ (表单输入) │  │ (报告展示)│  │ (付费解锁)│           │
│  └──────────┘  └──────────┘  └──────────┘           │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP API
┌───────────────────▼─────────────────────────────────┐
│              后端 API Routes (Next.js)               │
│  ┌──────────────────────────────────────────────┐   │
│  │            业务逻辑层 (Services)               │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │   │
│  │  │规则引擎 │ │评分引擎 │ │竞争评估 │ │AI引擎 │ │   │
│  │  └────────┘ └────────┘ └────────┘ └───┬───┘ │   │
│  └───────────────────────────────────────┼──────┘   │
└──────────────────────────────────────────┼──────────┘
                                           │
                                ┌──────────▼──────────┐
                                │  DeepSeek API       │
                                └─────────────────────┘
```

## 二、技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端框架 | Next.js 14 (App Router) | SSR支持SEO、API Routes内置后端、Vercel原生部署 |
| UI组件 | React + 原生CSS | 灵活控制样式，打造精美界面 |
| 后端 | Next.js API Routes | 无需额外服务器，前后端一体 |
| AI接口 | DeepSeek API | 成本低、中文优化好 |
| 支付 | 微信支付 H5 | 目标用户主力支付方式 |
| 部署 | Vercel | 免运维、自动CI/CD |
| 数据存储 | JSON配置文件 (MVP) | MVP阶段无需数据库，规则和参数用配置文件管理 |

## 三、目录结构设计

```
kaogong/
├── public/                    # 静态资源
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── layout.js          # 全局布局
│   │   ├── page.js            # 首页（信息输入）
│   │   ├── result/
│   │   │   └── page.js        # 结果页（报告展示）
│   │   ├── payment/
│   │   │   └── page.js        # 支付页
│   │   └── api/               # API Routes
│   │       ├── analyze/
│   │       │   └── route.js   # 分析接口
│   │       ├── payment/
│   │       │   └── route.js   # 支付接口
│   │       └── report/
│   │           └── route.js   # 报告查询接口
│   ├── components/            # React 组件
│   │   ├── forms/             # 表单组件
│   │   │   ├── UserInfoForm.jsx
│   │   │   ├── StepIndicator.jsx
│   │   │   └── FormField.jsx
│   │   ├── report/            # 报告组件
│   │   │   ├── BonusLevel.jsx      # 红利等级
│   │   │   ├── JobRecommend.jsx     # 岗位推荐
│   │   │   ├── CompetitionChart.jsx # 竞争分析
│   │   │   ├── AvoidPitfalls.jsx    # 避坑建议
│   │   │   └── StudyPlan.jsx        # 备考策略
│   │   ├── payment/           # 支付组件
│   │   │   ├── PayWall.jsx
│   │   │   └── PriceCard.jsx
│   │   └── common/            # 通用组件
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── Loading.jsx
│   │       └── AnimatedCard.jsx
│   ├── services/              # 业务逻辑层（核心）
│   │   ├── ruleEngine.js      # 规则引擎 - 岗位筛选
│   │   ├── bonusScoring.js    # 身份红利评分
│   │   ├── competition.js     # 竞争烈度评估
│   │   ├── jobScoring.js      # 岗位综合评分
│   │   └── aiAnalyzer.js      # AI分析报告生成
│   ├── config/                # 配置文件
│   │   ├── formFields.js      # 表单字段配置
│   │   ├── scoringRules.js    # 评分规则配置
│   │   ├── competition.js     # 竞争参数配置
│   │   └── regions.js         # 地域配置
│   ├── utils/                 # 工具函数
│   │   ├── validators.js      # 表单验证
│   │   └── formatters.js      # 数据格式化
│   └── styles/                # 样式文件
│       ├── globals.css        # 全局样式与设计系统
│       ├── form.css           # 表单样式
│       ├── report.css         # 报告样式
│       └── payment.css        # 支付样式
├── docs/                      # 项目文档
├── package.json
├── next.config.js
└── README.md
```

## 四、核心数据流

### 4.1 分析请求流程

```
[用户填写表单]
      │
      ▼
[POST /api/analyze]
      │
      ▼
[① 规则引擎] ── 筛选符合条件的岗位类型
      │
      ▼
[② 身份红利评分] ── 计算用户身份红利等级(T0/T1/普通/三不限)
      │
      ▼
[③ 竞争烈度评估] ── 计算各方向竞争指数
      │
      ▼
[④ 岗位综合评分] ── 加权评分排序
      │
      ▼
[⑤ AI分析引擎] ── 调用DeepSeek生成分析报告
      │
      ▼
[生成reportId，存储结果]
      │
      ▼
[返回 reportId + 免费内容]
```

### 4.2 核心数据结构

```javascript
// 用户输入
UserInput = {
  education: "本科" | "硕士" | "博士",
  isFullTime: boolean,
  major: string,
  graduationYear: number,
  isFreshGrad: boolean,
  politicalStatus: "群众" | "团员" | "党员",
  targetRegion: string,
  acceptTownship: boolean,
  certificates: string[],       // 可选
  grassrootsExp: boolean,       // 可选
  hasExamExp: boolean,          // 可选
  xingceScore: number,          // 可选
  shenlunScore: number,         // 可选
  dailyStudyHours: number       // 可选
}

// 分析报告
AnalysisReport = {
  reportId: string,
  createdAt: timestamp,
  isPaid: boolean,
  // 免费内容
  free: {
    bonusLevel: "T0" | "T1" | "普通" | "三不限",
    direction: string,          // 岗位方向概述
    briefTip: string            // 简要提示
  },
  // 付费内容
  paid: {
    topJobs: JobRecommendation[5],
    competitionAnalysis: CompetitionDetail[],
    avoidPitfalls: string[],
    studyPlan: StudyPlan
  }
}

// 岗位推荐
JobRecommendation = {
  rank: number,
  jobType: string,
  matchScore: number,           // 匹配度
  successRate: number,          // 上岸概率
  qualityScore: number,         // 岗位质量
  riskScore: number,            // 风险系数
  finalScore: number,           // 综合评分
  analysis: string              // AI分析说明
}
```

## 五、API 设计

### 5.1 分析接口

```
POST /api/analyze
Request: UserInput
Response: {
  reportId: string,
  freeContent: FreeReport,
  hasPaidContent: boolean
}
```

### 5.2 支付接口

```
POST /api/payment
Request: { reportId: string }
Response: { paymentUrl: string, orderId: string }
```

### 5.3 报告查询接口

```
GET /api/report?id={reportId}
Response: {
  freeContent: FreeReport,
  paidContent: PaidReport | null  // 未支付则为null
}
```

## 六、AI Prompt 设计思路

```
系统角色：你是一位资深公考选岗顾问，精通国考/省考报考策略。

输入信息：
- 用户画像（学历、专业、政治面貌等）
- 身份红利评分结果
- 竞争烈度评估结果
- 岗位匹配评分结果

输出要求（JSON格式）：
1. 红利等级解读（为什么是这个等级，有什么优势）
2. Top5岗位推荐（具体岗位类型+推荐理由）
3. 竞争分析（主要竞争对手画像、难度评估）
4. 避坑建议（绝对不能报的方向、常见误区）
5. 备考策略（时间规划、重点科目、提分建议）
```

## 七、安全与性能

### 7.1 安全考虑
- DeepSeek API Key 通过环境变量管理，不暴露到前端
- 用户数据仅用于分析，不做持久化存储（MVP阶段）
- 支付接口做签名验证

### 7.2 性能考虑
- AI分析接口使用流式返回（SSE），提升用户体验
- 前端表单使用分步加载，减少首屏渲染压力
- 报告页使用骨架屏，等待AI返回时保持良好体验
