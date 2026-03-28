export function setAllRates(elements: HTMLElement[], rate: number): void {
  for (const el of elements) {
    for (const anim of el.getAnimations()) {
      anim.playbackRate = rate
    }
  }
}

export function restoreRates(elements: HTMLElement[]): void {
  for (const el of elements) {
    for (const anim of el.getAnimations()) {
      anim.playbackRate = 1
    }
  }
}
