"use client";
export default function StepIndicator({ currentStep, totalSteps, titles }) {
  const circleSize = 'clamp(28px, 8vw, 34px)';
  const lineTop = 'clamp(13px, 4vw, 16px)';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 4px' }}>
      {/* Background Line */}
      <div style={{ position: 'absolute', top: lineTop, left: '15%', right: '15%', height: '2px', background: 'var(--glass-border)', zIndex: 0 }} />
      {/* Active Line */}
      <div style={{ position: 'absolute', top: lineTop, left: '15%', height: '2px', background: 'var(--primary-color)', zIndex: 1, width: `${(currentStep / (totalSteps - 1)) * 70}%`, transition: 'width 0.4s ease' }} />
      
      {titles.map((title, index) => {
        const isActive = index <= currentStep;
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
            <div style={{ 
              width: circleSize, height: circleSize, borderRadius: '50%', 
              background: isActive ? 'var(--primary-color)' : 'var(--surface-color)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
              border: `2px solid ${isActive ? 'var(--primary-color)' : 'var(--glass-border)'}`,
              transition: 'all 0.4s ease',
              boxShadow: isActive ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
            }}>
              {index + 1}
            </div>
            <span style={{ marginTop: '6px', fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'color 0.4s ease', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
