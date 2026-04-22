const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 3

const memoryMap = new Map<string, { count: number; resetTime: number }>()

function memoryRateLimit(clientKey: string): boolean {
  const now = Date.now()
  const key = `subscribe_rl_${clientKey}`
  const entry = memoryMap.get(key)
  if (entry) {
    if (now < entry.resetTime) {
      if (entry.count >= MAX_REQUESTS) return true
      entry.count += 1
    } else {
      memoryMap.set(key, { count: 1, resetTime: now + WINDOW_MS })
    }
  } else {
    memoryMap.set(key, { count: 1, resetTime: now + WINDOW_MS })
  }
  return false
}

/**
 * Returns true if the client should be rate limited.
 * Uses Vercel KV when KV_REST_API_URL and KV_REST_API_TOKEN are set; otherwise falls back to in-memory (single-instance only).
 */
export async function isSubscribeRateLimited(clientKey: string): Promise<boolean> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv')
    const key = `subscribe:rl:${clientKey}`
    const count = await kv.incr(key)
    if (count === 1) {
      await kv.expire(key, Math.ceil(WINDOW_MS / 1000))
    }
    return count > MAX_REQUESTS
  }
  return memoryRateLimit(clientKey)
}
