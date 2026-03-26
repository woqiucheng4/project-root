// src/components/report/CourseRecommend.jsx
"use client";
import React from 'react';
import AnimatedCard from '../common/AnimatedCard';

export default function CourseRecommend() {
  return (
    <AnimatedCard delay={0.6}>
      <div style={{
        background: 'linear-gradient(to right, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1.1rem' }}>🔥 弱项突破限时福利</h4>
          <span style={{ fontSize: '0.8rem', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>低至3折</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          经AI评估，在您匹配的上述高薪岗位中，行测理科或成最大绊脚石。系统为您争取到考公名师内部特训名额：
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ flex: 1 }}>
             <div style={{ fontWeight: 'bold' }}>《考公系统精讲980突击班》</div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>包含: 核心高频考点/历年真题/名师1对1答疑</div>
          </div>
        </div>
        <button style={{
          width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
          color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer',
          marginTop: '12px', boxShadow: '0 4px 15px rgba(239,68,68,0.3)'
        }}>
          立即领取特惠 (¥199)
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          注：本福利仅保留 30 分钟
        </div>
      </div>
    </AnimatedCard>
  );
}
