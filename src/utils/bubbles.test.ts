import { describe, it, expect, beforeEach } from 'vitest'
import { setAllDurations, restoreBaseDurations } from './bubbles'

function makeBubble(baseDuration: string, currentDuration?: string): HTMLElement {
  const el = document.createElement('div')
  el.classList.add('bubble')
  el.dataset.baseDuration = baseDuration
  el.style.setProperty('--bubble-duration', currentDuration ?? baseDuration)
  return el
}

describe('setAllDurations', () => {
  let bubbles: HTMLElement[]

  beforeEach(() => {
    bubbles = ['4s', '6s', '8s'].map((d) => makeBubble(d))
  })

  it('全要素の --bubble-duration を指定値に変更する', () => {
    setAllDurations(bubbles, '2s')
    for (const el of bubbles) {
      expect(el.style.getPropertyValue('--bubble-duration')).toBe('2s')
    }
  })

  it('空の配列でもエラーにならない', () => {
    expect(() => setAllDurations([], '2s')).not.toThrow()
  })

  it('data-base-duration は変更しない', () => {
    setAllDurations(bubbles, '2s')
    expect(bubbles[0].dataset.baseDuration).toBe('4s')
    expect(bubbles[1].dataset.baseDuration).toBe('6s')
  })
})

describe('restoreBaseDurations', () => {
  let bubbles: HTMLElement[]

  beforeEach(() => {
    bubbles = ['4s', '6s', '8s'].map((d) => makeBubble(d, '2s'))
  })

  it('各要素の --bubble-duration を data-base-duration に戻す', () => {
    restoreBaseDurations(bubbles)
    expect(bubbles[0].style.getPropertyValue('--bubble-duration')).toBe('4s')
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('6s')
    expect(bubbles[2].style.getPropertyValue('--bubble-duration')).toBe('8s')
  })

  it('data-base-duration がない場合はフォールバック値を使う', () => {
    const el = document.createElement('div')
    el.style.setProperty('--bubble-duration', '2s')
    // data-base-duration を意図的に設定しない

    restoreBaseDurations([el], '10s')
    expect(el.style.getPropertyValue('--bubble-duration')).toBe('10s')
  })

  it('空の配列でもエラーにならない', () => {
    expect(() => restoreBaseDurations([])).not.toThrow()
  })
})
