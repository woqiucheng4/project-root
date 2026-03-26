"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function WechatSubscribeBtn({ reportId }) {
  const searchParams = useSearchParams();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (searchParams.get('subscribed') === 'success') {
      setIsSubscribed(true);
    }
  }, [searchParams]);

  const handleSubscribe = () => {
    // 唤起后端定义的授权中转站，并把当前页面作为成功后的跳回地址
    const currentPath = `/result?id=${reportId}`;
    window.location.href = `/api/wechat/auth?redirect=${encodeURIComponent(currentPath)}`;
  };

  return (
    <div style={{
      marginTop: '16px', padding: '16px', background: 'rgba(16,185,129,0.08)',
      borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      textAlign: 'center'
    }}>
      <h4 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem' }}>🔔 开启专属防内卷盯盘</h4>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        授权微信后，当这 5 个岗位出现“报名激增”或“0人捡漏”时，服务号将给您推送微信强提醒。
      </p>
      
      {isSubscribed ? (
        <button style={{
          marginTop: '8px', padding: '10px 24px', background: '#059669', color: '#fff',
          fontWeight: 'bold', border: 'none', borderRadius: '24px', cursor: 'default',
          display: 'flex', alignItems: 'center', gap: '8px'
        }} disabled>
          <span>✓ 已成功开启微信极光推送</span>
        </button>
      ) : (
        <button 
          onClick={handleSubscribe}
          style={{
            marginTop: '8px', padding: '12px 32px', background: '#10b981', color: '#fff',
            fontWeight: 'bold', border: 'none', borderRadius: '24px', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <span>一键授权微信盯盘提醒</span>
        </button>
      )}
    </div>
  );
}
