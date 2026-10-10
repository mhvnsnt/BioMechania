import { z } from "zod";

/**
 * Mecha part-system contract v2.
 *
 * A mech is MULTI-MODE: it carries one full 7-slot part set per mode and
 * transforms between them mid-competition (racer ↔ combat, more later).
 * MODES is the canonical list — N modes, not 2. Builds, validation, stats,
 * and coverage all iterate MODES; adding a form = appending one string and
 * filling its part set (part manifests may need the new mode in their
 * `modes` arrays — see partSchema).
 *
 * Seven slots per mode. arms / legs / shoulders are pairs — one part id
 * per slot covers both sides (the GLB carries both halves; the viewer
 * mounts the pair GLB once at the socket-pair midpoint).
 */

/**
 * Combat forms a mech can take. Append new forms here to extend N modes.
 *
 * racer:  vehicle/racer form — speed, drift, repositioning.
 * combat: derby/fighting form — armor, power, crowd control.
 * breach: RAGE-GATED burst form (Grimlock-style earned transformation).
 *   You don't equip your way into breach — you earn it: deal damage to
 *   fill the breach charge, then transform. The charge drains while
 *   breach is active, so it's a window, not a second permanent form
 *   (the Armored Core VI Core Expansion parallel — see
 *   TRANSFORMATION_MECHANICS.md §13g).
 */
export const MODES = ["racer", "combat", "breach"] as const;
export type MechMode = (typeof MODES)[number];

export const SLOTS = [
  "head",
  "torso",
  "arms",
  "legs",
  "shoulders",
  "backpack",
  "weapon",
] as const;
export type Slot = (typeof SLOTS)[number];

/**
 * Socket nodes every torso GLB must carry (named empty nodes).
 * A part's socket is where a child part's origin attaches.
 *
 * The weapon slot is a documented extension (see CONTRACT.md): the
 * socket list has no weapon mount, so arm parts carry
 * `socket_weapon_r` and the viewer mounts the weapon there, falling
 * back to the torso's `socket_arm_r`.
 */
export const SOCKET_FOR_SLOT: Record<Slot, string[]> = {
  head: ["socket_head"],
  torso: [], // torso is the root of the hierarchy
  arms: ["socket_arm_l", "socket_arm_r"],
  legs: ["socket_leg_l", "socket_leg_r"],
  shoulders: ["socket_shoulder_l", "socket_shoulder_r"],
  backpack: ["socket_back"],
  weapon: ["socket_weapon_r"],
};

/** Every socket name a torso GLB must define (contract v1). */
export const REQUIRED_TORSO_SOCKETS = [
  "socket_head",
  "socket_arm_l",
  "socket_arm_r",
  "socket_leg_l",
  "socket_leg_r",
  "socket_shoulder_l",
  "socket_shoulder_r",
  "socket_back",
] as const;

const partIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, "part id must be lowercase letters, digits and dashes");

export const partStatsSchema = z.object({
  armor: z.number().min(0).max(999),
  speed: z.number().min(0).max(999),
  power: z.number().min(0).max(999),
  weight: z.number().min(0).max(999),
});
export type PartStats = z.infer<typeof partStatsSchema>;

/**
 * One part manifest: public/mecha/parts/<part-id>/part.json
 * plus public/mecha/parts/<part-id>/<part-id>.glb
 *
 * `modes` lists the forms this part can be equipped in (default: all
 * MODES). A mode-exclusive part (e.g. aero cowl = racer-only, ram plow =
 * combat-only, rage plating = breach-only) is rejected by build validation
 * when placed in a mode it doesn't support.
 *
 * Every part GLB's origin IS its attach point for SINGLE parts (e.g. a
 * head's origin sits at the neck joint where it meets socket_head).
 * PAIR parts (arms / legs / shoulders) are the exception: they carry both
 * halves in one GLB, so their origin sits at the PAIR MIDPOINT — the
 * socket-pair midpoint on the torso (between socket_arm_l/_r etc.) —
 * and the viewer mounts them once, not per side.
 */
export const partSchema = z.object({
  id: partIdSchema,
  slot: z.enum(SLOTS),
  name: z.string().min(1).max(60),
  description: z.string().max(280),
  stats: partStatsSchema,
  modes: z.array(z.enum(MODES)).min(1).max(MODES.length).default([...MODES]),
  model: z
    .string()
    .min(1)
    .max(128)
    .regex(
      /^[a-z0-9-]+\.glb$/,
      "model must be the part's own glb file name, e.g. head-scout.glb",
    ),
});
export type PartManifest = z.infer<typeof partSchema>;

/** One mode's full part set: one part id per slot, every slot required. */
export const mechModeBuildSchema = z.object({
  head: partIdSchema,
  torso: partIdSchema,
  arms: partIdSchema,
  legs: partIdSchema,
  shoulders: partIdSchema,
  backpack: partIdSchema,
  weapon: partIdSchema,
});
export type MechModeBuild = z.infer<typeof mechModeBuildSchema>;

/** When a mech is allowed to transform. The race/battle sim consumes this. */
export const TRANSFORM_TRIGGERS = [
  "manual",
  "meter_full",
  "damage_threshold",
  "breach_rage",
] as const;
export type TransformTrigger = (typeof TRANSFORM_TRIGGERS)[number];

/** Triggers that fire on their own — the driver doesn't pick the moment. */
export const AUTO_TRIGGERS = ["meter_full", "damage_threshold", "breach_rage"] as const;
export type AutoTrigger = (typeof AUTO_TRIGGERS)[number];

export const transformSchema = z.object({
  /**
   * manual: driver transforms on command (and picks the mode).
   * meter_full: auto-transforms when the boost/drift meter fills (meter is consumed).
   * damage_threshold: auto-transforms when hull drops to damageThresholdPct.
   * breach_rage: auto-transforms when the breach charge hits
   *   breachRage.entryThreshold (charge is earned by DEALING damage).
   */
  trigger: z.enum(TRANSFORM_TRIGGERS).default("manual"),
  /** Meter (0-100, shared with boost) spent to transform. */
  cost: z
    .object({ meter: z.number().min(0).max(100).default(25) })
    .default({ meter: 25 }),
  /** Minimum seconds between transforms — stops mode-flicker exploits. */
  cooldownSec: z.number().min(0).max(120).default(8),
  /** Hull % at/below which the damage_threshold trigger fires. */
  damageThresholdPct: z.number().min(1).max(99).default(35),
  /**
   * Where each AUTO trigger sends the mech. "manual" has no entry — the
   * driver picks the mode. breach_rage / damage_threshold default to
   * breach: the last-stand comeback window and the earned rage form.
   */
  autoTargets: z
    .record(z.enum(AUTO_TRIGGERS), z.enum(MODES))
    .default({ meter_full: "combat", damage_threshold: "breach", breach_rage: "breach" }),
  /**
   * Rage-charge config for the breach form (Grimlock-style: earned, not bought).
   * Charge (0-100) builds when you DEAL damage, gates breach entry, and
   * drains while breach is active — the form is a timed window, not a
   * permanent third loadout (the AC VI Core Expansion parallel — see
   * TRANSFORMATION_MECHANICS.md).
   */
  breachRage: z
    .object({
      /** Charge gained per point of damage dealt. */
      chargePerDamage: z.number().min(0).max(10).default(0.5),
      /** Charge level that unlocks/triggers breach entry. */
      entryThreshold: z.number().min(1).max(100).default(75),
      /** Charge drained per second while breach is active. */
      drainPerSec: z.number().min(0).max(100).default(12),
      /** breach entry requires charge >= entryThreshold (no free rage). */
      entryGated: z.boolean().default(true),
    })
    .default({
      chargePerDamage: 0.5,
      entryThreshold: 75,
      drainPerSec: 12,
      entryGated: true,
    }),
});
export type TransformRules = z.infer<typeof transformSchema>;

/** Sensible defaults, balancing rationale in MECHA_CONTRACT.md. */
export const DEFAULT_TRANSFORM: TransformRules = {
  trigger: "manual",
  cost: { meter: 25 },
  cooldownSec: 8,
  damageThresholdPct: 35,
  autoTargets: { meter_full: "combat", damage_threshold: "breach", breach_rage: "breach" },
  breachRage: { chargePerDamage: 0.5, entryThreshold: 75, drainPerSec: 12, entryGated: true },
};

/**
 * One part set per mode, keyed by the MODES tuple — N modes, not 2.
 * The refine keeps every mode REQUIRED (a build missing a mode is a
 * build bug, not a partial build), so extending MODES to a 4th form
 * automatically requires its part set everywhere.
 */
export const mechModesSchema = z
  .record(z.enum(MODES), mechModeBuildSchema)
  .refine((modes) => MODES.every((m) => m in modes), {
    message: `a build must carry a part set for every mode: ${MODES.join(", ")}`,
  });

/**
 * A full mech build: one part set per mode + the transformation rules.
 */
export const mechBuildSchema = z.object({
  modes: mechModesSchema,
  transform: transformSchema.default(DEFAULT_TRANSFORM),
});
export type MechBuild = z.infer<typeof mechBuildSchema>;

/** Parse helper in the repo's packs.ts style: throws a readable error. */
export function parsePartManifest(raw: string): PartManifest {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("That text isn't JSON.");
  }
  const parsed = partSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "part";
    throw new Error(`${path}: ${issue?.message ?? "invalid part manifest"}`);
  }
  return parsed.data;
}

/** Parse helper for a build object: throws a readable error. */
export function parseMechBuild(data: unknown): MechBuild {
  const parsed = mechBuildSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.join(".") || "build";
    throw new Error(`${path}: ${issue?.message ?? "invalid mech build"}`);
  }
  return parsed.data;
}
