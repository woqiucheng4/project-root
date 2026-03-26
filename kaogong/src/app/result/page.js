"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Loading from '@/components/common/Loading';
import BonusLevel from '@/components/report/BonusLevel';
import PayWall from '@/components/payment/PayWall';
import PaidContent from '@/components/report/PaidContent';
import LockedJobsPreview from '@/components/report/LockedJobsPreview';
import WechatSubscribeBtn from '@/components/common/WechatSubscribeBtn';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("参数错误：未检测到合法的分析流水号。");
      setLoading(false);
      return;
    }

    fetch(`/api/report?id=${id}`)
      .then(async res => {
         const data = await res.json();
         if (!res.ok || data.error) throw new Error(data.error || "获取失败");
         return data;
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loading text="数据提取中，系统正在解密您的专属报告..." />;
  if (error) return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: '#ef4444' }}>{error}</div>;
  if (!report) return null;

  return (
    <div style={{ padding: 'var(--spacing-md) 0 var(--spacing-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', padding: '0 8px' }} className="animate-fade-in">
        <h1 style={{ fontSize: 'clamp(1.4rem, 5.5vw, 2.5rem)', lineHeight: 1.3 }} className="text-gradient">你的专属极速考情分析</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)', wordBreak: 'break-all' }}>
          防伪标识码：{report.reportId} <br/> 生成于：{new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      <BonusLevel 
        level={report.free.bonusLevel}
        direction={report.free.direction}
        briefTip={report.free.briefTip}
      />

      {/* "犹抱琵琶半遮面" 的黄金预览诱饵 */}
      {!report.isPaid && report.free.previewJobs && (
         <LockedJobsPreview jobs={report.free.previewJobs} />
      )}

      {/* 微信长效转化核武器：授权开启模板消息盯盘 */}
      <WechatSubscribeBtn reportId={report.reportId} />

      {/* 如果未支付，这里会将 PaidContent 锁死在一个渐变的模糊遮罩池里，否则透绿完整渲染 */}
      <PayWall isPaid={report.isPaid} reportId={report.reportId}>
        <PaidContent paidData={report.paid} />
      </PayWall>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResultContent />
    </Suspense>
  );
}
