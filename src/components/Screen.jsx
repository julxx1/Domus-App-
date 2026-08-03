import TabBar from './TabBar';

export default function Screen({ children, hideTabs = false, scroll = true, style = {} }) {
  return (
    <div style={{
      height: '100%', width: '100%', maxWidth: 420, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--d-cream)',
      position: 'relative',
      animation: 'screenEnter 260ms cubic-bezier(0.22,1,0.36,1) both',
      ...style,
    }}>
      <div style={{
        flex: 1,
        overflowY: scroll ? 'auto' : 'hidden',
        overflowX: 'hidden',
        paddingBottom: hideTabs ? 20 : 112,
      }}>
        {children}
      </div>
      {!hideTabs && <TabBar />}
    </div>
  );
}
