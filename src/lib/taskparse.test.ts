import { describe, it, expect } from 'vitest'
import { extractTasks, toggleTaskInMarkdown } from './taskparse'

describe('extractTasks', () => {
  it('finds checked and unchecked tasks', () => {
    const md = '- [ ] todo\n- [x] done\n- [X] DONE'
    const hits = extractTasks(md)
    expect(hits).toHaveLength(3)
    expect(hits.map(h => h.checked)).toEqual([false, true, true])
  })

  it('supports *, +, and numbered lists', () => {
    const md = '* [ ] star\n+ [x] plus\n1. [ ] one\n2. [X] two'
    const hits = extractTasks(md)
    expect(hits).toHaveLength(4)
    expect(hits.map(h => h.checked)).toEqual([false, true, false, true])
  })

  it('supports bulletless checkboxes', () => {
    const md = '[ ] todo\n[x] done\n[X] DONE'
    const hits = extractTasks(md)
    expect(hits).toHaveLength(3)
    expect(hits.map(h => h.checked)).toEqual([false, true, true])
  })

  it('ignores tasks inside code fences', () => {
    const md = [
      '```',
      '- [ ] ignored',
      '```',
      '- [ ] real task',
    ].join('\n')
    expect(extractTasks(md)).toHaveLength(1)
  })

  it('ignores tasks in fenced blocks with languages and tildes', () => {
    const md = [
      '```js',
      '- [ ] ignored',
      '```',
      '~~~ts',
      '- [x] also ignored',
      '~~~',
      '- [ ] real task',
    ].join('\n')
    expect(extractTasks(md)).toHaveLength(1)
  })
})

describe('toggleTaskInMarkdown', () => {
  it('preserves checkbox case and only toggles the target line', () => {
    const md = '- [ ] a\n- [X] b\n- [x] c'
    const hits = extractTasks(md)
    const toggledOff = toggleTaskInMarkdown(md, hits[1])
    expect(toggledOff.split('\n')).toEqual(['- [ ] a', '- [ ] b', '- [x] c'])
    const toggledBack = toggleTaskInMarkdown(toggledOff, { ...hits[1], checked: false })
    expect(toggledBack.split('\n')).toEqual(['- [ ] a', '- [X] b', '- [x] c'])

    const toggledOffLower = toggleTaskInMarkdown(md, hits[2])
    expect(toggledOffLower.split('\n')).toEqual(['- [ ] a', '- [X] b', '- [ ] c'])
    const toggledBackLower = toggleTaskInMarkdown(toggledOffLower, { ...hits[2], checked: false })
    expect(toggledBackLower.split('\n')).toEqual(['- [ ] a', '- [X] b', '- [x] c'])
  })
})
