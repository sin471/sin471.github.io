/* =============================================================
   海の背景で共有するユーティリティ
   - CSS 変数のテーマカラーを Canvas 用 RGB に変換
   - レイヤー間（泡 ⇔ マンタ）のイベントバス
   - トースト / 深海モード
   ============================================================= */

export type RGB = { r: number; g: number; b: number }

const probe = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = 1
  return c.getContext('2d', { willReadFrequently: true })
})()

/** oklch() などどんな CSS 色でも 1px Canvas に塗って RGB を読み戻す */
export function cssColorToRgb(css: string, fallback: RGB): RGB {
  if (!probe || !css) return fallback
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = '#000'
  probe.fillStyle = css.trim()
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return { r, g, b }
}

export type Palette = {
  primary: RGB
  accent: RGB
  base100: RGB
  base200: RGB
  content: RGB
  deep: boolean
}

export function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement)
  const v = (name: string) => s.getPropertyValue(name)
  return {
    primary: cssColorToRgb(v('--color-primary'), { r: 120, g: 200, b: 240 }),
    accent: cssColorToRgb(v('--color-accent'), { r: 190, g: 240, b: 90 }),
    base100: cssColorToRgb(v('--color-base-100'), { r: 248, g: 250, b: 252 }),
    base200: cssColorToRgb(v('--color-base-200'), { r: 241, g: 245, b: 249 }),
    content: cssColorToRgb(v('--color-base-content'), { r: 20, g: 30, b: 50 }),
    deep: isDeepSea(),
  }
}

export const rgba = (c: RGB, a: number) =>
  `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a)).toFixed(3)})`

export const mix = (a: RGB, b: RGB, t: number): RGB => ({
  r: Math.round(a.r + (b.r - a.r) * t),
  g: Math.round(a.g + (b.g - a.g) * t),
  b: Math.round(a.b + (b.b - a.b) * t),
})

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- イベントバス ---------- */

export type BubbleSpawn = { x: number; y: number; r: number; vx?: number; vy?: number }

export const OCEAN_BUBBLES = 'ocean:bubbles'
export const OCEAN_THEME = 'ocean:theme'

export function emitBubbles(bubbles: BubbleSpawn[]) {
  window.dispatchEvent(new CustomEvent<BubbleSpawn[]>(OCEAN_BUBBLES, { detail: bubbles }))
}

/** 泡レイヤーが処理したポインタイベントに印をつけ、マンタ側で二重処理しないようにする */
const handled = new WeakSet<Event>()
export const markHandled = (e: Event) => handled.add(e)
export const isHandled = (e: Event) => handled.has(e)

/** リンクやボタン上の操作は背景に渡さない */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element &&
    !!target.closest('a, button, input, label, select, textarea, header, .drawer-side')
}

/* ---------- トースト ---------- */

let toastEl: HTMLDivElement | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function toast(message: string, ms = 2600) {
  if (!toastEl) {
    toastEl = document.createElement('div')
    toastEl.setAttribute('role', 'status')
    toastEl.className = 'ocean-toast'
    document.body.appendChild(toastEl)
  }
  toastEl.textContent = message
  toastEl.classList.add('is-visible')
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl?.classList.remove('is-visible'), ms)
}

/* ---------- 深海モード ---------- */

const DEEP_KEY = 'sin471:deep-sea'

export function isDeepSea() {
  return document.documentElement.classList.contains('deep-sea')
}

export function setDeepSea(on: boolean) {
  document.documentElement.classList.toggle('deep-sea', on)
  try {
    if (on) sessionStorage.setItem(DEEP_KEY, '1')
    else sessionStorage.removeItem(DEEP_KEY)
  } catch { /* storage 不可でも見た目は切り替わる */ }
  window.dispatchEvent(new CustomEvent(OCEAN_THEME))
}

export function toggleDeepSea() {
  const next = !isDeepSea()
  setDeepSea(next)
  toast(next ? '深海モード — 水深 200m より深くへ潜航中…' : '浅瀬に戻ってきました')
}
