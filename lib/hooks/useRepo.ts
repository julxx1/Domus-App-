import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Minimal async-resource hook.
 *
 * Repositories are promise-based even locally, so every screen needs the same
 * load / reload / error shape. This keeps that in one place instead of
 * repeating useEffect+useState in a dozen components — and gives us a single
 * spot to add caching when Supabase arrives.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = []
): {
  data: T | null
  loading: boolean
  error: Error | null
  reload: () => Promise<void>
  /** Optimistic local update; does not persist on its own. */
  set: (updater: T | ((prev: T | null) => T)) => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Guards against setting state after unmount, and against a slow earlier
  // load resolving on top of a newer one.
  const mounted = useRef(true)
  const runId = useRef(0)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = useCallback(async () => {
    const id = ++runId.current
    setLoading(true)
    try {
      const result = await loader()
      if (mounted.current && id === runId.current) {
        setData(result)
        setError(null)
      }
    } catch (e) {
      if (mounted.current && id === runId.current) {
        setError(e instanceof Error ? e : new Error(String(e)))
      }
    } finally {
      if (mounted.current && id === runId.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    void load()
  }, [load])

  const set = useCallback((updater: T | ((prev: T | null) => T)) => {
    setData(prev => (typeof updater === 'function' ? (updater as (p: T | null) => T)(prev) : updater))
  }, [])

  return { data, loading, error, reload: load, set }
}
