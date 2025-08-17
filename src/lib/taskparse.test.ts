import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extractTasks, toggleTaskInMarkdown } from './taskparse'

describe('extractTasks', () => {
  it('detects checked and unchecked tasks with different cases', () => {
    const md = [
      '- [ ] todo',
      '- [x] done',
      '- [X] done upper',
    ].join('\n')
    const tasks = extractTasks(md)
    assert.equal(tasks.length, 3)
    assert.deepStrictEqual(tasks.map(t => t.checked), [false, true, true])
    assert.deepStrictEqual(tasks.map(t => t.text), ['todo', 'done', 'done upper'])
  })

  it('ignores tasks inside fenced code blocks', () => {
    const md = [
      '- [ ] outside',
      '```',
      '- [ ] inside',
      '- [x] also inside',
      '```',
      '- [X] outside too',
    ].join('\n')
    const tasks = extractTasks(md)
    assert.equal(tasks.length, 2)
    assert.deepStrictEqual(tasks.map(t => t.text), ['outside', 'outside too'])
  })
})

describe('toggleTaskInMarkdown', () => {
  it('toggles tasks preserving case', () => {
    const md = '- [X] upper'
    const hit = extractTasks(md)[0]
    const unchecked = toggleTaskInMarkdown(md, hit)
    assert.match(unchecked, /\[ \] upper/)
    const rechecked = toggleTaskInMarkdown(unchecked, { ...hit, checked: false })
    assert.match(rechecked, /\[X\] upper/)
  })

  it('toggles lowercase tasks', () => {
    const md = '- [x] lower'
    const hit = extractTasks(md)[0]
    const unchecked = toggleTaskInMarkdown(md, hit)
    assert.match(unchecked, /\[ \] lower/)
    const rechecked = toggleTaskInMarkdown(unchecked, { ...hit, checked: false })
    assert.match(rechecked, /\[x\] lower/)
  })

  it('checks an unchecked task with lowercase x', () => {
    const md = '- [ ] todo'
    const hit = extractTasks(md)[0]
    const checked = toggleTaskInMarkdown(md, hit)
    assert.match(checked, /\[x\] todo/)
  })
})
