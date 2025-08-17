import { describe, it, expect } from 'vitest'
import { extractTasks, toggleTaskInMarkdown } from './taskparse'

describe('extractTasks', () => {
  it('finds checked and unchecked tasks', () => {
    const md = '- [ ] todo\n- [x] done\n- [X] DONE'
    const hits = extractTasks(md)
    expect(hits).toHaveLength(3)
    expect(hits.map(h => h.checked)).toEqual([false, true, true])
  })

  it('ignores tasks inside code fences', () => {
    const md = '```\n- [ ] ignored\n```\n- [ ] real task'
    expect(extractTasks(md)).toHaveLength(1)
  })
})

describe('toggleTaskInMarkdown', () => {
  it('toggles the specified hit only', () => {
    const md = '- [ ] a\n- [x] b'
    const hit = extractTasks(md)[0]
    const toggled = toggleTaskInMarkdown(md, hit)
    expect(toggled.split('\n')).toEqual(['- [x] a', '- [x] b'])
  })
})
