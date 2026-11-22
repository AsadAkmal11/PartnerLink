"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger)

/* PartnerLink — the landing page for the GIKI FYP matchmaker, which builds
   itself while you scroll. A crew of named collaborator cursors types the copy,
   drags match cards out of a deck, draws rules with a pen, floods signal swatches
   with an eyedropper, stretches the headline, pushes the pink plate out of register
   and swaps two steps after a comment thread. Every move sits on a GSAP timeline
   scrubbed by ScrollTrigger, so scrolling back up takes the page apart again.

   The finished page is the server render: real text, no cursors. Motion only
   ever hides what it is about to build, and reduced motion gets plain fades. */

export type OverprintCollaborator = { name: string; color: string; ink?: string }
export type OverprintSpeaker = { name: string; role: string; city: string; talk: string; ink: "pink" | "blue" | "yellow" | "teal" | "orange" }
export type OverprintSession = { time: string; title: string; who?: string; room: string }
export type OverprintPass = { name: string; price: string; note: string; perks: string[]; featured?: boolean; stamp?: string; href?: string; cta?: string }

export type OverprintSwarmTemplateProps = {
  brand?: string
  edition?: string
  headline?: [string, string, string]
  kicker?: string
  intro?: string
  city?: string
  dates?: string
  venue?: string[]
  email?: string
  ctaHref?: string
  ctaLabel?: string
  signInHref?: string
  signInLabel?: string
  crew?: OverprintCollaborator[]
  speakers?: OverprintSpeaker[]
  sessions?: OverprintSession[]
  passes?: OverprintPass[]
  /** Height of the hero stage. A definite length: an installed page has no 100% chain. */
  height?: string
  /** Google Fonts stylesheet for Archivo + JetBrains Mono. Pass null to bring your own. */
  fontHref?: string | null
  className?: string
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap"

const DEFAULT_CREW: OverprintCollaborator[] = [
  { name: "Ayesha", color: "#F2308F" },
  { name: "Hamza", color: "#1D63E0" },
  { name: "Zainab", color: "#F2611A" },
  { name: "Usman", color: "#00968C" },
  { name: "Mahnoor", color: "#7650F5" },
  { name: "Danish", color: "#F0B800", ink: "#17161B" },
  { name: "Fatima", color: "#1F9A45" },
  { name: "Saad", color: "#DC2E25" },
]

const DEFAULT_SPEAKERS: OverprintSpeaker[] = [
  { name: "Aria Noor", role: "Computer Science", city: "CGPA 3.60", talk: "Vision systems for campus robotics", ink: "pink" },
  { name: "Zayan Malik", role: "Computer Engineering", city: "CGPA 3.40", talk: "Hardware first, edge AI next", ink: "blue" },
  { name: "Hira Saeed", role: "Software Engineering", city: "CGPA 3.70", talk: "Full-stack, curious about language tech", ink: "yellow" },
  { name: "Omar Farooq", role: "Cyber Security", city: "CGPA 3.30", talk: "Hardening embedded devices", ink: "teal" },
  { name: "Sara Khan", role: "Computer Science", city: "CGPA 3.80", talk: "Urdu NLP and retrieval", ink: "orange" },
  { name: "Bilal Ahmed", role: "Artificial Intelligence", city: "CGPA 3.50", talk: "Models that ship, not just train", ink: "pink" },
]

const DEFAULT_SESSIONS: OverprintSession[] = [
  { time: "01", title: "Sign up with your GIKI email", who: "@giki.edu.pk only", room: "Register" },
  { time: "02", title: "Map your skills, CGPA and domains", room: "Profile" },
  { time: "03", title: "The engine ranks your best peers", who: "Skill overlap · domains · CGPA fit", room: "Matching" },
  { time: "04", title: "Browse and filter the directory", room: "Discovery" },
  { time: "05", title: "Lock in your group", room: "Dashboard" },
  { time: "06", title: "Find an approved supervisor", who: "Admin-vetted faculty", room: "Faculty" },
  { time: "07", title: "Kick off your FYP together", room: "Everywhere" },
]

const DEFAULT_PASSES: OverprintPass[] = [
  { name: "Professor", price: "Free", note: "Pending until approved", perks: ["Add your research domains", "Admin-verified listing", "Get found by strong groups"], href: "/register?role=professor", cta: "Join as faculty" },
  { name: "Student", price: "Free", note: "Any GIKI undergrad", perks: ["Ranked teammate matches", "Peer and faculty directory", "Profile built in minutes"], featured: true, stamp: "FYP groups are forming now", href: "/register", cta: "Join as student" },
  { name: "Admin", price: "Invite", note: "Moderators only", perks: ["Review faculty sign-ups", "Approve or reject in one click", "Every decision audit-logged"], href: "/login", cta: "Sign in as admin" },
]

const INKS = [
  { name: "Skills", code: "SIGNAL 01", v: "var(--ov-pink)" },
  { name: "Interests", code: "SIGNAL 02", v: "var(--ov-blue)" },
  { name: "Domains", code: "SIGNAL 03", v: "var(--ov-yel)" },
  { name: "CGPA fit", code: "SIGNAL 04", v: "var(--ov-teal)" },
  { name: "Faculty", code: "SIGNAL 05", v: "var(--ov-org)" },
]

const useIso = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

// #region choreography
/* Pure timing rules for the crew, lifted out and run by tests/overprint-swarm-template.test.mjs. */

/** Seconds a cursor needs to cross d pixels: quick hops, long trips that slow down (roughly Fitts). */
export function travel(d: number): number {
  return 0.26 + 0.15 * Math.log2(1 + Math.max(0, d) / 60)
}

/** Which collaborator takes the next job: whoever can be standing on it soonest; ties go to the earlier one. */
export function chooseHand(hands: { x: number; y: number; t: number }[], p: { x: number; y: number }, ready: number): number {
  let best = 0
  let bestT = Infinity
  for (let i = 0; i < hands.length; i++) {
    const h = hands[i]
    const arrive = Math.max(h.t + travel(Math.hypot(p.x - h.x, p.y - h.y)), ready)
    if (arrive < bestT - 1e-6) {
      best = i
      bestT = arrive
    }
  }
  return best
}

/** What a typed line shows after n keystrokes, clamped. */
export function typed(text: string, n: number): string {
  return text.slice(0, Math.max(0, Math.min(text.length, Math.round(n))))
}

/** How long typing takes: about 30 keys a second of timeline, never instant, never a drag. */
export function typeTime(text: string, max: number): number {
  return Math.min(max, Math.max(0.35, text.length * 0.033))
}

/** The nearest point just outside a w×h stage, where a finished cursor leaves. */
export function exitPoint(p: { x: number; y: number }, w: number, h: number): { x: number; y: number } {
  const d = [p.x, w - p.x, p.y, h - p.y]
  const m = d.indexOf(Math.min(...d))
  if (m === 0) return { x: -70, y: p.y }
  if (m === 1) return { x: w + 70, y: p.y }
  if (m === 2) return { x: p.x, y: -70 }
  return { x: p.x, y: h + 70 }
}

/** Fewer, lighter cursors on narrow screens. */
export function crewSize(width: number, full: number): number {
  if (width < 420) return Math.min(full, 2)
  if (width < 720) return Math.min(full, 3)
  return full
}

/** Small deterministic wander so idle cursors never sit dead still. */
export function wander(seed: number): { x: number; y: number } {
  const s = Math.sin(seed * 12.9898) * 43758.5453
  const t = Math.sin(seed * 78.233) * 12345.6789
  return { x: ((s - Math.floor(s)) - 0.5) * 56, y: ((t - Math.floor(t)) - 0.5) * 40 }
}
// #endregion

// ---- the director -------------------------------------------------------------------

type Pt = { x: number; y: number }
type Box = { x: number; y: number; w: number; h: number }
type Tool = "arrow" | "text" | "cross" | "pen" | "drop" | "grab" | "size"
type Hand = { el: HTMLElement; g: HTMLElement; frm: HTMLElement; badge: HTMLElement; x: number; y: number; t: number; tool: Tool; i: number; idle: number }
type Job = { ready?: number; who?: number }

/** Layout box relative to the stage, read from offsets so transforms already set never skew it. */
function boxOf(el: HTMLElement, stage: HTMLElement): Box {
  let x = 0
  let y = 0
  let n: HTMLElement | null = el
  while (n && n !== stage) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

function director(tl: gsap.core.Timeline, stage: HTMLElement, handEls: HTMLElement[], frames: HTMLElement[], cleanups: (() => void)[]) {
  const B = (el: HTMLElement) => boxOf(el, stage)
  const W = stage.offsetWidth
  const H = stage.offsetHeight
  const hands: Hand[] = handEls.map((el, i) => ({
    el,
    g: el.querySelector< HTMLElement>(".ov-hg")!,
    frm: frames[i],
    badge: frames[i].querySelector< HTMLElement>("b")!,
    x: 0,
    y: 0,
    t: 0,
    tool: "arrow",
    i,
    idle: 0,
  }))

  const place = (h: Hand, p: Pt) => {
    h.x = p.x
    h.y = p.y
    gsap.set(h.el, { x: p.x, y: p.y })
  }

  const tool = (h: Hand, t: Tool, at: number) => {
    if (h.tool === t) return
    tl.set(h.el, { attr: { "data-tool": t } }, at)
    h.tool = t
  }

  const click = (h: Hand, at: number) => {
    tl.to(h.g, { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.out" }, at)
  }

  /** Walk on a gentle curve: x and y ease differently, so no two trips look ruled. */
  const walk = (h: Hand, p: Pt, at: number, dur?: number) => {
    const gap = at - h.t
    if (gap > 0.9) {
      const w = wander(h.i * 31 + ++h.idle)
      const d = Math.min(gap - 0.15, 1.2)
      tl.to(h.el, { x: h.x + w.x, y: h.y + w.y, duration: d, ease: "sine.inOut" }, h.t + 0.05)
      h.x += w.x
      h.y += w.y
    }
    const d = dur ?? travel(Math.hypot(p.x - h.x, p.y - h.y))
    tl.to(h.el, { x: p.x, duration: d, ease: "power2.inOut" }, at)
    tl.to(h.el, { y: p.y, duration: d, ease: "power1.inOut" }, at)
    h.x = p.x
    h.y = p.y
    h.t = at + d
    return h.t
  }

  /** Carry the cursor in lock-step with whatever it is moving. */
  const glide = (h: Hand, p: Pt, at: number, d: number, ease: string) => {
    tl.to(h.el, { x: p.x, y: p.y, duration: d, ease }, at)
    h.x = p.x
    h.y = p.y
    h.t = at + d
  }

  /** Pick a collaborator and get them to p by `ready` (or as soon as they are free). */
  const begin = (p: Pt, o: Job = {}) => {
    const ready = o.ready ?? 0
    const h = hands[o.who !== undefined ? o.who % hands.length : chooseHand(hands, p, ready)]
    const tr = travel(Math.hypot(p.x - h.x, p.y - h.y))
    const leave = Math.max(h.t, ready - tr)
    const at = walk(h, p, leave, tr)
    return { h, at }
  }

  const fade = (el: Element | Element[], at: number, o: gsap.TweenVars = {}) => {
    const { y = 0, ...rest } = o
    gsap.set(el, { opacity: 0, y })
    tl.to(el, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.05, ...rest }, at)
  }

  /** I-beam, click, type. The ghost copy holds the layout; the live copy is what you watch. */
  const type = (el: HTMLElement, o: Job & { max?: number; org?: Box; s?: number; off?: Pt } = {}) => {
    const ghost = el.querySelector< HTMLElement>(".ov-ty-ghost")!
    const live = el.querySelector< HTMLElement>(".ov-ty-txt")!
    const caret = el.querySelector< HTMLElement>(".ov-caret")!
    const text = ghost.textContent || ""
    let b = B(el)
    if (o.org && o.s) b = { x: o.org.x + (b.x - o.org.x) * o.s, y: o.org.y + (b.y - o.org.y) * o.s, w: b.w * o.s, h: b.h * o.s }
    const fs = parseFloat(getComputedStyle(el).fontSize) * (o.s ?? 1)
    const p = { x: b.x + 2 + (o.off?.x ?? 0), y: b.y + Math.min(b.h / 2, fs * 0.62) + (o.off?.y ?? 0) }
    gsap.set(ghost, { opacity: 0 })
    live.textContent = ""
    cleanups.push(() => { live.textContent = "" })
    const { h, at } = begin(p, o)
    tool(h, "text", at - 0.12)
    click(h, at)
    const d = typeTime(text, o.max ?? 2.6)
    const st = { n: 0 }
    tl.set(caret, { opacity: 1 }, at + 0.06)
    let shown = -1
    tl.to(st, { n: text.length, duration: d, ease: "none", onUpdate: () => {
      const k = Math.round(st.n)
      if (k !== shown) { shown = k; live.textContent = typed(text, k) }
    } }, at + 0.1)
    tl.set(caret, { opacity: 0 }, at + 0.1 + d + 0.2)
    h.t = at + 0.1 + d + 0.12
    return h.t
  }

  /** Grab a block from somewhere else and set it down in its slot, lifted a touch on the way. */
  const drag = (el: HTMLElement, from: { x: number; y: number; r?: number; s?: number }, o: Job & { hidden?: boolean } = {}) => {
    const b = B(el)
    const hold = { x: b.x + b.w * 0.5, y: b.y + Math.min(b.h * 0.3, 60) }
    // Where the grab point sits while the block is still small (scaled about its centre).
    const s = from.s ?? 1
    const grabAt = { x: b.x + b.w * 0.5 + from.x, y: b.y + b.h * 0.5 + (hold.y - b.y - b.h * 0.5) * s + from.y }
    gsap.set(el, { x: from.x, y: from.y, rotation: from.r ?? 0, scale: from.s ?? 1 })
    if (o.hidden) gsap.set(el, { opacity: 0 })
    const { h, at } = begin(grabAt, o)
    tool(h, "grab", at - 0.1)
    if (o.hidden) tl.to(el, { opacity: 1, duration: 0.15 }, at - 0.15)
    click(h, at)
    const d = Math.min(1.3, travel(Math.hypot(from.x, from.y)) * 1.25 + 0.1)
    if (!from.s) tl.to(el, { scale: 1.035, duration: 0.14, ease: "power2.out" }, at + 0.06)
    tl.to(el, { x: 0, y: 0, rotation: 0, scale: from.s ? 1 : 1.035, duration: d, ease: "power3.inOut" }, at + 0.1)
    glide(h, hold, at + 0.1, d, "power3.inOut")
    tl.to(el, { scale: 1, duration: 0.22, ease: "back.out(3)" }, at + 0.1 + d)
    click(h, at + 0.1 + d)
    h.t += 0.12
    return h.t
  }

  /** Grow a selection frame and its W × H badge. Writes only: the numbers come from the tween, never from the DOM. */
  const sizeFrame = (h: Hand, w0: number, h0: number, w1: number, h1: number, at: number, d: number, ease: string) => {
    const f = h.frm
    const st = { w: w0, h: h0 }
    const paint = () => {
      f.style.width = st.w + "px"
      f.style.height = st.h + "px"
      h.badge.textContent = Math.round(st.w) + " × " + Math.round(st.h)
    }
    tl.to(st, { w: w1, h: h1, duration: d, ease, onUpdate: paint, onStart: paint }, at)
  }

  /** Crosshair marquee: the frame and its W × H badge grow with the drag, the block is revealed under it. */
  const marquee = (el: HTMLElement, o: Job = {}) => {
    const b = B(el)
    gsap.set(el, { clipPath: "inset(0% 100% 100% 0%)" })
    const { h, at } = begin({ x: b.x, y: b.y }, o)
    tool(h, "cross", at - 0.12)
    click(h, at)
    const d = 0.45 + 0.12 * Math.log2(1 + (b.w + b.h) / 120)
    const f = h.frm
    tl.set(f, { x: b.x, y: b.y, opacity: 1 }, at + 0.02)
    sizeFrame(h, 0, 0, b.w, b.h, at + 0.06, d, "power2.inOut")
    tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease: "power2.inOut" }, at + 0.06)
    glide(h, { x: b.x + b.w, y: b.y + b.h }, at + 0.06, d, "power2.inOut")
    tl.set(f, { opacity: 0 }, at + 0.06 + d + 0.18)
    // Done drawing: stop clipping, so anything that overhangs the block (a stamp) shows.
    tl.set(el, { clipPath: "none" }, at + 0.06 + d + 0.02)
    h.t += 0.1
    return h.t
  }

  /** Pen tool: drag a rule out from one end; it grows behind the nib. */
  const pen = (el: HTMLElement, axis: "x" | "y", o: Job & { dur?: number; reverse?: boolean } = {}) => {
    const b = B(el)
    const start = axis === "x" ? { x: o.reverse ? b.x + b.w : b.x, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: o.reverse ? b.y + b.h : b.y }
    const end = axis === "x" ? { x: o.reverse ? b.x : b.x + b.w, y: start.y } : { x: start.x, y: o.reverse ? b.y : b.y + b.h }
    const prop = axis === "x" ? "scaleX" : "scaleY"
    gsap.set(el, { [prop]: 0, transformOrigin: o.reverse ? (axis === "x" ? "100% 50%" : "50% 100%") : axis === "x" ? "0% 50%" : "50% 0%" })
    const { h, at } = begin(start, o)
    tool(h, "pen", at - 0.12)
    click(h, at)
    const d = o.dur ?? 0.3 + 0.1 * Math.log2(1 + Math.max(b.w, b.h) / 40)
    tl.to(el, { [prop]: 1, duration: d, ease: "power1.inOut" }, at + 0.06)
    glide(h, end, at + 0.06, d, "power1.inOut")
    click(h, h.t)
    h.t += 0.08
    return { end: h.t, at: at + 0.06, d }
  }

  /** Eyedropper: click a swatch and the ink floods it from the centre out. */
  const flood = (el: HTMLElement, o: Job & { color?: string } = {}) => {
    const b = B(el)
    gsap.set(el, { clipPath: "circle(0% at 50% 50%)" })
    const { h, at } = begin({ x: b.x + b.w * 0.5, y: b.y + b.h * 0.5 }, o)
    tool(h, "drop", at - 0.12)
    if (o.color) tl.set(h.el, { "--dc": o.color }, at - 0.12)
    click(h, at)
    tl.to(el, { clipPath: "circle(71% at 50% 50%)", duration: 0.55, ease: "power2.out" }, at + 0.06)
    h.t = at + 0.3
    return h.t
  }

  /** Grow a disc out from its centre with the crosshair. */
  const disc = (el: HTMLElement, o: Job = {}) => {
    const b = B(el)
    const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
    gsap.set(el, { clipPath: "circle(0% at 50% 50%)" })
    const { h, at } = begin(c, o)
    tool(h, "cross", at - 0.12)
    click(h, at)
    tl.to(el, { clipPath: "circle(50% at 50% 50%)", duration: 0.8, ease: "power2.inOut" }, at + 0.06)
    glide(h, { x: c.x + b.w * 0.36, y: c.y + b.h * 0.36 }, at + 0.06, 0.8, "power2.inOut")
    h.t += 0.08
    return h.t
  }

  /** Stretch a block from a small size up to full, by its bottom-right handle. */
  const stretch = (el: HTMLElement, s0: number, o: Job = {}) => {
    const b = B(el)
    gsap.set(el, { scale: s0, transformOrigin: "0% 0%" })
    const { h, at } = begin({ x: b.x + b.w * s0, y: b.y + b.h * s0 }, o)
    tool(h, "size", at - 0.12)
    click(h, at)
    const d = 1.1
    const f = h.frm
    tl.set(f, { x: b.x, y: b.y, opacity: 1 }, at)
    sizeFrame(h, b.w * s0, b.h * s0, b.w, b.h, at, d + 0.06, "power3.inOut")
    tl.to(el, { scale: 1, duration: d, ease: "power3.inOut" }, at + 0.06)
    glide(h, { x: b.x + b.w, y: b.y + b.h }, at + 0.06, d, "power3.inOut")
    tl.set(f, { opacity: 0 }, at + 0.06 + d + 0.15)
    h.t += 0.1
    return { h, end: h.t }
  }

  /** Lean on a block's edge and shove it home. */
  const push = (el: HTMLElement, from: { x: number; y: number }, o: Job = {}) => {
    const b = B(el)
    gsap.set(el, { x: from.x, y: from.y })
    // Displaced left means it gets shoved right from its left edge, and the other way round.
    const fromLeft = from.x < 0
    const contact = { x: fromLeft ? b.x + from.x - 4 : b.x + b.w + from.x + 4, y: b.y + b.h * 0.55 + from.y }
    const { h, at } = begin({ x: contact.x + (fromLeft ? -30 : 30), y: contact.y }, o)
    tool(h, "arrow", at - 0.1)
    tl.to(h.el, { x: contact.x, duration: 0.14, ease: "power2.in" }, at)
    const d = 0.7
    tl.to(el, { x: 0, y: 0, duration: d, ease: "power2.out" }, at + 0.14)
    glide(h, { x: contact.x - from.x, y: contact.y - from.y }, at + 0.14, d, "power2.out")
    h.t += 0.1
    return h.t
  }

  /** Turn a block by a handle, the cursor riding the arc in three short legs. */
  const rotate = (el: HTMLElement, fromDeg: number, o: Job = {}) => {
    const b = B(el)
    const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
    const r = b.w / 2
    const on = (deg: number) => ({ x: c.x + r * Math.sin((deg * Math.PI) / 180), y: c.y - r * Math.cos((deg * Math.PI) / 180) })
    gsap.set(el, { rotation: fromDeg, opacity: 0 })
    const { h, at } = begin(on(fromDeg), o)
    tool(h, "grab", at - 0.12)
    tl.to(el, { opacity: 1, duration: 0.25 }, at - 0.2)
    click(h, at)
    tl.to(el, { rotation: 0, duration: 1.05, ease: "power2.inOut" }, at + 0.06)
    let t = at + 0.06
    const legs = [0.33, 0.33, 0.34]
    let done = 0
    for (const l of legs) {
      done += l
      const p = on(fromDeg * (1 - done))
      glide(h, p, t, 1.05 * l, "none")
      t += 1.05 * l
    }
    h.t = t + 0.08
    return h.t
  }

  /** Stamp: click and it slams down from above the paper. */
  const slam = (el: HTMLElement, o: Job = {}) => {
    const b = B(el)
    gsap.set(el, { opacity: 0, scale: 1.9 })
    const { h, at } = begin({ x: b.x + b.w * 0.5, y: b.y + b.h * 0.5 }, o)
    tool(h, "arrow", at - 0.1)
    click(h, at)
    tl.to(el, { opacity: 1, scale: 1, duration: 0.32, ease: "power4.in" }, at + 0.02)
    tl.fromTo(el, { x: -2 }, { x: 0, duration: 0.2, ease: "elastic.out(1,0.3)", immediateRender: false }, at + 0.34)
    h.t = at + 0.45
    return h.t
  }

  /** Point at something and click (a button, a chip) at a given moment. */
  const tap = (el: HTMLElement, o: Job & { tool?: Tool; color?: string; off?: Pt } = {}) => {
    const b = B(el)
    const { h, at } = begin({ x: b.x + b.w * 0.5 + (o.off?.x ?? 0), y: b.y + b.h * 0.5 + (o.off?.y ?? 0) }, o)
    tool(h, o.tool ?? "arrow", at - 0.12)
    if (o.color) tl.set(h.el, { "--dc": o.color }, at + 0.02)
    click(h, at)
    h.t = at + 0.18
    return { h, at }
  }

  const layer = stage.querySelector< HTMLElement>(".ov-hands")!
  const made = (cls: string, color: string) => {
    const el = document.createElement("div")
    el.className = cls
    el.setAttribute("aria-hidden", "true")
    el.style.setProperty("--c", color)
    layer.appendChild(el)
    cleanups.push(() => el.remove())
    return el
  }
  const colorOf = (h: Hand) => h.el.style.getPropertyValue("--c")

  /** Right-click: a context menu opens at the cursor, it hovers down the items and picks one. */
  const rclick = (el: HTMLElement, items: string[], pick: number, o: Job & { at?: Pt } = {}) => {
    const b = B(el)
    const p = o.at ?? { x: b.x + b.w * 0.62, y: b.y + b.h * 0.3 }
    const { h, at } = begin(p, o)
    tool(h, "arrow", at - 0.12)
    const m = made("ov-menu", colorOf(h))
    const rows = items.map((t) => {
      const r = document.createElement("span")
      r.textContent = t
      m.appendChild(r)
      return r
    })
    // Open up-left of the cursor if it would run off the stage.
    const mw = 176
    const mh = 12 + items.length * 30
    const mx = p.x + 4 + mw > W ? p.x - mw - 4 : p.x + 4
    const my = p.y + 4 + mh > H ? p.y - mh - 4 : p.y + 4
    gsap.set(m, { x: mx, y: my, opacity: 0, scale: 0.94, transformOrigin: "0% 0%" })
    tl.to(h.g, { scale: 0.86, duration: 0.06, yoyo: true, repeat: 1 }, at)
    tl.to(m, { opacity: 1, scale: 1, duration: 0.14, ease: "power2.out" }, at + 0.05)
    let t = at + 0.22
    rows.forEach((r, i) => {
      if (i > pick) return
      const y = my + 6 + i * 30 + 15
      glide(h, { x: mx + 52 + i * 3, y }, t, i ? 0.13 : 0.2, "power1.inOut")
      tl.set(r, { attr: { "data-on": "1" } }, t + 0.05)
      if (i < pick) tl.set(r, { attr: { "data-on": "0" } }, t + 0.17)
      t = h.t
    })
    click(h, t + 0.05)
    tl.to(m, { opacity: 0, duration: 0.12 }, t + 0.2)
    h.t = t + 0.3
    return { h, end: t + 0.2 }
  }

  /** A shortcut chip by the cursor: the crew uses the keyboard too. */
  const key = (h: Hand, label: string, at: number) => {
    const k = made("ov-key", colorOf(h))
    k.textContent = label
    gsap.set(k, { x: h.x + 14, y: h.y - 34, opacity: 0, scale: 0.8 })
    tl.to(k, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(3)" }, at)
    tl.to(k, { opacity: 0, y: h.y - 44, duration: 0.2 }, at + 0.6)
  }

  /** Everybody who worked here walks off the nearest edge once their last job is done. */
  const leave = (except: Set< Hand> = new Set()) => {
    for (const h of hands) {
      if (except.has(h)) continue
      tool(h, "arrow", h.t)
      walk(h, exitPoint(h, W, H), h.t + 0.15)
    }
  }

  return { tl, hands, B, W, H, place, tool, walk, glide, begin, fade, type, drag, marquee, pen, flood, disc, stretch, push, rotate, slam, tap, leave, click, rclick, key }
}

// ---- markup helpers -------------------------------------------------------------------

/** Text that can be typed: a screen-reader copy, a ghost that holds the layout, and the live copy. */
function Ty({ children, block, sr = true, className, k }: { children: React.ReactNode; block?: boolean; sr?: boolean; className?: string; k?: string }) {
  return (
    <span className={"ov-ty" + (block ? " ov-ty-b" : "") + (className ? " " + className : "")} data-k={k}>
      {sr && <span className="ov-sr">{children}</span>}
      <span className="ov-ty-ghost" aria-hidden="true">{children}</span>
      <span className="ov-ty-live" aria-hidden="true"><span className="ov-ty-txt" /><i className="ov-caret" /></span>
    </span>
  )
}

const GLYPHS = (
  <>
    <svg className="ov-gl ov-gl-arrow" width="22" height="22" viewBox="0 0 22 22"><path d="M1.6 1.6v15.6l4.3-4.1 3.1 6.6 2.9-1.3-3-6.5h6.1z" fill="var(--c)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    <svg className="ov-gl ov-gl-text" width="14" height="24" viewBox="0 0 14 24"><path d="M2.5 2h3.5M8 2h3.5M7 2.5v19M2.5 22h3.5M8 22h3.5" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" /><path d="M2.5 2h3.5M8 2h3.5M7 2.5v19M2.5 22h3.5M8 22h3.5" fill="none" stroke="var(--c)" strokeWidth="1.8" strokeLinecap="round" /></svg>
    <svg className="ov-gl ov-gl-cross" width="24" height="24" viewBox="0 0 24 24"><path d="M12 1v22M1 12h22" stroke="#fff" strokeWidth="4" /><path d="M12 1v22M1 12h22" stroke="var(--c)" strokeWidth="1.6" /></svg>
    <svg className="ov-gl ov-gl-pen" width="22" height="22" viewBox="0 0 22 22"><path d="M1.5 20.5l3.2-9.4 8.6-8.6 6.2 6.2-8.6 8.6z" fill="var(--c)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="8.2" cy="13.8" r="1.6" fill="#fff" /><path d="M1.5 20.5l5.6-5.6" stroke="#fff" strokeWidth="1.2" /></svg>
    <svg className="ov-gl ov-gl-drop" width="22" height="22" viewBox="0 0 22 22"><path d="M2 20l1.1-4.4 9.3-9.3 3.3 3.3-9.3 9.3z" fill="var(--dc,#fff)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12 4.6l2.4-2.4a2.4 2.4 0 013.4 3.4l-2.4 2.4 1.2 1.2-1.8 1.8-5.6-5.6 1.8-1.8z" fill="var(--c)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
    <svg className="ov-gl ov-gl-grab" width="24" height="24" viewBox="0 0 24 24"><path d="M12 1.5l3.2 3.6h-2.1v5.8h5.8V8.8l3.6 3.2-3.6 3.2v-2.1h-5.8v5.8h2.1L12 22.5l-3.2-3.6h2.1v-5.8H5.1v2.1L1.5 12l3.6-3.2v2.1h5.8V5.1H8.8z" fill="var(--c)" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>
    <svg className="ov-gl ov-gl-size" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h7.5L8 5.5l10.5 10.5 2.5-2.5V21h-7.5l2.5-2.5L5.5 8 3 10.5z" fill="var(--c)" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>
  </>
)

function Hands({ crew, ids }: { crew: OverprintCollaborator[]; ids: number[] }) {
  return (
    <div className="ov-hands" aria-hidden="true">
      {ids.map((id, i) => {
        const m = crew[id % crew.length]
        return (
          <div key={"f" + i} className="ov-frm" style={{ "--c": m.color } as CSSVars}><b /></div>
        )
      })}
      {ids.map((id, i) => {
        const m = crew[id % crew.length]
        return (
          <div key={"h" + i} className="ov-hand" data-tool="arrow" style={{ "--c": m.color, "--ct": m.ink ?? "#fff" } as CSSVars}>
            <div className="ov-hg">
              {GLYPHS}
              <span className="ov-tag">{m.name}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Crops() {
  return (
    <div className="ov-crops" aria-hidden="true">
      {["tl", "tr", "bl", "br"].map((c) => (
        <span key={c} className={"ov-crop ov-crop-" + c}><i className="ov-cx" data-k="crop-x" /><i className="ov-cy" data-k="crop-y" /></span>
      ))}
    </div>
  )
}

const inkVar = (k: OverprintSpeaker["ink"]) => ({ pink: "var(--ov-pink)", blue: "var(--ov-blue)", yellow: "var(--ov-yel)", teal: "var(--ov-teal)", orange: "var(--ov-org)" })[k]
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")

// ---- the page --------------------------------------------------------------------------

export default function OverprintSwarmTemplate({
  brand = "PartnerLink",
  edition = "’26",
  headline = ["Find your", "perfect", "FYP team."],
  kicker = "The GIKI FYP matchmaker",
  intro = "Tell us your skills, interests, CGPA and the research you want to chase. PartnerLink ranks the GIKI peers you would build best with, and connects your group to vetted faculty supervisors.",
  city = "GIKI",
  dates = "FYP season 2026–27",
  venue = ["Ghulam Ishaq Khan Institute", "Topi, Swabi", "Khyber Pakhtunkhwa"],
  email = "partnerlink@giki.edu.pk",
  ctaHref = "/register",
  ctaLabel = "Get started",
  signInHref = "/login",
  signInLabel = "Sign in",
  crew = DEFAULT_CREW,
  speakers = DEFAULT_SPEAKERS,
  sessions = DEFAULT_SESSIONS,
  passes = DEFAULT_PASSES,
  height = "100svh",
  fontHref = FONT_HREF,
  className,
}: OverprintSwarmTemplateProps) {
  const rootRef = React.useRef< HTMLDivElement>(null)
  // Until JS runs this is the finished page; with it, the crew takes over.
  const [live, setLive] = React.useState(false)
  const [layout, setLayout] = React.useState(0)
  const featured = passes.findIndex((p) => p.featured)
  const swapAt = Math.min(4, sessions.length - 2)

  React.useEffect(() => {
    setLive(true)
    let cancelled = false
    // Every target is measured, so rebuild once the real fonts have landed (ready can resolve before the stylesheet does).
    const bump = () => { if (!cancelled) setLayout((n) => n + 1) }
    const fonts = document.fonts
    Promise.all([fonts?.load('900 40px "Archivo"'), fonts?.load('500 12px "JetBrains Mono"')]).then(bump, bump)
    fonts?.addEventListener?.("loadingdone", bump)
    // Rebuild when the width changes for real: every target moved.
    const el = rootRef.current!
    let w = el.offsetWidth
    let t = 0
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.offsetWidth - w) < 24) return
      w = el.offsetWidth
      clearTimeout(t)
      t = window.setTimeout(() => setLayout((n) => n + 1), 220)
    })
    ro.observe(el)
    return () => { cancelled = true; ro.disconnect(); clearTimeout(t); fonts?.removeEventListener?.("loadingdone", bump) }
  }, [])

  useIso(() => {
    if (!live) return
    const root = rootRef.current!
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => buildAll(root))
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.querySelectorAll< HTMLElement>("[data-calm]").forEach((el) => {
          gsap.from(el, { opacity: 0, y: 14, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } })
        })
      })
    }, root)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => { cancelAnimationFrame(raf); ctx.revert() }
  }, [live, layout])

  // Intro: the print job opens, two plates ink in, the crew arrives one by one, then hands over to scroll.
  // Time-based and played once; it moves the glyph wrappers, never the cursors the scroll timeline owns.
  useIso(() => {
    if (!live || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const root = rootRef.current!
    const stage = root.querySelector< HTMLElement>('[data-stage="hero"]')!
    const k = (n: string) => stage.querySelector< HTMLElement>('[data-k="' + n + '"]')!
    const ctx = gsap.context(() => {
      const gs = [...stage.querySelectorAll< HTMLElement>(".ov-hand")].filter((h) => h.style.display !== "none").map((h) => h.querySelector< HTMLElement>(".ov-hg")!)
      const W = stage.offsetWidth
      const H = stage.offsetHeight
      const n = k("pre-n")
      k("pre-t").textContent = String(gs.length)
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(k("hint"), { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" }, 0)
      tl.fromTo(k("pre-p"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.2)
      tl.fromTo(k("pre-b"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.75)
      gs.forEach((g, i) => {
        const a = (i / gs.length) * Math.PI * 2 + 0.4
        tl.from(g, { x: Math.cos(a) * W * 0.65, y: Math.sin(a) * H * 0.75, duration: 0.85, ease: "power3.out" }, 0.3 + i * 0.13)
        tl.call(() => { n.textContent = String(i + 1) }, undefined, 0.3 + i * 0.13 + 0.6)
      })
      n.textContent = "0"
      const done = 0.3 + gs.length * 0.13 + 0.7
      tl.to(k("pre-wait"), { opacity: 0, y: -6, duration: 0.25 }, done)
      tl.fromTo(k("pre-go"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, done + 0.1)
      // Scroll during the intro? Skip to the end so nothing fights the scrub.
      const skip = () => { if (window.scrollY > 4) tl.progress(1) }
      window.addEventListener("scroll", skip, { passive: true })
      return () => { window.removeEventListener("scroll", skip); n.textContent = String(gs.length) }
    }, root)
    return () => ctx.revert()
  }, [live])

  const ids = (n: number, off: number) => Array.from({ length: n }, (_, i) => (i + off) % crew.length)

  return (
    <div ref={rootRef} className={"ov" + (live ? " ov-live" : "") + (className ? " " + className : "")} style={{ "--h": height } as CSSVars}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <style>{CSS}</style>

      {/* ---- hero: a sticky stage the crew builds across almost two screens of scroll ---- */}
      <section className="ov-hero-run" aria-label={brand + " " + edition}>
        <div className="ov-stage ov-hero" data-stage="hero">
          <Crops />
          <header className="ov-top" data-calm>
            <a className="ov-logo" href="#top" data-k="logo"><Ty>{brand.toUpperCase()}</Ty><sup data-k="ed">{edition}</sup></a>
            <nav className="ov-nav" aria-label="Sections">
              <a href="#speakers"><Ty k="nav">Matches</Ty></a>
              <a href="#programme"><Ty k="nav">How it works</Ty></a>
              <a href={signInHref}><Ty k="nav">{signInLabel}</Ty></a>
            </nav>
            <a className="ov-btn ov-btn-solid" href={ctaHref} data-k="pass"><span data-k="pass-l">{ctaLabel}</span></a>
          </header>

          <div className="ov-hero-main">
            <div className="ov-hero-copy">
              <p className="ov-kicker" data-calm><Ty k="kicker">{kicker + " · " + city + " · " + dates}</Ty></p>
              <h1 className="ov-h1" data-calm>
                <span className="ov-sr">{headline.join(" ")}</span>
                <span className="ov-plates" aria-hidden="true" data-k="plates">
                  <span className="ov-plate ov-plate-b">
                    {headline.map((l, i) => <span key={i} className="ov-pl"><Ty sr={false} k="hl">{l}</Ty></span>)}
                  </span>
                  <span className="ov-plate ov-plate-p" data-k="pink">
                    {headline.map((l, i) => <span key={i} className="ov-pl">{l}</span>)}
                  </span>
                </span>
              </h1>
              <p className="ov-sub" data-calm><Ty block k="sub">{intro}</Ty></p>
              <div className="ov-ctas" data-calm>
                <a className="ov-btn ov-btn-solid ov-btn-lg" href={ctaHref} data-k="cta">Create your profile — {passes[featured >= 0 ? featured : 0]?.price}</a>
                <a className="ov-btn ov-btn-lg" href={signInHref} data-k="cta">{signInLabel === "Sign in" ? "I have an account" : signInLabel}</a>
              </div>
            </div>
            <div className="ov-art" aria-hidden="true" data-calm>
              <span className="ov-disc ov-disc-p" data-k="disc" />
              <span className="ov-disc ov-disc-b" data-k="disc" />
              <span className="ov-ring" data-k="ring">
                <svg viewBox="0 0 200 200">
                  <defs><path id="ov-ring-path" d="M100 100m-91 0a91 91 0 1 1 182 0a91 91 0 1 1-182 0" /></defs>
                  <text><textPath href="#ov-ring-path" textLength="568">SKILLS · INTERESTS · DOMAINS · CGPA · FACULTY · ONE TEAM ·</textPath></text>
                </svg>
              </span>
              <span className="ov-art-date" data-k="date"><b>FYP</b><b>GIKI</b></span>
            </div>
          </div>

          <footer className="ov-colo" data-calm>
            <span className="ov-colo-inks">
              <span data-k="colo"><Ty>Matched in two passes</Ty></span>
              <i className="ov-chip" style={{ "--i": "var(--ov-pink)" } as CSSVars} data-k="chip-p" />
              <i className="ov-chip" style={{ "--i": "var(--ov-blue)" } as CSSVars} data-k="chip-b" />
            </span>
            <span data-k="colo"><Ty>{venue.join(" · ")}</Ty></span>
            <span className="ov-colo-crew" data-k="crew" aria-label={"Built by " + crew.map((c) => c.name).join(", ")}>
              {crew.map((c) => <i key={c.name} style={{ "--c": c.color, "--ct": c.ink ?? "#fff" } as CSSVars} aria-hidden="true">{c.name[0]}</i>)}
            </span>
          </footer>

          <div className="ov-hint" aria-hidden="true" data-k="hint">
            <span className="ov-pre-top"><b>{brand.toLowerCase()}-{edition.replace(/\D/g, "")}.fyp</b><span><span data-k="pre-n">{crew.length}</span> of <span data-k="pre-t">{crew.length}</span> teammates</span></span>
            <span className="ov-pre-bar"><i data-k="pre-p" /><i data-k="pre-b" /></span>
            <span className="ov-pre-msg"><span data-k="pre-wait">Ranking your matches…</span><span data-k="pre-go">Scroll — watch your team assemble ↓</span></span>
          </div>
          <Hands crew={crew} ids={ids(crew.length, 0)} />
        </div>
      </section>

      {/* ---- the idea + the inks ---- */}
      <section className="ov-stage ov-sec ov-idea" data-stage="idea" aria-labelledby="ov-idea-h">
        <i className="ov-rule" data-k="rule" aria-hidden="true" />
        <p className="ov-label" id="ov-idea-h" data-calm><Ty k="label">01 — The idea</Ty></p>
        <p className="ov-state" data-calm>
          <Ty block k="state">Most FYP groups are formed by <mark>who sat nearby</mark> in first year. PartnerLink matches you on what you know and what you want to build, so every project starts on solid ground.</Ty>
        </p>
        <ul className="ov-inks" aria-label="What we match on">
          {INKS.map((ink) => (
            <li key={ink.name} className="ov-ink" data-calm>
              <i className="ov-ink-dot" style={{ "--i": ink.v } as CSSVars} data-k="ink" aria-hidden="true" />
              <b><Ty k="ink-n">{ink.name}</Ty></b>
              <span>{ink.code}</span>
            </li>
          ))}
        </ul>
        <Hands crew={crew} ids={ids(4, 4)} />
      </section>

      {/* ---- speakers, dealt from a deck ---- */}
      <section className="ov-stage ov-sec ov-spks" id="speakers" data-stage="speakers" aria-labelledby="ov-spk-h">
        <i className="ov-rule" data-k="rule" aria-hidden="true" />
        <div className="ov-sec-head">
          <p className="ov-label" data-calm><Ty k="label">02 — Matches</Ty></p>
          <h2 className="ov-h2" id="ov-spk-h" data-calm><Ty block k="h2">Teammates you haven’t met yet</Ty></h2>
          <span className="ov-deck" data-k="deck" aria-hidden="true" />
        </div>
        <ul className="ov-spk-grid">
          {speakers.map((s, i) => (
            <li key={s.name} className="ov-spk" data-k="spk" data-calm style={{ "--a": inkVar(s.ink), zIndex: speakers.length - i } as CSSVars}>
              <span className="ov-spk-art" aria-hidden="true">
                <b className="ov-mono-b">{initials(s.name)}</b>
                <b className="ov-mono-p">{initials(s.name)}</b>
                <span className="ov-spk-no">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="ov-spk-info">
                <b className="ov-spk-name">{s.name}</b>
                <span className="ov-spk-role">{s.role} · {s.city}</span>
                <span className="ov-spk-talk">“{s.talk}”</span>
              </span>
            </li>
          ))}
        </ul>
        <Hands crew={crew} ids={ids(4, 1)} />
      </section>

      {/* ---- programme: a pen draws the day, a comment swaps two sessions ---- */}
      <section className="ov-stage ov-sec ov-prog" id="programme" data-stage="programme" aria-labelledby="ov-prog-h">
        <i className="ov-rule" data-k="rule" aria-hidden="true" />
        <div className="ov-prog-head">
          <p className="ov-label" data-calm><Ty k="label">03 — How it works</Ty></p>
          <h2 className="ov-h2" id="ov-prog-h" data-calm><Ty block k="h2">Sign-up to supervisor</Ty></h2>
          <p className="ov-note" data-calm><Ty block k="note">Seven steps, one semester head start. Professors join too, and stay pending until an admin approves them.</Ty></p>
        </div>
        <div className="ov-tl">
          <i className="ov-tl-line" data-k="line" aria-hidden="true" />
          <ol className="ov-rows" aria-label="How PartnerLink works, step by step">
            {sessions.map((s, i) => (
              <li key={s.time + s.title} className="ov-row" data-k="row" data-calm>
                <time className="ov-row-t">{s.time}</time>
                <span className="ov-row-m"><b>{s.title}</b>{s.who && <span>{s.who}</span>}</span>
                <span className="ov-row-r">{s.room}</span>
                {i === swapAt && (
                  <span className="ov-cmt" data-k="cmt" aria-hidden="true">
                    <span className="ov-cmt-line"><i style={{ "--c": crew[5 % crew.length].color } as CSSVars}>{crew[5 % crew.length].name[0]}</i><Ty sr={false} k="cmt-a">Group before supervisor? Profs ask who’s in it.</Ty></span>
                    <span className="ov-cmt-line"><i style={{ "--c": crew[1].color } as CSSVars}>{crew[1].name[0]}</i><Ty sr={false} k="cmt-b">Swapping them now ✓</Ty></span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <Hands crew={crew} ids={ids(4, 5)} />
      </section>

      {/* ---- passes: drawn with the marquee, priced, stamped ---- */}
      <section className="ov-stage ov-sec ov-passes" id="passes" data-stage="passes" aria-labelledby="ov-pass-h">
        <i className="ov-rule" data-k="rule" aria-hidden="true" />
        <div className="ov-sec-head">
          <p className="ov-label" data-calm><Ty k="label">04 — Roles</Ty></p>
          <h2 className="ov-h2" id="ov-pass-h" data-calm><Ty block k="h2">Pick a role, bring a friend</Ty></h2>
        </div>
        <ul className="ov-pass-grid">
          {passes.map((p) => (
            <li key={p.name} className={"ov-pass" + (p.featured ? " ov-pass-f" : "")} data-k="pass-card" data-calm>
              <span className="ov-pass-top" data-k="pass-in"><b>{p.name}</b><span>{p.note}</span></span>
              <Ty className="ov-pass-price" k="price">{p.price}</Ty>
              <ul className="ov-perks" data-k="pass-in">{p.perks.map((k) => <li key={k}>{k}</li>)}</ul>
              <a className={"ov-btn" + (p.featured ? " ov-btn-solid" : "")} href={p.href ?? "mailto:" + email + "?subject=" + encodeURIComponent(p.name)} data-k="pass-in">{p.cta ?? "Join as " + p.name.toLowerCase()}</a>
              {p.stamp && <span className="ov-stamp" data-k="stamp">{p.stamp}</span>}
            </li>
          ))}
        </ul>
        <Hands crew={crew} ids={ids(3, 2)} />
      </section>

      {/* ---- finale: the swarm fetches the letters, then rests on the credits ---- */}
      <section className="ov-stage ov-sec ov-fin" data-stage="finale" aria-labelledby="ov-fin-h">
        <i className="ov-rule" data-k="rule" aria-hidden="true" />
        <span className="ov-fin-disc" data-k="fdisc" aria-hidden="true" />
        <h2 className="ov-fin-h" id="ov-fin-h" data-calm>
          <span className="ov-sr">Team up at {city}.</span>
          <span aria-hidden="true" className="ov-fin-l1">{"TEAM UP".split("").map((c, i) => <span key={i} className="ov-L" data-k="L">{c === " " ? " " : c}</span>)}</span>
          <span aria-hidden="true" className="ov-fin-l2">{("AT " + city.toUpperCase() + ".").split("").map((c, i) => <span key={i} className="ov-L" data-k="L">{c === " " ? " " : c}</span>)}</span>
        </h2>
        <div className="ov-foot">
          <div data-calm data-k="foot"><span className="ov-label">Where</span>{venue.map((v) => <span key={v}>{v}</span>)}</div>
          <div data-calm data-k="foot"><span className="ov-label">When</span><span>{dates}</span><span>Open to every batch</span></div>
          <div data-calm data-k="foot"><span className="ov-label">Write</span><a href={"mailto:" + email}>{email}</a></div>
          <div data-calm className="ov-credits"><span className="ov-label" data-k="foot">This page was built by</span>
            <ul>{crew.map((c) => <li key={c.name} data-k="credit" style={{ "--c": c.color } as CSSVars}><i aria-hidden="true" />{c.name}</li>)}</ul>
          </div>
        </div>
        <p className="ov-fine" data-calm data-k="foot">{brand} is a Software Engineering course project at GIKI. Demo profiles are fictional. Two inks, many hands.</p>
        <Hands crew={crew} ids={ids(crew.length, 0)} />
      </section>
    </div>
  )
}

// ---- choreography per section --------------------------------------------------------------

function buildAll(root: HTMLElement) {
  const cleanups: (() => void)[] = []
  const stages = [...root.querySelectorAll< HTMLElement>("[data-stage]")]
  for (const stage of stages) {
    const kind = stage.dataset.stage!
    const all = [...stage.querySelectorAll< HTMLElement>(".ov-hand")]
    const frames = [...stage.querySelectorAll< HTMLElement>(".ov-frm")]
    const n = crewSize(stage.offsetWidth, all.length)
    all.slice(n).forEach((el) => gsap.set(el, { display: "none" }))
    const tl = gsap.timeline({ paused: true, defaults: { overwrite: false } })
    const D = director(tl, stage, all.slice(0, n), frames.slice(0, n), cleanups)
    const q = (k: string) => stage.querySelector< HTMLElement>('[data-k="' + k + '"]')!
    const qa = (k: string) => [...stage.querySelectorAll< HTMLElement>('[data-k="' + k + '"]')]
    const narrow = stage.offsetWidth < 720

    // Everyone starts just off the edges, spread down the stage.
    D.hands.forEach((h, i) => D.place(h, { x: i % 2 ? D.W + 50 : -50, y: D.H * (0.18 + (0.64 * i) / Math.max(1, D.hands.length - 1)) }))
    qa("rule").forEach((r) => D.pen(r, "x", { ready: 0, dur: 0.9 }))

    if (kind === "hero") hero(D, tl, q, qa, narrow)
    if (kind === "idea") idea(D, tl, q, qa, cleanups, stage)
    if (kind === "speakers") speakersBuild(D, q, qa, narrow)
    if (kind === "programme") programme(D, tl, q, qa)
    if (kind === "passes") passesBuild(D, q, qa)
    if (kind === "finale") finale(D, tl, q, qa)

    tl.to({}, { duration: 0.4 })
    const run = kind === "hero" ? (stage.parentElement as HTMLElement) : stage
    ScrollTrigger.create({
      animation: tl,
      trigger: run,
      start: kind === "hero" ? "top top" : "top 78%",
      end: kind === "hero" ? "bottom bottom" : kind === "finale" ? "bottom bottom" : () => "+=" + Math.max(stage.offsetHeight * 0.95, window.innerHeight * 0.9),
      scrub: 0.7,
    })
  }
  return () => cleanups.forEach((f) => f())
}

type Dir = ReturnType< typeof director>
type Q = (k: string) => HTMLElement
type QA = (k: string) => HTMLElement[]

function hero(D: Dir, tl: gsap.core.Timeline, q: Q, qa: QA, narrow: boolean) {
  // The crew waits around the scroll hint, then fans out.
  const hint = q("hint")
  const hb = D.B(hint)
  D.hands.forEach((h, i) => {
    const a = (i / D.hands.length) * Math.PI * 2 - Math.PI / 2
    D.place(h, { x: hb.x + hb.w / 2 + Math.cos(a) * (hb.w * 0.6 + 24), y: hb.y + hb.h / 2 + Math.sin(a) * 86 - 10 })
    h.t = 0.25
  })
  tl.to(hint, { opacity: 0, y: -10, duration: 0.35 }, 0.05)

  // Crop marks first: the sheet gets its corners.
  const cx = qa("crop-x")
  const cy = qa("crop-y")
  cx.forEach((el, i) => D.pen(el, "x", { ready: 0.3 + i * 0.05, dur: 0.32, reverse: i % 2 === 0 }))
  cy.forEach((el, i) => D.pen(el, "y", { ready: 0.5 + i * 0.05, dur: 0.32, reverse: i < 2 }))

  // Masthead.
  const logo = q("logo")
  D.type(logo.querySelector< HTMLElement>(".ov-ty")!, { ready: 0.4 })
  D.fade(q("ed"), 1.2, { y: -6 })
  if (!narrow) qa("nav").forEach((el, i) => D.type(el, { ready: 0.7 + i * 0.15 }))
  const pass = q("pass")
  D.marquee(pass, { ready: 0.8 })
  D.fade(q("pass-l"), 1.9)

  // Kicker, then the headline typed small in blue, stretched to size, inked in pink, knocked out of register.
  const kick = D.type(q("kicker"), { ready: 1 })
  const plates = q("plates")
  const pb = D.B(plates)
  const s0 = narrow ? 0.5 : 0.34
  let typedEnd = kick
  qa("hl").forEach((el, i) => {
    typedEnd = Math.max(typedEnd, D.type(el, { ready: kick + 0.1 + i * 0.5, org: pb, s: s0 }))
  })
  const st = D.stretch(plates, s0, { ready: typedEnd + 0.15 })

  // Colophon + ink chips; the pink is picked up from its chip.
  qa("colo").forEach((el, i) => D.type(el.querySelector< HTMLElement>(".ov-ty")!, { ready: 1.6 + i * 0.4 }))
  D.flood(q("chip-p"), { ready: 2.2, color: "var(--ov-pink)" })
  D.flood(q("chip-b"), { ready: 2.4, color: "var(--ov-blue)" })
  const crewEl = q("crew")
  D.fade([...crewEl.children], 2.6, { y: 6, stagger: 0.08 })

  // Pick the pink, drop it on the type, then nudge the plate out of register.
  const pink = q("pink")
  const off = { x: parseFloat(getComputedStyle(pink).fontSize) * 0.045, y: parseFloat(getComputedStyle(pink).fontSize) * 0.03 }
  gsap.set(pink, { opacity: 0 })
  const pick = D.tap(q("chip-p"), { ready: st.end + 0.05, tool: "drop", color: "var(--ov-pink)" })
  const b0 = D.B(plates)
  const dropAt = D.walk(pick.h, { x: b0.x + b0.w * 0.3, y: b0.y + b0.h * 0.3 }, pick.h.t)
  D.click(pick.h, dropAt)
  tl.to(pink, { opacity: 1, duration: 0.3 }, dropAt + 0.05)
  pick.h.t = dropAt + 0.2
  D.push(pink, { x: -off.x - 0.5, y: -off.y }, { ready: dropAt + 0.35, who: pick.h.i })

  // Sub copy and the two calls to action.
  D.type(q("sub"), { ready: st.end - 0.2, max: 2.4 })
  qa("cta").forEach((el, i) => D.drag(el, { x: (i ? 1 : -1) * 60, y: narrow ? 140 : 180, r: i ? 6 : -5 }, { ready: st.end + 0.6 + i * 0.3, hidden: true }))

  // The art: two discs grown from their centres, the ring turned into place, the date stamped.
  const discs = qa("disc")
  discs.forEach((el, i) => D.disc(el, { ready: (narrow ? 2.6 : 1.5) + i * 0.4 }))
  D.rotate(q("ring"), -100, { ready: narrow ? 3.4 : 2.4 })
  D.slam(q("date"), { ready: narrow ? 3.8 : 3 })
  D.leave()
}

function idea(D: Dir, tl: gsap.core.Timeline, q: Q, qa: QA, cleanups: (() => void)[], stage: HTMLElement) {
  D.type(q("label"), { ready: 0.2 })
  const state = q("state")
  const end = D.type(state, { ready: 0.4, max: 4.2 })
  // Highlighter: bars laid under "many hands", swept left to right once the words exist.
  const mark = state.querySelector< HTMLElement>(".ov-ty-ghost mark")
  if (mark) {
    const base = state.getBoundingClientRect()
    const host = state
    const bars = [...mark.getClientRects()].map((r) => {
      const bar = document.createElement("i")
      bar.className = "ov-mk"
      bar.style.cssText = "left:" + (r.left - base.left) + "px;top:" + (r.top - base.top + r.height * 0.12) + "px;width:" + r.width + "px;height:" + r.height * 0.82 + "px"
      host.appendChild(bar)
      return bar
    })
    cleanups.push(() => bars.forEach((b) => b.remove()))
    const sb = D.B(state)
    let at = end * 0.55
    bars.forEach((bar) => {
      const x0 = sb.x + bar.offsetLeft
      const y0 = sb.y + bar.offsetTop + bar.offsetHeight / 2
      gsap.set(bar, { scaleX: 0, transformOrigin: "0% 50%" })
      const { h, at: a } = D.begin({ x: x0, y: y0 }, { ready: Math.max(at, end - 0.2) })
      D.tool(h, "pen", a - 0.12)
      D.click(h, a)
      tl.to(bar, { scaleX: 1, duration: 0.55, ease: "power1.inOut" }, a + 0.05)
      D.glide(h, { x: x0 + bar.offsetWidth, y: y0 }, a + 0.05, 0.55, "power1.inOut")
      at = h.t
    })
  }
  qa("ink").forEach((el, i) => D.flood(el, { ready: 1.2 + i * 0.35, color: getComputedStyle(el).getPropertyValue("--i") }))
  qa("ink-n").forEach((el, i) => D.type(el, { ready: 1.6 + i * 0.35 }))
  D.fade([...stage.querySelectorAll(".ov-ink > span")], 2.4, { stagger: 0.1 })
  D.leave()
}

function speakersBuild(D: Dir, q: Q, qa: QA, narrow: boolean) {
  D.type(q("label"), { ready: 0.1 })
  D.type(q("h2"), { ready: 0.3, max: 1.4 })
  const deck = D.B(q("deck"))
  const tilt = [-7, 4, -3, 8, -5, 3, -6, 5]
  qa("spk").forEach((el, i) => {
    const b = D.B(el)
    const from = narrow
      ? { x: (i % 2 ? 1 : -1) * (D.W * 0.7), y: 40, r: tilt[i % tilt.length] * 1.6 }
      : { x: deck.x + deck.w / 2 - (b.x + b.w / 2) + i * 5, y: deck.y + deck.h / 2 - (b.y + b.h / 2) - i * 4, r: tilt[i % tilt.length], s: Math.min(1, deck.w / b.w) }
    D.drag(el, from, { ready: 0.9 + i * 0.32 })
  })
  D.leave()
}

function programme(D: Dir, tl: gsap.core.Timeline, q: Q, qa: QA) {
  D.type(q("label"), { ready: 0.1 })
  D.type(q("h2"), { ready: 0.3, max: 1.4 })
  D.type(q("note"), { ready: 0.9, max: 2 })
  const line = D.pen(q("line"), "y", { ready: 0.6, dur: 2.6 })
  const rows = qa("row")
  const swap = rows.findIndex((r) => r.querySelector('[data-k="cmt"]'))
  const ys = rows.map((r) => D.B(r).y)
  const tlBox = D.B(q("line"))
  rows.forEach((r, i) => {
    // Each session slides in from the right just as the pen passes its time.
    const when = line.at + ((ys[i] - tlBox.y) / Math.max(1, tlBox.h)) * line.d
    if (i === swap || i === swap + 1) return
    if (i === 2) D.push(r, { x: -Math.min(220, D.W * 0.2), y: 0 }, { ready: when })
    else D.drag(r, { x: Math.min(260, D.W * 0.3), y: 0 }, { ready: when, hidden: true })
  })
  if (swap >= 0 && rows[swap + 1]) {
    const a = rows[swap]
    const b = rows[swap + 1]
    const dy = ys[swap + 1] - ys[swap]
    // They arrive in the wrong order...
    const when = line.at + ((ys[swap] - tlBox.y) / Math.max(1, tlBox.h)) * line.d
    const off = { x: 0, y: dy }
    // ...someone leaves a comment, someone replies, then the two are dragged past each other.
    const cmt = q("cmt")
    gsap.set(cmt, { opacity: 0, scale: 0.6, transformOrigin: "0% 100%" })
    const c = D.tap(cmt, { ready: when + 0.6, off })
    tl.to(cmt, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, c.at + 0.04)
    c.h.t = c.at + 0.3
    const a1 = D.type(q("cmt-a"), { ready: c.at + 0.35, who: c.h.i, max: 1.4, off })
    const a2 = D.type(q("cmt-b"), { ready: a1 + 0.3, max: 0.9, off })
    tl.to(cmt, { opacity: 0, y: -8, duration: 0.3 }, a2 + 0.35)
    D.drag(a, { x: 0, y: dy }, { ready: a2 + 0.5 })
    D.drag(b, { x: 0, y: -dy }, { ready: a2 + 0.5 })
    // The drags above parked both rows in each other's slots; they fade in there, in the wrong order.
    gsap.set([a, b], { opacity: 0 })
    tl.to([b, a], { opacity: 1, duration: 0.3, stagger: 0.15 }, when)
  }
  D.leave()
}

function passesBuild(D: Dir, q: Q, qa: QA) {
  D.type(q("label"), { ready: 0.1 })
  D.type(q("h2"), { ready: 0.3, max: 1.4 })
  const cards = qa("pass-card")
  const fill = (card: HTMLElement, at: number) => {
    D.type(card.querySelector< HTMLElement>('[data-k="price"]')!, { ready: at + 0.1 })
    D.fade([...card.querySelectorAll('[data-k="pass-in"]')], at + 0.15, { y: 10, stagger: 0.12 })
  }
  // The first pass is drawn by hand...
  const drawn = D.marquee(cards[0], { ready: 0.7 })
  fill(cards[0], drawn)
  if (cards.length > 1) {
    // ...then copied from the context menu and pasted into the next slot,
    const copy = D.rclick(cards[0], ["Cut", "Copy", "Paste", "Duplicate", "Bring to front"], 1, { ready: drawn + 0.2 })
    const paste = (card: HTMLElement, at: number) => {
      gsap.set(card, { opacity: 0 })
      D.tl.to(card, { opacity: 1, duration: 0.1 }, at)
      D.tl.fromTo(card, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: "back.out(2.4)", immediateRender: false }, at)
      fill(card, at + 0.1)
    }
    const b1 = D.B(cards[1])
    const pasted = D.rclick(cards[1], ["Paste", "Paste in place", "Select all"], 0, { who: copy.h.i, at: { x: b1.x + b1.w * 0.4, y: b1.y + b1.h * 0.3 } })
    paste(cards[1], pasted.end)
    // ...and the third one with the keyboard.
    if (cards[2]) {
      const b2 = D.B(cards[2])
      const h = copy.h
      const at = D.walk(h, { x: b2.x + b2.w * 0.4, y: b2.y + b2.h * 0.3 }, h.t + 0.1)
      D.click(h, at)
      D.key(h, "⌘ V", at + 0.12)
      paste(cards[2], at + 0.22)
      h.t = at + 0.5
    }
  }
  const stamp = q("stamp")
  if (stamp) {
    const card = stamp.parentElement as HTMLElement
    const b = D.B(card)
    const m = D.rclick(card, ["Copy", "Paste", "Add stamp…", "Rename", "Delete"], 2, { ready: 3.4, at: { x: b.x + b.w * 0.7, y: b.y + b.h * 0.18 } })
    D.slam(stamp, { ready: m.end + 0.05, who: m.h.i })
  }
  D.leave()
}

function finale(D: Dir, tl: gsap.core.Timeline, q: Q, qa: QA) {
  D.disc(q("fdisc"), { ready: 0.2 })
  // Every collaborator fetches letters from above the sheet.
  qa("L").filter((el) => el.textContent!.trim()).forEach((el, i) => {
    const b = D.B(el)
    D.drag(el, { x: ((i * 37) % 60) - 30, y: -(b.y + b.h + 90), r: ((i * 53) % 30) - 15 }, { ready: 0.35 + i * 0.1 })
  })
  const feet = qa("foot")
  D.fade(feet, 2.6, { y: 10, stagger: 0.1 })
  // Then each one rests on their own name in the credits.
  const credits = qa("credit")
  gsap.set(credits, { opacity: 0 })
  D.hands.forEach((h) => {
    const name = h.el.querySelector(".ov-tag")?.textContent
    const el = credits.find((c) => c.textContent === name)
    if (!el) return
    const b = D.B(el)
    // Rest the arrow tip just past the end of their own name (the li pads 52px on the right), tag tucked away.
    const start = Math.max(h.t, 2.9 + h.i * 0.08)
    D.tool(h, "arrow", start)
    const at = D.walk(h, { x: b.x + b.w - 46, y: b.y + b.h * 0.35 }, start)
    tl.to(el, { opacity: 1, duration: 0.25 }, at - 0.15)
    tl.to(h.el.querySelector(".ov-tag"), { opacity: 0, scale: 0.6, duration: 0.25 }, at + 0.05)
    D.click(h, at)
  })
  credits.forEach((el) => {
    if (!D.hands.some((h) => h.el.querySelector(".ov-tag")?.textContent === el.textContent)) tl.to(el, { opacity: 1, duration: 0.25 }, 3.2)
  })
}

// ---- styles ---------------------------------------------------------------------------------

const CSS = `
.ov{--ov-paper:#F3EEE3;--ov-ink:#16151A;--ov-mute:#57534B;--ov-line:rgba(22,21,26,.14);--ov-pink:#FF48B0;--ov-blue:#0078BF;--ov-yel:#FFE800;--ov-teal:#00838A;--ov-org:#FF6C2F;--ov-blend:multiply;--ov-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  container:ov/inline-size;position:relative;color:var(--ov-ink);font-family:Archivo,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip;
  background-color:var(--ov-paper);background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .09 0 0 0 0 .08 0 0 0 0 .07 0 0 0 .2 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.dark .ov{--ov-paper:#111014;--ov-ink:#F1ECE1;--ov-mute:#A9A399;--ov-line:rgba(241,236,225,.15);--ov-pink:#FF5CBC;--ov-blue:#3B96FF;--ov-yel:#FFE45C;--ov-teal:#22B5AC;--ov-org:#FF7A3D;--ov-blend:screen}
.ov :where(a){color:inherit;text-decoration:none}
.ov ul,.ov ol{list-style:none;margin:0;padding:0}
.ov p,.ov h1,.ov h2{margin:0}
.ov mark{background:none;color:inherit;box-shadow:inset 0 -.42em 0 color-mix(in srgb,var(--ov-pink) 70%,transparent)}
.ov-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ov-label{font:500 12px/1.4 var(--ov-mono);text-transform:uppercase;letter-spacing:.09em;color:var(--ov-mute)}

/* typed text */
.ov-ty{position:relative;display:inline-block;max-width:100%}
.ov-ty-b{display:block}
.ov-ty-live{position:absolute;inset:0;display:none;pointer-events:none}
.ov-live .ov-ty-live{display:block}
.ov-caret{position:relative;opacity:0}
.ov-caret::after{content:"";position:absolute;left:1px;bottom:-.08em;width:2px;height:.95em;background:currentColor;animation:ov-blink 1s steps(1) infinite}
@keyframes ov-blink{50%{visibility:hidden}}
.ov-mk{position:absolute;z-index:-1;background:var(--ov-pink);mix-blend-mode:var(--ov-blend);opacity:.75;pointer-events:none}
.ov-live .ov-state mark{box-shadow:none}

/* cursors */
.ov-hands{position:absolute;inset:0;pointer-events:none;z-index:40;display:none}
.ov-live .ov-hands{display:block}
.ov-hand{position:absolute;left:0;top:0;will-change:transform}
.ov-hg{position:absolute;left:0;top:0;transform-origin:0 0;animation:ov-bob 2.8s ease-in-out infinite}
.ov-hand:nth-child(odd) .ov-hg{animation-duration:3.4s}
@keyframes ov-bob{50%{translate:0 -2px}}
.ov-gl{position:absolute;display:none;overflow:visible;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.25))}
.ov-gl-arrow{left:-1px;top:-1px}
.ov-gl-text{left:-7px;top:-12px}
.ov-gl-cross,.ov-gl-grab,.ov-gl-size{left:-12px;top:-12px}
.ov-gl-pen,.ov-gl-drop{left:-1px;top:-21px}
.ov-hand[data-tool=arrow] .ov-gl-arrow,.ov-hand[data-tool=text] .ov-gl-text,.ov-hand[data-tool=cross] .ov-gl-cross,.ov-hand[data-tool=pen] .ov-gl-pen,.ov-hand[data-tool=drop] .ov-gl-drop,.ov-hand[data-tool=grab] .ov-gl-grab,.ov-hand[data-tool=size] .ov-gl-size{display:block}
.ov-tag{position:absolute;left:13px;top:19px;padding:4px 7px 4px;border-radius:2px 9px 9px 9px;background:var(--c);color:var(--ct);font:600 11px/1 var(--ov-mono);letter-spacing:.02em;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.18)}
.ov-hand[data-tool=text] .ov-tag,.ov-hand[data-tool=cross] .ov-tag,.ov-hand[data-tool=grab] .ov-tag,.ov-hand[data-tool=size] .ov-tag{left:12px;top:12px}
.ov-frm{position:absolute;left:0;top:0;width:0;height:0;border:1.5px solid var(--c);opacity:0;pointer-events:none}
.ov-frm b{position:absolute;left:50%;top:calc(100% + 6px);translate:-50% 0;padding:3px 5px;border-radius:3px;background:var(--c);color:#fff;font:600 10px/1 var(--ov-mono);white-space:nowrap}
.ov-frm b:empty{display:none}

/* hero */
.ov-hero-run{position:relative;height:calc(var(--h) * 2.7)}
.ov-stage{position:relative}
.ov-hero{position:sticky;top:0;height:var(--h);min-height:560px;overflow:clip;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:clamp(18px,2.2cqi,34px) clamp(18px,3.2cqi,52px) clamp(16px,2cqi,30px)}
.ov-crops{position:absolute;inset:clamp(8px,1cqi,14px);pointer-events:none}
.ov-crop{position:absolute;width:26px;height:26px}
.ov-crop i{position:absolute;background:var(--ov-ink)}
.ov-cx{height:1px;width:26px;top:0}
.ov-cy{width:1px;height:26px;left:0}
.ov-crop-tl{left:0;top:0}.ov-crop-tr{right:0;top:0}.ov-crop-bl{left:0;bottom:0}.ov-crop-br{right:0;bottom:0}
.ov-crop-tr .ov-cy,.ov-crop-br .ov-cy{left:auto;right:0}
.ov-crop-bl .ov-cx,.ov-crop-br .ov-cx{top:auto;bottom:0}
.ov-top{display:flex;align-items:center;justify-content:space-between;gap:24px;position:relative;z-index:3}
.ov-logo{display:inline-flex;align-items:flex-start;font-weight:850;font-stretch:125%;font-size:clamp(16px,1.55cqi,24px);letter-spacing:.01em;line-height:1}
.ov-logo sup{font:700 .5em/1 var(--ov-mono);margin-left:.25em;color:var(--ov-pink)}
.ov-nav{display:flex;gap:clamp(18px,2.6cqi,40px);font:500 13px/1 var(--ov-mono);text-transform:uppercase;letter-spacing:.08em}
.ov-nav a{padding:6px 0}
.ov-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6em;min-height:42px;padding:0 20px;border:1.5px solid var(--ov-ink);border-radius:999px;font:600 12px/1 var(--ov-mono);text-transform:uppercase;letter-spacing:.07em;white-space:nowrap;transition:background-color .2s,color .2s}
.ov-btn:hover{background:var(--ov-ink);color:var(--ov-paper)}
.ov-btn-solid{background:var(--ov-ink);color:var(--ov-paper)}
.ov-btn-solid:hover{background:var(--ov-pink);border-color:var(--ov-pink);color:#16151A}
.ov-btn-lg{min-height:52px;padding:0 26px;font-size:13px}
.ov-btn:focus-visible{outline:2px solid var(--ov-blue);outline-offset:3px}
.ov-hero-main{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);align-items:center;gap:3cqi;position:relative;min-height:0}
.ov-hero-copy{position:relative;z-index:2;min-width:0}
.ov-kicker{font:500 12.5px/1.4 var(--ov-mono);text-transform:uppercase;letter-spacing:.09em;margin-bottom:clamp(14px,1.8cqi,28px)}
.ov-h1{font-weight:900;font-stretch:62%;font-size:min(12.4cqi,calc(var(--h) * .205));line-height:.8;text-transform:uppercase;letter-spacing:-.012em}
.ov-plates{position:relative;display:block;width:max-content;max-width:100%}
.ov-plate{display:block}
.ov-pl{display:block;white-space:nowrap}
.ov-pl > .ov-ty{display:block}
.ov-plate-b{color:var(--ov-blue)}
.ov-plate-p{position:absolute;left:.045em;top:.03em;width:100%;color:var(--ov-pink);mix-blend-mode:var(--ov-blend)}
.ov-sub{max-width:34em;margin-top:clamp(22px,2.8cqi,44px);font-size:clamp(15px,1.25cqi,19px);line-height:1.5;font-stretch:100%;color:var(--ov-ink)}
.ov-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(18px,2.2cqi,32px)}
.ov-art{position:relative;justify-self:end;width:min(100%,calc(var(--h) * .58));aspect-ratio:1}
.ov-disc{position:absolute;width:74%;aspect-ratio:1;border-radius:50%;mix-blend-mode:var(--ov-blend)}
.ov-disc-p{left:0;top:2%;background:radial-gradient(circle,var(--ov-pink) 0 36%,transparent 36.5%),radial-gradient(circle,var(--ov-pink) 46%,transparent 50%) 0 0/9px 9px;-webkit-mask:radial-gradient(circle,#000 52%,rgba(0,0,0,.45) 66%,#000 70.5%,transparent 71%);mask:radial-gradient(circle,#000 52%,rgba(0,0,0,.45) 66%,#000 70.5%,transparent 71%)}
.ov-disc-b{right:0;bottom:2%;background:var(--ov-blue)}
.ov-ring{position:absolute;inset:-3%;color:var(--ov-ink)}
.ov-ring svg{display:block;width:100%;height:100%;overflow:visible}
.ov-ring text{font:500 7.4px var(--ov-mono);fill:currentColor;letter-spacing:.5px}
.ov-art-date{position:absolute;left:50%;top:50%;translate:-50% -50%;display:grid;justify-items:center;font-weight:900;font-stretch:125%;line-height:.9;color:var(--ov-paper);font-size:clamp(20px,3cqi,46px);text-align:center;mix-blend-mode:normal}
.ov-art-date b{display:block}
.ov-colo{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:14px;border-top:1px solid var(--ov-line);font:500 11.5px/1.3 var(--ov-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--ov-mute);position:relative;z-index:3}
.ov-colo-inks{display:inline-flex;align-items:center;gap:8px}
.ov-chip{width:14px;height:14px;border-radius:50%;background:var(--i);display:inline-block}
.ov-colo-crew{display:inline-flex}
.ov-colo-crew i{width:22px;height:22px;margin-left:-5px;border-radius:50%;background:var(--c);color:var(--ct);display:grid;place-items:center;font:700 10px/1 var(--ov-mono);font-style:normal;box-shadow:0 0 0 2px var(--ov-paper)}
.ov-hint{position:absolute;left:50%;top:50%;translate:-50% -50%;z-index:5;width:min(340px,78%);display:none;gap:10px;font:500 11.5px/1.3 var(--ov-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--ov-mute)}
.ov-live .ov-hint{display:grid}
.ov-pre-top{display:flex;justify-content:space-between;gap:12px;color:var(--ov-ink)}
.ov-pre-top b{font-weight:700;text-transform:none;letter-spacing:.02em}
.ov-pre-bar{display:grid;grid-template-columns:1fr 1fr;gap:3px;height:6px}
.ov-pre-bar i{display:block;background:var(--ov-pink);transform-origin:0 50%}
.ov-pre-bar i + i{background:var(--ov-blue)}
.ov-pre-msg{display:grid}
.ov-pre-msg > span{grid-area:1/1}
.ov-pre-msg > span + span{opacity:0;color:var(--ov-ink)}
.ov-menu{position:absolute;left:0;top:0;display:grid;width:176px;padding:6px;border-radius:10px;background:#1C1B21;color:#F3EEE3;font:500 12px/1 var(--ov-mono);box-shadow:0 14px 34px rgba(0,0,0,.28),0 0 0 1px rgba(255,255,255,.06);opacity:0;z-index:2}
.ov-menu span{display:flex;align-items:center;height:30px;padding:0 10px;border-radius:6px}
.ov-menu span[data-on="1"]{background:var(--c);color:#fff}
.ov-key{position:absolute;left:0;top:0;padding:6px 9px;border-radius:7px;background:#1C1B21;color:#fff;font:700 12px/1 var(--ov-mono);box-shadow:0 0 0 2px var(--c),0 6px 16px rgba(0,0,0,.2);opacity:0;z-index:2}

/* sections */
.ov-sec{overflow:clip;padding:clamp(72px,8cqi,140px) clamp(18px,3.2cqi,52px)}
.ov-rule{position:absolute;left:clamp(18px,3.2cqi,52px);right:clamp(18px,3.2cqi,52px);top:0;height:1.5px;background:var(--ov-ink)}
.ov-h2{font-weight:900;font-stretch:62%;font-size:clamp(46px,7.6cqi,132px);line-height:.84;text-transform:uppercase;letter-spacing:-.01em;max-width:11ch}
.ov-sec-head{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,9fr);gap:16px 1.6cqi;align-items:start;position:relative;margin-bottom:clamp(36px,4.5cqi,72px)}
.ov-deck{position:absolute;right:2%;top:-2%;width:min(19cqi,290px);aspect-ratio:3/4}

.ov-idea{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,9fr);gap:28px 1.6cqi}
.ov-state{font-size:clamp(26px,3.9cqi,64px);line-height:1.06;font-weight:600;font-stretch:86%;letter-spacing:-.018em;position:relative;z-index:0;isolation:isolate}
.ov-inks{grid-column:1/-1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:1.6cqi;margin-top:clamp(28px,4cqi,64px)}
.ov-ink{display:grid;gap:6px;font-size:14px}
.ov-ink-dot{display:block;width:100%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.22) 30%,transparent 34%) 0 0/7px 7px,var(--i);mix-blend-mode:var(--ov-blend);margin-bottom:10px}
.ov-ink b{font-weight:700;font-stretch:100%;font-size:clamp(14px,1.25cqi,19px)}
.ov-ink > span{font:500 11.5px/1 var(--ov-mono);letter-spacing:.06em;color:var(--ov-mute)}

.ov-spk-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.6cqi,26px)}
.ov-spk{position:relative;display:grid;background:var(--ov-paper);border:1.5px solid var(--ov-ink);will-change:transform}
.ov-spk-art{position:relative;display:block;aspect-ratio:4/3;background:var(--a);overflow:hidden;border-bottom:1.5px solid var(--ov-ink)}
.ov-spk-art::after{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(255,255,255,.2) 32%,transparent 36%) 0 0/8px 8px}
.ov-spk-art b{position:absolute;left:5%;bottom:-.12em;font-weight:900;font-stretch:62%;font-size:min(13cqi,200px);line-height:1;letter-spacing:-.02em}
.ov-mono-b{color:#16151A;mix-blend-mode:multiply;opacity:.9}
.ov-mono-p{color:#F6F1E7;translate:.035em -.03em;mix-blend-mode:normal;opacity:.95}
.ov-spk-no{position:absolute;right:10px;top:10px;font:600 11px/1 var(--ov-mono);color:#16151A}
.ov-spk-info{display:grid;gap:6px;padding:16px 16px 18px}
.ov-spk-name{font-weight:800;font-stretch:100%;font-size:clamp(18px,1.6cqi,24px)}
.ov-spk-role{font:500 11.5px/1.3 var(--ov-mono);text-transform:uppercase;letter-spacing:.07em;color:var(--ov-mute)}
.ov-spk-talk{font-size:15px;line-height:1.35}

.ov-prog{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:40px 3cqi}
.ov-prog-head{display:grid;gap:20px;align-content:start}
.ov-note{max-width:26em;font-size:15px;line-height:1.5;color:var(--ov-mute)}
.ov-tl{position:relative;padding-left:clamp(26px,3cqi,44px)}
.ov-tl-line{position:absolute;left:5px;top:12px;bottom:12px;width:2px;background:var(--ov-ink)}
.ov-row{position:relative;display:grid;grid-template-columns:5.2em minmax(0,1fr) auto;gap:8px 1.6cqi;align-items:baseline;padding:18px 0;border-bottom:1px solid var(--ov-line)}
.ov-row-t{position:relative;font:600 14px/1 var(--ov-mono)}
.ov-row-t::before{content:"";position:absolute;left:calc(-1 * clamp(26px,3cqi,44px));top:50%;translate:0 -50%;width:12px;height:12px;border-radius:50%;background:var(--ov-paper);border:2px solid var(--ov-ink);box-sizing:border-box}
.ov-row:nth-child(3n+1) .ov-row-t::before{background:var(--ov-pink);border-color:var(--ov-pink)}
.ov-row-m{display:grid;gap:4px}
.ov-row-m b{font-weight:750;font-stretch:96%;font-size:clamp(17px,1.65cqi,26px);line-height:1.15}
.ov-row-m span,.ov-row-r{font:500 11.5px/1.3 var(--ov-mono);text-transform:uppercase;letter-spacing:.07em;color:var(--ov-mute)}
.ov-cmt{position:absolute;right:0;bottom:calc(100% - 14px);z-index:3;display:none;gap:8px;width:min(300px,70%);padding:12px 14px;border-radius:12px 12px 12px 2px;background:var(--ov-paper);border:1.5px solid var(--ov-ink);box-shadow:0 10px 24px rgba(0,0,0,.12);font-size:13.5px;line-height:1.35;opacity:0}
.ov-live .ov-cmt{display:grid}
.ov-cmt-line{display:grid;grid-template-columns:20px 1fr;gap:8px;align-items:start}
.ov-cmt-line i{width:20px;height:20px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font:700 10px/1 var(--ov-mono);font-style:normal}

.ov-pass-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.6cqi,26px);align-items:stretch}
.ov-pass{position:relative;display:grid;grid-template-rows:auto auto 1fr auto;gap:18px;padding:clamp(20px,2.2cqi,32px);border:1.5px solid var(--ov-ink);background:var(--ov-paper)}
.ov-pass-f{background:var(--ov-pink);border-color:var(--ov-pink);color:#16151A}
.ov-pass-f .ov-btn{border-color:#16151A}
.ov-pass-f .ov-btn-solid{background:#16151A;color:#FFF5FA}
.ov-pass-top{display:grid;gap:6px}
.ov-pass-top b{font-weight:800;font-stretch:110%;font-size:clamp(18px,1.6cqi,24px);text-transform:uppercase}
.ov-pass-top span{font:500 11.5px/1.3 var(--ov-mono);text-transform:uppercase;letter-spacing:.07em;opacity:.75}
.ov-pass-price{font-weight:900;font-stretch:62%;font-size:clamp(64px,7.4cqi,128px);line-height:.85;letter-spacing:-.02em}
.ov-perks{display:grid;gap:8px;align-content:start;font-size:15px}
.ov-perks li{display:flex;gap:10px}
.ov-perks li::before{content:"";flex:none;width:8px;height:8px;margin-top:.45em;border-radius:50%;background:currentColor}
.ov-pass .ov-btn{justify-self:start}
.ov-stamp{position:absolute;right:-10px;top:-16px;rotate:-7deg;padding:8px 12px;border:2px solid #16151A;border-radius:6px;background:var(--ov-yel);color:#16151A;font:700 11px/1.2 var(--ov-mono);text-transform:uppercase;letter-spacing:.06em;max-width:15em}

.ov-fin{padding-bottom:clamp(28px,3cqi,48px)}
.ov-fin-disc{position:absolute;right:-6cqi;top:4cqi;width:46cqi;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--ov-pink) 46%,transparent 50%) 0 0/10px 10px;mix-blend-mode:var(--ov-blend);-webkit-mask:radial-gradient(circle,#000 40%,transparent 71%);mask:radial-gradient(circle,#000 40%,transparent 71%);pointer-events:none}
.ov-fin-h{position:relative;font-weight:900;font-stretch:62%;font-size:min(19cqi,330px);line-height:.8;text-transform:uppercase;letter-spacing:-.015em}
.ov-fin-h > span{display:block;white-space:nowrap}
.ov-fin-l2{color:var(--ov-blue)}
.ov-L{display:inline-block;will-change:transform}
.ov-foot{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,1.4fr);gap:28px 2cqi;margin-top:clamp(40px,5cqi,80px);padding-top:22px;border-top:1.5px solid var(--ov-ink);font-size:15px;line-height:1.45}
.ov-foot > div{display:grid;gap:4px;align-content:start}
.ov-foot .ov-label{margin-bottom:6px}
.ov-foot a{text-decoration:underline;text-underline-offset:3px}
.ov-credits ul{display:flex;flex-wrap:wrap;gap:8px 18px}
.ov-credits li{display:inline-flex;align-items:center;gap:7px;font-weight:600;padding-right:52px}
.ov-credits li i{width:9px;height:9px;border-radius:50%;background:var(--c)}
.ov-fine{margin-top:40px;font:500 11px/1.4 var(--ov-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--ov-mute)}

@container ov (max-width: 720px){
  .ov-hero-run{height:calc(var(--h) * 2.3)}
  .ov-hero{min-height:620px}
  .ov-nav{display:none}
  .ov-top .ov-btn{min-height:36px;padding:0 14px;font-size:11px}
  .ov-hero-main{grid-template-columns:1fr;align-content:end;gap:0;padding-bottom:18px}
  .ov-art{position:absolute;right:-10%;top:0;width:58cqi;z-index:0}
  .ov-h1{font-size:min(23cqi,calc(var(--h) * .15))}
  .ov-kicker{max-width:70%}
  .ov-sub{font-size:15px}
  .ov-btn-lg{min-height:46px;padding:0 18px;font-size:11.5px}
  .ov-colo{flex-wrap:wrap;gap:10px 16px}
  .ov-colo > span:nth-child(2){display:none}
  .ov-sec-head,.ov-idea,.ov-prog{grid-template-columns:1fr}
  .ov-inks{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 12px}
  .ov-spk-grid,.ov-pass-grid{grid-template-columns:1fr}
  .ov-spk-art{aspect-ratio:16/9}
  .ov-spk-art b{font-size:30cqi}
  .ov-deck{display:none}
  .ov-row{grid-template-columns:4.2em minmax(0,1fr)}
  .ov-row-r{grid-column:2}
  .ov-cmt{width:84%}
  .ov-stamp{right:8px}
  .ov-fin-h{font-size:22cqi}
  .ov-foot{grid-template-columns:1fr 1fr}
  .ov-credits{grid-column:1/-1}
}
@media (prefers-reduced-motion: reduce){
  .ov-hero-run{height:auto}
  .ov-hero{position:relative}
  .ov-hands,.ov-hint,.ov-cmt{display:none !important}
  .ov-caret::after,.ov-hg{animation:none}
}
@media (forced-colors: active){
  .ov-hands{display:none !important}
}
`

// Keep template-literal types after JSX so the 21st CLI tokenizer stays linear.
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>
