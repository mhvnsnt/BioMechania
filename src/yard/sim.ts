import type { GamePack, Handling, Kind } from "./packs";
import type { DriveInput } from "./input";
import {
  buildTrack,
  crossedGate,
  frameAt,
  projectPoint,
  type Proj,
  type Track,
} from "./track";

export type Outcome = "" | "finish" | "clear" | "short" | "delivered" | "late" | "lost";

export type Racer = {
  id: string;
  name: string;
  isPlayer: boolean;
  color: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  vx: number;
  vz: number;
  speed: number;
  charge: number;
  boost: number;
  stun: number;
  drifting: boolean;
  next: number;
  laps: number;
  finished: boolean;
  finishTime: number;
  score: number;
  progress: number;
  place: number;
  wrong: boolean;
  side: number;
};

export type Beacon = { x: number; z: number; alive: boolean; spin: number };
export type Hazard = { x: number; z: number; angle: number; orbit: number; rate: number };

export type HudSnap = {
  phase: "live" | "done";
  outcome: Outcome;
  kmh: number;
  charge: number;
  boost: boolean;
  lap: number;
  laps: number;
  place: number;
  field: number;
  elapsed: number;
  remain: number;
  score: number;
  target: number;
  cargo: number;
  step: number;
  steps: number;
  wrong: boolean;
  message: string;
  kind: Kind;
  title: string;
  slug: string;
};

const BOT_COLORS = ["#c4553a", "#d9d3c4", "#6e7f74", "#c9842a", "#8d6b8a"];
const BOT_NAMES = ["Moth", "Rust", "Bone", "Kiln", "Soot"];

const ZERO: DriveInput = { throttle: 0, steer: 0, drift: false, reset: false };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function wrap(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSlug(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Session {
  pack: GamePack;
  origin: string;
  track: Track;
  racers: Racer[] = [];
  beacons: Beacon[] = [];
  hazards: Hazard[] = [];
  time = 0;
  phase: "live" | "done" = "live";
  outcome: Outcome = "";
  cargo = 100;
  message = "";
  messageT = 0;
  resetHeld = false;
  player: Racer;

  constructor(pack: GamePack) {
    this.pack = pack;
    this.origin = pack.slug;
    this.track = buildTrack(pack.kind);
    this.player = this.spawnField();
    if (pack.kind === "sweep") this.seedSweep();
  }

  private spawnField(): Racer {
    const bots = this.track.kind === "circuit" ? this.pack.rules.bots : 0;
    const field = 1 + bots;
    const make = (i: number, isPlayer: boolean): Racer => ({
      id: isPlayer ? "you" : `bot-${i}`,
      name: isPlayer ? "You" : BOT_NAMES[i - 1] ?? `Bot ${i}`,
      isPlayer,
      color: isPlayer ? "#e7e1d4" : BOT_COLORS[(i - 1) % BOT_COLORS.length]!,
      x: 0,
      y: 0,
      z: 0,
      yaw: 0,
      pitch: 0,
      vx: 0,
      vz: 0,
      speed: 0,
      charge: 0,
      boost: 0,
      stun: 0,
      drifting: false,
      next: 0,
      laps: 0,
      finished: false,
      finishTime: 0,
      score: 0,
      progress: 0,
      place: i + 1,
      wrong: false,
      side: 0,
    });
    const racers: Racer[] = [];
    for (let i = 0; i < field; i++) racers.push(make(i, i === 0));
    this.racers = racers;
    const player = racers[0]!;
    if (this.track.kind === "sweep") {
      racers.forEach((r, i) => {
        const a = (i / field) * Math.PI * 2;
        r.x = Math.cos(a) * 3.2;
        r.z = Math.sin(a) * 3.2;
        r.yaw = a + Math.PI / 2;
      });
      return player;
    }
    const frame = frameAt(this.track, this.track.spawn);
    racers.forEach((r, i) => {
      const side = (i - (field - 1) / 2) * Math.min(2.4, (this.track.half * 1.35) / field);
      r.x = frame.x + frame.sx * side;
      r.z = frame.z + frame.sz * side;
      r.y = frame.y;
      r.yaw = frame.yaw;
      r.side = side;
    });
    return player;
  }

  private seedSweep() {
    const rand = mulberry32(hashSlug(this.pack.slug));
    const arena = this.track.arena;
    this.beacons = [];
    for (let i = 0; i < 6; i++) {
      this.beacons.push({
        x: (rand() * 2 - 1) * arena * 0.72,
        z: (rand() * 2 - 1) * arena * 0.72,
        alive: true,
        spin: rand() * Math.PI,
      });
    }
    this.hazards = [];
    for (let i = 0; i < 4; i++) {
      this.hazards.push({
        x: 0,
        z: 0,
        angle: (i / 4) * Math.PI * 2,
        orbit: 10 + i * 5.5,
        rate: 0.35 + i * 0.12,
      });
    }
  }

  tick(dt: number, input: DriveInput) {
    if (this.phase === "done") return;
    this.time += dt;
    if (this.messageT > 0) {
      this.messageT -= dt;
      if (this.messageT <= 0) this.message = "";
    }
    for (let i = 0; i < this.racers.length; i++) {
      const r = this.racers[i]!;
      if (r.finished && this.track.kind === "circuit") continue;
      const drive = r.isPlayer ? input : this.botDrive(r, i);
      if (r.stun > 0) r.stun = Math.max(0, r.stun - dt);
      const x0 = r.x;
      const z0 = r.z;
      this.integrate(r, drive, this.handlingFor(i), dt);
      let proj: Proj | null = null;
      if (this.track.kind === "sweep") this.constrainArena(r);
      else proj = this.constrainRoad(r, dt, i);
      if (this.track.kind === "circuit") this.progressCircuit(r, x0, z0);
      else if (this.track.kind === "haul") this.progressHaul(r, x0, z0);
      if (proj && r.isPlayer) {
        const along = r.vx * proj.tx + r.vz * proj.tz;
        r.wrong = along < -4;
      } else r.wrong = false;
      if (r.isPlayer) this.tryRescue(r, drive.reset);
    }
    if (this.track.kind === "sweep") this.tickSweep(dt);
    this.rank();
    this.tickEnd();
  }

  private handlingFor(index: number): Handling {
    const base = this.pack.handling;
    if (index === 0) return base;
    const pace = this.pack.rules.botPace * (0.9 + (index - 1) * 0.035);
    return { ...base, maxSpeed: base.maxSpeed * pace, accel: base.accel * 0.92 };
  }

  private integrate(r: Racer, input: DriveInput, h: Handling, dt: number) {
    const fx = -Math.sin(r.yaw);
    const fz = -Math.cos(r.yaw);
    const rx = Math.cos(r.yaw);
    const rz = -Math.sin(r.yaw);
    let throttle = input.throttle;
    if (r.stun > 0) throttle = Math.min(0, throttle);
    const powered = throttle >= 0 ? h.accel : h.brake;
    const boostMul = r.boost > 0 ? h.boost : 1;
    r.vx += fx * throttle * powered * (throttle > 0 ? boostMul : 1) * dt;
    r.vz += fz * throttle * powered * (throttle > 0 ? boostMul : 1) * dt;
    const coast = Math.abs(throttle) < 0.05 ? 0.9 : 0;
    const keep = Math.max(0, 1 - (h.drag + coast) * dt);
    r.vx *= keep;
    r.vz *= keep;

    let fwd = r.vx * fx + r.vz * fz;
    let lat = r.vx * rx + r.vz * rz;
    const drifting = input.drift && fwd > 8 && Math.abs(input.steer) > 0.12;
    const grip = drifting ? h.driftGrip : h.grip;
    lat *= Math.exp(-grip * dt);
    const max = h.maxSpeed * (r.boost > 0 ? 1.12 : 1);
    fwd = clamp(fwd, -h.reverse, max);
    r.vx = fx * fwd + rx * lat;
    r.vz = fz * fwd + rz * lat;
    r.speed = fwd;

    const speedFactor = clamp(Math.abs(fwd) / (h.maxSpeed * 0.42), 0.22, 1);
    const reverse = fwd >= 0 ? 1 : -1;
    // A is +steer and must increase yaw while moving forward (nose left on the chase cam).
    r.yaw += input.steer * h.turn * speedFactor * reverse * dt;

    if (drifting) {
      r.charge = Math.min(1, r.charge + dt * 0.72);
      r.drifting = true;
    } else if (r.drifting) {
      if (r.charge > 0.42 && fwd > 8) {
        r.boost = 0.5 + r.charge * 0.85;
        r.vx += fx * (6 + r.charge * 8);
        r.vz += fz * (6 + r.charge * 8);
        if (r.isPlayer) this.say("BOOST");
      }
      r.charge = 0;
      r.drifting = false;
    }
    if (r.boost > 0) r.boost = Math.max(0, r.boost - dt);

    r.x += r.vx * dt;
    r.z += r.vz * dt;
  }

  private constrainArena(r: Racer) {
    const rad = Math.hypot(r.x, r.z);
    const limit = this.track.arena;
    if (rad > limit) {
      const k = (limit - 0.2) / rad;
      r.x *= k;
      r.z *= k;
      const nx = r.x / (limit || 1);
      const nz = r.z / (limit || 1);
      const outward = r.vx * nx + r.vz * nz;
      if (outward > 0) {
        r.vx -= nx * outward;
        r.vz -= nz * outward;
      }
    }
    r.y = 0;
    r.pitch = 0;
  }

  private constrainRoad(r: Racer, dt: number, index: number): Proj {
    const proj = projectPoint(r.x, r.z, this.track);
    const half = this.track.half;
    const h = this.handlingFor(index);
    if (Math.abs(proj.side) > half) {
      const sign = proj.side >= 0 ? 1 : -1;
      const latVel = r.vx * proj.sx + r.vz * proj.sz;
      const impact = latVel * sign;
      r.x = proj.px + proj.sx * sign * (half - 0.15);
      r.z = proj.pz + proj.sz * sign * (half - 0.15);
      if (impact > 0) {
        r.vx -= proj.sx * latVel;
        r.vz -= proj.sz * latVel;
        r.speed *= 0.82;
        if (r.isPlayer && this.track.kind === "haul" && impact > 8) {
          this.cargo = Math.max(0, this.cargo - impact * 0.45);
          this.say("CARGO");
        }
      }
    } else if (Math.abs(proj.side) > half * 0.78) {
      const keep = Math.max(0, 1 - h.offDrag * dt);
      r.vx *= keep;
      r.vz *= keep;
      r.speed *= keep;
    }
    const next = this.track.samples[(proj.seg + 1) % this.track.samples.length];
    const aheadY = next ? next.y : proj.y;
    r.y = proj.y;
    r.pitch = Math.atan2(aheadY - proj.y, 4);
    return proj;
  }

  private progressCircuit(r: Racer, x0: number, z0: number) {
    const cps = this.track.checkpoints;
    if (cps.length === 0 || r.finished) return;
    const gate = cps[r.next]!;
    const sample = this.track.samples[gate];
    if (!sample) return;
    const frame = frameAt(this.track, gate);
    if (!crossedGate(x0, z0, r.x, r.z, sample, frame.tx, frame.tz, frame.sx, frame.sz, this.track.half)) {
      return;
    }
    r.next += 1;
    if (r.next >= cps.length) {
      r.laps += 1;
      r.next = 0;
      if (r.laps >= this.pack.rules.laps) {
        r.finished = true;
        r.finishTime = this.time;
        if (r.isPlayer) this.say("FINISH");
      } else if (r.isPlayer) this.say(`LAP ${r.laps + 1}`);
    } else if (r.isPlayer) this.say("GATE");
  }

  private progressHaul(r: Racer, x0: number, z0: number) {
    if (!r.isPlayer || r.finished) return;
    const cps = this.track.checkpoints;
    if (r.next >= cps.length) return;
    const gate = cps[r.next]!;
    const sample = this.track.samples[gate];
    if (!sample) return;
    const frame = frameAt(this.track, gate);
    if (!crossedGate(x0, z0, r.x, r.z, sample, frame.tx, frame.tz, frame.sx, frame.sz, this.track.half)) {
      return;
    }
    r.next += 1;
    this.say(r.next >= cps.length ? "DROP" : "GATE");
    if (r.next >= cps.length) {
      r.finished = true;
      r.finishTime = this.time;
    }
  }

  private tickSweep(dt: number) {
    const p = this.player;
    for (const b of this.beacons) {
      b.spin += dt * 2;
      if (!b.alive) continue;
      if (Math.hypot(b.x - p.x, b.z - p.z) < 2.35) {
        b.alive = false;
        p.score += 1;
        this.say(String(p.score));
        this.relocate(b);
        b.alive = true;
      }
    }
    for (const h of this.hazards) {
      h.angle += h.rate * dt * (h.orbit > 18 ? -1 : 1);
      h.x = Math.cos(h.angle) * h.orbit;
      h.z = Math.sin(h.angle) * h.orbit;
      if (p.stun <= 0 && Math.hypot(h.x - p.x, h.z - p.z) < 2.15) {
        p.stun = 0.45;
        p.vx *= 0.25;
        p.vz *= 0.25;
        p.speed *= 0.25;
        p.score = Math.max(0, p.score - 1);
        this.say("HIT");
      }
    }
  }

  private relocate(b: Beacon) {
    const rand = mulberry32((hashSlug(this.pack.slug) ^ Math.imul(this.player.score + 1, 997)) >>> 0);
    const arena = this.track.arena * 0.75;
    for (let n = 0; n < 8; n++) {
      const x = (rand() * 2 - 1) * arena;
      const z = (rand() * 2 - 1) * arena;
      if (Math.hypot(x - this.player.x, z - this.player.z) > 10) {
        b.x = x;
        b.z = z;
        return;
      }
    }
    b.x = -this.player.x * 0.8;
    b.z = -this.player.z * 0.8;
  }

  private botDrive(r: Racer, index: number): DriveInput {
    if (this.track.kind === "sweep") {
      const ang = this.time * 0.35 + index;
      return this.steerToward(r, Math.cos(ang) * 16, Math.sin(ang) * 16, false);
    }
    const pts = this.track.samples;
    const n = pts.length;
    if (!n) return ZERO;
    const proj = projectPoint(r.x, r.z, this.track);
    const look = this.track.closed ? (proj.seg + 12) % n : Math.min(n - 1, proj.seg + 12);
    const target = pts[look]!;
    let steerToward = this.steerToward(r, target.x, target.z, false);
    if (Math.abs(proj.side) > this.track.half * 0.62) {
      const back = proj.side > 0 ? 1 : -1;
      steerToward = {
        ...steerToward,
        steer: clamp(steerToward.steer * 0.35 + back * 0.85, -1, 1),
        throttle: 0.65,
      };
    }
    return steerToward;
  }

  private steerToward(r: Racer, x: number, z: number, drift: boolean): DriveInput {
    const desired = Math.atan2(-(x - r.x), -(z - r.z));
    const diff = wrap(desired - r.yaw);
    const steer = clamp(diff / 0.5, -1, 1);
    const throttle = Math.abs(diff) > 0.9 ? 0.45 : 1;
    return { throttle, steer, drift, reset: false };
  }

  private tryRescue(r: Racer, reset: boolean) {
    if (reset && !this.resetHeld) {
      this.resetHeld = true;
      if (this.track.kind === "sweep") {
        r.x = 0;
        r.z = 0;
        r.vx = 0;
        r.vz = 0;
        r.speed = 0;
        r.stun = 0;
        return;
      }
      const cps = this.track.checkpoints;
      const passed = r.next === 0 ? cps.length - 1 : r.next - 1;
      const anchor = r.laps === 0 && r.next === 0 ? this.track.spawn : cps[passed] ?? this.track.spawn;
      const n = this.track.samples.length;
      const idx = this.track.closed ? (anchor + 4) % n : Math.min(n - 1, anchor + 2);
      const frame = frameAt(this.track, idx);
      r.x = frame.x;
      r.z = frame.z;
      r.y = frame.y;
      r.yaw = frame.yaw;
      r.vx = frame.tx * 8;
      r.vz = frame.tz * 8;
      r.speed = 8;
      r.stun = 0;
      r.charge = 0;
      this.say("RESCUE");
    } else if (!reset) this.resetHeld = false;
  }

  private say(text: string) {
    this.message = text;
    this.messageT = text === "GATE" ? 0.45 : 1.15;
  }

  private rank() {
    if (this.track.kind !== "circuit") {
      this.player.place = 1;
      return;
    }
    const cps = this.track.checkpoints;
    for (const r of this.racers) {
      const gate = cps[Math.min(r.next, cps.length - 1)] ?? 0;
      const s = this.track.samples[gate];
      const d = s ? Math.hypot(r.x - s.x, r.z - s.z) : 0;
      r.progress = r.laps * 100 + r.next * 10 - Math.min(d, 80) / 80;
    }
    const order = [...this.racers].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });
    order.forEach((r, i) => {
      r.place = i + 1;
    });
  }

  private tickEnd() {
    const rules = this.pack.rules;
    if (this.track.kind === "circuit") {
      if (this.player.finished) {
        this.phase = "done";
        this.outcome = "finish";
      }
      return;
    }
    const remain = rules.seconds - this.time;
    if (this.track.kind === "sweep" && remain <= 0) {
      this.phase = "done";
      this.outcome = this.player.score >= rules.target ? "clear" : "short";
      return;
    }
    if (this.track.kind === "haul") {
      if (this.player.finished) {
        this.phase = "done";
        this.outcome = "delivered";
      } else if (this.cargo <= 0) {
        this.phase = "done";
        this.outcome = "lost";
      } else if (remain <= 0) {
        this.phase = "done";
        this.outcome = "late";
      }
    }
  }

  hud(): HudSnap {
    const p = this.player;
    const rules = this.pack.rules;
    const steps = this.track.checkpoints.length;
    return {
      phase: this.phase,
      outcome: this.outcome,
      kmh: Math.abs(p.speed) * 3.6,
      charge: p.charge,
      boost: p.boost > 0,
      lap: p.finished ? rules.laps : p.laps + 1,
      laps: rules.laps,
      place: p.place,
      field: this.racers.length,
      elapsed: p.finished ? p.finishTime : this.time,
      remain: Math.max(0, rules.seconds - this.time),
      score: p.score,
      target: rules.target,
      cargo: this.cargo,
      step: Math.min(p.next, steps),
      steps,
      wrong: p.wrong,
      message: this.message,
      kind: this.track.kind,
      title: this.pack.title,
      slug: this.pack.slug,
    };
  }
}

export function createSession(pack: GamePack) {
  return new Session(pack);
}
