/* =============================================================
   BubbleField: 全ページ共通の泡レイヤー（Canvas）
   - 泡は大きいほど速く浮上し、揺れながら形を変える
   - 大きな泡はときどき分裂する
   - カーソルの動きで水流が生まれ、泡が押し流される
   - 素早くなぞる / クリックで泡が弾ける
   - スマホを振ると泡の嵐
   - 深海モードでは泡が発光し、カーソルの軌跡に夜光虫が光る
   ============================================================= */

import { createShakeDetector } from '@/utils/shake'
import {
  OCEAN_BUBBLES, OCEAN_THEME, type BubbleSpawn, type Palette,
  isInteractiveTarget, markHandled, mix, readPalette, rgba,
} from './shared'

type Bubble = {
  x: number; y: number; r: number
  vx: number; vy: number
  phase: number; wobbleFreq: number
  age: number
  /** 生成直後のふくらみ演出 */
  grow: number
}

type Droplet = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number }
type Ring = { x: number; y: number; r: number; life: number; max: number }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number }

const MAX_BUBBLES = 160

export function startBubbleField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let W = 0, H = 0, dpr = 1
  let palette: Palette = readPalette()
  const bubbles: Bubble[] = []
  const droplets: Droplet[] = []
  const rings: Ring[] = []
  const sparks: Spark[] = []

  let spawnAcc = 0
  let storm = 0          // シェイク中の加速係数（0..1）

  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0, active: false }

  /* ---------- セットアップ ---------- */

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
  }
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener(OCEAN_THEME, () => { palette = readPalette() })

  function makeBubble(x: number, y: number, r: number, vx = 0, vy = 0): Bubble {
    return {
      x, y, r, vx, vy,
      phase: Math.random() * Math.PI * 2,
      wobbleFreq: 1.2 + Math.random() * 1.6,
      age: 0,
      grow: 0,
    }
  }

  function addBubble(b: Bubble) {
    if (bubbles.length >= MAX_BUBBLES) bubbles.shift()
    bubbles.push(b)
  }

  // 最初から画面内に何個か漂わせておく（ロード直後の寂しさ対策）
  for (let i = 0; i < Math.round(W / 90); i++) {
    const b = makeBubble(Math.random() * W, H * (0.3 + Math.random() * 0.8), 3 + 15 * Math.random() ** 2)
    b.grow = 1
    addBubble(b)
  }

  /* ---------- 泡がはじける ---------- */

  function pop(b: Bubble) {
    rings.push({ x: b.x, y: b.y, r: b.r, life: 0, max: 0.35 })
    const n = 4 + Math.round(b.r / 4)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5
      const sp = 40 + b.r * 6 * (0.6 + Math.random() * 0.6)
      droplets.push({
        x: b.x + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20,
        life: 0, max: 0.4 + Math.random() * 0.3, r: 0.8 + Math.random() * 1.4,
      })
    }
    // 大きな泡は弾けると小さな泡を残す
    if (b.r > 10) {
      for (let i = 0; i < 3; i++) {
        addBubble(makeBubble(b.x + (Math.random() - 0.5) * b.r, b.y + (Math.random() - 0.5) * b.r, 1.5 + Math.random() * 2.5))
      }
    }
  }

  /* ---------- 入力 ---------- */

  window.addEventListener('pointermove', (e) => {
    const now = performance.now()
    const dt = Math.max(1, now - pointer.t) / 1000
    if (pointer.active) {
      // 指数移動平均で速度を平滑化
      pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dt) * 0.4
      pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dt) * 0.4
    }
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.t = now
    pointer.active = true

    // 深海モード：カーソルの軌跡に夜光虫
    if (palette.deep) {
      const speed = Math.hypot(pointer.vx, pointer.vy)
      const n = Math.min(4, Math.floor(speed / 400) + (Math.random() < 0.5 ? 1 : 0))
      for (let i = 0; i < n; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 16, y: e.clientY + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
          life: 0, max: 0.8 + Math.random() * 1.2, r: 1 + Math.random() * 1.8,
          hue: Math.random(),
        })
      }
    }
  }, { passive: true })

  window.addEventListener('pointerleave', () => { pointer.active = false })
  document.addEventListener('pointerleave', () => { pointer.active = false })

  // capture で先に受け取り、泡を割ったらマンタ側には渡さない
  document.addEventListener('pointerdown', (e) => {
    if (isInteractiveTarget(e.target)) return
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]
      if (Math.hypot(e.clientX - b.x, e.clientY - b.y) < b.r + 6) {
        bubbles.splice(i, 1)
        pop(b)
        markHandled(e)
        return
      }
    }
  }, { capture: true })

  window.addEventListener(OCEAN_BUBBLES, (e) => {
    for (const s of (e as CustomEvent<BubbleSpawn[]>).detail) {
      addBubble(makeBubble(s.x, s.y, s.r, s.vx ?? 0, s.vy ?? 0))
    }
  })

  /* ---------- シェイク → 泡の嵐 ---------- */

  const shake = createShakeDetector({
    onShake: (mag) => {
      storm = 1
      const n = Math.min(40, Math.round(mag))
      for (let i = 0; i < n; i++) {
        addBubble(makeBubble(Math.random() * W, H + 20 + Math.random() * 80, 2 + 14 * Math.random() ** 2, (Math.random() - 0.5) * 120, -200))
      }
    },
    onCalm: () => { /* storm は update 内で自然に減衰させる */ },
  }, { threshold: 15, recoveryMs: 2000, debounceMs: 500 })

  if (typeof DeviceMotionEvent !== 'undefined') {
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a) shake.onMotion({ x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0 })
    }
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DME.requestPermission === 'function') {
      // iOS 13+ はユーザー操作起点で許可が必要
      document.addEventListener('click', async () => {
        try {
          if ((await DME.requestPermission!()) === 'granted') window.addEventListener('devicemotion', handler)
        } catch { /* 拒否されたら静かに諦める */ }
      }, { once: true })
    } else {
      window.addEventListener('devicemotion', handler)
    }
  }

  /* ---------- 更新 ---------- */

  function update(dt: number) {
    storm = Math.max(0, storm - dt * 0.35)
    const speedMul = 1 + storm * 2.5

    // 常時の湧き出し（画面幅に比例）
    spawnAcc += dt * Math.max(0.8, (W / 1440) * 2.4) * (1 + storm * 3)
    while (spawnAcc >= 1) {
      spawnAcc -= 1
      // ときどき海底の「泡の湧き口」からまとまって出る
      if (Math.random() < 0.18) {
        const x = Math.random() * W
        for (let i = 0; i < 5; i++) addBubble(makeBubble(x + (Math.random() - 0.5) * 18, H + 10 + i * 22, 1.5 + Math.random() * 5))
      } else {
        addBubble(makeBubble(Math.random() * W, H + 30, 3 + 17 * Math.random() ** 2.2))
      }
    }

    const pSpeed = Math.hypot(pointer.vx, pointer.vy)
    pointer.vx *= Math.exp(-dt * 6)
    pointer.vy *= Math.exp(-dt * 6)

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]
      b.age += dt
      b.grow = Math.min(1, b.grow + dt * 3)

      // 浮力：終端速度は半径の平方根に比例（大きい泡ほど速い）
      const terminal = -(38 + 34 * Math.sqrt(b.r)) * speedMul
      b.vy += (terminal - b.vy) * Math.min(1, dt * 1.8)
      b.vx *= Math.exp(-dt * 1.5)

      // カーソル周りの水流
      if (pointer.active) {
        const dx = b.x - pointer.x, dy = b.y - pointer.y
        const d = Math.hypot(dx, dy)
        const reach = 70 + b.r * 2
        if (d < reach) {
          const f = (1 - d / reach) ** 2
          b.vx += pointer.vx * f * dt * 3 + (dx / (d || 1)) * f * 60 * dt * 6
          b.vy += pointer.vy * f * dt * 3
          // 素早くなぞると割れる
          if (d < b.r + 4 && pSpeed > 900) {
            bubbles.splice(i, 1)
            pop(b)
            continue
          }
        }
      }

      // ジグザグ上昇（大きい泡ほど大きく揺れる）
      const wobble = Math.sin(b.age * b.wobbleFreq * 2 + b.phase) * (6 + b.r * 1.2)
      b.x += (b.vx + wobble * b.wobbleFreq * 0.6) * dt
      b.y += b.vy * dt

      // 大きな泡はときどき分裂
      if (b.r > 13 && Math.random() < dt * 0.04) {
        const r2 = b.r * 0.72
        b.r = r2
        const twin = makeBubble(b.x + r2, b.y + r2 * 0.4, r2 * 0.85, 30, b.vy)
        twin.grow = 0.6
        addBubble(twin)
        b.vx -= 30
      }

      if (b.y < -b.r * 2 - 10) {
        bubbles.splice(i, 1)
      } else if (b.y < 64 + b.r && Math.random() < dt * 0.8) {
        // 水面（ヘッダー付近）でたまに弾ける
        bubbles.splice(i, 1)
        pop(b)
      }
    }

    for (let i = droplets.length - 1; i >= 0; i--) {
      const d = droplets[i]
      d.life += dt
      d.vx *= Math.exp(-dt * 5)
      d.vy = d.vy * Math.exp(-dt * 5) - 30 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      if (d.life > d.max) droplets.splice(i, 1)
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      rings[i].life += dt
      if (rings[i].life > rings[i].max) rings.splice(i, 1)
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.life += dt
      s.x += s.vx * dt
      s.y += s.vy * dt - 6 * dt
      if (s.life > s.max) sparks.splice(i, 1)
    }

  }

  /* ---------- 描画 ---------- */

  function drawBubble(b: Bubble) {
    // 元の CSS 泡と同じ、細い輪郭＋淡い塗りのシンプルな丸
    const { primary, deep } = palette
    const r = b.r * (0.3 + 0.7 * easeOutBack(b.grow))
    const jiggle = Math.sin(b.age * b.wobbleFreq * 3 + b.phase) * (b.r > 7 ? 0.05 : 0.02)
    ctx!.save()
    if (deep) { ctx!.shadowColor = rgba(primary, 0.9); ctx!.shadowBlur = 8 }
    ctx!.fillStyle = rgba(bubbleFill, deep ? 0.12 : 0.25)
    ctx!.strokeStyle = rgba(bubbleEdge(), deep ? 0.85 : 0.55)
    ctx!.lineWidth = 1.5
    ctx!.beginPath()
    ctx!.ellipse(b.x, b.y, r * (1 + jiggle), r * (1 - jiggle), 0, 0, Math.PI * 2)
    ctx!.fill()
    ctx!.stroke()
    ctx!.restore()
  }

  const bubbleFill = { r: 226, g: 240, b: 248 }
  const bubbleEdge = () => palette.deep ? palette.primary : mix(palette.primary, { r: 60, g: 130, b: 170 }, 0.3)

  function draw() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.clearRect(0, 0, W, H)

    for (const b of bubbles) drawBubble(b)

    ctx!.lineCap = 'round'
    for (const rg of rings) {
      const t = rg.life / rg.max
      ctx!.strokeStyle = rgba(palette.primary, (1 - t) * 0.7)
      ctx!.lineWidth = 1.5 * (1 - t) + 0.3
      ctx!.beginPath()
      ctx!.arc(rg.x, rg.y, rg.r * (1 + t * 0.8), 0, Math.PI * 2)
      ctx!.stroke()
    }
    for (const d of droplets) {
      const t = d.life / d.max
      ctx!.fillStyle = rgba(palette.primary, (1 - t) * 0.9)
      ctx!.beginPath()
      ctx!.arc(d.x, d.y, d.r * (1 - t * 0.5), 0, Math.PI * 2)
      ctx!.fill()
    }

    if (sparks.length) {
      ctx!.save()
      ctx!.globalCompositeOperation = 'lighter'
      for (const s of sparks) {
        const t = s.life / s.max
        const a = Math.sin(Math.PI * Math.min(1, t * 1.4)) * (1 - t)
        const c = mix(palette.primary, palette.accent, s.hue)
        const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
        g.addColorStop(0, rgba(c, a))
        g.addColorStop(1, rgba(c, 0))
        ctx!.fillStyle = g
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.restore()
    }
  }

  let last = performance.now()
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    update(dt)
    draw()
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function easeOutBack(t: number) {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}
