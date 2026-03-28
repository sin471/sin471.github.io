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

function makeBubble(): HTMLElement {
  const el = document.createElement('div')
  const anim = { playbackRate: 1 }
  el.getAnimations = () => [anim] as unknown as Animation[]
  return el
}

function getRate(el: HTMLElement): number {
  return (el.getAnimations()[0] as unknown as { playbackRate: number }).playbackRate
}

describe('createShakeController', () => {
  let bubbles: HTMLElement[]

  beforeEach(() => {
    bubbles = [0, 1, 2].map(() => makeBubble())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('シェイク時に全泡の playbackRate が fastRate になる', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastRate: 4,
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 20, y: 0, z: 0 })

    for (const el of bubbles) {
      expect(getRate(el)).toBe(4)
    }
  })

  it('recoveryMs 後に全泡の playbackRate が 1 に戻る', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastRate: 4,
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 20, y: 0, z: 0 })
    vi.advanceTimersByTime(2000)

    for (const el of bubbles) {
      expect(getRate(el)).toBe(1)
    }
  })

  it('振り続ける間は playbackRate が fastRate のまま維持される', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastRate: 4,
      recoveryMs: 2000,
      debounceMs: 500,
    })

    // t=0: 1回目シェイク
    controller.onMotion({ x: 20, y: 0, z: 0 })
    expect(getRate(bubbles[0])).toBe(4)

    // t=600: 2回目シェイク（デバウンス後）→ タイマーリセット
    vi.advanceTimersByTime(600)
    controller.onMotion({ x: 20, y: 0, z: 0 })
    expect(getRate(bubbles[0])).toBe(4)

    // t=1800: 1回目タイマーが発火するはずだった時刻を過ぎても fast のまま
    vi.advanceTimersByTime(1200)
    expect(getRate(bubbles[0])).toBe(4)

    // t=2600: 2回目タイマー発火 → 1 に戻る
    vi.advanceTimersByTime(800)
    expect(getRate(bubbles[0])).toBe(1)
  })

  it('debounceMs 以内の連続シェイクは無視される', () => {
    vi.useFakeTimers()
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastRate: 4,
      recoveryMs: 2000,
      debounceMs: 500,
    })

    // 1回目シェイク at t=0 → fires
    controller.onMotion({ x: 20, y: 0, z: 0 })

    // 300ms後（デバウンス内）に2回目シェイク → 無視
    vi.advanceTimersByTime(300)
    controller.onMotion({ x: 20, y: 0, z: 0 })

    // fast のまま
    expect(getRate(bubbles[1])).toBe(4)

    // t=2000ms: recovery が発火 → 1 に戻る
    vi.advanceTimersByTime(1700)
    expect(getRate(bubbles[1])).toBe(1)

    // t=2500ms: デバウンス境界を超えた3回目シェイク → fires
    vi.advanceTimersByTime(500)
    controller.onMotion({ x: 20, y: 0, z: 0 })
    expect(getRate(bubbles[1])).toBe(4)
  })

  it('threshold 未満の motion ではトリガーしない', () => {
    const controller = createShakeController(() => bubbles, {
      threshold: 15,
      fastRate: 4,
      recoveryMs: 2000,
      debounceMs: 500,
    })

    controller.onMotion({ x: 5, y: 5, z: 0 })

    // 変化なし（playbackRate は 1 のまま）
    expect(getRate(bubbles[1])).toBe(1)
  })
})
