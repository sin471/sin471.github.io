export type AccelerationInput = {
  x: number
  y: number
  z: number
}

export type ShakeDetectorOptions = {
  threshold: number
  recoveryMs: number
  debounceMs: number
}

export type ShakeHandlers = {
  /** シェイクを検知するたびに呼ばれる（デバウンス済み） */
  onShake: (magnitude: number) => void
  /** 最後のシェイクから recoveryMs 経過したときに 1 度だけ呼ばれる */
  onCalm: () => void
}

export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z)
}

export function shouldTriggerShake(magnitude: number, threshold: number): boolean {
  return magnitude > threshold
}

/**
 * 加速度入力からシェイクを検知する。
 * 描画方式（CSS アニメーション / Canvas）に依存しないよう、結果はコールバックで返す。
 */
export function createShakeDetector(handlers: ShakeHandlers, options: ShakeDetectorOptions) {
  const { threshold, recoveryMs, debounceMs } = options
  let lastShakeTime = -Infinity
  let recoveryTimer: ReturnType<typeof setTimeout> | null = null

  return {
    onMotion(acceleration: AccelerationInput): void {
      const magnitude = calculateMagnitude(acceleration.x, acceleration.y, acceleration.z)
      if (!shouldTriggerShake(magnitude, threshold)) return

      const now = Date.now()
      if (now - lastShakeTime < debounceMs) return
      lastShakeTime = now

      handlers.onShake(magnitude)

      // 振り続けている間はタイマーをリセットし続ける
      if (recoveryTimer !== null) clearTimeout(recoveryTimer)
      recoveryTimer = setTimeout(() => {
        recoveryTimer = null
        handlers.onCalm()
      }, recoveryMs)
    },
  }
}
