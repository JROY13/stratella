import { describe, it, expect, vi } from 'vitest'
import { saveWithRetry, SaveStatus } from '../InlineEditor'

describe('saveWithRetry', () => {
  it('retries failed saves with exponential backoff', async () => {
    vi.useFakeTimers()
    const statuses: SaveStatus[] = []
    const setStatus = (s: SaveStatus) => statuses.push(s)
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(undefined)

    const attemptRef = { current: 0 }
    const retryRef = { current: null as ReturnType<typeof setTimeout> | null }

    const promise = saveWithRetry(fn, setStatus, attemptRef, retryRef)

    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(statuses).toContain('saving')
    expect(statuses).toContain('retrying')

    vi.advanceTimersByTime(1000)
    await promise

    expect(fn).toHaveBeenCalledTimes(2)
    expect(statuses[statuses.length - 1]).toBe('saved')
    vi.useRealTimers()
  })
})
