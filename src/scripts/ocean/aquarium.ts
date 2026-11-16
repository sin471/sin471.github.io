/* =============================================================
   Aquarium: トップページの海中シーン
   - 水中をクリック → 波紋とプランクトン。マンタが頭鰭を広げて食べに来る
   - マンタをクリック → 驚いてバレルロール（お腹側が見える）
   - マンタを素早く 5 連打 → 宙返り＋ハートの泡
   - カーソルを止めておくと、マンタが興味を持って近くを旋回する
   - カーソルを勢いよくぶつけると逃げる
   - ときどき小魚の群れが横切る（マンタやカーソルを避ける）

   イースターエッグ
   - 「manta」とタイプ / マンタを長押し → 子マンタが仲間に
   - ↑↑↓↓←→←→BA / タイトルを 5 回タップ → 深海モード
   - コンソールにも何か…
   ============================================================= */

import { createSequenceMatcher } from '@/utils/sequence'
import { Manta } from './manta'
import {
  OCEAN_THEME, type Palette,
  emitBubbles, isHandled, isInteractiveTarget, mix, readPalette, rgba, toggleDeepSea,
} from './shared'

type Plankton = { x: number; y: number; vx: number; vy: number; age: number; life: number; eaten: number; phase: number }
type Ripple = { x: number; y: number; age: number }
type Fish = { x: number; y: number; vx: number; vy: number; phase: number; size: number }

const TAU = Math.PI * 2

function mantaLength(W: number) {
  // 旧 SVG と同程度の大きさ（翼幅 ≒ 2L）
  const ratio = W < 768 ? 0.72 : W < 1024 ? 0.58 : 0.48
  const width = Math.max(280, Math.min(680, W * ratio))
  return width * 0.465
}

export function startAquarium(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let W = 0, H = 0, dpr = 1
  let palette: Palette = readPalette()
  let time = 0

  const manta = new Manta({
    x: window.innerWidth * (0.3 + Math.random() * 0.4),
    y: window.innerHeight * 0.42,
    heading: Math.random() * TAU,
    L: mantaLength(window.innerWidth),
  })
  let baby: Manta | null = null

  const plankton: Plankton[] = []
  const ripples: Ripple[] = []
  let fish: Fish[] = []
  let nextSchool = 14 + Math.random() * 10
  let nextBreath = 6 + Math.random() * 6

  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, lastMove: 0, inside: false }
  let curiosityCooldown = 0
  let fleeTimer = 0

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    manta.L = mantaLength(W)
    if (baby) baby.L = manta.L * 0.38
    if (opts.reducedMotion) drawStatic()
  }

  window.addEventListener('resize', resize)
  window.addEventListener(OCEAN_THEME, () => {
    palette = readPalette()
    if (opts.reducedMotion) drawStatic()
  })
  resize()

  if (opts.reducedMotion) {
    // 動きを減らす設定：中央に静止したマンタだけを描く
    manta.x = W / 2
    manta.y = H * 0.4
    manta.heading = -Math.PI / 2
    manta.resetTail()
    drawStatic()
    return
  }

  /* ---------- ヒットテスト ---------- */

  function hitManta(m: Manta, x: number, y: number) {
    if (!m.hitPath) return false
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (ctx!.isPointInPath(m.hitPath, x * dpr, y * dpr)) return true
    return Math.hypot(x - m.x, y - m.y) < m.L * 0.3
  }

  /* ---------- 入力 ---------- */

  const clickTimes: number[] = []
  let pressTimer: ReturnType<typeof setTimeout> | null = null

  window.addEventListener('pointermove', (e) => {
    const now = performance.now()
    const dt = Math.max(1, now - pointer.lastMove) / 1000
    pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dt) * 0.4
    pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dt) * 0.4
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.lastMove = now
    pointer.inside = true

    const over = !isInteractiveTarget(e.target) && hitManta(manta, e.clientX, e.clientY)
    document.documentElement.classList.toggle('manta-hover', over)
  }, { passive: true })
  document.addEventListener('pointerleave', () => { pointer.inside = false })

  document.addEventListener('pointerdown', (e) => {
    if (isHandled(e) || isInteractiveTarget(e.target)) return
    const target = e.target as Element | null
    if (target?.closest('h1')) return // タイトルは別のイースターエッグ用

    if (hitManta(manta, e.clientX, e.clientY) || (baby && hitManta(baby, e.clientX, e.clientY))) {
      onMantaTap(e.clientX, e.clientY)
      if (pressTimer) clearTimeout(pressTimer)
      pressTimer = setTimeout(() => { pressTimer = null; summonBaby() }, 700)
      return
    }
    spawnPlankton(e.clientX, e.clientY)
  })
  const cancelPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null } }
  document.addEventListener('pointerup', cancelPress)
  document.addEventListener('pointercancel', cancelPress)

  function onMantaTap(x: number, y: number) {
    const now = performance.now()
    clickTimes.push(now)
    while (clickTimes.length && now - clickTimes[0] > 3000) clickTimes.shift()

    // 驚いたときの泡
    const burst = Array.from({ length: 10 }, () => {
      const a = Math.random() * TAU
      return { x: x + Math.cos(a) * 12, y: y + Math.sin(a) * 12, r: 2 + Math.random() * 6, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160 - 40 }
    })
    emitBubbles(burst)

    if (clickTimes.length >= 5) {
      clickTimes.length = 0
      if (manta.somersault()) {
        setTimeout(() => heartBubbles(
          Math.max(160, Math.min(W - 160, manta.x)),
          Math.max(220, Math.min(H - 200, manta.y)),
        ), 1100)
        if (baby) setTimeout(() => baby?.somersault(), 500)
      }
      return
    }
    if (manta.barrelRoll()) {
      if (baby) setTimeout(() => baby?.barrelRoll(), 450) // 子マンタも真似をする
    } else {
      manta.startle()
    }
  }

  function heartBubbles(cx: number, cy: number) {
    const s = Math.min(9, manta.L / 30)
    const pts = Array.from({ length: 28 }, (_, i) => {
      const t = (i / 28) * TAU
      return {
        x: cx + 16 * Math.sin(t) ** 3 * s,
        y: cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s,
        r: 4.5,
      }
    })
    emitBubbles(pts)
  }

  function spawnPlankton(x: number, y: number) {
    ripples.push({ x, y, age: 0 })
    const n = 16 + Math.floor(Math.random() * 10)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU
      const sp = 20 + Math.random() * 70
      plankton.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        age: 0, life: 22 + Math.random() * 10, eaten: 0, phase: Math.random() * TAU,
      })
    }
    if (plankton.length > 200) plankton.splice(0, plankton.length - 200)
  }

  function summonBaby() {
    if (baby) return
    const a = manta.heading + Math.PI * (0.6 + Math.random() * 0.8)
    const d = Math.max(W, H) * 0.7
    baby = new Manta({
      x: manta.x + Math.cos(a) * d,
      y: manta.y + Math.sin(a) * d,
      heading: a + Math.PI,
      L: manta.L * 0.38,
      baby: true,
    })
  }

  // 「manta」とタイプすると子マンタが来る
  const mantaWord = createSequenceMatcher(['m', 'a', 'n', 't', 'a'], summonBaby)
  window.addEventListener('keydown', (e) => mantaWord.push(e.key))

  // タイトルを 5 回タップで深海モード（キーボードのないスマホ向け）
  const title = document.querySelector('main h1')
  const titleTaps: number[] = []
  title?.addEventListener('pointerdown', () => {
    const now = performance.now()
    titleTaps.push(now)
    while (titleTaps.length && now - titleTaps[0] > 2500) titleTaps.shift()
    if (titleTaps.length >= 5) { titleTaps.length = 0; toggleDeepSea() }
  })

  /* ---------- 行動の決定 ---------- */

  function planktonTarget() {
    // マンタの口に最も近い、まだ食べられていないプランクトン群の重心を狙う
    const m = manta.mouth
    let best: Plankton | null = null, bestD = Infinity
    for (const p of plankton) {
      if (p.eaten > 0) continue
      const d = Math.hypot(p.x - m.x, p.y - m.y)
      if (d < bestD) { bestD = d; best = p }
    }
    if (!best) return null
    let sx = 0, sy = 0, n = 0
    for (const p of plankton) {
      if (p.eaten > 0) continue
      if (Math.hypot(p.x - best.x, p.y - best.y) < 120) { sx += p.x; sy += p.y; n++ }
    }
    // 群れの重心と最寄りの粒の中間を狙うと、群れを旋回しながら食べる
    return { x: (sx / n + best.x) / 2, y: (sy / n + best.y) / 2, d: bestD }
  }

  function decideMantaGoal(dt: number) {
    curiosityCooldown = Math.max(0, curiosityCooldown - dt)
    fleeTimer = Math.max(0, fleeTimer - dt)

    const pSpeed = Math.hypot(pointer.vx, pointer.vy)
    const pDist = Math.hypot(pointer.x - manta.x, pointer.y - manta.y)

    // 勢いよく迫るカーソルからは逃げる
    if (pointer.inside && pSpeed > 1400 && pDist < manta.L * 0.8 && fleeTimer === 0) {
      fleeTimer = 1.6
      manta.startle()
      curiosityCooldown = 8
    }
    if (fleeTimer > 0) {
      manta.goal = { kind: 'flee', x: pointer.x, y: pointer.y, weight: 1.2 }
      manta.feedTarget = 0
      return
    }

    const food = planktonTarget()
    if (food) {
      manta.goal = { kind: 'seek', x: food.x, y: food.y, weight: 1.3 }
      manta.feedTarget = food.d < manta.L * 1.6 ? 1 : 0.25
      return
    }
    manta.feedTarget = 0

    // 止まっているカーソルに興味を持つ
    const idle = (performance.now() - pointer.lastMove) / 1000
    if (pointer.inside && idle > 2 && idle < 14 && curiosityCooldown === 0) {
      manta.goal = { kind: 'orbit', x: pointer.x, y: pointer.y, weight: 0.7, radius: manta.L * 0.9 }
      return
    }
    if (idle >= 14 && manta.goal?.kind === 'orbit') curiosityCooldown = 20
    manta.goal = null
  }

  function updateBaby() {
    if (!baby) return
    // 親の斜め後ろ（伴泳位置）を目指す
    const side = 1
    const slotX = manta.x + Math.cos(manta.heading) * -manta.L * 0.9 - Math.sin(manta.heading) * manta.L * 0.85 * side
    const slotY = manta.y + Math.sin(manta.heading) * -manta.L * 0.9 + Math.cos(manta.heading) * manta.L * 0.85 * side
    const d = Math.hypot(slotX - baby.x, slotY - baby.y)
    baby.goal = { kind: 'seek', x: slotX, y: slotY, weight: Math.min(3, 0.6 + d / manta.L) }
    baby.speedOverride = Math.max(30, Math.min(manta.speed * 3, manta.speed * (0.6 + d / (manta.L * 0.8))))
    baby.feedTarget = manta.feedTarget
  }

  /* ---------- 更新 ---------- */

  function update(dt: number) {
    time += dt
    pointer.vx *= Math.exp(-dt * 6)
    pointer.vy *= Math.exp(-dt * 6)

    decideMantaGoal(dt)
    manta.update(dt, time, { W, H })
    if (baby) {
      updateBaby()
      // 子マンタは画面外にいても親についてくるので境界は広めに
      baby.update(dt, time, { W, H })
    }

    // 呼吸孔から小さな泡
    nextBreath -= dt
    if (nextBreath <= 0) {
      nextBreath = 6 + Math.random() * 9
      const src = manta.toWorld(0.3, 0)
      emitBubbles(Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => ({
        x: src.x + (Math.random() - 0.5) * 10, y: src.y + i * 6, r: 1.5 + Math.random() * 3,
      })))
    }

    updatePlankton(dt)
    updateFish(dt)

    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].age += dt
      if (ripples[i].age > 1.6) ripples.splice(i, 1)
    }
  }

  function updatePlankton(dt: number) {
    const mouths = [manta, baby].filter((m): m is Manta => !!m).map((m) => ({ m, p: m.mouth }))
    for (let i = plankton.length - 1; i >= 0; i--) {
      const p = plankton[i]
      p.age += dt

      if (p.eaten > 0) {
        // 口に吸い込まれていく
        const target = mouths[0].p
        p.x += (target.x - p.x) * Math.min(1, dt * 12)
        p.y += (target.y - p.y) * Math.min(1, dt * 12)
        p.eaten += dt
        if (p.eaten > 0.25) plankton.splice(i, 1)
        continue
      }

      // ブラウン運動＋ゆっくり沈む
      p.vx = p.vx * Math.exp(-dt * 2) + (Math.random() - 0.5) * 30 * dt
      p.vy = p.vy * Math.exp(-dt * 2) + (Math.random() - 0.5) * 30 * dt + 2 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt

      for (const { m, p: mouth } of mouths) {
        if (m.isFeeding && Math.hypot(p.x - mouth.x, p.y - mouth.y) < m.L * 0.16) {
          p.eaten = 0.0001
          break
        }
      }

      if (p.age > p.life) plankton.splice(i, 1)
    }

  }

  /* ---------- 小魚の群れ（boids） ---------- */

  function spawnSchool() {
    const fromLeft = Math.random() < 0.5
    const y0 = H * (0.2 + Math.random() * 0.5)
    const dir = fromLeft ? 1 : -1
    const n = 18 + Math.floor(Math.random() * 12)
    fish = Array.from({ length: n }, () => ({
      x: (fromLeft ? -60 : W + 60) - dir * Math.random() * 160,
      y: y0 + (Math.random() - 0.5) * 90,
      vx: dir * (90 + Math.random() * 30),
      vy: (Math.random() - 0.5) * 20,
      phase: Math.random() * TAU,
      size: 0.8 + Math.random() * 0.5,
    }))
  }

  function updateFish(dt: number) {
    if (fish.length === 0) {
      nextSchool -= dt
      if (nextSchool <= 0) { spawnSchool(); nextSchool = 35 + Math.random() * 40 }
      return
    }
    const dir = Math.sign(fish.reduce((s, f) => s + f.vx, 0)) || 1
    for (const f of fish) {
      let ax = 0, ay = 0, cx = 0, cy = 0, avx = 0, avy = 0, n = 0
      for (const o of fish) {
        if (o === f) continue
        const dx = o.x - f.x, dy = o.y - f.y
        const d = Math.hypot(dx, dy)
        if (d < 70) {
          cx += o.x; cy += o.y; avx += o.vx; avy += o.vy; n++
          if (d < 16) { ax -= (dx / (d || 1)) * (16 - d) * 14; ay -= (dy / (d || 1)) * (16 - d) * 14 }
        }
      }
      if (n) {
        ax += (cx / n - f.x) * 0.8 + (avx / n - f.vx) * 1.2
        ay += (cy / n - f.y) * 0.8 + (avy / n - f.vy) * 1.2
      }
      // 目的方向へ
      ax += (dir * 110 - f.vx) * 0.5
      // 捕食者（マンタ・カーソル）を避ける
      for (const [px, py, r, k] of [
        [manta.x, manta.y, manta.L * 0.75, 900],
        [pointer.inside ? pointer.x : -9999, pointer.y, 120, 1600],
      ] as const) {
        const dx = f.x - px, dy = f.y - py
        const d = Math.hypot(dx, dy)
        if (d < r) { ax += (dx / (d || 1)) * k * (1 - d / r); ay += (dy / (d || 1)) * k * (1 - d / r) }
      }
      f.vx += ax * dt
      f.vy += ay * dt
      const sp = Math.hypot(f.vx, f.vy)
      const clamped = Math.max(60, Math.min(260, sp))
      f.vx = (f.vx / (sp || 1)) * clamped
      f.vy = (f.vy / (sp || 1)) * clamped
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.phase += dt * (8 + sp / 20)
    }
    if (fish.every((f) => f.x < -200 || f.x > W + 200 || f.y < -200 || f.y > H + 200)) fish = []
  }

  /* ---------- 描画 ---------- */

  function draw() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.clearRect(0, 0, W, H)
    const pal = palette

    // 波紋
    for (const r of ripples) {
      for (let k = 0; k < 3; k++) {
        const t = r.age - k * 0.18
        if (t <= 0) continue
        const a = Math.max(0, 1 - t / 1.4)
        ctx!.strokeStyle = rgba(pal.primary, a * 0.6)
        ctx!.lineWidth = 1.5
        ctx!.beginPath()
        ctx!.ellipse(r.x, r.y, 8 + t * 90, (8 + t * 90) * 0.8, 0, 0, TAU)
        ctx!.stroke()
      }
    }

    // プランクトン
    ctx!.save()
    if (pal.deep) ctx!.globalCompositeOperation = 'lighter'
    for (const p of plankton) {
      const fade = Math.min(1, (p.life - p.age) / 3) * (p.eaten > 0 ? 1 - p.eaten * 4 : 1)
      const tw = 0.6 + 0.4 * Math.sin(time * 4 + p.phase)
      const c = mix(pal.accent, pal.primary, 0.3 + 0.3 * Math.sin(p.phase))
      const r = (pal.deep ? 2.2 : 1.8) * (0.8 + 0.4 * tw)
      if (pal.deep) {
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
        g.addColorStop(0, rgba(c, 0.9 * fade * tw))
        g.addColorStop(1, rgba(c, 0))
        ctx!.fillStyle = g
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r * 4, 0, TAU)
        ctx!.fill()
      } else {
        ctx!.fillStyle = rgba(mix(c, pal.content, 0.35), 0.75 * fade)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, TAU)
        ctx!.fill()
      }
    }
    ctx!.restore()

    drawFish(pal)
    if (baby) baby.draw(ctx!, pal, time)
    manta.draw(ctx!, pal, time)
  }

  function drawFish(pal: Palette) {
    if (!fish.length) return
    const col = pal.deep ? pal.primary : mix(pal.primary, pal.content, 0.55)
    ctx!.save()
    if (pal.deep) { ctx!.shadowColor = rgba(pal.primary, 0.8); ctx!.shadowBlur = 6 }
    ctx!.fillStyle = rgba(col, pal.deep ? 0.8 : 0.5)
    for (const f of fish) {
      const a = Math.atan2(f.vy, f.vx)
      const s = f.size * 5
      const wag = Math.sin(f.phase) * 0.5
      ctx!.save()
      ctx!.translate(f.x, f.y)
      ctx!.rotate(a)
      ctx!.beginPath()
      ctx!.ellipse(0, 0, s * 1.4, s * 0.5, 0, 0, TAU)
      ctx!.fill()
      ctx!.beginPath()
      ctx!.moveTo(-s * 1.1, 0)
      ctx!.lineTo(-s * 2.3, -s * 0.7 + wag * s)
      ctx!.lineTo(-s * 2.3, s * 0.7 + wag * s)
      ctx!.closePath()
      ctx!.fill()
      ctx!.restore()
    }
    ctx!.restore()
  }

  function drawStatic() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.clearRect(0, 0, W, H)
    manta.draw(ctx!, palette, 0)
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

/* ---------- コンソール ---------- */

export function installPageEasterEggs() {
  const art = [
    '              ___',
    '    __.--‾‾‾‾     ‾‾‾‾--.__',
    '  <___      ◉     ◉      ___>',
    '       ‾‾--.._____..--‾‾',
    '               \\',
    '                 ~~~~',
  ].join('\n')
  console.log(
    `%c${art}\n%c  type "manta"  ·  ↑↑↓↓←→←→BA  ·  click the water`,
    'color:#5ec3f0;font-family:monospace',
    'color:#8aa;font-family:monospace',
  )
}
