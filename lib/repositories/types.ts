import type {
  Camera,
  CalendarEvent,
  Channel,
  Duty,
  DutyCompletion,
  ID,
  MarketItem,
  Member,
  Message,
  Profile,
} from '@/lib/domain/types'

/**
 * Repository contracts.
 *
 * Every method is async even where the local implementation could be sync —
 * that is deliberate, so replacing `Local*Repository` with `Supabase*Repository`
 * is a one-line swap in `lib/repositories/index.ts` and no screen changes.
 */

export interface ProfileRepository {
  get(): Promise<Profile>
  update(patch: Partial<Omit<Profile, 'id'>>): Promise<Profile>
  listMembers(): Promise<Member[]>
  addMember(member: Omit<Member, 'id'>): Promise<Member>
  removeMember(id: ID): Promise<void>
}

export interface EventRepository {
  /** All events for a YYYY-MM-DD day, ordered by start time. */
  listByDate(date: string): Promise<CalendarEvent[]>
  /** Days in the given month (YYYY-MM) that have at least one event. */
  datesWithEvents(month: string): Promise<string[]>
  create(input: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent>
  update(id: ID, patch: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): Promise<CalendarEvent>
  remove(id: ID): Promise<void>
}

export interface DutyRepository {
  listAll(): Promise<Duty[]>
  /** Duties that repeat on the weekday of the given YYYY-MM-DD. */
  listForDate(date: string): Promise<Duty[]>
  create(input: Omit<Duty, 'id' | 'createdAt'>): Promise<Duty>
  update(id: ID, patch: Partial<Omit<Duty, 'id' | 'createdAt'>>): Promise<Duty>
  remove(id: ID): Promise<void>

  listCompletions(date: string): Promise<DutyCompletion[]>
  /** Idempotent toggle; returns the resulting checked state. */
  toggleCompletion(dutyId: ID, memberId: ID, date: string): Promise<boolean>
}

export interface MarketRepository {
  list(): Promise<MarketItem[]>
  create(input: Omit<MarketItem, 'id' | 'createdAt' | 'done' | 'doneAt'>): Promise<MarketItem>
  update(id: ID, patch: Partial<Omit<MarketItem, 'id' | 'createdAt'>>): Promise<MarketItem>
  toggleDone(id: ID): Promise<MarketItem>
  remove(id: ID): Promise<void>
  clearCompleted(): Promise<void>
}

/**
 * Chat is LOCAL AND TEMPORARY. It exists so the UI (composer, bubbles, scroll,
 * keyboard) can be built and felt on the device. It is not a realtime chat and
 * must not be presented as one — messages never leave the phone.
 */
export interface MessageRepository {
  listChannels(): Promise<Channel[]>
  listMessages(channelId: ID): Promise<Message[]>
  send(channelId: ID, senderId: ID, text: string): Promise<Message>
  remove(id: ID): Promise<void>
}

export interface CameraRepository {
  list(): Promise<Camera[]>
  create(input: Omit<Camera, 'id' | 'createdAt' | 'status'>): Promise<Camera>
  update(id: ID, patch: Partial<Omit<Camera, 'id' | 'createdAt'>>): Promise<Camera>
  remove(id: ID): Promise<void>
}

export interface Repositories {
  profile: ProfileRepository
  events: EventRepository
  duties: DutyRepository
  market: MarketRepository
  messages: MessageRepository
  cameras: CameraRepository
}
