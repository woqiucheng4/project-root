/**
 * 数据增强脚本 (Phase 1)
 * 
 * 1. 使用 NLP / 正则对岗位的“备注”字段进行二次深度清洗，提取隐藏门槛（四六级、证书、性别倾向、户籍限制）。
 * 2. 逆向生成历年（近3年）的模拟进面分数线和报录比数据。
 * 
 * 使用方式：
 * node scripts/enhance-jobs.js
 */

const fs = require('fs');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '..', 'data', 'jobs-parsed.json');
const REGIONS_FILE = path.join(__dirname, '..', 'data', 'regions.json');

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ============== 1. NLP 备注清洗逻辑 ==============

function extractHiddenRequirements(notes) {
  const text = (notes || '').toLowerCase();
  
  const tags = {
    cetLevel: '无要求',
    certifications: [],
    genderReq: '不限',
    domicileReq: '不限'
  };

  if (!text) return tags;

  // 1. 英语四六级
  if (text.match(/(英语六级|六级考试|cet-6|cet6|425分及以上.*六级)/)) {
    tags.cetLevel = 'CET-6';
  } else if (text.match(/(英语四级|四级考试|cet-4|cet4|425分及以上.*四级)/)) {
    tags.cetLevel = 'CET-4';
  } else if (text.match(/英语专八|专业八级/)) {
    tags.cetLevel = 'TEM-8';
  } else if (text.match(/英语专四|专业四级/)) {
    tags.cetLevel = 'TEM-4';
  }

  // 2. 资格证书 (可扩展)
  const certPatterns = {
    '法律职业资格A类': /(法律职业资格|司法考试).*a类/,
    '法律职业资格C类及以上': /(法律职业资格|司法考试).*(c类|b类)/,
    'CPA/注册会计师': /(注册会计师|cpa)/,
    '初级会计职称': /初级会计/,
    '中级会计职称': /中级会计/,
    '执业医师资格证': /医师资格/,
    '建造师': /建造师/,
    '计算机二/三/四级': /计算机.*(二|三|四)级/
  };

  for (const [certName, regex] of Object.entries(certPatterns)) {
    if (regex.test(text)) {
      tags.certifications.push(certName);
    }
  }

  // 3. 性别倾向 (通常通过工作性质隐晦表达)
  if (text.match(/(适合男性|经常夜班|高强度外勤|出海|登船|值大夜班|男性|男生为主)/)) {
    tags.genderReq = '倾向男性';
  } else if (text.match(/(适合女性|女性|女生)/)) {
    tags.genderReq = '倾向女性';
  }

  // 4. 户籍/生源地限制
  if (text.match(/(限本市|本市户籍|本市生源)/)) {
    tags.domicileReq = '限本市';
  } else if (text.match(/(限本省|本省户籍|本省生源)/)) {
    tags.domicileReq = '限本省';
  } else if (text.match(/(限西部|西部志愿者|西部计划)/)) {
    tags.domicileReq = '限特定项目';
  }

  return tags;
}


// ============== 2. 历史数据模拟器 ==============

function getRegionHeatIndex(workLocation, regionsData) {
  if (!workLocation || !regionsData) return 0.85; // 默认四线及以下
  
  for (const tier of ['一线城市', '新一线城市', '二线城市', '三线城市']) {
    const cities = regionsData[tier];
    if (Array.isArray(cities)) {
      for (const city of cities) {
        if (workLocation.includes(city.replace('市', '')) || city.includes(workLocation.replace('市', '').replace('省', ''))) {
          return regionsData.heatIndex?.[tier] || 1.0;
        }
      }
    }
  }
  return 0.85; // 找不到就算四线
}

function simulateHistoricalData(job, regionsData) {
  // 基准分设定：国考地市级基准大约 115，副省级 125 
  // 为简单起见，按统一基准 115 算，然后根据加成浮动
  const baseScore = job.examType && job.examType.includes('副省') ? 125 : 115;
  
  // 热度乘数
  const heatIndex = getRegionHeatIndex(job.workLocation, regionsData);
  
  // 限制等级修正
  const restrictionModifiers = {
    '三不限': { scoreAdd: 18, ratioMul: 15.0 },     // 三不限极度内卷，分数极高，报录比极高
    '低限制': { scoreAdd: 8, ratioMul: 3.5 },
    '中限制': { scoreAdd: 0, ratioMul: 1.0 },       // 基准
    '高限制': { scoreAdd: -8, ratioMul: 0.3 }       // 高限制可能踩线进，报录比极低
  };
  
  const mod = restrictionModifiers[job.restrictionLevel] || restrictionModifiers['中限制'];
  
  // 综合计算核心锚点
  const anchorScore = Math.min(145, Math.max(90, baseScore * (heatIndex * 0.5 + 0.5) + mod.scoreAdd));
  const anchorRatio = Math.max(3, Math.round(50 * heatIndex * mod.ratioMul));

  // 生成近 3 年的波动数据
  const history = {};
  [2023, 2024, 2025].forEach(year => {
    // 加入一定随机噪音 (-3% 到 +3%)
    const noiseFactorScore = 1 + (Math.random() * 0.06 - 0.03); 
    const noiseFactorRatio = 1 + (Math.random() * 0.4 - 0.2);
    
    // 如果是偶数年大小年波动
    const isBigYear = year % 2 === 0;
    const yearModScore = isBigYear ? 2.5 : -1.5;

    history[year] = {
      scoreLine: Number((anchorScore * noiseFactorScore + yearModScore).toFixed(1)),
      ratio: Math.round(anchorRatio * noiseFactorRatio),
      recruitCount: job.recruitCount // 假设招收人数不变，实际会有变动，此处简单处理
    };
  });

  return history;
}


// ============== 主执行函数 ==============

function main() {
  console.log('🚀 开始执行 Phase 1：数据增强与清洗...');
  
  const jobs = loadJSON(JOBS_FILE);
  if (!jobs) {
    console.error('❌ 找不到 jobs-parsed.json，请先运行 parse-jobs.js！');
    process.exit(1);
  }
  
  const regionsData = loadJSON(REGIONS_FILE) || {};

  console.log(`📊 共载入 ${jobs.length} 个岗位，开始二次挖掘...`);

  let countCPA = 0;
  let countCET46 = 0;
  let countGender = 0;

  jobs.forEach(job => {
    // 1. 挂载隐性门槛
    const hiddenReqs = extractHiddenRequirements(job.notes);
    job.hiddenTags = hiddenReqs;

    // 统计用
    if (hiddenReqs.cetLevel !== '无要求') countCET46++;
    if (hiddenReqs.certifications.length > 0) countCPA++;
    if (hiddenReqs.genderReq !== '不限') countGender++;

    // 2. 挂载模拟历史数据
    job.historicalData = simulateHistoricalData(job, regionsData);
  });

  // 写回文件
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');

  console.log(`\n✅ 增强完毕！覆盖保存至: data/jobs-parsed.json`);
  console.log(`\n📈 隐藏金矿挖掘成果:`);
  console.log(` - 捕获含【英语四六级/专八】限制的岗位: ${countCET46} 个`);
  console.log(` - 捕获含【高价值证书】(如法考、CPA等)限制的岗位: ${countCPA} 个`);
  console.log(` - 捕获含【特定性别倾向】(如经常夜班、高强度出海)的岗位: ${countGender} 个`);
  console.log(` - 成功为 100% 的岗位逆向生成了 3 年的进面分数与报录比模拟数据。`);
}

main();
