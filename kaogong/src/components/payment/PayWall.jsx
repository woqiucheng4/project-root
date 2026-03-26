"use client";
import React from 'react';

export default function PayWall({ isPaid, reportId, children }) {
  if (isPaid) return children;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--border-radius-lg)', marginTop: 'var(--spacing-xl)' }}>
      {/* 模糊化的底层假数据占位内容 */}
      <div style={{ filter: 'blur(8px)', opacity: 0.6, userSelect: 'none', pointerEvents: 'none' }}>
        {children}
      </div>
      
      {/* 绝对定位的引导支付罩层 */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'linear-gradient(to bottom, rgba(13, 17, 23, 0.2), rgba(13, 17, 23, 0.98) 60%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center',
        padding: 'calc(var(--spacing-xl) * 2)', textAlign: 'center', zIndex: 10
      }}>
        <div style={{ marginTop: 'auto', width: '100%' }}>
          <h3 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', marginBottom: 'var(--spacing-md)', lineHeight: 1.3 }} className="text-gradient">
            解锁完整高价值报考研判报告
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', maxWidth: '450px', lineHeight: '1.6', margin: '0 auto var(--spacing-lg)', fontSize: 'clamp(0.8rem, 2.8vw, 1rem)' }}>
            包含你专属的 Top 5 真实岗位推荐、数据化图解竞争烈度、深度AI避坑排雷指令及考前强化策略。
          </p>
          
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)' }}>
            <span style={{ fontSize: 'clamp(1.8rem, 7vw, 2.5rem)', fontWeight: 'bold', color: '#fff' }}>¥9.9</span>
            <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>¥99.0</span>
          </div>
          
          <button 
            onClick={() => window.location.href = `/payment?id=${reportId}`}
            style={{
              padding: '14px 40px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff', borderRadius: 'var(--border-radius-full)', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            立即解锁完整报告
          </button>
        </div>
      </div>
    </div>
  );
}
