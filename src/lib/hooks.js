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
