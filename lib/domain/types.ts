/**
 * Domain model for Domus.
 *
 * These shapes are storage-agnostic on purpose: the local (AsyncStorage) and
 * the future Supabase repositories both speak this language, so swapping the
 * backend never reaches the UI.
 */

export type ID = string

// ── Perfil / familia ─────────────────────────────────────────────────────────

/** Mirrors the `profiles_role_check` CHECK constraint in Supabase exactly. */
export const ROLES = ['Mamá', 'Papá', 'Hijo', 'Hija', 'Abuelo', 'Abuela', 'Miembro', 'Admin'] as const
export type Role = (typeof ROLES)[number]

/**
 * Roles allowed to create/assign duties, manage the household, and invite
 * members — single source of truth mirroring the DB's
 * `private.can_invite_to_household()` role list. Every screen that gates a
 * privileged action on role (Cuenta, Mi familia) must check membership in
 * this array, never redeclare its own copy — the UI showing/hiding a button
 * is convenience, not security; the DB is still the real gate either way.
 */
export const PARENT_ROLES: readonly Role[] = ['Mamá', 'Papá', 'Abuelo', 'Abuela', 'Admin']

export function canInvite(role: Role | null | undefined): boolean {
  return role != null && PARENT_ROLES.includes(role)
}

/** Roles a household invitation can grant — every role except Admin (assigned only at household creation). */
export const INVITE_ROLES: readonly Role[] = ROLES.filter(r => r !== 'Admin')

export interface Profile {
  id: ID
  name: string
  role: Role
  color: string
  /** Household name. Kept on the profile until real families exist (Fase 2). */
  familyName: string
  email: string | null
}

export interface Member {
  id: ID
  name: string
  role: Role
  color: string
  /**
   * No presence system exists locally yet (Fase 2+), so this defaults to
   * `true` for every member — an honest "we assume everyone added is home"
   * rather than a fabricated status. Toggling it is a future feature.
   */
  atHome?: boolean
}

// ── Agenda ───────────────────────────────────────────────────────────────────

export const EVENT_CATEGORIES = [
  'familia', 'salud', 'deporte', 'trabajo', 'escuela', 'bienestar',
] as const
export type EventCategory = (typeof EVENT_CATEGORIES)[number]

export interface CalendarEvent {
  id: ID
  title: string
  note: string | null
  /** YYYY-MM-DD (local calendar day, not UTC). */
  date: string
  /** HH:MM 24h. */
  startTime: string
  /** HH:MM 24h, or null for an event with no end. */
  endTime: string | null
  category: EventCategory
  memberId: ID | null
  createdAt: string
}

// ── Deberes ──────────────────────────────────────────────────────────────────

export type RepeatMode = 'daily' | 'weekdays' | 'custom'

export interface Duty {
  id: ID
  title: string
  icon: string
  repeat: RepeatMode
  /** 0 = Monday … 6 = Sunday. */
  repeatDays: number[]
  /** HH:MM, or null when the duty has no fixed time. */
  time: string | null
  /** Empty = visible to everyone in the household. */
  assigneeIds: ID[]
  createdAt: string
}

/** One row per (duty, member, day). Absence means "not done". */
export interface DutyCompletion {
  dutyId: ID
  memberId: ID
  /** YYYY-MM-DD */
  date: string
  completedAt: string
}

// ── Mercado ──────────────────────────────────────────────────────────────────

export interface MarketItem {
  id: ID
  name: string
  note: string | null
  icon: string
  /** Sticky-note paper colour — a small fixed palette, not the app's theme. */
  color: string
  /** Degrees, fixed at creation so notes don't jiggle on re-render. */
  rot: number
  done: boolean
  doneAt: string | null
  createdAt: string
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: ID
  channelId: ID
  senderId: ID
  text: string
  createdAt: string
}

export interface Channel {
  id: ID
  name: string
  icon: string
}

// ── Seguridad ────────────────────────────────────────────────────────────────

export type CameraStatus =
  | 'registered'    // saved, never connected yet
  | 'connecting'
  | 'online'        // reachable, no stream open
  | 'streaming'     // live video actually flowing
  | 'offline'
  | 'auth_error'
  | 'unreachable'

export interface Camera {
  id: ID
  name: string
  location: string | null
  /** Never rendered in the UI and never logged. */
  host: string | null
  status: CameraStatus
  createdAt: string
}
