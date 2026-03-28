export type AccelerationInput = {
  x: number
  y: number
  z: number
}

export type ShakeControllerOptions = {
  threshold: number
  fastRate: number
  recoveryMs: number
  debounceMs: number
}

export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z)
}

export function shouldTriggerShake(magnitude: number, threshold: number): boolean {
  return magnitude > threshold
}

export function createShakeController(
  getBubbles: () => HTMLElement[],
  options: ShakeControllerOptions,
) {
  const { threshold, fastRate, recoveryMs, debounceMs } = options
  let lastShakeTime = 0
  let recoveryTimer: ReturnType<typeof setTimeout> | null = null

  return {
    onMotion(acceleration: AccelerationInput): void {
      const magnitude = calculateMagnitude(acceleration.x, acceleration.y, acceleration.z)
      if (!shouldTriggerShake(magnitude, threshold)) return

      const now = Date.now()
      if (now - lastShakeTime < debounceMs) return
      lastShakeTime = now

      const bubbles = getBubbles()
      for (const el of bubbles) {
        for (const anim of el.getAnimations()) {
          anim.playbackRate = fastRate
        }
      }

      // 振り続けている間はタイマーをリセットし続ける
      if (recoveryTimer !== null) clearTimeout(recoveryTimer)
      recoveryTimer = setTimeout(() => {
        recoveryTimer = null
        for (const el of bubbles) {
          for (const anim of el.getAnimations()) {
            anim.playbackRate = 1
          }
        }
      }, recoveryMs)
    },
  }
}
