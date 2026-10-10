# Mecha Part System — Contract v2

> **Provenance:** migrated 2026-10-09 from theyard `feature/mecha-os-pulls`
> (`src/yard/mecha/CONTRACT.md`). BioMechania is the canonical mecha-game
> repo. Code moved `src/yard/mecha/` → `src/mecha/`; the localStorage key
> was renamed `yard.mechs.v1` → `biomechania.mechs.v1`. Contract semantics
> unchanged.

Owner: **part-system lane**. Other lanes (viewer, customizer UI, sim) build
against this contract. Changes land here first, with the change documented
below. Code: `src/mecha/` (`schemas.ts`, `parts.ts`, `stats.ts`,
`storage.ts`, `viewer.ts`).

## Modes (transform extension, owner 2026-10-09; v2 N-mode 2026-10-09)

Mechs **transform mid-competition**: vehicle/racer mode ↔ combat/derby mode
↔ **breach** (rage-gated burst form — see below). The `MODES` tuple in
`schemas.ts` is the canonical mode list: **N modes, not 2**. Builds carry
one full 7-slot part set per mode (`mechModesSchema` = a record over
`MODES`, with every mode required); validation, stat aggregation, and slot
coverage all iterate `MODES`. Adding a 4th form = one string in the tuple
plus its part set — nothing else is hardcoded to a mode count.
Inspirations: Evangelion, Gundam, Transformers, Bionicle, Gunpla,
Kamen Rider form changes, Power Rangers Zords. All designs original.

A build carries **one full 7-slot part set per mode**:

```ts
{
  modes: {
    racer:  { head, torso, arms, legs, shoulders, backpack, weapon },
    combat: { head, torso, arms, legs, shoulders, backpack, weapon },
    breach: { head, torso, arms, legs, shoulders, backpack, weapon },
  },
  transform: {
    trigger, cost: { meter }, cooldownSec, damageThresholdPct,
    autoTargets: { meter_full, damage_threshold, breach_rage },
    breachRage: { chargePerDamage, entryThreshold, drainPerSec, entryGated },
  },
}
```

Validation runs **per mode independently**: every slot filled, every id in
the registry, part slot matches build slot, part supports the mode.

### The breach form (rage-gated — Grimlock-style earned transformation)

`breach` is not a third permanent loadout — it's a **timed rage window**.
You don't equip your way into it; you **earn** it by dealing damage:

- **Charge builds when you deal damage** (`breachRage.chargePerDamage`,
  default 0.5 charge per damage point, 0–100 scale).
- **Entry is gated** (`entryGated`, default true): no transform into
  breach until charge ≥ `entryThreshold` (default 75). No free rage.
- **The form drains itself** (`drainPerSec`, default 12): at full
  threshold entry you get roughly a 6-second window before the charge
  empties and you're kicked back out.
- **Auto-triggers point at breach**: `autoTargets` sends
  `damage_threshold` (the 35%-hull last stand) and `breach_rage`
  (charge hits threshold) to breach; `meter_full` goes to combat.
  `manual` has no auto-target — the driver picks the mode.

Design parallel: Armored Core VI Core Expansions (10s timed burst
forms, limited use, chosen per build — see TRANSFORMATION_MECHANICS.md
§13g). Breach is our Core Expansion: a build-carried, earned, timed
power form, not a third grind.

## Slots

`head` `torso` `arms` `legs` `shoulders` `backpack` `weapon`.
`arms` / `legs` / `shoulders` are pairs — one part id per slot covers both
sides (the GLB carries both halves; the viewer mounts the pair GLB once
at the socket-pair midpoint).

### Why 7 slots, not 11 (Gundam Breaker 4 evaluation, v2 decision)

Gundam Breaker 4 ships 11 part slots; we evaluated matching it and
**stayed at 7**. Three reasons: (1) every slot maps 1:1 to a socket on
the torso rig, and each extra slot multiplies GLB build + QC cost per
part across all three modes; (2) the weight/speed formula already gives
stat-tuning depth, so more slots would add fiddliness, not decisions;
(3) breadth comes from modes, not slots — 7 slots × 3 modes is already
21 models per build set. Seven stays.

## Part manifest

`public/mecha/parts/<part-id>/part.json` + `<part-id>.glb`:

```json
{
  "id": "head-scout",
  "slot": "head",
  "name": "Scout Sensor Head",
  "description": "Light recon head.",
  "stats": { "armor": 4, "speed": 3, "power": 2, "weight": 3 },
  "modes": ["racer", "combat"],
  "model": "head-scout.glb"
}
```

- `id`: lowercase letters/digits/dashes, must match its directory name.
- `modes`: which forms the part equips in (default `["racer","combat"]`).
  Mode-exclusive parts are legal — e.g. aero cowl = racer-only,
  ram plow = combat-only — and build validation rejects them in modes
  they don't support.
- `model`: the part's own `.glb` file name (bare filename, no path).
  **Attach-point convention:** a single part's GLB origin IS its attach
  point (head origin at the neck joint, etc.). **Pair parts are the
  exception** — `arms` / `legs` / `shoulders` carry both halves in one
  GLB, so their origin sits at the **pair midpoint** (the socket-pair
  midpoint on the torso, between the `_l` / `_r` sockets), and the
  viewer mounts them once there. Pair-midpoint wins — proven in the QC
  assembly renders (`tools/mecha-parts/render_qc.py`).

Parts are discovered via `public/mecha/parts/index.json` (array of part
ids). One broken manifest never kills the registry — failures collect
into `registry.issues`.

## Socket convention

Torso GLBs carry named empty nodes:

```
socket_head, socket_arm_l, socket_arm_r, socket_leg_l, socket_leg_r,
socket_shoulder_l, socket_shoulder_r, socket_back
```

The viewer composes the hierarchy from these (`SOCKET_FOR_SLOT` in
`schemas.ts`).

**Documented extension — weapon mount:** the socket list has no weapon
mount, so **arm parts carry `socket_weapon_r`** and the viewer mounts the
weapon there, falling back to the torso's `socket_arm_r`.

## Stat formula

Computed **per mode** from that mode's part set:

- `armor = Σ armor`, `power = Σ power`, `weight = Σ weight`
- `speedRaw = Σ speed`
- `weightPenalty = 0.25 × weight`
- `speed = max(0, speedRaw − weightPenalty)`

Every 4 points of weight cost 1 point of speed. Heavy builds hit hard
but move slow; light builds keep pace. Rounded to 1 decimal.

## Transformation rules

```ts
transform: {
  trigger: "manual" | "meter_full" | "damage_threshold" | "breach_rage",  // default "manual"
  cost: { meter: 25 },        // meter (0–100, shared with boost) spent to transform
  cooldownSec: 8,             // min seconds between transforms
  damageThresholdPct: 35,     // hull % at/below which damage_threshold fires
  autoTargets: {              // where each auto trigger sends the mech
    meter_full: "combat", damage_threshold: "breach", breach_rage: "breach",
  },
  breachRage: {               // rage-charge config for the breach form
    chargePerDamage: 0.5,     // charge gained per point of damage dealt
    entryThreshold: 75,       // charge level that unlocks/triggers breach entry
    drainPerSec: 12,          // charge drained per second while breach is active
    entryGated: true,         // breach entry requires charge >= entryThreshold
  },
}
```

**Balancing rationale** (why these numbers):

- Transforming is a power spike — fresh mode stats come online
  (racer → combat brings armor/power; combat → racer brings speed).
  It must cost something, or there's no reason not to run both modes
  maxed. The cost is **meter, the same resource boost uses** — spending
  it on a transform means not boosting. That's the core tradeoff.
- **25 meter ≈ one drift-boost** — meaningful, not build-defining.
- **8s cooldown ≈ two corners / one derby exchange** — stops
  mode-flickering (racer speed on straights + combat armor in every
  hit). Without it, optimal play is flicker spam.
- **damage_threshold at 35% hull** — the "last stand" transform: nearly
  wrecked in a race, you get one combat-form comeback window.
  Threshold-gated so it can't be hoarded for a planned alpha strike.
- **meter_full** — the reward loop for drift-heavy drivers: fill the
  meter, auto-transform, but the meter is consumed, so it still
  competitions with boost usage.

The race/battle sim consumes this later: on trigger condition AND
`meter >= cost.meter` AND cooldown elapsed → transform into
`autoTargets[trigger]` (or the driver's chosen mode for `manual`).

## Armored Core VI lessons (balancing philosophy, v2)

Two lessons from AC VI, adopted as standing balance law:

1. **Build constraints, not respec costs, are the balancing lever.**
   AC VI's assembly works because the constraint is structural — weight,
   EN (energy) load, and capacity per frame part force real tradeoffs
   (heavy armor costs mobility; big weapons need the generator and legs
   to carry them). Our equivalent: the weight→speed penalty
   (`speed = Σspeed − 0.25 × weight`) plus per-mode part sets. Balance
   tuning happens in the constraints — penalty factors, mode stat
   deltas, transform costs — never in friction around changing the
   build.

2. **NO-PENALTY respec.** FromSoftware confirmed for AC VI: no penalties
   for buying and selling parts — respec is free. We adopt the same
   rule: **swapping parts between events costs nothing; the constraint
   comes from build limits, not respec cost.** Experimentation is the
   game. If a build is degenerate, the fix is a constraint (weight,
   cooldown, charge gating), never a tax on trying something new.

## The balance net rule (transformation must earn its place)

See TRANSFORMATION_MECHANICS.md §13i. A transformation survives as a
core mechanic only when every switch has **cost or commitment** (meter,
cooldown, rage charge, vulnerability window), a **clear payoff**
(asymmetric mode roles big enough to feel different — never "slightly
faster"), and **level design that demands switching**. Free-and-painless
switching produces the Fall of Cybertron outcome: ~80% of playtime in
one mode and a mechanic players call bolted-on.

## Persistence

localStorage key **`biomechania.mechs.v1`**: `{ version: 1, builds: Record<name,
{ name, build, updatedAt }> }`. API: `saveMech(name, build)` /
`getMech(name)` / `listMechs()` / `deleteMech(name)` /
`subscribeMechs(cb)` / `ensureStarterMech()`. Corrupt entries drop out
on read (zod safeParse). The starter build (`"Starter Rig"`, seeded by
`ensureStarterMech()`) runs the scout set in racer mode and the bruiser
set in combat mode.

## Placeholder parts (parts lane fulfills the .glb files)

| id | slot | modes | role |
|---|---|---|---|
| head/torso/arms/legs/shoulders-scout | … | racer/combat/breach | light racer set |
| backpack-afterburner | backpack | racer/breach | mode-exclusive demo |
| weapon-scrapblade | weapon | racer/combat/breach | light blade |
| head/torso/arms/legs/shoulders/backpack-bruiser | … | racer/combat/breach | heavy combat set |
| weapon-siegeplow | weapon | combat/breach | mode-exclusive demo |

## Changelog

- **2026-10-09 — contract v2:** `MODES` gains `breach` (rage-gated burst
  form, Grimlock-style earned transformation); `mechBuildSchema` is now
  an N-mode record over `MODES` (every mode required — nothing hardcodes
  2); new `breach_rage` trigger, `autoTargets`, and `breachRage` charge
  config; viewer generalized from 2-mode toggle to N-mode cycle; all 48
  shipped manifests + `build_parts.py` gain `breach` mode support
  (racer/combat exclusivity preserved); AC VI lessons adopted
  (build-constraint balancing, no-penalty respec); slot decision
  recorded (7 stays); pair-midpoint attach convention corrected.

- **2026-10-09 — BioMechania migration:** code `src/yard/mecha/` →
  `src/mecha/`; localStorage key `yard.mechs.v1` →
  `biomechania.mechs.v1`; 12 pair-slot GLBs rebuilt (both halves +
  `socket_weapon_r`); manifests normalized (plural slots, bare model
  filenames); `index.json` carries all 48 shipped parts. Semantics
  unchanged.
- **2026-10-09 — transform extension (owner directive):** builds are now
  multi-mode (`modes.racer` / `modes.combat`); manifest gains `modes`;
  stats aggregate per mode; new `transform` rules schema with
  balancing rationale; storage + starter build updated. Weapon mount
  (`socket_weapon_r` on arm parts) documented as extension.
- **2026-10-09 — contract v1:** slots, manifest schema, socket
  convention, build shape, stat formula, persistence key.
