import { beforeEach, describe, expect, test, vi } from 'vitest'

import { POST } from '../route'
import { supabaseServer } from '@/lib/supabase-server'
import { TASKS_PAGE_SIZE } from '@/lib/tasks/constants'

vi.mock('@/lib/supabase-server', () => ({
  supabaseServer: vi.fn(),
}))

describe('POST /api/search', () => {
  let rpcMock: ReturnType<typeof vi.fn>
  let getUserMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    rpcMock = vi.fn().mockResolvedValue({ data: [] })
    getUserMock = vi
      .fn()
      .mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })

    const supabase = {
      auth: { getUser: getUserMock },
      rpc: rpcMock,
    }

    vi
      .mocked(supabaseServer)
      .mockResolvedValue(supabase as Awaited<ReturnType<typeof supabaseServer>>)
  })

  test('returns results when optional filters are missing', async () => {
    const request = new Request('http://localhost/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope: 'tasks' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ scope: 'tasks', page: 1, pageSize: 20, results: [] })

    expect(rpcMock).toHaveBeenCalledWith('search_note_tasks', {
      p_query: null,
      p_limit: 20,
      p_offset: 0,
      p_completion: null,
      p_tag: null,
      p_note_id: null,
      p_due: null,
      p_sort: 'text',
    })
  })

  test('accepts maximum allowed page size for tasks', async () => {
    const request = new Request('http://localhost/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope: 'tasks', pageSize: TASKS_PAGE_SIZE }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ scope: 'tasks', page: 1, pageSize: TASKS_PAGE_SIZE, results: [] })

    expect(rpcMock).toHaveBeenCalledWith('search_note_tasks', {
      p_query: null,
      p_limit: TASKS_PAGE_SIZE,
      p_offset: 0,
      p_completion: null,
      p_tag: null,
      p_note_id: null,
      p_due: null,
      p_sort: 'text',
    })
  })
})
