export default function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.75, style }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  const P = (children) => <svg {...props}>{children}</svg>;
  switch (name) {
    case 'home':       return P(<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z"/>);
    case 'shield':     return P(<path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"/>);
    case 'pin':        return P(<><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>);
    case 'chat':       return P(<path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5A8 8 0 1121 12z"/>);
    case 'cart':       return P(<><path d="M3 4h2l2.5 11.5a2 2 0 002 1.5h8a2 2 0 002-1.5L21 8H6"/><circle cx="9" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></>);
    case 'bell':       return P(<><path d="M6 9a6 6 0 0112 0v4l1.5 3h-15L6 13V9z"/><path d="M10 19a2 2 0 004 0"/></>);
    case 'plus':       return P(<path d="M12 5v14M5 12h14"/>);
    case 'cam':        return P(<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-2v8l-5-2z"/></>);
    case 'play':       return P(<path d="M8 5l11 7-11 7z" fill={color}/>);
    case 'pause':      return P(<><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></>);
    case 'mic':        return P(<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></>);
    case 'send':       return P(<path d="M3 12l18-9-7 18-3-7-8-2z"/>);
    case 'check':      return P(<path d="M4 12l5 5L20 6"/>);
    case 'x':          return P(<path d="M6 6l12 12M18 6L6 18"/>);
    case 'chev-r':     return P(<path d="M9 6l6 6-6 6"/>);
    case 'chev-d':     return P(<path d="M6 9l6 6 6-6"/>);
    case 'chev-l':     return P(<path d="M15 6l-6 6 6 6"/>);
    case 'moon':       return P(<path d="M21 13a8 8 0 11-10-10 6 6 0 0010 10z"/>);
    case 'sun':        return P(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>);
    case 'settings':   return P(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.65 1.65 0 00-1.8-.3 1.65 1.65 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.65 1.65 0 00-1-1.5 1.65 1.65 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.65 1.65 0 00.3-1.8 1.65 1.65 0 00-1.5-1H3a2 2 0 110-4h.1a1.65 1.65 0 001.5-1 1.65 1.65 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.65 1.65 0 001.8.3h0a1.65 1.65 0 001-1.5V3a2 2 0 114 0v.1a1.65 1.65 0 001 1.5h0a1.65 1.65 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.65 1.65 0 00-.3 1.8v0a1.65 1.65 0 001.5 1H21a2 2 0 110 4h-.1a1.65 1.65 0 00-1.5 1z"/></>);
    case 'face-id':    return P(<><path d="M5 8V6a1 1 0 011-1h2M16 5h2a1 1 0 011 1v2M19 16v2a1 1 0 01-1 1h-2M8 19H6a1 1 0 01-1-1v-2"/><path d="M9 10v1M15 10v1M12 9v4M10 16c1 .5 3 .5 4 0"/></>);
    case 'lock':       return P(<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>);
    case 'mail':       return P(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>);
    case 'eye':        return P(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>);
    case 'expand':     return P(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>);
    case 'wifi':       return P(<><path d="M2 9a14 14 0 0120 0M5 13a9 9 0 0114 0M8.5 16.5a4 4 0 017 0"/><circle cx="12" cy="20" r="1" fill={color}/></>);
    case 'volume':     return P(<><path d="M11 5L6 9H3v6h3l5 4V5zM16 9c1.5 1 2 2 2 3s-.5 2-2 3M19 6c3 1.5 4 3.5 4 6s-1 4.5-4 6"/></>);
    case 'sparkles':   return P(<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3zM19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/>);
    case 'heart':      return P(<path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/>);
    case 'star':       return P(<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z"/>);
    case 'clock':      return P(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
    case 'calendar':   return P(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>);
    case 'fridge':     return P(<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 10h14M9 6v2M9 13v3"/></>);
    case 'leaf':       return P(<><path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16-1 0-2-1-2-2z"/><path d="M4 20l8-8"/></>);
    case 'box':        return P(<><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>);
    case 'filter':     return P(<path d="M3 5h18M6 12h12M10 19h4"/>);
    case 'search':     return P(<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></>);
    case 'menu':       return P(<path d="M4 6h16M4 12h16M4 18h16"/>);
    case 'pencil':     return P(<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/>);
    case 'trash':      return P(<path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"/>);
    case 'thermo':     return P(<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/>);
    case 'flame':      return P(<path d="M12 3c2 4 6 6 6 11a6 6 0 11-12 0c0-3 2-4 2-7 2 1 3 3 4 0z"/>);
    case 'door':       return P(<><path d="M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17M3 21h18M14 12h.01"/></>);
    case 'circle-dot': return P(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill={color}/></>);
    case 'arrow-r':    return P(<><path d="M5 12h14M13 5l7 7-7 7"/></>);
    case 'arrow-l':    return P(<><path d="M19 12H5M11 5l-7 7 7 7"/></>);
    case 'milk':       return P(<path d="M9 3h6v2l1 3v11a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l1-3V3z"/>);
    case 'bread':      return P(<path d="M3 14a4 4 0 014-4 5 5 0 0110 0 4 4 0 010 8H7a4 4 0 01-4-4z"/>);
    case 'egg':        return P(<path d="M12 3c4 0 7 6 7 11a7 7 0 11-14 0c0-5 3-11 7-11z"/>);
    case 'tomato':     return P(<><circle cx="12" cy="14" r="7"/><path d="M9 7s1-2 3-2 3 2 3 2M12 7v-2"/></>);
    case 'paw':        return P(<><circle cx="6" cy="11" r="2"/><circle cx="18" cy="11" r="2"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><path d="M7 17a5 5 0 0110 0c0 3-2 4-5 4s-5-1-5-4z"/></>);
    case 'image':      return P(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 5 5 3-3 5 4"/></>);
    default: return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
  }
}
