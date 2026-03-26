export const filterJobs = (userInput) => {
  const jobs = [
    { type: "两办/纪委", requiredDegree: "本科", politicalRequired: true, needFresh: false, township: false, quality: 90, risk: 80, match: 100 },
    { type: "普通综合岗", requiredDegree: "大专", politicalRequired: false, needFresh: false, township: false, quality: 75, risk: 50, match: 100 },
    { type: "乡镇基础岗", requiredDegree: "大专", politicalRequired: false, needFresh: false, township: true, quality: 60, risk: 20, match: 100 },
    { type: "应届生定向", requiredDegree: "本科", politicalRequired: false, needFresh: true, township: false, quality: 80, risk: 40, match: 100 },
    { type: "基层定向岗", requiredDegree: "大专", politicalRequired: false, needFresh: false, needGrassroots: true, township: true, quality: 70, risk: 30, match: 100 }
  ];

  return jobs.filter(job => {
    // 政治面貌过滤项
    if (job.politicalRequired && userInput.politicalStatus !== "中共党员(含预备)") return false;
    // 应届过滤项
    if (job.needFresh && !userInput.isFreshGrad) return false;
    // 基层经历要求
    if (job.needGrassroots && !userInput.grassrootsExp) return false;
    // 乡镇接受度
    if (job.township && !userInput.acceptTownship) return false;
    
    // 学历等级简单匹配（大专 < 本科 < 硕士 < 博士）
    const degrees = ["大专", "本科", "硕士", "博士"];
    const userDegreeLevel = degrees.indexOf(userInput.education);
    const reqDegreeLevel = degrees.indexOf(job.requiredDegree);
    if (userDegreeLevel === -1 || userDegreeLevel < reqDegreeLevel) return false;
    
    return true;
  });
};
