# 🎯 AI 公考智能精准选岗预测引擎 (KaoGong AI)

本系统是一款极高壁垒的 **“公考/省考智能辅助报考系统”**。不同于传统市面上静态的“历年数据查询工具”，本工具利用千亿大模型（AI）与深度结构化的考情算法，能在几分钟内为数万考生出具最强容错率的报考预测、核心竞争评估及精准落地的 Top 5 指导策略。

## 🌟 核心独家特色 (Features)

1. **🚀 毫秒计算引擎 (Deep Parsing Engine)**
   - 自动解析长达数万行的杂乱国家/各省 Excel 官方职位表，直接剥离非结构化噪音。
   - 内置强大的 **NLP 解析模型** 对岗位“备注”实现深度开采。自动识别 `四六级限制`、`高净值证书门槛(CPA/法考)`、`潜在性别选择及出海下乡限制`。

2. **⚖️ 动态博弈精准推荐系统 (Top-5 Radar)**
   - 不是“瞎蒙推荐”。结合考生的“学历/专业背景”、“特定工作倾向（写材料/常挂外勤）”及“城市驻地 GDP 热度要求”，全维度进行竞争算法打分。为考生生成最高性价比的**保底下盘点**。
   - **自动化捡漏神器**：基于独家脚本雷达全自动扫描每日“过审激增”或者“无人问津洼地”。

3. **📱 极致商业闭环与变现生态 (Commercialization)**
   - 独创 **“犹抱琵琶半遮面”的电商级 SaaS 付费墙**。利用盲盒机制展示诱导性岗位的亮点吸引付费，解锁后自动呈交深度完整的千层报告。
   - 底端预埋公考头部培训机构教培课程 **自动 CPS 引流模块**，配合长线微信服务号（OA）模板消息盯盘触达，锁定高昂用户生命周期（LTV）终局变现。

---

## 🏗️ 架构设施 (Tech Stack)

*   **框架核心**: `Next.js 14` (App Router SSR 模式) 保证最佳加载和卓越 SEO 数据。
*   **通信与鉴权**: 集成了全套 `WeChat OAuth 2.0` 用户体系与无感 OpenID Session 管理机制。
*   **服务层设计**:
    *   `src/services/dataLoader.js`: 万物之源，对接清洗后 JSON 矿的核心库。
    *   `src/services/aiAnalyzer.js`: 万能分析师，无缝对话主流通用语言大模型 (如 Deepseek、GPT)。
    *   `src/services/jobRecommender.js`: 核心估值量化天秤，用苛刻算法筛选皇冠上的明珠职位。

---

## 🛠️ 本地启动与部署 (Getting Started)

1. **环境安装与下载**
   ```bash
   cd kaogong
   npm install
   ```

2. **核心环境变量** (请在此刻根目录新建 `.env` 或在对应商用平台配置)：
   ```env
   # 驱动生成极速报告的人工智能大模型 API KEY (如 DeepSeek)
   DEEPSEEK_API_KEY="your-deepseek-or-llm-api-token"
   # 用于微信盯盘自动消息触达
   WX_APP_ID="your-wechat-oa-app-id"
   WX_APP_SECRET="your-wechat-oa-secret"
   NEXT_PUBLIC_DOMAIN="https://您的服务商公网生产域名.com"
   ```

3. **本地唤醒验证 (Dev Server)**
   ```bash
   npm run dev
   # 打开 http://localhost:3000 进行体验
   ```

4. **一键上云 (Production Deployment)**
   完美适配 Vercel 或各大现代化轻量容器托管平台。请遵循 `docs/05-deploy-domain.md` 操作标准执行。

---

## 📚 项目内务与高级功能说明

关于如何操控项目中那个极为神秘、每天都能全息网罗搜刮公考最新动态数据的“无人值守大爬虫编队”，请查阅本系统的专属说明书：
👉 **`docs/08-crawler-guide.md`**
