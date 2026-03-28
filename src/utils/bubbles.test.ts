import { describe, it, expect } from 'vitest'
import { setAllRates, restoreRates } from './bubbles'

function makeBubble(initialRate = 1): HTMLElement {
  const el = document.createElement('div')
  const anim = { playbackRate: initialRate }
  el.getAnimations = () => [anim] as unknown as Animation[]
  return el
}

function getRate(el: HTMLElement): number {
  return (el.getAnimations()[0] as unknown as { playbackRate: number }).playbackRate
}

describe('setAllRates', () => {
  it('全要素の playbackRate を指定値に変更する', () => {
    const bubbles = [1, 1, 1].map(() => makeBubble())
    setAllRates(bubbles, 4)
    for (const el of bubbles) {
      expect(getRate(el)).toBe(4)
    }
  })

  it('空の配列でもエラーにならない', () => {
    expect(() => setAllRates([], 4)).not.toThrow()
  })

  it('アニメーションがない要素はスキップする', () => {
    const el = document.createElement('div')
    el.getAnimations = () => []
    expect(() => setAllRates([el], 4)).not.toThrow()
  })
})

describe('restoreRates', () => {
  it('各要素の playbackRate を 1 に戻す', () => {
    const bubbles = [4, 4, 4].map((r) => makeBubble(r))
    restoreRates(bubbles)
    for (const el of bubbles) {
      expect(getRate(el)).toBe(1)
    }
  })

  it('空の配列でもエラーにならない', () => {
    expect(() => restoreRates([])).not.toThrow()
  })
})
