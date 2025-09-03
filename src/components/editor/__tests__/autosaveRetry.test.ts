import { describe, it, expect, vi } from 'vitest'
import { saveWithRetry, SaveStatus } from '../InlineEditor'
import './setup'

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

  it('rejects after the configured number of retries', async () => {
    vi.useFakeTimers()
    const setStatus = vi.fn()
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    const attemptRef = { current: 0 }
    const retryRef = { current: null as ReturnType<typeof setTimeout> | null }
    const onError = vi.fn()

    const promise = saveWithRetry(fn, setStatus, attemptRef, retryRef, {
      maxRetries: 2,
      onError,
    })

    await Promise.resolve()
    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    vi.advanceTimersByTime(2000)

    await expect(promise).rejects.toThrow('fail')
    expect(onError).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
