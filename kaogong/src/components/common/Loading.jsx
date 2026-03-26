export default function Loading({ text = "AI正在为您深度分析..." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-2xl) 0' }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--glass-border)',
        borderTop: '3px solid var(--primary-color)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 'var(--spacing-md)'
      }}></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
