export default function Header() {
  return (
    <header style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--glass-border)', background: 'rgba(13, 17, 23, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto', padding: '0 var(--spacing-lg)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className="text-gradient">
          AI公考上岸助手
        </div>
        <nav style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <a href="/" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>免费测评</a>
        </nav>
      </div>
    </header>
  );
}
