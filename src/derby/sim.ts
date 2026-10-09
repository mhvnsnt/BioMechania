export const VEHICLE = 0;
export const HYBRID = 1;
export const MECH = 2;

export type ClassId = "muscle" | "bike" | "heavy" | "loader";

export type DriveInput = {
  throttle: number;
  steer: number;
  strafe: number;
  aim: number;
  drift: boolean;
  fire: boolean;
  grapple: boolean;
  stance: number;
};

type ClassDef = {
  name: string;
  speed: number;
  accel: number;
  turn: number;
  armor: number;
  mass: number;
  grip: number;
  drift: number;
  grapple: boolean;
  jets: boolean;
  smash: boolean;
  pivot: boolean;
  gun: number;
  gunCd: number;
  shot: number;
  color: number;
};

export const CLASSES: Record<ClassId, ClassDef> = {
  muscle: {
    name: "Muscle",
    speed: 34,
    accel: 42,
    turn: 2.35,
    armor: 120,
    mass: 1.35,
    grip: 6.5,
    drift: 1.15,
    grapple: true,
    jets: false,
    smash: false,
    pivot: false,
    gun: 9,
    gunCd: 0.16,
    shot: 46,
    color: 0xe08a2c,
  },
  bike: {
    name: "Superbike",
    speed: 46,
    accel: 54,
    turn: 3.15,
    armor: 72,
    mass: 0.55,
    grip: 4.2,
    drift: 1.4,
    grapple: false,
    jets: true,
    smash: false,
    pivot: false,
    gun: 16,
    gunCd: 0.42,
    shot: 72,
    color: 0x3ec7ff,
  },
  heavy: {
    name: "Heavy Rig",
    speed: 22,
    accel: 16,
    turn: 1.15,
    armor: 200,
    mass: 2.7,
    grip: 9,
    drift: 2.4,
    grapple: true,
    jets: false,
    smash: true,
    pivot: false,
    gun: 18,
    gunCd: 0.38,
    shot: 32,
    color: 0xd24b4b,
  },
  loader: {
    name: "Loader",
    speed: 18,
    accel: 18,
    turn: 2.05,
    armor: 168,
    mass: 2.2,
    grip: 10,
    drift: 3.2,
    grapple: true,
    jets: false,
    smash: true,
    pivot: true,
    gun: 8,
    gunCd: 0.2,
    shot: 38,
    color: 0xe2c14a,
  },
};

export type Shot = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  dmg: number;
  owner: number;
  color: number;
  splash: boolean;
  alive: boolean;
};

export type Block = {
  x: number;
  z: number;
  hx: number;
  hz: number;
  barrier: boolean;
  dead: boolean;
};

const ARENA = 46;

export class Rig {
  id: number;
  classId: ClassId;
  cls: ClassDef;
  isBot: boolean;
  x: number;
  y = 0;
  z: number;
  yaw: number;
  turretYaw: number;
  vx = 0;
  vz = 0;
  vy = 0;
  stance = VEHICLE;
  hull: number;
  hullMax: number;
  lives: number;
  alive = true;
  invuln = 0;
  stanceLock = 0;
  fireCd = 0;
  meleeCd = 0;
  grabCd = 0;
  ramUntil = new Map<number, number>();
  radius: number;

  constructor(id: number, classId: ClassId, bot: boolean, x: number, z: number, yaw: number) {
    this.id = id;
    this.classId = classId;
    this.cls = CLASSES[classId];
    this.isBot = bot;
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.turretYaw = yaw;
    this.hullMax = this.cls.armor;
    this.hull = this.hullMax;
    this.lives = bot ? 2 : 3;
    this.radius = classId === "bike" ? 0.9 : classId === "heavy" ? 1.8 : 1.35;
  }

  get speed() {
    return Math.hypot(this.vx, this.vz);
  }

  forward() {
    return { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) };
  }

  right() {
    return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
  }

  stanceName() {
    return this.stance === VEHICLE ? "VEHICLE" : this.stance === HYBRID ? "HYBRID" : "MECH";
  }

  setStance(next: number) {
    if (!this.alive || next === this.stance || this.stanceLock > 0) return;
    if (next < VEHICLE || next > MECH) return;
    this.stance = next;
    this.stanceLock = 0.4;
    const mul = next === HYBRID ? 0.5 : next === MECH ? 0.3 : 1;
    this.vx *= mul;
    this.vz *= mul;
    if (next !== HYBRID) this.turretYaw = this.yaw;
  }
}

export class Match {
  rigs: Rig[] = [];
  shots: Shot[] = [];
  blocks: Block[] = [];
  time = 0;
  ended: "" | "win" | "lose" = "";
  nextId = 1;

  constructor(playerClass: ClassId) {
    this.rigs.push(new Rig(this.nextId++, playerClass, false, 0, 30, 0));
    const seats: Array<[ClassId, number, number, number]> = [
      ["bike", -24, -18, 0.4],
      ["heavy", 22, -20, -0.6],
      ["loader", -8, -28, 0.2],
    ];
    for (const [id, x, z, yaw] of seats) {
      if (id === playerClass) continue;
      this.rigs.push(new Rig(this.nextId++, id, true, x, z, yaw));
    }
    if (this.rigs.length < 4) {
      const extra: ClassId = playerClass === "muscle" ? "bike" : "muscle";
      this.rigs.push(new Rig(this.nextId++, extra, true, 18, 10, 2.2));
    }
    this.blocks.push(
      { x: 0, z: -ARENA, hx: ARENA, hz: 2, barrier: false, dead: false },
      { x: 0, z: ARENA, hx: ARENA, hz: 2, barrier: false, dead: false },
      { x: -ARENA, z: 0, hx: 2, hz: ARENA, barrier: false, dead: false },
      { x: ARENA, z: 0, hx: 2, hz: ARENA, barrier: false, dead: false },
    );
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
      this.blocks.push({
        x: Math.sin(a) * 28,
        z: Math.cos(a) * 28,
        hx: 2.4,
        hz: 0.7,
        barrier: true,
        dead: false,
      });
    }
  }

  get player() {
    return this.rigs[0]!;
  }

  step(dt: number, input: DriveInput) {
    if (this.ended) return;
    this.time += dt;
    const player = this.player;
    if (player.alive) this.drive(player, input, dt);
    for (const rig of this.rigs) {
      if (!rig.isBot || !rig.alive) continue;
      this.drive(rig, this.think(rig, player), dt);
    }
    this.shotsStep(dt);
    this.hazards(dt);
    this.separate();
    if (!player.alive) this.ended = "lose";
    else if (this.rigs.every((r) => r.isBot === false || !r.alive)) this.ended = "win";
  }

  drive(rig: Rig, inp: DriveInput, dt: number) {
    rig.stanceLock = Math.max(0, rig.stanceLock - dt);
    rig.fireCd = Math.max(0, rig.fireCd - dt);
    rig.meleeCd = Math.max(0, rig.meleeCd - dt);
    rig.grabCd = Math.max(0, rig.grabCd - dt);
    rig.invuln = Math.max(0, rig.invuln - dt);
    if (inp.stance !== rig.stance) rig.setStance(inp.stance);
    const fwd = rig.forward();
    const rt = rig.right();
    const accel = rig.cls.accel;
    const turn = rig.cls.turn * (rig.cls.pivot ? 1.35 : 1);
    let maxSpeed = rig.cls.speed;
    if (rig.stance === HYBRID) {
      maxSpeed *= 0.5;
      rig.vx += fwd.x * inp.throttle * accel * dt;
      rig.vz += fwd.z * inp.throttle * accel * dt;
      rig.vx += -rt.x * inp.strafe * accel * 0.9 * dt;
      rig.vz += -rt.z * inp.strafe * accel * 0.9 * dt;
      rig.yaw += inp.strafe * turn * 0.45 * dt;
      this.bleed(rig, fwd, 1.5, dt);
      rig.turretYaw = wrap(rig.turretYaw + inp.aim * 2.4 * dt);
    } else if (rig.stance === MECH) {
      maxSpeed *= 0.3;
      rig.yaw += inp.steer * turn * 1.35 * dt;
      rig.turretYaw = rig.yaw;
      const wishX = fwd.x * inp.throttle * maxSpeed;
      const wishZ = fwd.z * inp.throttle * maxSpeed;
      const k = 1 - Math.exp(-7 * dt);
      rig.vx += (wishX - rig.vx) * k;
      rig.vz += (wishZ - rig.vz) * k;
    } else {
      rig.vx += fwd.x * inp.throttle * accel * dt;
      rig.vz += fwd.z * inp.throttle * accel * dt;
      const grip = inp.drift ? rig.cls.drift : rig.cls.grip;
      this.bleed(rig, fwd, grip, dt);
      const lon = rig.vx * fwd.x + rig.vz * fwd.z;
      const factor = clamp(rig.speed / 7, 0.2, 1);
      const reverse = lon < -0.8 ? -1 : 1;
      rig.yaw += inp.steer * turn * factor * reverse * dt;
      rig.turretYaw = rig.yaw;
      if (rig.cls.jets && inp.drift) rig.vy = 7.5;
    }
    if (rig.stance === HYBRID && rig.cls.jets && inp.drift) rig.vy = 8;
    const sp = rig.speed;
    if (sp > maxSpeed) {
      rig.vx = (rig.vx / sp) * maxSpeed;
      rig.vz = (rig.vz / sp) * maxSpeed;
    }
    rig.vy = rig.y > 0.05 || rig.vy > 0 ? rig.vy - 30 * dt : 0;
    rig.x += rig.vx * dt;
    rig.z += rig.vz * dt;
    rig.y = Math.max(0, rig.y + rig.vy * dt);
    if (rig.y <= 0) rig.vy = 0;
    this.collideWorld(rig);
    if (inp.fire) this.attack(rig);
    if (inp.grapple) this.grapple(rig);
  }

  think(rig: Rig, target: Rig): DriveInput {
    const inp: DriveInput = {
      throttle: 0.35,
      steer: 0.4,
      strafe: 0,
      aim: 0,
      drift: false,
      fire: false,
      grapple: false,
      stance: rig.stance,
    };
    if (!target.alive) return inp;
    const dx = target.x - rig.x;
    const dz = target.z - rig.z;
    const dist = Math.hypot(dx, dz) || 0.001;
    const desired = Math.atan2(-dx, -dz);
    const diff = wrap(desired - rig.yaw);
    let want = VEHICLE;
    if (dist < 8 && rig.cls.grapple) want = MECH;
    else if (dist < 26) want = HYBRID;
    inp.stance = want;
    inp.throttle = dist > 9 ? 1 : 0.35;
    if (dist < 6 && rig.stance === MECH) inp.throttle = 0.2;
    if (rig.stance === HYBRID) {
      inp.strafe = clamp(diff * 1.4, -1, 1);
      const adiff = wrap(desired - rig.turretYaw);
      inp.aim = clamp(adiff * 3, -1, 1);
      inp.fire = dist < 30 && Math.abs(adiff) < 0.45;
    } else if (rig.stance === MECH) {
      inp.steer = clamp(diff * 2.2, -1, 1);
      inp.fire = dist < 5.2;
      inp.grapple = dist < 7.5 && rig.cls.grapple && rig.grabCd <= 0;
    } else {
      inp.steer = clamp(diff * 2, -1, 1);
      inp.drift = Math.abs(diff) > 0.7 && rig.speed > 10;
      inp.fire = dist < 22 && Math.abs(diff) < 0.35;
    }
    return inp;
  }

  hurt(rig: Rig, amount: number) {
    if (!rig.alive || rig.invuln > 0 || amount <= 0) return;
    const soak = rig.stance === HYBRID ? 1 / 1.2 : rig.stance === MECH ? 1 / 1.5 : 1;
    rig.hull -= amount * soak;
    if (rig.hull > 0) return;
    rig.lives -= 1;
    if (rig.lives <= 0) {
      rig.alive = false;
      rig.hull = 0;
      rig.vx = 0;
      rig.vz = 0;
      return;
    }
    rig.hull = rig.hullMax;
    rig.invuln = 1.6;
    rig.vx = 0;
    rig.vz = 0;
    rig.stance = VEHICLE;
  }

  private bleed(rig: Rig, fwd: { x: number; z: number }, grip: number, dt: number) {
    const rx = fwd.z;
    const rz = -fwd.x;
    const lon = rig.vx * fwd.x + rig.vz * fwd.z;
    let lat = rig.vx * rx + rig.vz * rz;
    lat *= Math.exp(-grip * dt);
    rig.vx = fwd.x * lon + rx * lat;
    rig.vz = fwd.z * lon + rz * lat;
  }

  private attack(rig: Rig) {
    if (rig.stance === MECH) {
      if (rig.meleeCd > 0) return;
      rig.meleeCd = 0.48;
      const reach = rig.cls.smash ? 6.2 : 4.4;
      const dmg = (rig.cls.smash ? 28 : 16) * rig.cls.mass;
      const fwd = rig.forward();
      for (const other of this.rigs) {
        if (other === rig || !other.alive) continue;
        const dx = other.x - rig.x;
        const dz = other.z - rig.z;
        const dist = Math.hypot(dx, dz);
        if (dist > reach) continue;
        if (!rig.cls.smash && (dx * fwd.x + dz * fwd.z) / (dist || 1) < 0.25) continue;
        this.hurt(other, dmg);
        other.vx += fwd.x * (rig.cls.smash ? 10 : 6);
        other.vz += fwd.z * (rig.cls.smash ? 10 : 6);
      }
      return;
    }
    if (rig.fireCd > 0) return;
    rig.fireCd = rig.cls.gunCd * (rig.stance === HYBRID ? 0.7 : 1);
    const dir = rig.stance === VEHICLE ? rig.forward() : { x: -Math.sin(rig.turretYaw), z: -Math.cos(rig.turretYaw) };
    const y = rig.stance === VEHICLE ? 0.7 : 1.7;
    this.shots.push({
      x: rig.x + dir.x * 2.2,
      y,
      z: rig.z + dir.z * 2.2,
      vx: dir.x * rig.cls.shot,
      vz: dir.z * rig.cls.shot,
      life: 1.35,
      dmg: rig.cls.gun * (rig.stance === HYBRID ? 1.15 : 1),
      owner: rig.id,
      color: rig.cls.color,
      splash: rig.stance === HYBRID && rig.cls.smash,
      alive: true,
    });
  }

  private grapple(rig: Rig) {
    if (rig.stance !== MECH || !rig.cls.grapple || rig.grabCd > 0 || rig.classId === "bike") return;
    rig.grabCd = 0.9;
    let best: Rig | null = null;
    let bestD = rig.cls.pivot ? 9.5 : 8;
    for (const other of this.rigs) {
      if (other === rig || !other.alive) continue;
      const d = Math.hypot(other.x - rig.x, other.z - rig.z);
      if (d < bestD) {
        bestD = d;
        best = other;
      }
    }
    if (!best) return;
    const fwd = rig.forward();
    best.x = rig.x + fwd.x * 2.4;
    best.z = rig.z + fwd.z * 2.4;
    const kick = rig.cls.smash ? 16 : 11;
    best.vx = fwd.x * kick;
    best.vz = fwd.z * kick;
    this.hurt(best, 22 * rig.cls.mass);
  }

  private collideWorld(rig: Rig) {
    for (const block of this.blocks) {
      if (block.dead) continue;
      const dx = rig.x - block.x;
      const dz = rig.z - block.z;
      const hx = block.hx + rig.radius;
      const hz = block.hz + rig.radius;
      if (Math.abs(dx) > hx || Math.abs(dz) > hz) continue;
      if (block.barrier && rig.cls.smash && rig.stance === VEHICLE && rig.speed > 13) {
        block.dead = true;
        continue;
      }
      const px = hx - Math.abs(dx);
      const pz = hz - Math.abs(dz);
      if (px < pz) {
        rig.x += Math.sign(dx || 1) * px;
        rig.vx *= -0.15;
      } else {
        rig.z += Math.sign(dz || 1) * pz;
        rig.vz *= -0.15;
      }
      if (rig.stance === VEHICLE && rig.speed > 8) {
        for (const other of this.rigs) {
          if (other === rig || !other.alive) continue;
          if (Math.hypot(other.x - rig.x, other.z - rig.z) > rig.radius + other.radius + 0.4) continue;
          const until = rig.ramUntil.get(other.id) ?? 0;
          if (this.time < until) continue;
          rig.ramUntil.set(other.id, this.time + 0.45);
          const fwd = rig.forward();
          this.hurt(other, rig.speed * rig.cls.mass * 0.85);
          other.vx += fwd.x * Math.min(rig.speed, 18) * 0.35;
          other.vz += fwd.z * Math.min(rig.speed, 18) * 0.35;
        }
      }
    }
  }

  private separate() {
    for (let i = 0; i < this.rigs.length; i++) {
      const a = this.rigs[i]!;
      if (!a.alive) continue;
      for (let j = i + 1; j < this.rigs.length; j++) {
        const b = this.rigs[j]!;
        if (!b.alive) continue;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const dist = Math.hypot(dx, dz) || 0.001;
        const need = a.radius + b.radius;
        if (dist >= need) continue;
        const push = (need - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;
        a.x -= nx * push;
        a.z -= nz * push;
        b.x += nx * push;
        b.z += nz * push;
        if (a.stance === VEHICLE && a.speed > 8) {
          const until = a.ramUntil.get(b.id) ?? 0;
          if (this.time >= until) {
            a.ramUntil.set(b.id, this.time + 0.45);
            this.hurt(b, a.speed * a.cls.mass * 0.85);
          }
        }
        if (b.stance === VEHICLE && b.speed > 8) {
          const until = b.ramUntil.get(a.id) ?? 0;
          if (this.time >= until) {
            b.ramUntil.set(a.id, this.time + 0.45);
            this.hurt(a, b.speed * b.cls.mass * 0.85);
          }
        }
      }
    }
  }

  private shotsStep(dt: number) {
    for (const shot of this.shots) {
      if (!shot.alive) continue;
      shot.life -= dt;
      shot.x += shot.vx * dt;
      shot.z += shot.vz * dt;
      if (shot.life <= 0 || Math.abs(shot.x) > 70 || Math.abs(shot.z) > 70) {
        shot.alive = false;
        continue;
      }
      for (const rig of this.rigs) {
        if (!rig.alive || rig.id === shot.owner) continue;
        if (Math.hypot(rig.x - shot.x, rig.z - shot.z) > 1.8) continue;
        this.hurt(rig, shot.dmg);
        if (shot.splash) {
          for (const other of this.rigs) {
            if (!other.alive) continue;
            if (Math.hypot(other.x - shot.x, other.z - shot.z) < 4.5) this.hurt(other, shot.dmg * 0.45);
          }
        }
        shot.alive = false;
        break;
      }
    }
    if (this.shots.length > 48) this.shots = this.shots.filter((s) => s.alive);
  }

  private hazards(dt: number) {
    for (const rig of this.rigs) {
      if (!rig.alive) continue;
      if (Math.abs(rig.x - 30) < 7 && Math.abs(rig.z + 16) < 8) this.hurt(rig, 16 * dt);
    }
  }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function wrap(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
