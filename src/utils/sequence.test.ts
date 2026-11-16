import { describe, it, expect, vi } from 'vitest'
import { createSequenceMatcher, KONAMI } from './sequence'

describe('createSequenceMatcher', () => {
  it('シーケンスを正しく入力すると onMatch が呼ばれる', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(KONAMI, onMatch)
    for (const k of KONAMI) m.push(k)
    expect(onMatch).toHaveBeenCalledTimes(1)
  })

  it('大文字小文字を区別しない', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(['m', 'a', 'n', 't', 'a'], onMatch)
    for (const k of 'MANTA') m.push(k)
    expect(onMatch).toHaveBeenCalledTimes(1)
  })

  it('前に余計な入力があっても末尾で一致すれば検出する', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(['m', 'a', 'n', 't', 'a'], onMatch)
    for (const k of 'xxmamanta') m.push(k)
    expect(onMatch).toHaveBeenCalledTimes(1)
  })

  it('途中で間違えると検出しない', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(['m', 'a', 'n', 't', 'a'], onMatch)
    for (const k of 'manxa') m.push(k)
    expect(onMatch).not.toHaveBeenCalled()
  })

  it('一致後はバッファがリセットされ、連続で再検出できる', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(['a', 'b'], onMatch)
    for (const k of 'abab') m.push(k)
    expect(onMatch).toHaveBeenCalledTimes(2)
  })

  it('reset するとそれまでの入力は無視される', () => {
    const onMatch = vi.fn()
    const m = createSequenceMatcher(['a', 'b'], onMatch)
    m.push('a')
    m.reset()
    m.push('b')
    expect(onMatch).not.toHaveBeenCalled()
  })
})
