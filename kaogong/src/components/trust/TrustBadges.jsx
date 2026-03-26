"use client";
import React from 'react';

const guarantees = [
  { icon: '🔒', title: '数据安全', desc: '信息仅用于分析，绝不泄露' },
  { icon: '🤖', title: 'AI深度分析', desc: '结合历年大数据智能研判' },
  { icon: '💯', title: '不满意退款', desc: '报告不满意24h内全额退' }
];

export default function TrustBadges() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', gap: 'clamp(12px, 3vw, 24px)',
      flexWrap: 'wrap', padding: '16px 0'
    }}>
      {guarantees.map((g, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '20px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', color: 'var(--text-secondary)',
          whiteSpace: 'nowrap'
        }}>
          <span>{g.icon}</span>
          <span>{g.title}</span>
        </div>
      ))}
    </div>
  );
}
