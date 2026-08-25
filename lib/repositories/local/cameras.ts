import { readJSON, writeJSON, uid } from '@/lib/storage/kv'
import type { Camera, ID } from '@/lib/domain/types'
import type { CameraRepository } from '../types'

/**
 * Camera metadata only.
 *
 * Credentials are NEVER stored here — they belong in the OS keychain, and that
 * work lands with the native ONVIF client. A camera saved through this
 * repository is `registered`, never `streaming`: the UI must not show LIVE
 * without an actual stream.
 */

const KEY = 'cameras'

async function all(): Promise<Camera[]> {
  return readJSON<Camera[]>(KEY, [])
}

export const localCameraRepository: CameraRepository = {
  async list() {
    return all()
  },

  async create(input) {
    const cameras = await all()
    const camera: Camera = {
      ...input,
      id: uid(),
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    await writeJSON(KEY, [...cameras, camera])
    return camera
  },

  async update(id, patch) {
    const cameras = await all()
    const index = cameras.findIndex(c => c.id === id)
    if (index === -1) throw new Error('La cámara ya no existe.')
    const updated: Camera = { ...cameras[index]!, ...patch }
    const next = [...cameras]
    next[index] = updated
    await writeJSON(KEY, next)
    return updated
  },

  async remove(id: ID) {
    const cameras = await all()
    await writeJSON(KEY, cameras.filter(c => c.id !== id))
  },
}
