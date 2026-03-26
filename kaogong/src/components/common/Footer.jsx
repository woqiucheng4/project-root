export default function Footer() {
  return (
    <footer style={{ padding: 'var(--spacing-xl) 0', borderTop: '1px solid var(--glass-border)', marginTop: 'auto', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      <div className="container" style={{ margin: '0 auto' }}>
        <p>© {new Date().getFullYear()} AI公考上岸助手. All rights reserved.</p>
        <p style={{ marginTop: 'var(--spacing-xs)' }}>帮助百万考生做出正确的报考决策</p>
      </div>
    </footer>
  );
}
