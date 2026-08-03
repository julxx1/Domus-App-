import { createContext, useContext, useState } from 'react'
import { store, uid, code } from './store'

const AuthContext = createContext(null)

const COLORS = ['#C97B4A','#7A8B6F','#5B7BA5','#7B5B9A','#C97B8A','#C9A74A','#4A8B6F','#9B5A4A']
const initial = (name) => name?.trim()?.[0]?.toUpperCase() || '?'

function loadProfileWithHousehold(profile) {
  if (!profile?.household_id) return profile
  const hh = store.get('households', []).find(h => h.id === profile.household_id)
  return hh ? { ...profile, households: hh } : profile
}

export function AuthProvider({ children }) {
  const [profile, setProfileState] = useState(() =>
    loadProfileWithHousehold(store.get('profile'))
  )

  function persist(p) {
    const full = loadProfileWithHousehold(p)
    store.set('profile', full)
    setProfileState(full)
    // keep profiles list in sync
    const list = store.get('profiles', [])
    const idx = list.findIndex(x => x.id === full.id)
    if (idx >= 0) list[idx] = full; else list.push(full)
    store.set('profiles', list)
  }

  async function signUp(email, password, name, role) {
    const exists = store.get('profiles', []).find(p => p.email === email)
    if (exists) throw new Error('Ya existe una cuenta con ese correo')
    const color = COLORS[store.get('profiles', []).length % COLORS.length]
    persist({ id: uid(), email, name, role, color, initial: initial(name), household_id: null })
  }

  async function signIn(email, password) {
    const found = store.get('profiles', []).find(p => p.email === email)
    if (!found) throw new Error('Correo no registrado. Crea una cuenta primero.')
    persist(found)
  }

  async function signOut() {
    store.set('profile', null)
    setProfileState(null)
  }

  async function createHousehold(householdName) {
    const hh = { id: uid(), name: householdName, owner_id: profile.id, invite_code: code() }
    const list = store.get('households', []); list.push(hh); store.set('households', list)
    persist({ ...profile, household_id: hh.id })
    return hh
  }

  async function joinHousehold(inviteCode) {
    const hh = store.get('households', []).find(h => h.invite_code === inviteCode.toUpperCase())
    if (!hh) throw new Error('Código inválido')
    persist({ ...profile, household_id: hh.id })
    return hh
  }

  async function updateProfile({ name, role, color }) {
    const updated = { ...profile, name, role, color, initial: initial(name) }
    persist(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{
      session: profile ? { user: { id: profile.id } } : null,
      profile,
      loading: false,
      signIn, signUp, signOut, createHousehold, joinHousehold, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
