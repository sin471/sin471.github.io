import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateMagnitude,
  shouldTriggerShake,
  createShakeController,
} from './shake'

describe('calculateMagnitude', () => {
  it('原点の magnitude は 0', () => {
    expect(calculateMagnitude(0, 0, 0)).toBe(0)
  })

  it('x 軸のみの magnitude を正しく計算する', () => {
    expect(calculateMagnitude(3, 0, 0)).toBe(3)
  })

  it('3次元の magnitude を正しく計算する（3-4-5の三角形）', () => {
    expect(calculateMagnitude(3, 4, 0)).toBe(5)
  })

  it('負の値でも magnitude は正になる', () => {
    expect(calculateMagnitude(-3, -4, 0)).toBe(5)
  })

  it('全軸を使った magnitude を計算する', () => {
    // sqrt(1^2 + 2^2 + 2^2) = sqrt(9) = 3
    expect(calculateMagnitude(1, 2, 2)).toBe(3)
  })
})

describe('shouldTriggerShake', () => {
  it('magnitude がちょうど threshold のときはトリガーしない', () => {
    expect(shouldTriggerShake(15, 15)).toBe(false)
  })

  it('magnitude が threshold より大きいときトリガーする', () => {
    expect(shouldTriggerShake(15.1, 15)).toBe(true)
  })

  it('magnitude が threshold より小さいときトリガーしない', () => {
    expect(shouldTriggerShake(14.9, 15)).toBe(false)
  })

  it('magnitude が 0 のときトリガーしない', () => {
    expect(shouldTriggerShake(0, 15)).toBe(false)
  })
})

describe('createShakeController', () => {
  let bubbles: HTMLElement[]

  beforeEach(() => {
    bubbles = [1, 2, 3].map((i) => {
      const el = document.createElement('div')
      el.dataset.baseDuration = `${i * 2}s`
      el.style.setProperty('--bubble-duration', `${i * 2}s`)
      return el
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('シェイク時に全泡の --bubble-duration が FAST_DURATION になる', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastDuration: '2s',
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 20, y: 0, z: 0 })

    for (const el of bubbles) {
      expect(el.style.getPropertyValue('--bubble-duration')).toBe('2s')
    }
  })

  it('recoveryMs 後に元の --bubble-duration に戻る', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastDuration: '2s',
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 20, y: 0, z: 0 })
    vi.advanceTimersByTime(2000)

    expect(bubbles[0].style.getPropertyValue('--bubble-duration')).toBe('2s')  // data-base-duration
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('4s')
    expect(bubbles[2].style.getPropertyValue('--bubble-duration')).toBe('6s')
  })

  it('debounceMs 以内の連続シェイクは無視される', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastDuration: '2s',
      recoveryMs: 2000,
      debounceMs: 500,
    })

    // 1回目シェイク at t=0 → fires, lastShakeTime=0
    controller.onMotion({ x: 20, y: 0, z: 0 })

    // 300ms後（デバウンス内: 300 < 500）に2回目シェイク → 無視
    vi.advanceTimersByTime(300)
    controller.onMotion({ x: 20, y: 0, z: 0 })

    // バブルは fast のまま（無視されても変化なし）
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('2s')

    // t=2000ms: 1回目の recovery が発火 → base に戻る
    vi.advanceTimersByTime(1700)
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('4s')

    // t=2500ms: デバウンス境界を超えた3回目シェイク（2500-0=2500 > 500）→ fires
    vi.advanceTimersByTime(500)
    controller.onMotion({ x: 20, y: 0, z: 0 })
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('2s')
  })

  it('threshold 未満の motion ではトリガーしない', () => {
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastDuration: '2s',
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 5, y: 5, z: 0 })

    // 変化なし（元の値のまま）
    expect(bubbles[1].style.getPropertyValue('--bubble-duration')).toBe('4s')
  })
})
