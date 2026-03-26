/**
 * 国考/省考职位表 Excel 解析器
 * 
 * 使用方式：
 *   1. npm install xlsx  (如果尚未安装)
 *   2. 将下载的职位表 Excel 放到 data/raw/ 目录下
 *   3. node scripts/parse-jobs.js data/raw/2025国考职位表.xlsx
 * 
 * 输出：data/jobs-parsed.json
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 字段映射（适配国考职位表列名，不同年份列名可能微调）
const COLUMN_MAP = {
  '部门名称': 'department',
  '招录机关': 'department',
  '用人司局': 'bureau',
  '机构性质': 'orgType',
  '招考职位': 'jobTitle',
  '职位属性': 'jobAttr',
  '职位分布': 'jobLocation',
  '职位简介': 'jobDesc',
  '职位代码': 'jobCode',
  '机构层级': 'orgLevel',
  '考试类别': 'examType',
  '招考人数': 'recruitCount',
  '专业': 'majorRequired',
  '学历': 'educationRequired',
  '学位': 'degreeRequired',
  '政治面貌': 'politicsRequired',
  '基层工作最低年限': 'grassrootsYears',
  '服务基层项目工作经历': 'grassrootsProject',
  '是否在面试阶段组织专业能力测试': 'hasProfTest',
  '面试人员比例': 'interviewRatio',
  '面试人选与计划录用人数的确定比例': 'interviewRatio',
  '工作地点': 'workLocation',
  '落户地点': 'settleLocation',
  '备注': 'notes',
  '部门网站': 'website',
  '咨询电话1': 'phone',
  '咨询电话': 'phone',
};

function parseExcel(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  console.log(`📂 正在解析: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  let allValidJobs = [];

  for (const sheetName of workbook.SheetNames) {
    console.log(`\n  -> 正在解析 Tab: [${sheetName}]`);
    const sheet = workbook.Sheets[sheetName];
    // range: 1 让它从第二行开始读取作为表头（因为国考表第一行往往是一句通栏的警示语）
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 1 });

    console.log(`  📊 该 Tab 共读取 ${rawData.length} 行原始数据`);

    const jobs = rawData.map((row, index) => {
      const job = { _sheet: sheetName, _rowIndex: index + 2 };
      
      for (const [cnKey, enKey] of Object.entries(COLUMN_MAP)) {
        // 尝试多种可能的列名变体
        const value = row[cnKey] || row[cnKey.replace(/\s/g, '')] || '';
        job[enKey] = typeof value === 'string' ? value.trim() : value;
      }

      // 自动补全缺失字段
      if (!job.jobCode && row['职位代码'] === undefined) {
        // 有些表的列名可能不同，尝试模糊匹配
        for (const key of Object.keys(row)) {
          if (key.includes('代码')) job.jobCode = String(row[key]).trim();
          if (key.includes('人数') && !job.recruitCount) job.recruitCount = row[key];
          if (key.includes('学历') && !job.educationRequired) job.educationRequired = String(row[key]).trim();
          if (key.includes('专业') && !job.majorRequired) job.majorRequired = String(row[key]).trim();
          if (key.includes('政治') && !job.politicsRequired) job.politicsRequired = String(row[key]).trim();
        }
      }

      // 数值化
      job.recruitCount = parseInt(job.recruitCount) || 1;

      // 推导限制条件等级
      job.restrictionLevel = calculateRestrictionLevel(job);

      return job;
    });

    // 过滤空行
    const validJobs = jobs.filter(j => j.jobCode || j.department);
    console.log(`  ✅ 该 Tab 提取有效岗位: ${validJobs.length}`);
    
    allValidJobs = allValidJobs.concat(validJobs);
  }

  console.log(`\n🎉 所有 Tab 解析完毕，总计有效岗位: ${allValidJobs.length}`);
  return allValidJobs;
}

function calculateRestrictionLevel(job) {
  let score = 0;
  
  // 专业限制
  const major = (job.majorRequired || '').toLowerCase();
  if (major.includes('不限')) score += 0;
  else if (major.includes('、') || major.includes('及')) score += 2; // 限多个专业
  else score += 3; // 限单个专业类

  // 学历限制
  const edu = job.educationRequired || '';
  if (edu.includes('博士')) score += 3;
  else if (edu.includes('硕士')) score += 2;
  else if (edu.includes('本科')) score += 1;

  // 政治面貌
  const politics = job.politicsRequired || '';
  if (politics.includes('党员')) score += 2;

  // 基层经历
  const grassroots = job.grassrootsYears || '';
  if (grassroots && grassroots !== '无限制' && grassroots !== '不限') score += 2;

  // 备注中的特殊限制
  const notes = (job.notes || '').toLowerCase();
  if (notes.includes('应届') || notes.includes('毕业生')) score += 2;
  if (notes.includes('男性') || notes.includes('男生')) score += 1;
  if (notes.includes('服务期') || notes.includes('三支一扶') || notes.includes('西部计划')) score += 3;

  // 限制等级：0-3 三不限, 4-6 低限制, 7-9 中限制, 10+ 高限制
  if (score <= 3) return '三不限';
  if (score <= 6) return '低限制';
  if (score <= 9) return '中限制';
  return '高限制';
}

// 执行入口
const inputFile = process.argv[2];
if (!inputFile) {
  console.log('用法: node scripts/parse-jobs.js <职位表Excel路径>');
  console.log('示例: node scripts/parse-jobs.js data/raw/2025国考职位表.xlsx');
  process.exit(1);
}

const jobs = parseExcel(inputFile);
const outputPath = path.join(__dirname, '..', 'data', 'jobs-parsed.json');
fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2), 'utf-8');
console.log(`💾 已保存到: ${outputPath}`);

// 输出统计
const stats = {
  总岗位数: jobs.length,
  总招录人数: jobs.reduce((s, j) => s + j.recruitCount, 0),
  限制等级分布: {}
};
jobs.forEach(j => {
  stats.限制等级分布[j.restrictionLevel] = (stats.限制等级分布[j.restrictionLevel] || 0) + 1;
});
console.log('\n📈 统计摘要:');
console.log(JSON.stringify(stats, null, 2));
