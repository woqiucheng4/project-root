"use client";
import React, { useEffect, useState } from 'react';

const stats = [
  { label: '已服务考生', value: 12860, suffix: '+', icon: '👥' },
  { label: '报告准确率', value: 94, suffix: '%', icon: '🎯' },
  { label: '平均节省时间', value: 30, suffix: '天', icon: '⏱️' },
  { label: '用户好评率', value: 98, suffix: '%', icon: '⭐' }
];

function AnimatedNumber({ target, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function TrustStats() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
      padding: '20px 0'
    }} className="trust-stats-grid">
      {stats.map((s, i) => (
        <div key={i} style={{
          textAlign: 'center', padding: '16px 8px',
          background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>{s.icon}</div>
          <div style={{
            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 'bold',
            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text', color: 'transparent',
            margin: '4px 0'
          }}>
            <AnimatedNumber target={s.value} suffix={s.suffix} />
          </div>
          <div style={{ fontSize: 'clamp(0.65rem, 2.2vw, 0.8rem)', color: 'var(--text-secondary)' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
