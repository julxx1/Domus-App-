import { useState, useEffect, useRef } from 'react'
import { useAuth } from './auth'
import { store, uid } from './store'

// ── Family members ────────────────────────────────────────────────────────────
export function useFamilyMembers() {
  const { profile } = useAuth()
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!profile?.household_id) return
    const all = store.get('profiles', [])
    setMembers(all.filter(p => p.household_id === profile.household_id))
  }, [profile?.household_id, profile?.id, profile?.name, profile?.color])

  return members
}

// ── Chat messages ─────────────────────────────────────────────────────────────
export function useMessages(channelId) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])

  function load() {
    if (!channelId) return
    const profiles = store.get('profiles', [])
    const msgs = store.get(`msgs_${channelId}`, [])
    setMessages(msgs.map(m => ({ ...m, profiles: profiles.find(p => p.id === m.sender_id) || null })))
  }

  useEffect(load, [channelId])

  function sendMessage(text) {
    if (!text.trim() || !profile) return
    const msg = {
      id: uid(), channel_id: channelId, sender_id: profile.id,
      text: text.trim(), household_id: profile.household_id,
      created_at: new Date().toISOString(),
    }
    const arr = store.get(`msgs_${channelId}`, []); arr.push(msg); store.set(`msgs_${channelId}`, arr)
    setMessages(prev => [...prev, { ...msg, profiles: profile }])
  }

  return { messages, sendMessage }
}

// ── Chat channels ─────────────────────────────────────────────────────────────
export function useChannels() {
  const { profile } = useAuth()
  const [channels, setChannels] = useState([])

  useEffect(() => {
    if (!profile?.household_id) return
    let chs = store.get(`channels_${profile.household_id}`, [])
    if (chs.length === 0) {
      chs = [
        { id: uid(), name: 'General',    icon: 'chat',     household_id: profile.household_id },
        { id: uid(), name: 'Compras',    icon: 'cart',     household_id: profile.household_id },
        { id: uid(), name: 'Importante', icon: 'bell',     household_id: profile.household_id },
      ]
      store.set(`channels_${profile.household_id}`, chs)
    }
    // attach last message
    const withLast = chs.map(ch => {
      const msgs = store.get(`msgs_${ch.id}`, [])
      return { ...ch, messages: msgs.length ? [msgs[msgs.length - 1]] : [] }
    })
    setChannels(withLast)
  }, [profile?.household_id])

  return channels
}

// ── Pantry / Mercado ──────────────────────────────────────────────────────────
export function usePantry() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])

  function load() {
    if (!profile?.household_id) return
    setItems(store.get(`pantry_${profile.household_id}`, []))
  }
  useEffect(load, [profile?.household_id])

  function addItem(name, note, icon, color, rot) {
    const item = {
      id: uid(), name, note, icon,
      color: color || '#FFF4B8', rot: rot || 0, done: false,
      household_id: profile.household_id, added_by: profile.id,
      created_at: new Date().toISOString(),
    }
    const arr = store.get(`pantry_${profile.household_id}`, []); arr.push(item)
    store.set(`pantry_${profile.household_id}`, arr); setItems([...arr])
  }

  function toggleItem(id, done) {
    const arr = store.get(`pantry_${profile.household_id}`, [])
    const i = arr.findIndex(x => x.id === id); if (i >= 0) arr[i] = { ...arr[i], done: !done }
    store.set(`pantry_${profile.household_id}`, arr); setItems([...arr])
  }

  function deleteItem(id) {
    const arr = store.get(`pantry_${profile.household_id}`, []).filter(x => x.id !== id)
    store.set(`pantry_${profile.household_id}`, arr); setItems([...arr])
  }

  return { items, addItem, toggleItem, deleteItem }
}

// ── Calendar events ───────────────────────────────────────────────────────────
export function useCalendarEvents(dateStr) {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])

  function load() {
    if (!profile?.household_id) return
    const profiles = store.get('profiles', [])
    const all = store.get(`cal_${profile.household_id}`, [])
    const filtered = all
      .filter(e => e.start_time?.startsWith(dateStr))
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
      .map(e => ({ ...e, profiles: profiles.find(p => p.id === e.member_id) || null }))
    setEvents(filtered)
  }
  useEffect(load, [profile?.household_id, dateStr])

  function addEvent({ title, start_time, end_time, note, category, member_id }) {
    const ev = {
      id: uid(), title, start_time, end_time, note, category, member_id,
      household_id: profile.household_id, created_by: profile.id,
      created_at: new Date().toISOString(),
    }
    const arr = store.get(`cal_${profile.household_id}`, []); arr.push(ev)
    store.set(`cal_${profile.household_id}`, arr); load()
  }

  return { events, addEvent }
}

// ── Location sharing ──────────────────────────────────────────────────────────
export function useLocations() {
  const { profile } = useAuth()
  const [locations, setLocations] = useState({})
  const watchRef = useRef(null)

  useEffect(() => {
    if (!profile?.household_id) return
    setLocations(store.get(`locs_${profile.household_id}`, {}))

    if (!navigator.geolocation) return
    const push = (pos) => {
      const loc = {
        profile_id: profile.id, household_id: profile.household_id,
        lat: pos.coords.latitude, lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy, updated_at: new Date().toISOString(),
      }
      const all = store.get(`locs_${profile.household_id}`, {})
      all[profile.id] = loc; store.set(`locs_${profile.household_id}`, all)
      setLocations({ ...all })
    }
    watchRef.current = navigator.geolocation.watchPosition(push, null, { enableHighAccuracy: true, maximumAge: 30000 })
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current) }
  }, [profile?.household_id, profile?.id])

  return locations
}

// ── Cameras ───────────────────────────────────────────────────────────────────
export function useCameras() {
  const { profile } = useAuth()
  const [cameras, setCameras] = useState([])

  useEffect(() => {
    if (!profile?.household_id) return
    setCameras(store.get(`cams_${profile.household_id}`, []))
  }, [profile?.household_id])

  function addCamera({ name, location, rtsp_url }) {
    const cam = { id: uid(), name, location, rtsp_url, active: true, household_id: profile.household_id }
    const arr = store.get(`cams_${profile.household_id}`, []); arr.push(cam)
    store.set(`cams_${profile.household_id}`, arr); setCameras([...arr])
  }

  return { cameras, addCamera }
}

// ── Deberes diarios ───────────────────────────────────────────────────────────
const DEBER_DEFAULTS = (hhId, createdBy) => [
  { title: 'Paseo de la mascota', icon: 'paw',      assignee_ids: [], repeat: 'daily',    repeat_days: [0,1,2,3,4,5,6], time: null, household_id: hhId, created_by: createdBy },
  { title: 'Gym',                 icon: 'flame',    assignee_ids: [], repeat: 'custom',   repeat_days: [0,2,4],          time: null, household_id: hhId, created_by: createdBy },
  { title: 'Tareas escolares',    icon: 'pencil',   assignee_ids: [], repeat: 'weekdays', repeat_days: [0,1,2,3,4],      time: null, household_id: hhId, created_by: createdBy },
  { title: 'Asistencia a karate', icon: 'sparkles', assignee_ids: [], repeat: 'custom',   repeat_days: [1,3],            time: null, household_id: hhId, created_by: createdBy },
].map(d => ({ ...d, id: uid() }))

function dayIndex(dateStr) {
  return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7
}

function deberOnDay(deber, dateStr) {
  const d = dayIndex(dateStr)
  if (deber.repeat === 'daily') return true
  if (deber.repeat === 'weekdays') return d <= 4
  if (deber.repeat === 'custom') return (deber.repeat_days || []).includes(d)
  return false
}

export function useDeberes(dateStr) {
  const { profile } = useAuth()
  const [deberes, setDeberes] = useState([])
  const [checks, setChecks] = useState({})

  function loadAll() {
    if (!profile?.household_id) return
    let all = store.get(`deberes_${profile.household_id}`, null)
    if (all === null) {
      all = DEBER_DEFAULTS(profile.household_id, profile.id)
      store.set(`deberes_${profile.household_id}`, all)
    }
    setDeberes(dateStr ? all.filter(d => deberOnDay(d, dateStr)) : all)
  }

  function loadChecks() {
    if (!profile?.household_id || !dateStr) return
    setChecks(store.get(`deber_checks_${profile.household_id}_${dateStr}`, {}))
  }

  useEffect(() => { loadAll(); loadChecks() }, [profile?.household_id, dateStr])

  function toggleCheck(deberId, userId) {
    const key = `${deberId}_${userId}`
    const all = store.get(`deber_checks_${profile.household_id}_${dateStr}`, {})
    if (all[key]) delete all[key]
    else all[key] = { deber_id: deberId, user_id: userId, completed_at: new Date().toISOString() }
    store.set(`deber_checks_${profile.household_id}_${dateStr}`, all)
    setChecks({ ...all })
  }

  function addDeber({ title, icon, assignee_ids, repeat, repeat_days, time }) {
    const all = store.get(`deberes_${profile.household_id}`, [])
    const d = { id: uid(), title, icon: icon || 'check', assignee_ids: assignee_ids || [], repeat, repeat_days: repeat_days || [], time: time || null, household_id: profile.household_id, created_by: profile.id }
    all.push(d)
    store.set(`deberes_${profile.household_id}`, all)
    if (dateStr && deberOnDay(d, dateStr)) setDeberes(prev => [...prev, d])
  }

  function deleteDeber(id) {
    const all = store.get(`deberes_${profile.household_id}`, []).filter(d => d.id !== id)
    store.set(`deberes_${profile.household_id}`, all)
    setDeberes(prev => prev.filter(d => d.id !== id))
  }

  function editDeber(id, updates) {
    const all = store.get(`deberes_${profile.household_id}`, []).map(d => d.id === id ? { ...d, ...updates } : d)
    store.set(`deberes_${profile.household_id}`, all)
    loadAll()
  }

  function getWeekHistory() {
    if (!profile?.household_id) return []
    const allDef = store.get(`deberes_${profile.household_id}`, [])
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      const dayDef = allDef.filter(def => deberOnDay(def, ds))
      const dayChecks = store.get(`deber_checks_${profile.household_id}_${ds}`, {})
      const myChecks = Object.values(dayChecks).filter(c => c.user_id === profile.id).length
      const total = dayDef.length
      return { dateStr: ds, day: ['L','M','X','J','V','S','D'][(d.getDay() + 6) % 7], total, myChecks, pct: total > 0 ? Math.round((myChecks / total) * 100) : 0 }
    })
  }

  return { deberes, checks, toggleCheck, addDeber, deleteDeber, editDeber, getWeekHistory }
}
