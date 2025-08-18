import { describe, it, expect } from 'vitest'
import { extractTasks, toggleTaskInMarkdown } from './taskparse'

describe('extractTasks', () => {
  it('detects checked and unchecked tasks with different cases', () => {
    const md = [
      '- [ ] todo',
      '- [x] done',
      '- [X] done upper',
    ].join('\n')
    const hits = extractTasks(md)
    expect(hits).toHaveLength(3)
    expect(hits.map(h => h.checked)).toEqual([false, true, true])
    expect(hits.map(h => h.text)).toEqual(['todo', 'done', 'done upper'])
  })

  it('finds checked and unchecked tasks', () => {
    const md = '- [ ] todo\n- [x] done\n- [X] DONE'
    const hits = extractTasks(md)
    expect(hits).toHaveLength(3)
    expect(hits.map(h => h.checked)).toEqual([false, true, true])
  })

  it('ignores tasks inside code fences', () => {
    const md = [
      '- [ ] outside',
      '```',
      '- [ ] inside',
      '- [x] also inside',
      '```',
      '- [X] outside too',
    ].join('\n')
    const hits = extractTasks(md)
    expect(hits).toHaveLength(2)
    expect(hits.map(h => h.text)).toEqual(['outside', 'outside too'])
  })

  it('ignores tasks inside code fences (simple)', () => {
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

  it('toggles tasks preserving case', () => {
    const md = '- [X] upper'
    const hit = extractTasks(md)[0]
    const unchecked = toggleTaskInMarkdown(md, hit)
    expect(unchecked).toMatch(/\[ \] upper/)
    const rechecked = toggleTaskInMarkdown(unchecked, { ...hit, checked: false })
    expect(rechecked).toMatch(/\[X\] upper/)
  })

  it('toggles lowercase tasks', () => {
    const md = '- [x] lower'
    const hit = extractTasks(md)[0]
    const unchecked = toggleTaskInMarkdown(md, hit)
    expect(unchecked).toMatch(/\[ \] lower/)
    const rechecked = toggleTaskInMarkdown(unchecked, { ...hit, checked: false })
    expect(rechecked).toMatch(/\[x\] lower/)
  })

  it('checks an unchecked task with lowercase x', () => {
    const md = '- [ ] todo'
    const hit = extractTasks(md)[0]
    const checked = toggleTaskInMarkdown(md, hit)
    expect(checked).toMatch(/\[x\] todo/)
  })
})

