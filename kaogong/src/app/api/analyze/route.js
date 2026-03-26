import { NextResponse } from "next/server";
import { calculateBonus } from "@/services/bonusScoring";
import { recommendTopJobs } from "@/services/jobRecommender";
import { findMajorCategory } from "@/services/dataLoader";
import { generateAIAnalysis } from "@/services/aiAnalyzer";
import { saveReport } from "@/utils/storage";

export async function POST(request) {
  try {
    const userInput = await request.json();
    
    // 1. 红利评分提取 (沿用原逻辑)
    const bonusInfo = calculateBonus(userInput);
    
    // 2. 真实数据精算：Top 5 真实岗位推荐 (替代原有基于规则的模拟假数据)
    // 确保把自动匹配专业大类的逻辑带上
    const majorCat = findMajorCategory(userInput.major);
    userInput.majorCategory = majorCat ? majorCat.category : '三不限';
    
    const recommendedJobs = recommendTopJobs(userInput, 5);

    // 4. 调用 AI大模型 生成独家自然语言深度分析（带有超时兜底保障）
    const aiAnalysis = await generateAIAnalysis(userInput, bonusInfo, recommendedJobs);
    
    // 把 AI 深度分析回填到对应的岗位对象中，以便传给前端渲染
    recommendedJobs.forEach((job, idx) => {
      if (aiAnalysis.jobAnalyses && aiAnalysis.jobAnalyses[idx]) {
        job.aiReason = aiAnalysis.jobAnalyses[idx].reason;
        job.aiProsCons = aiAnalysis.jobAnalyses[idx].prosAndCons;
      }
    });
    
    const reportId = "rep_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    
    // 构造最终的商业化分层报告模型
    const completeReport = {
      reportId,
      createdAt: new Date().toISOString(),
      isPaid: false, // 初始阻断付费墙
      free: {
        bonusLevel: bonusInfo.level,
        direction: recommendedJobs[0]?.jobTitle || "综合基础岗",
        briefTip: aiAnalysis.bonusAdvice,
        previewJobs: recommendedJobs // 全量挂上去，在前端控制前三条展示锁屏UI
      },
      paid: {
        topJobs: recommendedJobs,
        competitionAnalysis: aiAnalysis.competitionAnalysis,
        avoidPitfalls: aiAnalysis.avoidPitfalls,
        studyPlan: aiAnalysis.studyPlan
      },
      userInput
    };
    
    // 安全缓冲：缓存进入后端状态机
    saveReport(completeReport);
    
    // 拦截式返回：绝不直接向前端暴露 paid 对象以防被盗抓
    return NextResponse.json({
      reportId,
      freeContent: completeReport.free
    });
  } catch (error) {
    console.error("API Error - /api/analyze:", error);
    return NextResponse.json({ error: "服务器内部错误，引擎分析失败" }, { status: 500 });
  }
}
