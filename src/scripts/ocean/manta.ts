/* =============================================================
   Manta: 手続き的に描くナンヨウマンタ（上から見た図）
   - 翼は毎フレーム Bezier で組み立て直す
     · 羽ばたきは「翼端が根元より遅れて動く」進行波
     · 上下に傾いた翼は上から見ると短く見える（cos による短縮）
     · 旋回時は内側にバンクして左右非対称になる
   - 尾は世界座標上の鎖として物理的に追従する
   - 推力は打ち下ろしで生まれ、速度が脈打つように変化する
   - バレルロール（お腹側が見える）/ 宙返り / 頭鰭を広げての捕食
   - 絵柄はシンプルな線画のまま、動きだけを生き物らしくする
   ============================================================= */

import { type Palette, rgba } from './shared'

export type Vec = { x: number; y: number }

export type Goal =
  | { kind: 'seek'; x: number; y: number; weight: number }
  | { kind: 'orbit'; x: number; y: number; weight: number; radius: number }
  | { kind: 'flee'; x: number; y: number; weight: number }

type Tween = { t: number; dur: number; dir: number } | null

const TAU = Math.PI * 2
const TAIL_SEGMENTS = 18

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

type P = [number, number]

/** cubic bezier を n 分割して points に追加（始点は含めない） */
function cubic(points: P[], p0: P, c1: P, c2: P, p1: P, n = 10) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t
    points.push([
      a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
      a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1],
    ])
  }
}

export class Manta {
  x: number
  y: number
  heading: number
  speed = 0
  /** 体長（px）。翼幅はおよそ 2L */
  L: number
  readonly baby: boolean

  goal: Goal | null = null
  /** 頭鰭を広げる度合いの目標値（0..1） */
  feedTarget = 0
  /** 他の個体に速度を合わせたいときに使う */
  speedOverride: number | null = null

  private flap = Math.random() * TAU
  private turn = 0
  private bank = 0
  private feed = 0
  private dash = 0
  private roll: Tween = null
  private pitch: Tween = null
  private rollAngle = 0
  private pitchAngle = 0
  private seed = Math.random() * 100
  private tail: Vec[] = []
  /** 直近に描いた体の外形（当たり判定用） */
  hitPath: Path2D | null = null

  constructor(opts: { x: number; y: number; heading: number; L: number; baby?: boolean }) {
    this.x = opts.x
    this.y = opts.y
    this.heading = opts.heading
    this.L = opts.L
    this.baby = !!opts.baby
    this.speed = this.baseSpeed
    this.resetTail()
  }

  get baseSpeed() {
    return Math.max(this.baby ? 34 : 40, this.L * (this.baby ? 0.42 : 0.2))
  }

  get busy() {
    return this.roll !== null || this.pitch !== null
  }

  get isFeeding() {
    return this.feed > 0.5
  }

  /** ローカル座標（x: 前方, y: 右方向、体長 1 単位）→ 画面座標 */
  toWorld(px: number, py: number): Vec {
    const cp = Math.cos(this.pitchAngle), cr = Math.cos(this.rollAngle)
    const lx = px * this.L * cp, ly = py * this.L * cr
    const c = Math.cos(this.heading), s = Math.sin(this.heading)
    return { x: this.x + c * lx - s * ly, y: this.y + s * lx + c * ly }
  }

  get mouth() {
    return this.toWorld(0.56, 0)
  }

  resetTail() {
    this.tail = []
    const base = this.toWorld(-0.39, 0)
    const bx = -Math.cos(this.heading), by = -Math.sin(this.heading)
    for (let i = 0; i < TAIL_SEGMENTS; i++) {
      this.tail.push({ x: base.x + bx * i * this.segLen, y: base.y + by * i * this.segLen })
    }
  }

  private get segLen() {
    return (this.L * 0.95) / TAIL_SEGMENTS
  }

  /* ---------- 技 ---------- */

  barrelRoll(dir = Math.random() < 0.5 ? 1 : -1) {
    if (this.busy) return false
    this.roll = { t: 0, dur: 1.4, dir }
    this.dash = 1
    return true
  }

  somersault() {
    if (this.pitch) return false
    this.roll = null
    this.rollAngle = 0
    this.pitch = { t: 0, dur: 2.6, dir: 1 }
    return true
  }

  startle() {
    this.dash = 1
  }

  /* ---------- 更新 ---------- */

  update(dt: number, t: number, bounds: { W: number; H: number }) {
    const { W, H } = bounds

    // 頭鰭
    this.feed = lerp(this.feed, this.feedTarget, Math.min(1, dt * 2.5))
    this.dash = Math.max(0, this.dash - dt * 0.6)

    // 羽ばたき：通常は約 3.8 秒周期。急ぐときや子どもは速い
    const period = (this.baby ? 2.4 : 3.8) / (1 + this.dash * 2.2 + this.feed * 0.3)
    this.flap += (TAU / period) * dt

    // 推力は打ち下ろし（sin > 0）で発生 → 速度が脈打つ
    const thrust = 0.5 + 0.5 * Math.sin(this.flap - 0.6)
    const cruise = (this.speedOverride ?? this.baseSpeed) * (0.72 + 0.56 * thrust)
    const targetSpeed = cruise * (1 + this.dash * 2.4) * (1 - this.feed * 0.25)
    this.speed = lerp(this.speed, targetSpeed, Math.min(1, dt * 1.6))

    /* --- 舵取り：望ましい進行方向ベクトルを合成 --- */
    let vx = Math.cos(this.heading), vy = Math.sin(this.heading)

    // 画面内に柔らかく留まる（大きく外れるほど強く戻る）
    // 子マンタは親についていくので境界は緩め
    const m = this.baby ? 0.05 : 0.25
    const bx0 = W * m, bx1 = W * (1 - m), by0 = H * (this.baby ? 0.05 : 0.28), by1 = H * (this.baby ? 0.95 : 0.62)
    const ex = this.x < bx0 ? bx0 - this.x : this.x > bx1 ? bx1 - this.x : 0
    const ey = this.y < by0 ? by0 - this.y : this.y > by1 ? by1 - this.y : 0
    vx += (ex / (W * 0.15)) * 4
    vy += (ey / (H * 0.15)) * 4

    let goalStrength = 0
    const g = this.goal
    if (g) {
      const dx = g.x - this.x, dy = g.y - this.y
      const d = Math.hypot(dx, dy) || 1
      if (g.kind === 'seek') {
        vx += (dx / d) * g.weight * 2
        vy += (dy / d) * g.weight * 2
      } else if (g.kind === 'flee') {
        vx -= (dx / d) * g.weight * 3
        vy -= (dy / d) * g.weight * 3
      } else {
        // 目標の周りを回る：接線方向＋半径を保つ成分
        const radial = (d - g.radius) / g.radius
        vx += ((-dy / d) + (dx / d) * radial) * g.weight * 2
        vy += ((dx / d) + (dy / d) * radial) * g.weight * 2
      }
      goalStrength = Math.min(1, g.weight)
    }

    const desired = Math.atan2(vy, vx)
    const diff = wrapAngle(desired - this.heading)
    const maxTurn = (this.baby ? 1.5 : 0.85) * (1 + this.dash)
    // 気まぐれな蛇行（複数周期のサインを重ねてパターンを読ませない）
    const wander = (Math.sin(t * 0.21 + this.seed) * 0.6 + Math.sin(t * 0.083 + this.seed * 3) * 0.5) * 0.28
    const turnTarget = clamp(diff * 1.4, -maxTurn, maxTurn) + wander * (1 - goalStrength)
    this.turn = lerp(this.turn, turnTarget, Math.min(1, dt * 2))
    this.heading = wrapAngle(this.heading + this.turn * dt)
    this.bank = lerp(this.bank, clamp(this.turn * 0.45, -0.45, 0.45), Math.min(1, dt * 3))

    // 宙返り中は上から見た前進量が cos(pitch) で縮む
    const forward = this.speed * Math.cos(this.pitchAngle)
    this.x += Math.cos(this.heading) * forward * dt
    this.y += Math.sin(this.heading) * forward * dt

    // 技の進行
    if (this.roll) {
      this.roll.t += dt / this.roll.dur
      this.rollAngle = TAU * easeInOut(Math.min(1, this.roll.t)) * this.roll.dir
      if (this.roll.t >= 1) { this.roll = null; this.rollAngle = 0 }
    }
    if (this.pitch) {
      this.pitch.t += dt / this.pitch.dur
      this.pitchAngle = TAU * easeInOut(Math.min(1, this.pitch.t))
      if (this.pitch.t >= 1) { this.pitch = null; this.pitchAngle = 0 }
    }

    this.updateTail(dt)
  }

  private updateTail(dt: number) {
    if (this.tail.length === 0) this.resetTail()
    const base = this.toWorld(-0.39, 0)
    // 付け根は羽ばたきと逆位相で左右に振れる
    const swing = Math.sin(this.flap * 2 + 1.2) * 0.22 - this.turn * 0.35
    const back = this.heading + Math.PI + swing
    this.tail[0] = base
    const seg = this.segLen
    let prevDir = { x: Math.cos(back), y: Math.sin(back) }
    for (let i = 1; i < this.tail.length; i++) {
      const p = this.tail[i], q = this.tail[i - 1]
      let dx = p.x - q.x, dy = p.y - q.y
      const d = Math.hypot(dx, dy) || 1
      dx /= d; dy /= d
      // 適度な剛性：前の節の向きへ少し寄せる
      const k = Math.min(1, (i === 1 ? 0.6 : 0.12) * dt * 60)
      dx = lerp(dx, prevDir.x, k)
      dy = lerp(dy, prevDir.y, k)
      const n = Math.hypot(dx, dy) || 1
      dx /= n; dy /= n
      this.tail[i] = { x: q.x + dx * seg, y: q.y + dy * seg }
      prevDir = { x: dx, y: dy }
    }
  }

  /* ---------- 形状 ---------- */

  private wingParams(side: 1 | -1) {
    // 翼端は根元より位相が遅れる（進行波）
    const A = 0.62
    const eTip = A * Math.sin(this.flap - 0.9) + side * this.bank
    const eMid = A * 0.45 * Math.sin(this.flap - 0.3) + side * this.bank * 0.5
    const tipX = -0.07 + 0.08 * Math.cos(this.flap - 0.9)
    const trailWave = 0.04 * Math.sin(this.flap - 1.6)
    return { eTip, eMid, tipX, trailWave }
  }

  /** 右半身（side=1）または左半身の外形点列（鼻先 → 尾の付け根） */
  private sideOutline(side: 1 | -1): P[] {
    const { eTip, eMid, tipX, trailWave } = this.wingParams(side)
    const span = Math.cos(eTip)
    const mid = Math.cos(eMid)
    const pts: P[] = []

    const f = this.feed
    const M: P = [0.485, 0]                // 口（頭の先端、左右の頭鰭のあいだ）
    const A: P = [0.49, 0.06]              // 口角
    // 頭鰭（角のような突起）：普段は丸めて前向きの角、捕食時は前へ広げて口へかき込む
    const F: P = [lerp(0.6, 0.67, f), lerp(0.115, 0.075, f)]
    const B: P = [0.41, 0.168]
    const T: P = [tipX, Math.max(0.2, span)]
    const Pv: P = [-0.28, 0.15]
    const R: P = [-0.38, 0]

    pts.push(M)
    pts.push(A)
    cubic(pts, A, [0.53, 0.055], [lerp(0.58, 0.65, f), lerp(0.085, 0.055, f)], F, 6)
    cubic(pts, F, [lerp(0.61, 0.69, f), lerp(0.135, 0.1, f)], [0.5, 0.178], B, 6)
    cubic(pts, B, [0.34, 0.17 + 0.3 * mid], [0.14 + tipX * 0.3, 0.9 * T[1]], T, 14)
    cubic(pts, T, [tipX - 0.06, T[1] * 0.82], [-0.1 + trailWave, 0.18 + 0.25 * mid], Pv, 14)
    // 腹びれ：小さくなだらかに尾の付け根へ
    cubic(pts, Pv, [-0.34, 0.15], [-0.39, 0.08], R, 6)
    return pts.map(([x, y]) => [x, y * side] as P)
  }

  /* ---------- 描画（元の線画テイストを保ったシンプルな絵） ---------- */

  draw(ctx: CanvasRenderingContext2D, pal: Palette, t: number) {
    const right = this.sideOutline(1)
    const left = this.sideOutline(-1).reverse()
    const world = [...right, ...left].map(([x, y]) => this.toWorld(x, y))

    const body = new Path2D()
    world.forEach((p, i) => (i === 0 ? body.moveTo(p.x, p.y) : body.lineTo(p.x, p.y)))
    body.closePath()
    this.hitPath = body

    // ロール／宙返りで裏返ったときはお腹側（白いお腹とエラ穴）
    const ventral = Math.cos(this.rollAngle) * Math.cos(this.pitchAngle) < 0
    const lw = Math.max(2, this.L * (this.baby ? 0.024 : 0.017))
    const ink = pal.primary

    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (pal.deep) {
      ctx.shadowColor = rgba(pal.primary, 0.9)
      ctx.shadowBlur = this.L * 0.07
    }

    // 尾：一定の太さのくねる線
    ctx.strokeStyle = rgba(ink, 0.82)
    ctx.lineWidth = lw * 0.8
    ctx.beginPath()
    this.tail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.stroke()

    // 体：ごく薄い塗り＋太い輪郭線
    ctx.fillStyle = ventral ? rgba(pal.base100, pal.deep ? 0.25 : 0.85) : rgba(pal.primary, pal.deep ? 0.12 : 0.1)
    ctx.fill(body)
    ctx.strokeStyle = rgba(ink, 0.88)
    ctx.lineWidth = lw
    ctx.stroke(body)
    ctx.shadowBlur = 0

    const dot = (x: number, y: number, r: number) => {
      const p = this.toWorld(x, y)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, TAU)
      ctx.fill()
    }

    ctx.fillStyle = rgba(ink, 0.85)
    const eyeR = Math.max(2, this.L * 0.026)
    if (ventral) {
      // マンタのお腹側：左右 5 対のエラ穴（口は頭の先端にあるので顔はない）
      ctx.strokeStyle = rgba(ink, 0.7)
      ctx.lineWidth = lw * 0.55
      for (const side of [1, -1]) {
        for (let i = 0; i < 5; i++) {
          const x = 0.31 - i * 0.045
          const a = this.toWorld(x, 0.08 * side)
          const c = this.toWorld(x - 0.002, 0.115 * side)
          const b = this.toWorld(x - 0.02, 0.15 * side)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.quadraticCurveTo(c.x, c.y, b.x, b.y)
          ctx.stroke()
        }
      }
    } else {
      // 目：頭の側面、頭鰭の付け根のすぐ後ろ（輪郭線上）。まばたきもする
      const blink = (t + this.seed) % 5.3 < 0.14
      if (blink) {
        ctx.strokeStyle = rgba(ink, 0.85)
        ctx.lineWidth = lw * 0.6
        for (const s of [1, -1]) {
          const p = this.toWorld(0.42, 0.162 * s)
          ctx.beginPath()
          ctx.moveTo(p.x - eyeR, p.y)
          ctx.lineTo(p.x + eyeR, p.y)
          ctx.stroke()
        }
      } else {
        dot(0.42, 0.162, eyeR)
        dot(0.42, -0.162, eyeR)
      }
    }
    ctx.restore()
  }
}
