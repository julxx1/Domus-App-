/**
 * Supabase/Postgres errors → human Spanish. Never shown: raw messages, stack
 * traces, or anything that reveals whether an email exists when it shouldn't.
 *
 * Mirrors `domus-app/src/lib/auth.tsx`'s `translateAuthError`, extended with
 * the RPC error codes raised by the `create_household`/`join_household_with_code`
 * functions in `supabase/migrations/20260812000000_household_invitations_and_rpc.sql`.
 */
export function translateAuthError(raw: unknown): string {
  const message = extractMessage(raw)
  const m = message.toLowerCase()

  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (m.includes('user already registered') || m.includes('already registered'))
    return 'Ya existe una cuenta con ese correo.'
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.'
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (m.includes('password should be') || (m.includes('password') && m.includes('least')))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('invalid email') || m.includes('unable to validate email'))
    return 'Ese correo no es válido.'
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch'))
    return 'No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.'
  if (m.includes('jwt') || (m.includes('session') && m.includes('expired')))
    return 'Tu sesión expiró. Inicia sesión de nuevo.'

  // household/invitation RPC error codes (RAISE EXCEPTION 'code' in SQL)
  if (m.includes('not_authenticated')) return 'Tu sesión expiró. Inicia sesión de nuevo.'
  if (m.includes('already_in_household')) return 'Ya perteneces a una familia.'
  if (m.includes('invalid_name')) return 'Escribe un nombre para tu hogar.'
  if (m.includes('invalid_code')) return 'Ese código no es válido.'
  if (m.includes('code_already_used')) return 'Ese código ya fue utilizado.'
  if (m.includes('code_expired')) return 'Ese código ya expiró. Pide uno nuevo.'
  if (m.includes('not_authorized')) return 'No tienes permiso para hacer esto.'
  if (m.includes('invalid_role')) return 'Ese rol no es válido.'
  if (m.includes('owner_has_members'))
    return 'Eres el administrador de tu hogar y hay otros miembros en él. Transfiere la administración o pídeles que se unan a otra familia antes de eliminar tu cuenta.'

  return message || 'Ocurrió un error. Inténtalo de nuevo.'
}

function extractMessage(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object') {
    const obj = raw as { message?: unknown; error_description?: unknown }
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error_description === 'string') return obj.error_description
  }
  return ''
}
