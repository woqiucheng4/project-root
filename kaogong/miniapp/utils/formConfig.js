// 从 Web 端直接复用的表单配置（保持与 src/config/formFields.js 一致）
const formSteps = [
  { title: "基本信息", fields: ["education", "isFullTime", "major", "graduationYear", "isFreshGrad", "politicalStatus"] },
  { title: "报考意向", fields: ["targetRegion", "acceptTownship"] },
  { title: "背景实力", fields: ["certificates", "grassrootsExp", "hasExamExp", "xingceScore", "shenlunScore", "dailyStudyHours"] }
];

const fieldDefinitions = {
  education: { type: "picker", label: "最高学历", required: true, options: ["大专", "本科", "硕士", "博士"] },
  isFullTime: { type: "radio", label: "是否全日制", required: true, options: [{ label: "是", value: true }, { label: "否", value: false }] },
  major: { type: "text", label: "专业名称", required: true, placeholder: "例如：计算机科学与技术" },
  graduationYear: { type: "number", label: "毕业年份", required: true, placeholder: "例如：2024" },
  isFreshGrad: { type: "radio", label: "是否应届生", required: true, options: [{ label: "是", value: true }, { label: "否", value: false }] },
  politicalStatus: { type: "picker", label: "政治面貌", required: true, options: ["群众", "共青团员", "中共党员(含预备)"] },
  targetRegion: { type: "text", label: "意向报考地区", required: true, placeholder: "例如：浙江省杭州市" },
  acceptTownship: { type: "radio", label: "是否接受乡镇岗", required: true, options: [{ label: "接受", value: true }, { label: "不接受", value: false }] },
  certificates: { type: "picker", label: "证书情况", required: false, options: ["无", "法考A证", "CPA", "CET-6", "计算机二级"] },
  grassrootsExp: { type: "radio", label: "基层工作经历", required: false, options: [{ label: "有", value: true }, { label: "无", value: false }] },
  hasExamExp: { type: "radio", label: "是否参加过公考", required: false, options: [{ label: "考过", value: true }, { label: "纯小白", value: false }] },
  xingceScore: { type: "number", label: "行测分数", required: false, placeholder: "0-100" },
  shenlunScore: { type: "number", label: "申论分数", required: false, placeholder: "0-100" },
  dailyStudyHours: { type: "number", label: "每日备考时间(小时)", required: false, placeholder: "例如：6" }
};

module.exports = { formSteps, fieldDefinitions };
