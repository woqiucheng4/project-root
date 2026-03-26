# AI公考上岸助手 - 部署与域名方案

## 一、Vercel 10分钟部署指南

### 前置准备
- GitHub 账号
- Vercel 账号（用 GitHub 登录即可）
- DeepSeek API Key（从 https://platform.deepseek.com 获取）

### 部署步骤

```bash
# 第1步：进入项目目录
cd /Users/sophia/Documents/Monorepo/kaogong

# 第2步：初始化 Git 仓库并推送到 GitHub
git init
git add .
git commit -m "feat: AI公考上岸助手 MVP"
# 在 GitHub 创建一个新仓库后：
git remote add origin https://github.com/你的用户名/kaogong.git
git branch -M main
git push -u origin main
```

### 第3步：Vercel 一键部署
1. 打开 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择刚才推送的 `kaogong` 仓库
4. 配置环境变量：
   - `DEEPSEEK_API_KEY` = 你的 DeepSeek API Key
5. 点击 **Deploy**
6. 等待 1-2 分钟，得到一个 `https://kaogong-xxx.vercel.app` 的地址

### 第4步：绑定自定义域名（买好后）
1. 进入 Vercel 项目 → Settings → Domains
2. 输入你的域名，点击 Add
3. 根据提示去域名商添加 CNAME 记录指向 `cname.vercel-dns.com`
4. 等待 DNS 生效（通常 5-30 分钟）

> ⚠️ Vercel 默认提供 HTTPS，无需额外配置 SSL。
> ⚠️ 使用海外域名商（如 Namecheap、GoDaddy）可免备案。

---

## 二、品牌域名推荐（5选1）

| 域名 | 含义 | 品牌感 | 参考价 |
|------|------|--------|--------|
| `shangàn.com` → `shangan.co` | "上岸"谐音，直击用户心理 | ⭐⭐⭐⭐⭐ | ~$12/年 |
| `kaogong.pro` | "考公"拼音 + .pro 专业感 | ⭐⭐⭐⭐⭐ | ~$10/年 |
| `gongkao.ai` | "公考" + .ai 彰显AI科技属性 | ⭐⭐⭐⭐⭐ | ~$60/年 |
| `xuangang.app` | "选岗"拼音 + .app 工具感 | ⭐⭐⭐⭐ | ~$15/年 |
| `shanganlu.com` | "上岸路"品牌故事感 | ⭐⭐⭐⭐ | ~$10/年 |

### 推荐购买平台（免备案）
- **Namecheap** — 便宜 + 隐私保护免费
- **Cloudflare Registrar** — 零加价 + 全球CDN加速
- **Google Domains** → 已转到 Squarespace

### 域名策略
1. **前期（现在）**：先用 `xxx.vercel.app` 免费子域名验证产品
2. **中期（有用户后）**：花 $10-60 买一个品牌域名绑定
3. **后期（变现稳定）**：买 `.com` 域名 + 国内备案 + 接入微信支付

---

## 三、信任感页面组件说明

已在首页集成以下信任增强模块：

### 3.1 数据社会证明条
- 显示「已服务 XX 位考生」「报告准确率 XX%」等关键数据
- 使用计数动画，增强真实感

### 3.2 用户好评轮播
- 3条模拟真实用户评价
- 自动轮播 + 头像 + 姓名脱敏

### 3.3 安全保障横幅
- 数据安全 / AI深度分析 / 满意度保障
- 使用图标 + 简洁文案

### 3.4 底部行动号召
- 「限时特价 ¥9.9」强调紧迫感
- 引导向上滚动填写表单
