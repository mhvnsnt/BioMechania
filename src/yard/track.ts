import type { Kind } from "./packs";

export type Sample = { x: number; y: number; z: number };

export type Track = {
  kind: Kind;
  samples: Sample[];
  closed: boolean;
  half: number;
  checkpoints: number[];
  arena: number;
  spawn: number;
};

export type Proj = {
  dist: number;
  side: number;
  seg: number;
  t: number;
  tx: number;
  tz: number;
  sx: number;
  sz: number;
  px: number;
  pz: number;
  y: number;
};

export type Frame = {
  x: number;
  y: number;
  z: number;
  tx: number;
  tz: number;
  sx: number;
  sz: number;
  yaw: number;
};

function loopControls(): Sample[] {
  const pts: Sample[] = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.16 * Math.sin(a * 2) + 0.06 * Math.sin(a * 3 + 0.4);
    const pinch = Math.exp(-((Math.atan2(Math.sin(a - 1.15), Math.cos(a - 1.15))) ** 2) / 0.05);
    const rad = (30 + 8 * Math.cos(a)) * wobble * (1 - pinch * 0.28);
    pts.push({
      x: Math.cos(a) * rad * 1.45,
      y: 0,
      z: Math.sin(a) * rad,
    });
  }
  return pts;
}

function haulControls(): Sample[] {
  const pts: Sample[] = [];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    pts.push({
      x: -78 + t * 156,
      y: 0,
      z: Math.sin(t * Math.PI * 2.15) * 24 + Math.sin(t * Math.PI) * 6,
    });
  }
  return pts;
}

function cr(p0: Sample, p1: Sample, p2: Sample, p3: Sample, t: number): Sample {
  const t2 = t * t;
  const t3 = t2 * t;
  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const z =
    0.5 *
    (2 * p1.z +
      (-p0.z + p2.z) * t +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);
  return { x, y: 0, z };
}

function catmull(controls: Sample[], perSeg: number, closed: boolean): Sample[] {
  const n = controls.length;
  const out: Sample[] = [];
  const segs = closed ? n : n - 1;
  const at = (i: number) => {
    if (closed) return controls[(i + n) % n]!;
    return controls[Math.max(0, Math.min(n - 1, i))]!;
  };
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    for (let s = 0; s < perSeg; s++) {
      out.push(cr(p0, p1, p2, p3, s / perSeg));
    }
  }
  if (!closed) {
    const last = controls[n - 1]!;
    out.push({ x: last.x, y: 0, z: last.z });
  }
  return out;
}

export function buildTrack(kind: Kind): Track {
  if (kind === "sweep") {
    return {
      kind,
      samples: [],
      closed: false,
      half: 34,
      checkpoints: [],
      arena: 34,
      spawn: 0,
    };
  }
  const closed = kind === "circuit";
  const samples = catmull(closed ? loopControls() : haulControls(), 8, closed);
  const amp = closed ? 1.7 : 3.1;
  samples.forEach((s, i) => {
    s.y = Math.sin(i * 0.085) * amp + Math.sin(i * 0.21 + 0.7) * amp * 0.28;
  });
  const n = samples.length;
  const cpCount = closed ? 4 : 6;
  const checkpoints: number[] = [];
  for (let i = 1; i <= cpCount; i++) {
    checkpoints.push(Math.min(n - 1, Math.round((i * n) / (cpCount + 1))));
  }
  const spawn = closed ? (checkpoints[checkpoints.length - 1]! + 10) % n : 2;
  return {
    kind,
    samples,
    closed,
    half: closed ? 7 : 4.5,
    checkpoints,
    arena: 0,
    spawn,
  };
}

export function frameAt(track: Track, index: number): Frame {
  const n = track.samples.length;
  const i = ((index % n) + n) % n;
  const a = track.samples[i]!;
  let j = track.closed ? (i + 1) % n : Math.min(n - 1, i + 1);
  if (j === i) j = Math.max(0, i - 1);
  const b = track.samples[j]!;
  let dx = b.x - a.x;
  let dz = b.z - a.z;
  if (j < i && !track.closed) {
    dx = -dx;
    dz = -dz;
  }
  const len = Math.hypot(dx, dz) || 1;
  const tx = dx / len;
  const tz = dz / len;
  const sx = -tz;
  const sz = tx;
  return {
    x: a.x,
    y: a.y,
    z: a.z,
    tx,
    tz,
    sx,
    sz,
    yaw: Math.atan2(-tx, -tz),
  };
}

export function projectPoint(x: number, z: number, track: Track): Proj {
  const pts = track.samples;
  const n = pts.length;
  const segs = track.closed ? n : n - 1;
  let best = Infinity;
  let found: Proj | null = null;
  for (let i = 0; i < segs; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % n]!;
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const len2 = abx * abx + abz * abz;
    if (len2 < 1e-6) continue;
    let t = ((x - a.x) * abx + (z - a.z) * abz) / len2;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const px = a.x + abx * t;
    const pz = a.z + abz * t;
    const dx = x - px;
    const dz = z - pz;
    const d2 = dx * dx + dz * dz;
    if (d2 < best) {
      best = d2;
      const len = Math.sqrt(len2);
      const tx = abx / len;
      const tz = abz / len;
      const sx = -tz;
      const sz = tx;
      found = {
        dist: Math.sqrt(d2),
        side: dx * sx + dz * sz,
        seg: i,
        t,
        tx,
        tz,
        sx,
        sz,
        px,
        pz,
        y: a.y + (b.y - a.y) * t,
      };
    }
  }
  if (!found) {
    return {
      dist: 0,
      side: 0,
      seg: 0,
      t: 0,
      tx: 0,
      tz: -1,
      sx: 1,
      sz: 0,
      px: x,
      pz: z,
      y: 0,
    };
  }
  return found;
}

export function crossedGate(
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  gate: Sample,
  tx: number,
  tz: number,
  sx: number,
  sz: number,
  half: number,
): boolean {
  const d0 = (x0 - gate.x) * tx + (z0 - gate.z) * tz;
  const d1 = (x1 - gate.x) * tx + (z1 - gate.z) * tz;
  if (!(d0 < 0.15 && d1 >= -0.05) || d1 < d0) return false;
  const denom = d0 - d1;
  const t = Math.abs(denom) < 1e-6 ? 0 : d0 / denom;
  const ix = x0 + (x1 - x0) * t;
  const iz = z0 + (z1 - z0) * t;
  const lat = Math.abs((ix - gate.x) * sx + (iz - gate.z) * sz);
  return lat < half + 1.8;
}
