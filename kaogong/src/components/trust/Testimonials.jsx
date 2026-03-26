"use client";
import React, { useEffect, useState } from 'react';

const testimonials = [
  {
    name: '张*华',
    tag: '2025国考上岸',
    text: '本来想报三不限，看了报告后改报了限计算机的乡镇岗，竞争少了10倍，笔试第二成功上岸！',
    avatar: '🧑‍💼'
  },
  {
    name: '李*',
    tag: '应届生省考',
    text: '作为应届党员，报告帮我发现了身份红利T0的优势，精准锁定只有300人报名的定向岗。',
    avatar: '👩‍🎓'
  },
  {
    name: '王*明',
    tag: '在职备考',
    text: '之前两年都是盲目报名，今年用AI分析选了避坑岗位，行测70+申论65，稳稳上岸。',
    avatar: '👨‍💻'
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[activeIndex];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      padding: 'clamp(16px, 4vw, 24px)', position: 'relative',
      minHeight: '140px', transition: 'all 0.4s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem'
        }}>
          {t.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{t.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{t.tag}</div>
        </div>
        <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: '0.9rem' }}>★★★★★</div>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)', lineHeight: 1.6, fontStyle: 'italic' }}>
        "{t.text}"
      </p>
      {/* 轮播指示器 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        {testimonials.map((_, i) => (
          <div key={i} onClick={() => setActiveIndex(i)} style={{
            width: i === activeIndex ? '20px' : '8px', height: '8px',
            borderRadius: '4px', cursor: 'pointer',
            background: i === activeIndex ? '#3b82f6' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease'
          }} />
        ))}
      </div>
    </div>
  );
}
