# Transition + Breach-Entry Staging Notes — scout build

Internal working label: **scout** (light build). Transition direction:
**racer → combat** (scout part set → bruiser part set — the only real
part-swap this build offers; its racer/combat sets differ, so the
transformation reads as a genuine mode change).

Camera: **M-1 hero 3/4** (az 35°, elev 10°) for all 7 shots — the sequence
reads as one continuous transformation. Soul part (face-plate + chest sigil)
is bit-identical geometry in every frame, mounted on the identity-carrying
head of each beat (QC gate 1).

## Beat order (design study §8, Device 2 — 24 frames @ 60fps)

| Shot | Frame | Staging |
|------|-------|---------|
| T-25 | 6 | **Identity hides.** Racer head retracted 0.30 head-heights toward the torso. Aero parts (arms/legs/shoulders/backpack/weapon) lifted 0.12 along their depart vectors — releasing, not yet traveling. Combat head descending from 0.55 inbound (early for readability); all other combat parts stowed per Device 3 (combat-only armor retracts in racer mode), hidden. Soul rides the retracting racer head — still readable. Lighting: racer studio rig. |
| T-50 | 12 | **SIGNATURE hybrid — the machine caught mid-thought.** Racer parts mid-depart (head 0.70, torso shell lifted 0.55 to expose the undersuit, limbs/shoulders/weapon 0.55, backpack 0.55 with 0.5 rad swing). Combat parts clearly separated further out at 2.0× the offset (head 0.60, torso 0.80, limbs 0.70) — two distinct part streams, never overlapping. Rigid plates only — nothing morphs. Soul rides the departing racer head (the identity carrier mid-flight). Lighting: combat studio rig. If this frame reads broken, the beat order gets reworked (gate 5). |
| T-75 | 18 | **Lock approaches.** Combat parts at 0.12–0.15 inbound — nearly seated on the scout torso's anchors. Racer parts at 0.85–0.95 depart, clear of the body. Torso shell 0.85 lifted; combat torso descending onto the anchor. Backpack counter-rotating toward upright. Soul now rides the seating combat head. Lighting: combat studio rig. |
| T-IGN | 24 | **Lock + ignition.** Fresh combat-mode assembly (proper socket seating on the bruiser torso). Departed racer parts parked in a tidy stow arc above/behind the mech — accounted for, not vanished (gate 3). Thruster flash: emissive cones at the backpack thrusters + a warm point light behind the mech. Soul on the combat head. Lighting: combat studio rig. |

## Breach entry (§9.3) — staged from the combat-mode base

| Shot | Beat | Staging |
|------|------|---------|
| B-1 | Restraint release | Combat mech wearing modeled restraint hardware (Device 4): bolted neck collar, 2 torso strap bands, 4 limb joint cuffs. Collar lifted +0.30 and scaled 1.25×; 8 collar bolts scattered mid-air (the violence read); straps snapped back 0.7 rad; cuffs popped. 7 breach-exclusive parts floating mid-flight above the mech (breach palette grade). Soul on the combat head. Lighting: combat rig. |
| B-2 | Reveal + palette shift | Breach parts seated (fresh breach-mode assembly). Restraint hardware jettisoned on the ground beside the mech — collar, bolts, straps, cuffs all visible, accounted for. Palette shift: breach grade (hot accent). Undersuit emission raised (1.0, 0.28, 0.06 @ 1.6) — the under-plating runs hot. Lighting: breach studio rig (warm key, hot rim, under-glow point). |
| B-3 | Breach weapon deploying | As B-2, plus: core-maul lifted 0.30 out of its mount along the arm axis, rotated −18° (deploying, not yet fired), weapon materials pushed to warmup emissive (1.0, 0.35, 0.08 @ ≥2.5). Whole-mech flinch: root leaned back 0.045 rad. Soul on the fracture-helm. Lighting: breach rig, under-glow hot. |

## Blending-rule compliance

- **Rigid plates mid-travel:** every offset is a rigid translate/rotate of the travel empty; no vertex morphing anywhere.
- **Routes along seam lines:** depart vectors point outward along each slot's natural separation axis (head/torso up, limbs up-out, backpack out-back, weapon out-right).
- **Color carry-over:** from-parts keep their racer grade, to-parts carry their combat grade (per-part subset grading) — the eye tracks each piece.
- **Limited simultaneous movers:** beat order staggers head → limbs → torso/backpack → lock.
- **No mass vanish:** every part is visible in every frame or explicitly stowed (T-IGN stow arc; B-2 jettisoned hardware on the ground).
- **Soul readable every frame:** face-plate raycast-placed proud of the head surface; chest sigil on the torso; both exempt from grading.
