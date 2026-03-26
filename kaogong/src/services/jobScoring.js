import { evaluateCompetition } from "./competition";

export const scoreJobs = (filteredJobs, userInput) => {
  const scoredJobs = filteredJobs.map(job => {
    const { competitionIndex, successRate } = evaluateCompetition(job, userInput);
    
    // 岗位风险得分：值越小风险越高，我们要将风险（0~100风险值）转化为良性收益基分：
    const riskScore = 100 - job.risk; 
    
    // PDR公式： 0.4*匹配度 + 0.3*上岸概率 + 0.2*质量 + 0.1*低风险率
    const finalScore = (0.4 * job.match) + (0.3 * successRate) + (0.2 * job.quality) + (0.1 * riskScore);
    
    return {
      ...job,
      competitionIndex: competitionIndex.toFixed(1),
      successRate: successRate.toFixed(1),
      finalScore: finalScore.toFixed(1)
    };
  });
  
  // 根据总得分按降序排列
  return scoredJobs.sort((a, b) => b.finalScore - a.finalScore);
};
