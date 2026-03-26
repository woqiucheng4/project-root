// src/components/home/LeakBanner.jsx
"use client";
import React, { useState, useEffect } from 'react';

export default function LeakBanner() {
  const [leaks, setLeaks] = useState([]);

  useEffect(() => {
    // 模拟前端加载服务器由自动化脚本更新的 daily-leak-jobs.json
    // 这里因为是静态构建，假设我们有个 API 或者直接抛出 mock
    const loadLeaks = async () => {
      try {
        const res = await fetch('/api/leaks');
        const data = await res.json();
        setLeaks(data.slice(0, 3));
      } catch(e) {
        // Fallback UI
        setLeaks([
          { department: "国家税务局xx县税务局", jobTitle: "执法员", currentApplicants: 0 },
          { department: "某某海关", jobTitle: "现场查验", currentApplicants: 0 }
        ]);
      }
    };
    loadLeaks();
  }, []);

  if (leaks.length === 0) return null;

  return (
    <div style={{
      margin: '0 auto 24px auto', maxWidth: '600px', width: '100%',
      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px', padding: '12px', overflow: 'hidden', position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
          LIVE
        </span>
        <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 'bold' }}>今日捡漏情报局 (报名过审为 0)</span>
      </div>
      <div className="leak-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {leaks.map((job, idx) => (
          <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
             <span>{job.department} - {job.jobTitle}</span>
             <span style={{ color: '#10b981', fontWeight: 'bold' }}>{job.currentApplicants}人过审</span>
          </div>
        ))}
      </div>
    </div>
  );
}
