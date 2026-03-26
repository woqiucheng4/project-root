// src/components/report/JobCard.jsx
"use client";
import React from 'react';

export default function JobCard({ job, index, isLocked }) {
  if (isLocked) {
    return (
      <div style={{
        padding: '16px', background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', overflow: 'hidden', minHeight: '120px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ filter: 'blur(6px)', opacity: 0.6, userSelect: 'none' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>#{index+1} 某国家部委核心业务岗位</div>
          <div style={{ color: 'var(--text-secondary)' }}>招录人数：X人 | 进面分：13X.X分 | 代码：XXXXX</div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ padding: '4px 8px', background: '#3b82f633', borderRadius: '4px' }}>特大优势门槛保护</span>
          </div>
        </div>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(13,17,23,0.3)',
          zIndex: 1
        }}>
          <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</span>
          <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '1.1rem' }}>黄金捡漏岗已隐藏</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>付费后解锁完整信息及报考避坑指南</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px', background: 'rgba(255,255,255,0.04)',
      borderRadius: '12px', border: '1px solid var(--glass-border)',
      display: 'flex', flexDirection: 'column', gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          #{index+1} {job.department} - {job.jobTitle}
        </h4>
        <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          匹配度 {job.matchScore}%
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <span>📍 {job.workLocation}</span>
        <span>👥 招 {job.recruitCount} 人</span>
        <span>🏷️ 职位代码 {job.jobCode}</span>
        <span>🎯 {job.restrictionLevel}</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '8px' }}>
        <span>往年进面分参考: {job.historyScoreStr}</span>
        <span>平均报录比: {job.historyRatio}:1</span>
      </div>

      {job.hiddenAdvantages && job.hiddenAdvantages.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {job.hiddenAdvantages.map((adv, i) => (
            <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
              ✓ {adv}
            </span>
          ))}
        </div>
      )}

      {/* AI 深度分析块 */}
      {(job.aiReason || job.aiProsCons) && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
          {job.aiReason && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#60a5fa', display: 'block', marginBottom: '2px' }}>💡 匹配依据</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{job.aiReason}</p>
            </div>
          )}
          {job.aiProsCons && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#8b5cf6', display: 'block', marginBottom: '2px' }}>⚖️ 优劣势打标</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{job.aiProsCons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
