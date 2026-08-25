import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as Linking from 'expo-linking'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase/client'
import { setUserNamespace } from '@/lib/storage/kv'
import { translateAuthError } from './errors'
import type { HouseholdRow, ProfileRow } from '@/lib/supabase/types'

/**
 * DOMUS ↓ Splash (initializing) ↓ resolve session ↓
 *   no session          → unauthenticated  → (auth) screens
 *   session, no household → no-household   → (onboarding) screens
 *   session + household → ready            → (tabs)
 *   unexpected DB failure while resolving  → error (shown inline, never a blank screen)
 *
 * Nothing renders app content until `status` leaves 'initializing' — this is
 * what prevents the login→Inicio→login flash the spec calls out.
 */
export type AuthStatus = 'initializing' | 'unauthenticated' | 'no-household' | 'ready' | 'error'

interface Result {
  error: string | null
}

interface SignUpResult extends Result {
  needsEmailConfirmation: boolean
}

interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  profile: ProfileRow | null
  household: HouseholdRow | null
  errorMessage: string | null
  signIn(email: string, password: string): Promise<Result>
  signUp(input: { firstName: string; lastName: string; email: string; password: string }): Promise<SignUpResult>
  signOut(): Promise<void>
  deleteAccount(): Promise<Result>
  resendConfirmation(email: string): Promise<Result>
  resetPassword(email: string): Promise<Result>
  updatePasswordFromRecovery(newPassword: string): Promise<Result>
  createHousehold(name: string): Promise<Result>
  joinHousehold(code: string): Promise<Result>
  refreshProfile(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [household, setHousehold] = useState<HouseholdRow | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (profileError) throw profileError
    const profileRow = (profileData ?? null) as ProfileRow | null
    setProfile(profileRow)

    if (!profileRow?.household_id) {
      setHousehold(null)
      setStatus('no-household')
      return
    }

    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', profileRow.household_id)
      .maybeSingle()
    if (householdError) throw householdError
    const householdRow = (householdData ?? null) as HouseholdRow | null
    setHousehold(householdRow)
    setStatus(householdRow ? 'ready' : 'no-household')
  }, [])

  const resolveSession = useCallback(
    async (nextSession: Session | null) => {
      setSession(nextSession)
      setUserNamespace(nextSession?.user.id ?? null)

      if (!nextSession) {
        setProfile(null)
        setHousehold(null)
        setErrorMessage(null)
        setStatus('unauthenticated')
        return
      }

      try {
        await loadProfile(nextSession.user.id)
        setErrorMessage(null)
      } catch (e) {
        setErrorMessage(translateAuthError(e))
        setStatus('error')
      }
    },
    [loadProfile]
  )

  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) void resolveSession(data.session)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // PASSWORD_RECOVERY is only ever emitted from GoTrueClient's web-only
      // `_initialize()` URL-detection path (gated behind `isBrowser()` — no
      // React Native equivalent exists in @supabase/auth-js 2.x). It will
      // never fire here; app/_layout.tsx's AuthGate instead exempts the
      // `/reset-password` route from the normal ready→(tabs) redirect, which
      // is what actually keeps a recovery session on that screen. This branch
      // is kept so the app does the right thing for free if a future SDK
      // version ever adds RN support for it — it's not the load-bearing fix.
      if (event === 'PASSWORD_RECOVERY') {
        setSession(nextSession)
        return
      }
      void resolveSession(nextSession)
    })
    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [resolveSession])

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { error: translateAuthError(error) }
    return { error: null }
  }, [])

  const signUp = useCallback<AuthContextValue['signUp']>(async ({ firstName, lastName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    })
    if (error) return { error: translateAuthError(error), needsEmailConfirmation: false }
    return { error: null, needsEmailConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange fires resolveSession(null) — no manual state reset needed.
  }, [])

  const deleteAccount = useCallback<AuthContextValue['deleteAccount']>(async () => {
    const { error } = await supabase.rpc('delete_own_account')
    if (error) return { error: translateAuthError(error) }
    // The account (and its auth.users row) no longer exists — the access
    // token is now invalid. signOut() clears local storage/session state so
    // AuthGate sends the user back to Welcome instead of retrying requests
    // against a deleted account.
    await supabase.auth.signOut()
    return { error: null }
  }, [])

  const resendConfirmation = useCallback<AuthContextValue['resendConfirmation']>(async email => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
    if (error) return { error: translateAuthError(error) }
    return { error: null }
  }, [])

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(async email => {
    const redirectTo = Linking.createURL('reset-password')
    if (__DEV__) {
      // Exact value to add under Supabase Dashboard → Authentication → URL
      // Configuration → Redirect URLs for this to be honored instead of
      // falling back to the project's Site URL. Changes with the dev
      // server's IP/port/tunnel — re-check after restarting `expo start`.
      console.log('[DEV] Password reset redirect:', redirectTo)
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (error) return { error: translateAuthError(error) }
    return { error: null }
  }, [])

  const updatePasswordFromRecovery = useCallback<AuthContextValue['updatePasswordFromRecovery']>(
    async newPassword => {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { error: translateAuthError(error) }
      return { error: null }
    },
    []
  )

  const createHousehold = useCallback<AuthContextValue['createHousehold']>(
    async name => {
      const { data, error } = await supabase.rpc('create_household', { p_name: name.trim() })
      if (error) return { error: translateAuthError(error) }
      setHousehold(data as HouseholdRow)
      if (session) await loadProfile(session.user.id)
      return { error: null }
    },
    [session, loadProfile]
  )

  const joinHousehold = useCallback<AuthContextValue['joinHousehold']>(
    async code => {
      const { data, error } = await supabase.rpc('join_household_with_code', { p_code: code.trim() })
      if (error) return { error: translateAuthError(error) }
      setHousehold(data as HouseholdRow)
      if (session) await loadProfile(session.user.id)
      return { error: null }
    },
    [session, loadProfile]
  )

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id)
  }, [session, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      profile,
      household,
      errorMessage,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      resendConfirmation,
      resetPassword,
      updatePasswordFromRecovery,
      createHousehold,
      joinHousehold,
      refreshProfile,
    }),
    [
      status, session, profile, household, errorMessage,
      signIn, signUp, signOut, deleteAccount, resendConfirmation, resetPassword,
      updatePasswordFromRecovery, createHousehold, joinHousehold, refreshProfile,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
