export function setAllDurations(elements: HTMLElement[], duration: string): void {
  for (const el of elements) {
    el.style.setProperty('--bubble-duration', duration)
  }
}

export function restoreBaseDurations(elements: HTMLElement[], fallback = '8s'): void {
  for (const el of elements) {
    const base = el.dataset.baseDuration ?? fallback
    el.style.setProperty('--bubble-duration', base)
  }
}
