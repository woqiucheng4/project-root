export const bonusRules = {
  isFreshGrad: { true: 30, false: 0 },
  politicalStatus: { "中共党员(含预备)": 15, "共青团员": 5, "群众": 0 },
  certificates: { "法考A证": 40, "CPA": 30, "CET-6": 10, "计算机二级": 5, "无": 0 },
  grassrootsExp: { true: 20, false: 0 },
  acceptTownship: { true: 10, false: 0 }
};

export const getBonusLevel = (score) => {
  if (score >= 80) return "T0";
  if (score >= 50) return "T1";
  if (score >= 20) return "普通";
  return "三不限";
};
