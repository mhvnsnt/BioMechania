import { z } from "zod";

export const KINDS = ["circuit", "sweep", "haul"] as const;
export const VEHICLES = ["wedge", "buggy", "hauler"] as const;
export const LOOK_IDS = ["sodium", "salt", "ridge", "ember"] as const;

export type Kind = (typeof KINDS)[number];
export type VehicleId = (typeof VEHICLES)[number];
export type LookId = (typeof LOOK_IDS)[number];

export type Handling = {
  accel: number;
  brake: number;
  maxSpeed: number;
  reverse: number;
  turn: number;
  grip: number;
  driftGrip: number;
  drag: number;
  boost: number;
  offDrag: number;
};

export type Rules = {
  laps: number;
  seconds: number;
  bots: number;
  botPace: number;
  target: number;
};

export type GamePack = {
  format: "yard-pack";
  version: 1;
  slug: string;
  title: string;
  summary: string;
  kind: Kind;
  vehicle: VehicleId;
  look: LookId;
  handling: Handling;
  rules: Rules;
  forkedFrom?: string;
};

export type LookStyle = {
  sky: string;
  fog: string;
  ground: string;
  road: string;
  shoulder: string;
  accent: string;
  lamp: string;
  hill: string;
  near: number;
  far: number;
  exposure: number;
};

export const LOOKS: Record<LookId, LookStyle> = {
  sodium: {
    sky: "#14110c",
    fog: "#1b1712",
    ground: "#141a16",
    road: "#2c322e",
    shoulder: "#1a221e",
    accent: "#f0a202",
    lamp: "#ffb703",
    hill: "#1a1612",
    near: 16,
    far: 78,
    exposure: 1.2,
  },
  salt: {
    sky: "#d7ded8",
    fog: "#c9d1cb",
    ground: "#b7c0b4",
    road: "#8d968b",
    shoulder: "#a7b0a3",
    accent: "#f0a202",
    lamp: "#fff1cc",
    hill: "#9aa396",
    near: 28,
    far: 130,
    exposure: 0.92,
  },
  ridge: {
    sky: "#10151b",
    fog: "#182028",
    ground: "#12181c",
    road: "#2a343a",
    shoulder: "#1a2328",
    accent: "#d5e2ea",
    lamp: "#9ad0ff",
    hill: "#1a2228",
    near: 14,
    far: 70,
    exposure: 1.15,
  },
  ember: {
    sky: "#140c0a",
    fog: "#1c100e",
    ground: "#1a1210",
    road: "#342826",
    shoulder: "#241614",
    accent: "#e85d04",
    lamp: "#ff7a3c",
    hill: "#1c1210",
    near: 14,
    far: 72,
    exposure: 1.18,
  },
};

export const LOOK_LABEL: Record<LookId, string> = {
  sodium: "Sodium",
  salt: "Salt",
  ridge: "Ridge",
  ember: "Ember",
};

export const VEHICLE_LABEL: Record<VehicleId, string> = {
  wedge: "Wedge",
  buggy: "Buggy",
  hauler: "Hauler",
};

export const KIND_LABEL: Record<Kind, string> = {
  circuit: "Circuit",
  sweep: "Sweep",
  haul: "Haul",
};

const handlingSchema = z.object({
  accel: z.number().min(6).max(80),
  brake: z.number().min(8).max(90),
  maxSpeed: z.number().min(10).max(70),
  reverse: z.number().min(2).max(24),
  turn: z.number().min(0.4).max(5),
  grip: z.number().min(0.4).max(24),
  driftGrip: z.number().min(0.15).max(12),
  drag: z.number().min(0.05).max(3),
  boost: z.number().min(1).max(3.5),
  offDrag: z.number().min(0).max(8),
});

const rulesSchema = z.object({
  laps: z.number().int().min(1).max(9),
  seconds: z.number().min(20).max(240),
  bots: z.number().int().min(0).max(5),
  botPace: z.number().min(0.55).max(1.25),
  target: z.number().int().min(1).max(40),
});

export const packSchema = z.object({
  format: z.literal("yard-pack"),
  version: z.literal(1),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9]+\/[a-z0-9-]+$/),
  title: z.string().min(1).max(42),
  summary: z.string().min(1).max(180),
  kind: z.enum(KINDS),
  vehicle: z.enum(VEHICLES),
  look: z.enum(LOOK_IDS),
  handling: handlingSchema,
  rules: rulesSchema,
  forkedFrom: z.string().max(48).optional(),
});

export function clonePack(pack: GamePack): GamePack {
  return structuredClone(pack);
}

export function slugify(owner: string, title: string): string {
  const tail =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 28) || "fork";
  return `${owner}/${tail}`;
}

export function parsePack(raw: string): GamePack {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("That text isn't JSON.");
  }
  const parsed = packSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "pack";
    throw new Error(`${path}: ${issue?.message ?? "invalid pack"}`);
  }
  return parsed.data;
}

export async function pullPack(url: string): Promise<GamePack> {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("That isn't a link.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Pack links have to be https.");
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(parsed.toString(), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Couldn't pull that link (${res.status}).`);
    const text = await res.text();
    if (text.length > 80_000) throw new Error("That file is too big to be a pack.");
    return parsePack(text);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("The link timed out.");
    }
    if (err instanceof Error) throw err;
    throw new Error("Couldn't pull that link.");
  } finally {
    clearTimeout(timer);
  }
}

const CIRCUIT_HANDLING: Handling = {
  accel: 28,
  brake: 42,
  maxSpeed: 34,
  reverse: 8,
  turn: 2.25,
  grip: 8,
  driftGrip: 1.2,
  drag: 0.34,
  boost: 1.55,
  offDrag: 2.6,
};

const SWEEP_HANDLING: Handling = {
  accel: 32,
  brake: 36,
  maxSpeed: 30,
  reverse: 9,
  turn: 2.45,
  grip: 3.4,
  driftGrip: 1.05,
  drag: 0.42,
  boost: 1.4,
  offDrag: 0.4,
};

const HAUL_HANDLING: Handling = {
  accel: 16,
  brake: 28,
  maxSpeed: 22,
  reverse: 6,
  turn: 1.55,
  grip: 9.5,
  driftGrip: 2.4,
  drag: 0.4,
  boost: 1.25,
  offDrag: 3.2,
};

export const BASES: GamePack[] = [
  {
    format: "yard-pack",
    version: 1,
    slug: "yard/night-circuit",
    title: "Night Circuit",
    summary:
      "Full race. Three laps, three rivals, drift to bank a boost. Rescue if you nose into the wall.",
    kind: "circuit",
    vehicle: "wedge",
    look: "sodium",
    handling: CIRCUIT_HANDLING,
    rules: { laps: 3, seconds: 180, bots: 3, botPace: 0.8, target: 8 },
  },
  {
    format: "yard-pack",
    version: 1,
    slug: "yard/salt-sweep",
    title: "Salt Sweep",
    summary:
      "Open salt pan, loose tires. Grab beacons before the clock dies. Sweepers punish a greedy line.",
    kind: "sweep",
    vehicle: "buggy",
    look: "salt",
    handling: SWEEP_HANDLING,
    rules: { laps: 1, seconds: 75, bots: 0, botPace: 0.9, target: 12 },
  },
  {
    format: "yard-pack",
    version: 1,
    slug: "yard/ridge-haul",
    title: "Ridge Haul",
    summary:
      "Narrow ridge, heavy truck. Clear every gate with cargo left. Walls chip the load.",
    kind: "haul",
    vehicle: "hauler",
    look: "ridge",
    handling: HAUL_HANDLING,
    rules: { laps: 1, seconds: 58, bots: 0, botPace: 0.88, target: 6 },
  },
];

export function packJson(pack: GamePack): string {
  return JSON.stringify(pack, null, 2);
}
