export type AccelerationInput = {
  x: number
  y: number
  z: number
}

export type ShakeControllerOptions = {
  threshold: number
  fastDuration: string
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
  const { threshold, fastDuration, recoveryMs, debounceMs } = options
  let lastShakeTime = 0

  return {
    onMotion(acceleration: AccelerationInput): void {
      const magnitude = calculateMagnitude(acceleration.x, acceleration.y, acceleration.z)
      if (!shouldTriggerShake(magnitude, threshold)) return

      const now = Date.now()
      if (now - lastShakeTime < debounceMs) return
      lastShakeTime = now

      const bubbles = getBubbles()
      for (const el of bubbles) {
        el.style.setProperty('--bubble-duration', fastDuration)
      }

      setTimeout(() => {
        for (const el of bubbles) {
          const base = el.dataset.baseDuration ?? fastDuration
          el.style.setProperty('--bubble-duration', base)
        }
      }, recoveryMs)
    },
  }
}
