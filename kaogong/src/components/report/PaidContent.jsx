"use client";
import React from 'react';
import AnimatedCard from '../common/AnimatedCard';
import JobCard from './JobCard';
import CourseRecommend from './CourseRecommend';

export default function PaidContent({ paidData }) {
  if (!paidData || !paidData.topJobs) {
    // 渲染骨架或模糊用的高阶假数据（确保就算被破解CSS也不会暴露机密逻辑）
    paidData = {
      topJobs: [ // 用占位对象凑数
        { department: "████部", jobTitle: "████科员", matchScore: "99", jobCode: "1001██" },
        { department: "████局", jobTitle: "████定向岗", matchScore: "95", jobCode: "1002██" },
        { department: "████委", jobTitle: "████业务室", matchScore: "90", jobCode: "1003██" },
      ],
      competitionAnalysis: "████分析结果被加密保存，解锁后生成深度内卷环境评估。████████",
      avoidPitfalls: ["绝对不能报考█████", "避开██████的万人坑", "警惕看似高福利的████"],
      studyPlan: { timeline: "最后30天的██冲刺法", focus: "██提分是最快路径" }
    };
  }

  const { topJobs, competitionAnalysis, avoidPitfalls, studyPlan } = paidData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* 竞争烈度与分析 */}
      <AnimatedCard delay={0.2}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📊 竞争环境核心评估</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{competitionAnalysis}</p>
      </AnimatedCard>

      {/* 完整 Top 5 推荐 */}
      {topJobs && topJobs.length > 0 && (
        <AnimatedCard delay={0.3}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>🎯 完整最优报考决断明细</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topJobs.map((job, idx) => (
              <JobCard key={idx} job={job} index={idx} isLocked={false} />
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* 避坑与备考 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <AnimatedCard delay={0.4}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: '#ef4444' }}>⚠️ 选岗避坑指令</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {avoidPitfalls.map((tip, i) => <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>)}
          </ul>
        </AnimatedCard>

        <AnimatedCard delay={0.5}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: '#10b981' }}>🎯 终极备考策略</h3>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>时间线极速规划：</div>
            <div style={{ color: 'var(--text-secondary)' }}>{studyPlan.timeline}</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>弱势项提分法则：</div>
            <div style={{ color: 'var(--text-secondary)' }}>{studyPlan.focus}</div>
          </div>
        </AnimatedCard>
      </div>

      {/* 商业闭环第二极：教培倒流 */}
      <CourseRecommend />
    </div>
  );
}
