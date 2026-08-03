const P = 'domus_'
export const store = {
  get: (k, fb = null) => {
    try { const r = localStorage.getItem(P + k); return r ? JSON.parse(r) : fb } catch { return fb }
  },
  set: (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)) } catch {} },
}
export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
export const code = () => Math.random().toString(36).slice(2, 8).toUpperCase()
