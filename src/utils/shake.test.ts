import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  calculateMagnitude,
  shouldTriggerShake,
  createShakeDetector,
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

describe('createShakeDetector', () => {
  const options = { threshold: 15, recoveryMs: 2000, debounceMs: 500 }

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup() {
    vi.useFakeTimers()
    const onShake = vi.fn()
    const onCalm = vi.fn()
    const detector = createShakeDetector({ onShake, onCalm }, options)
    return { detector, onShake, onCalm }
  }

  it('threshold を超えると onShake が magnitude 付きで呼ばれる', () => {
    const { detector, onShake } = setup()
    detector.onMotion({ x: 20, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledWith(20)
  })

  it('recoveryMs 後に onCalm が 1 度だけ呼ばれる', () => {
    const { detector, onCalm } = setup()
    detector.onMotion({ x: 20, y: 0, z: 0 })
    vi.advanceTimersByTime(1999)
    expect(onCalm).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onCalm).toHaveBeenCalledTimes(1)
  })

  it('振り続ける間は onCalm が遅延される', () => {
    const { detector, onShake, onCalm } = setup()
    detector.onMotion({ x: 20, y: 0, z: 0 })
    vi.advanceTimersByTime(600)
    detector.onMotion({ x: 20, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(2)

    // 1回目のタイマーが発火するはずだった時刻を過ぎても calm にならない
    vi.advanceTimersByTime(1200)
    expect(onCalm).not.toHaveBeenCalled()

    vi.advanceTimersByTime(800)
    expect(onCalm).toHaveBeenCalledTimes(1)
  })

  it('debounceMs 以内の連続シェイクは無視される', () => {
    const { detector, onShake } = setup()
    detector.onMotion({ x: 20, y: 0, z: 0 })
    vi.advanceTimersByTime(300)
    detector.onMotion({ x: 20, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    detector.onMotion({ x: 20, y: 0, z: 0 })
    expect(onShake).toHaveBeenCalledTimes(2)
  })

  it('threshold 未満の motion ではトリガーしない', () => {
    const { detector, onShake, onCalm } = setup()
    detector.onMotion({ x: 5, y: 5, z: 0 })
    vi.advanceTimersByTime(5000)
    expect(onShake).not.toHaveBeenCalled()
    expect(onCalm).not.toHaveBeenCalled()
  })
})
