import { filterJobs, getRegionTier, findMajorCategory } from './dataLoader';

/**
 * 核心推荐引擎 - 给用户推荐最适合的 Top 5 高性价比岗位
 * @param {Object} userData 用户的表单输入对象
 * @param {number} count 单次推荐数量
 */
export function recommendTopJobs(userData, count = 5) {
  // 1. 基于硬条件精准筛选掉 95% 的岗位（学历、专业等）
  // 注意：因为用户表单中是 "major", DataLoader 是根据 majorCategory 处理的
  // 假设外部传入了 majorCategory
  const candidates = filterJobs({
    education: userData.education,
    majorCategory: userData.majorCategory, 
    politics: userData.politics,
    isFreshGrad: typeof userData.isFreshGrad === 'boolean' ? userData.isFreshGrad : (userData.isFreshGrad === '是'),
    region: userData.targetRegion === '不限' ? null : userData.targetRegion
  });

  if (candidates.length === 0) return [];

  // 用户分数基本面
  const userScore = parseFloat(userData.pracTestScore || 60) + parseFloat(userData.essayScore || 60);

  // 2. 为初步符合条件的岗位进行“性价比”加权打分
  const scoredJobs = candidates.map(job => {
    let score = 100; // 基础分

    // A. 隐形门槛红利 (hiddenTags) 加分
    const hidden = job.hiddenTags || { certifications: [], genderReq: '不限', cetLevel: '无要求' };
    
    // 如果有英语要求且不是无要求，说明刷掉了一批人，岗位性价比上升
    if (hidden.cetLevel !== '无要求') score += 15;
    
    // 如果有强壁垒证书，说明竞争极小，性价比飙升
    if (hidden.certifications.length > 0) score += 30;

    // 性别或户籍红利（能排除竞争对手）
    if (hidden.genderReq !== '不限') score += 10;
    if (hidden.domicileReq !== '不限') score += 20;

    // B. 内卷级别惩罚/奖励
    const restrictMod = {
      '三不限': -40,  // 三不限神仙打架，减分
      '低限制': -10,
      '中限制': +15,
      '高限制': +40   // 萝卜坑最好考，猛加分
    };
    score += (restrictMod[job.restrictionLevel] || 0);

    // C. 模拟历史进面分相近度 (寻找用户刚够垫底进面的目标，性价比最高)
    const history = job.historicalData?.[2025];
    if (history) {
      const gap = history.scoreLine - userScore;
      // 容错率极佳：用户分数刚好多出 2-5 分
      if (gap >= -5 && gap <= 2) score += 25;
      // 有点危险：差 3-10 分，但还能冲
      else if (gap > 2 && gap <= 10) score += 10;
      // 炮灰级：差 15 分以上，坚决避开
      else if (gap > 15) score -= 50; 
      // 分数溢出太多：浪费了高分，可能被别人当炮灰
      else if (gap < -10) score -= 20;
    }

    // D. 城市热度惩罚 (二三线城市更容易上岸)
    const tierRaw = getRegionTier(job.workLocation); 
    const heat = tierRaw.heatIndex || 1.0;
    if (heat > 1.3) score -= 20;  // 珠三角、包邮区极度内卷
    if (heat < 0.9) score += 15;  // 避开人流

    // E. 性格与体制偏好强匹配
    const pref = userData.workPreference || "";
    const title = job.jobTitle || "";
    const dept = job.department || "";

    if (pref.includes("文字工作")) {
      if (dept.includes("委") || dept.includes("办公") || dept.includes("中共") || title.includes("综合") || title.includes("文秘") || title.includes("管理")) score += 25;
    } else if (pref.includes("外勤执法")) {
      if (dept.includes("海关") || dept.includes("公安") || dept.includes("城管") || dept.includes("综合执法") || title.includes("现场") || title.includes("巡查")) score += 25;
    } else if (pref.includes("业务技术")) {
      if (title.includes("财务") || title.includes("审计") || title.includes("计算机") || title.includes("信息") || dept.includes("统计局")) score += 25;
    } else if (pref.includes("保底")) {
      // 哪里人少去哪里
      if (heat < 0.9 || restrictMod[job.restrictionLevel] > 0) score += 15;
    }

    return { job, score };
  });

  // 3. 排序并切片输出 Top 5
  scoredJobs.sort((a, b) => b.score - a.score);
  
  const topJobs = scoredJobs.slice(0, count).map(st => {
    // 对推荐岗位的核心信息进行脱敏和格式化包装
    const j = st.job;
    const history = j.historicalData?.[2025] || { scoreLine: 125, ratio: 60 };
    return {
      department: j.department || '某政府核心部门',
      jobTitle: j.jobTitle || '行政业务/执法岗',
      jobCode: j.jobCode || '****', // 需要马赛克
      recruitCount: j.recruitCount || 1,
      workLocation: j.workLocation || '考区',
      restrictionLevel: j.restrictionLevel,
      historyScoreStr: history.scoreLine.toFixed(1),
      historyRatio: history.ratio,
      hiddenAdvantages: j.hiddenTags ? formatHiddenTags(j.hiddenTags) : [],
      matchScore: Math.min(99, Math.max(60, st.score)).toFixed(0) // 转为 60-99 的匹配度
    };
  });

  return topJobs;
}

// 辅助方法：将复杂的高维隐形门槛降维成几句爽快的人话
function formatHiddenTags(hiddenTags) {
  const adv = [];
  if (hiddenTags.cetLevel && hiddenTags.cetLevel !== '无要求') {
    adv.push(`过滤英语小白（要求${hiddenTags.cetLevel}）`);
  }
  if (hiddenTags.certifications && hiddenTags.certifications.length > 0) {
    adv.push(`极度稀缺门槛（需${hiddenTags.certifications[0]}）`);
  }
  if (hiddenTags.domicileReq && hiddenTags.domicileReq !== '不限') {
    adv.push(`本地户籍护城河直接排除外省神仙`);
  }
  return adv.length > 0 ? adv : ['限制条件优质，竞争压力适中性价比最高'];
}
