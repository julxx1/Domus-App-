import TabBar from './TabBar';

export default function Screen({ children, hideTabs = false, scroll = true, style = {} }) {
  return (
    <div style={{
      height: '100%', width: '100%', maxWidth: 420, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--d-cream)',
      position: 'relative', ...style,
    }}>
      <div style={{
        flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden',
        paddingBottom: hideTabs ? 20 : 100,
      }}>
        {children}
      </div>
      {!hideTabs && <TabBar />}
    </div>
  );
}
