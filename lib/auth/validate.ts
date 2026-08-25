const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

/** Matches Supabase Auth's default minimum. */
export const MIN_PASSWORD_LENGTH = 6

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}
