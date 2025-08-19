import { describe, it, expect } from 'vitest'
import { extractTasks, toggleTaskInMarkdown, filterTasks, TaskWithNote } from './taskparse'

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

  it('parses inline metadata', () => {
    const md = '- [ ] task due:2024-07-01 tag:home #work status:waiting'
    const [hit] = extractTasks(md)
    expect(hit.due).toBe('2024-07-01')
    expect(hit.tags.sort()).toEqual(['home', 'work'])
    expect(hit.status).toBe('waiting')
    expect(hit.text).toBe('task')
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

describe('filterTasks', () => {
  const tasks: TaskWithNote[] = [
    { text: 'a', checked: false, line: 0, start: 0, end: 0, mark: ' ', tags: ['work'], noteId: '1', due: '2024-07-01', status: 'todo' },
    { text: 'b', checked: true, line: 1, start: 0, end: 0, mark: 'x', tags: ['home'], noteId: '1', due: '2024-07-03', status: 'waiting' },
    { text: 'c', checked: false, line: 2, start: 0, end: 0, mark: ' ', tags: ['work'], noteId: '2', due: '2024-07-02', status: 'todo' },
    { text: 'd', checked: false, line: 3, start: 0, end: 0, mark: ' ', tags: [], noteId: '3', status: 'todo' },
  ]

  it('filters by completion', () => {
    const res = filterTasks(tasks, { completion: 'open' })
    expect(res.map(t => t.text)).toEqual(['a', 'c', 'd'])
  })

  it('filters by tag and due date', () => {
    const res = filterTasks(tasks, { tag: 'work', due: '2024-07-02' })
    expect(res.map(t => t.text)).toEqual(['c'])
  })

  it('sorts by due date', () => {
    const res = filterTasks(tasks, { sort: 'due' })
    expect(res.map(t => t.text)).toEqual(['a', 'c', 'b', 'd'])
  })
})
