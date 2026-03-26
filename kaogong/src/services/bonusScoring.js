import { bonusRules, getBonusLevel } from "@/config/scoringRules";

export const calculateBonus = (userInput) => {
  let score = 0;
  
  // 逐项计算分值
  score += bonusRules.isFreshGrad[Boolean(userInput.isFreshGrad)] || 0;
  score += bonusRules.politicalStatus[userInput.politicalStatus] || 0;
  score += bonusRules.certificates[userInput.certificates || "无"] || 0;
  score += bonusRules.grassrootsExp[Boolean(userInput.grassrootsExp)] || 0;
  
  // 基础补贴：如果填写了意向地区，给予一定户籍/就近红利预设分
  if(userInput.targetRegion) {
    score += 15;
  }
  
  return {
    score,
    level: getBonusLevel(score)
  };
};
