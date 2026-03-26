/**
 * 数据统一加载器
 * 
 * 为应用提供统一的数据访问接口，自动从 data/ 目录加载所有结构化数据。
 * 在引擎中使用: const db = require('@/services/dataLoader')
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[DataLoader] 数据文件缺失: ${filename}，使用空数据`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`[DataLoader] 解析失败: ${filename}`, err.message);
    return null;
  }
}

// ===== 专业目录 =====
const majorsData = loadJSON('majors.json') || {};

/**
 * 查找用户专业所属大类
 * @param {string} majorName - 用户输入的专业名
 * @returns {{ category: string, exact: boolean } | null}
 */
function findMajorCategory(majorName) {
  if (!majorName) return null;
  const input = majorName.trim();
  
  // 精确匹配
  for (const [category, list] of Object.entries(majorsData)) {
    if (list.includes(input)) {
      return { category, exact: true };
    }
  }
  
  // 模糊匹配（包含关系）
  for (const [category, list] of Object.entries(majorsData)) {
    for (const name of list) {
      if (name.includes(input) || input.includes(name)) {
        return { category, exact: false };
      }
    }
  }
  
  return null;
}

/**
 * 获取某大类下的所有专业
 */
function getMajorsByCategory(category) {
  return majorsData[category] || [];
}

/**
 * 获取所有专业大类名
 */
function getAllCategories() {
  return Object.keys(majorsData);
}


// ===== 地区数据 =====
const regionsData = loadJSON('regions.json') || {};

/**
 * 判断城市等级
 * @param {string} regionInput - 用户输入的地区
 * @returns {{ tier: string, heatIndex: number }}
 */
function getRegionTier(regionInput) {
  if (!regionInput) return { tier: '四线及以下', heatIndex: 0.85 };
  const input = regionInput.trim();
  
  // 特殊处理偏远地区
  const remote = regionsData['偏远地区'];
  if (remote) {
    if (remote.provinces?.some(p => input.includes(p.replace('自治区', '').replace('省', '')))) {
      return { tier: '偏远地区', heatIndex: regionsData.heatIndex?.['偏远地区'] || 0.6 };
    }
    if (remote.prefectures?.some(p => input.includes(p.replace('市', '').replace('地区', '')))) {
      return { tier: '偏远地区', heatIndex: regionsData.heatIndex?.['偏远地区'] || 0.6 };
    }
  }
  
  // 遍历城市等级
  for (const tier of ['一线城市', '新一线城市', '二线城市', '三线城市']) {
    const cities = regionsData[tier];
    if (Array.isArray(cities)) {
      for (const city of cities) {
        if (input.includes(city.replace('市', '')) || city.includes(input.replace('市', '').replace('省', ''))) {
          return { tier, heatIndex: regionsData.heatIndex?.[tier] || 1.0 };
        }
      }
    }
  }
  
  return { tier: '四线及以下', heatIndex: regionsData.heatIndex?.['四线及以下'] || 0.85 };
}


// ===== 考试数据 =====  
const examStats = loadJSON('exam-stats.json') || {};

/**
 * 获取报录比估算
 * @param {string} restrictionLevel - 限制等级
 * @returns {{ min: number, avg: number, max: number }}
 */
function getCompetitionRatio(restrictionLevel) {
  const mapping = {
    '三不限': '三不限岗位',
    '低限制': '限专业岗位',
    '中限制': '限专业+党员+应届',
    '高限制': '定向选调'
  };
  const key = mapping[restrictionLevel] || '限专业岗位';
  return examStats['典型报录比']?.[key] || { 最低: 20, 平均: 80, 最高: 300 };
}

/**
 * 获取进面分数线参考
 * @param {string} examType - 考试类别
 * @param {number|string} year - 年份
 */
function getScoreLine(examType = '地市级', year = '2025') {
  return examStats['国考']?.[examType]?.[String(year)] || null;
}

/**
 * 获取专业竞争池系数
 * @param {string} majorCategory - 专业大类
 */
function getMajorPoolFactor(majorCategory) {
  return examStats['majorPoolSize']?.[majorCategory] || 1.0;
}


// ===== 职位库 =====
const jobsData = loadJSON('jobs-parsed.json');

/**
 * 按条件过滤职位
 */
function filterJobs({ education, majorCategory, politics, isFreshGrad, grassrootsExp, region } = {}) {
  if (!jobsData || !Array.isArray(jobsData)) return [];
  
  return jobsData.filter(job => {
    // 学历过滤
    if (education && job.educationRequired) {
      const eduOrder = { '大专': 1, '本科': 2, '硕士': 3, '博士': 4 };
      const userEdu = eduOrder[education] || 2;
      if (job.educationRequired.includes('博士') && userEdu < 4) return false;
      if (job.educationRequired.includes('硕士') && !job.educationRequired.includes('本科') && userEdu < 3) return false;
    }
    
    // 专业过滤
    if (majorCategory && job.majorRequired && !job.majorRequired.includes('不限')) {
      const majorsInCategory = getMajorsByCategory(majorCategory);
      const jobMajor = job.majorRequired;
      const match = jobMajor.includes(majorCategory) || 
                    majorsInCategory.some(m => jobMajor.includes(m));
      if (!match) return false;
    }
    
    // 政治面貌
    if (job.politicsRequired && job.politicsRequired.includes('党员') && politics !== '中共党员(含预备)') {
      return false;
    }
    
    // 地区
    if (region && job.workLocation) {
      const regionClean = region.replace(/(省|市|自治区|壮族|回族|维吾尔)/g, '');
      if (!job.workLocation.includes(regionClean) && !regionClean.includes('不限')) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * 获取职位库统计信息
 */
function getJobStats() {
  if (!jobsData) return { loaded: false, count: 0 };
  return {
    loaded: true,
    count: jobsData.length,
    totalRecruit: jobsData.reduce((s, j) => s + (j.recruitCount || 1), 0)
  };
}

export {
  // 专业
  findMajorCategory,
  getMajorsByCategory,
  getAllCategories,
  // 地区
  getRegionTier,
  // 考试数据
  getCompetitionRatio,
  getScoreLine,
  getMajorPoolFactor,
  // 职位库
  filterJobs,
  getJobStats,
  // 原始数据（供高级用途）
};
export const raw = { majorsData, regionsData, examStats, jobsData };
