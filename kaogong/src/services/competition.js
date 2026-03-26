import { competitionParams, defaultBaseRatio } from "@/config/competition";

export const evaluateCompetition = (job, userInput) => {
  // 地域热度预估：基于简单的关键字判定 (避免强依赖外部地理API)
  let regionHeat = competitionParams.regionHeat["普通城市"];
  const region = userInput.targetRegion || "";
  
  if (region.includes("北") || region.includes("上") || region.includes("广") || region.includes("深") || region.includes("浙") || region.includes("苏")) {
    regionHeat = competitionParams.regionHeat["一线城市"];
  } else if (region.includes("省") || region.includes("市")) {
    // 简单假定非一线但明确市级的算二线热度
    regionHeat = competitionParams.regionHeat["二线城市"];
  }
  
  // 专业竞争评估 (MVP阶段使用常见大类模拟)
  let majorHeat = 1.0; 
  const major = userInput.major || "";
  if (major.includes("法")) majorHeat = competitionParams.majorPool["法学"];
  else if (major.includes("计算") || major.includes("软件")) majorHeat = competitionParams.majorPool["计算机科学与技术"];
  else if (major.includes("汉语言") || major.includes("中文")) majorHeat = competitionParams.majorPool["汉语言文学"];
  else majorHeat = competitionParams.majorPool["三不限"]; // 自行认定为三不限级别烈度

  // 获取该类岗位的默认热度基础值 (匹配模糊前缀即可)
  const jobHeatValue = Object.keys(competitionParams.jobTypeHeat).find(k => job.type.includes(k.replace("类","").replace("岗","")));
  const jobHeat = jobHeatValue ? competitionParams.jobTypeHeat[jobHeatValue] : 1.0;
  
  // 核心公式：竞争指数 (理论报录比)
  const competitionIndex = defaultBaseRatio * regionHeat * majorHeat * jobHeat;
  
  // 将竞争指数转化为上岸概率分值 (0-100)
  const successRate = Math.max(5, 100 - (competitionIndex / 1.5));
  
  return {
    competitionIndex,
    successRate
  };
};
