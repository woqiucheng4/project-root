---
description: 批量导入结构库和公务员考试职位表现有数据并二次分析自动化构建知识库
---

# 概述

当有新公布的历年国考或省考职位表需要录入系统时，本工作流可以自动化处理数据的解析、去重以及自然语言二次分析提取潜规则。

## 操作步骤

1. **准备原始 Excel 数据**
   获取最新一年的职位表 Excel 文件，并将其放置于 `kaogong/data/raw/` 文件夹下。确保其包含表头：“部门名称”、“职位属性”、“专业”、“学历”。如果第一行是全宽合并单元格（如警戒语，这是国考表的常见情况），可以直接跳过，脚本已支持自适应。

2. **执行第一步结构化解析脚本**
   执行以下自动化命令将 Excel 行转换为 JSON，并计算限制等级。请替换命令中的实际文件名为你的 Excel 名字：

// turbo
```bash
cd /Users/sophia/Documents/Monorepo/kaogong
# 注意：请将 1111.xls 替换成真正需要导入的 Excel 文件名称！
node scripts/parse-jobs.js data/raw/1111.xls
```

3. **执行第二步 NLP 洗数据与历史进面分数增强脚本**
   利用内置的正则表达式和分层规则从备注中抽取隐形护城河门槛（如女性优先、出海岗、需有法律从业证），并按照城市 GDP 等级和限制苛刻程度倒推 3 年模拟进面分数：

// turbo
```bash
cd /Users/sophia/Documents/Monorepo/kaogong
node scripts/enhance-jobs.js
```

4. **完成与数据校验**
   查看 `data/jobs-parsed.json` 确认数据是否正确附加了 `hiddenTags` 和 `historicalData` 字段。成功后新数据会自动对用户选岗推荐引擎生效。
