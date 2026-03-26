import AnimatedCard from "@/components/common/AnimatedCard";
import UserInfoForm from '@/components/forms/UserInfoForm';
import TrustStats from '@/components/home/TrustStats';
import Testimonials from '@/components/home/Testimonials';
import LeakBanner from '@/components/home/LeakBanner';

export default function Home() {
  return (
    <div style={{ padding: 'var(--spacing-xl) 0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Hero 区域 */}
      <div style={{ textAlign: 'center', marginBottom: '8px', padding: '0 8px' }} className="animate-fade-in">
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-color)', padding: '4px 12px', borderRadius: '20px', fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', marginBottom: '16px', fontWeight: 'bold' }}>
          🏆 突破市面 99% 的静态查询工具
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)', marginBottom: '16px', lineHeight: 1.3 }}>
          <span className="text-gradient">AI 智能公考上岸预测系统</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          基于真实近3年省局考数据，注入 AI 千亿大模型算法，<br />
          5分钟出具你的专属 <span style={{ color: 'var(--accent-color)' }}>高容错率报考策略</span>。
        </p>
      </div>

      {/* 数据统计 (原有) */}
      <TrustStats />

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        
        {/* 今天新增：报名动态捡漏走马灯 */}
        <LeakBanner />

        {/* 核心表单 */}
        <AnimatedCard delay={0.1}>
          <div className="card shadow-lg" style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: 'var(--text-primary)' }}>开始定制突围方案</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>请尽可能准确填写以下背景信息</p>
            </div>
            <UserInfoForm />
          </div>
        </AnimatedCard>
      </div>
      
      {/* 用户好评 */}
      <div style={{ marginTop: 'var(--spacing-md)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '16px', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)' }}>
          💬 来自 1.2万+ 上岸考生的反馈
        </h3>
        <Testimonials />
      </div>

      {/* 底部行动号召 */}
      <div style={{
        textAlign: 'center', padding: '24px 16px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <p style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          🔥 限时体验价 <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2em' }}>¥9.9</span>
          <span style={{ textDecoration: 'line-through', marginLeft: '8px', opacity: 0.6 }}>¥99</span>
        </p>
        <p style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', color: 'var(--text-secondary)', opacity: 0.8 }}>
          成功避免因选岗失误导致的考公沦为炮灰
        </p>
      </div>
    </div>
  );
}
