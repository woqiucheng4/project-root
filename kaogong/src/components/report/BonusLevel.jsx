"use client";
import React from 'react';
import AnimatedCard from '../common/AnimatedCard';

export default function BonusLevel({ level, direction, briefTip }) {
  const getLevelColor = (lv) => {
    switch(lv) {
      case 'T0': return '#ef4444'; // Red
      case 'T1': return '#f59e0b'; // Orange
      case '普通': return '#3b82f6'; // Blue
      default: return '#9ca3af'; // Gray
    }
  };
  
  return (
    <AnimatedCard delay={0.1}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>基础分析结果</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ 
          background: getLevelColor(level), 
          color: '#fff', 
          fontWeight: 'bold', 
          padding: '8px 16px', 
          borderRadius: '8px',
          fontSize: '1.2rem',
          boxShadow: `0 4px 15px ${getLevelColor(level)}66`
        }}>
          {level} 梯队
        </div>
        <div>你的身份红利评级</div>
      </div>
      
      <div style={{ marginBottom: 'var(--spacing-md)', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
        <h4 style={{ color: 'var(--primary-color)', marginBottom: '4px' }}>推荐大方向</h4>
        <p style={{ color: 'var(--text-primary)' }}>{direction}</p>
      </div>

      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
        <strong>顾问寄语：</strong>{briefTip}
      </div>
    </AnimatedCard>
  );
}
