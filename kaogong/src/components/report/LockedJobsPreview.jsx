// src/components/report/LockedJobsPreview.jsx
"use client";
import React from 'react';
import AnimatedCard from '../common/AnimatedCard';
import JobCard from './JobCard';

export default function LockedJobsPreview({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <AnimatedCard delay={0.3}>
      <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'clamp(1.1rem, 4vw, 1.3rem)' }}>
        🏆 为你量身挖掘的 Top 5 绝对高性价比岗位
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
        我们基于您的学历、专业、政治面貌及分数基本面，在 20,714 个真实国考/省考岗位中为您锁定了以下捡漏神岗：
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jobs.map((job, index) => {
          // Top 1-3 必须上锁，Top 4-5 可以预览展示作为 Hook
          const isLocked = index < 3;
          return <JobCard key={index} job={job} index={index} isLocked={isLocked} />;
        })}
      </div>
    </AnimatedCard>
  );
}
