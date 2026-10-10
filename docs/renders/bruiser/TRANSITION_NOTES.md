# Transition + Breach-Entry Staging Notes — bruiser build

Internal working label: **bruiser** (heavy build). Transition direction:
**combat → breach** (bruiser part set → 7 breach-exclusive parts).

Why not racer → combat: this build's racer and combat modes use the
**same** part set (`BRUISER_BUILD` racer = combat = bruiser parts), so a
racer → combat freeze would show zero part delta and fail QC gate 2
(mode delta) and gate 5 (hybrid readability). Combat → breach is the only
genuine part-swap this build offers, and it matches the escalation fiction
(heavies escalate into breach, not into a second identical heavy mode).

Camera: **M-1 hero 3/4** (az 35°, elev 10°) for all 7 shots. Soul part
(face-plate + chest sigil) bit-identical in every frame, mounted on the
identity-carrying head of each beat (QC gate 1).

Note: breach parts are ~60–70% the scale of the scout/bruiser parts
(measured during part production). Rendered as-is — the breach mech reads
leaner and meaner; this is the shipped part scale, not a staging error.

## Beat order (design study §8, Device 2 — 24 frames @ 60fps)

| Shot | Frame | Staging |
|------|-------|---------|
| T-25 | 6 | **Identity hides.** Bruiser head retracted 0.30 head-heights toward the torso. Armor parts (arms/legs/shoulders/backpack/weapon) lifted 0.12 along depart vectors. Breach fracture-helm descending from 0.35 inbound (kept close so it doesn't stretch the framing); other breach parts stowed (hidden) per Device 3. Soul rides the retracting bruiser head. Lighting: combat studio rig. |
| T-50 | 12 | **SIGNATURE hybrid.** Bruiser parts mid-depart (head 0.70, torso shell 0.55, limbs 0.55); breach parts clearly separated further out at 2.0× offset (head 0.60, torso 0.80, limbs 0.70). Undersuit exposed as inner frame. Rigid plates only. Soul rides the departing bruiser head. Lighting: combat studio rig. If this frame reads broken, the beat order gets reworked (gate 5). |
| T-75 | 18 | **Lock approaches.** Breach parts at 0.12–0.15 inbound, nearly seated on the bruiser torso's anchors (socket-spacing mismatch between generations is invisible at 12% offset). Bruiser parts at 0.85–0.95 depart. Soul on the seating fracture-helm. Lighting: combat studio rig. |
| T-IGN | 24 | **Lock + ignition.** Fresh breach-mode assembly. Departed bruiser parts stowed in an arc above/behind (gate 3). Ignition here is the **burst-coil** running hot: emissive cones at the backpack thrusters + warm point flash. Soul on the fracture-helm. Lighting: breach studio rig. |

## Breach entry (§9.3) — staged from the combat-mode base (bruiser parts)

| Shot | Beat | Staging |
|------|------|---------|
| B-1 | Restraint release | Combat mech in restraint hardware: bolted neck collar, 2 torso straps, 4 limb cuffs. Collar lifted +0.30 / 1.25×; 8 bolts scattered mid-air; straps snapped back 0.7 rad; cuffs popped. 7 breach parts inbound mid-flight (breach palette). Soul on the bruiser head. Lighting: combat rig. |
| B-2 | Reveal + palette shift | Breach parts seated. Restraint hardware jettisoned on the ground — accounted for. Breach grade + undersuit heat (1.0, 0.22, 0.05 @ 0.8). Lighting: breach studio rig (under-glow hot). |
| B-3 | Breach weapon deploying | As B-2, plus core-maul lifted 0.45 out of mount away from the body, −30° deploy rotation, warmup emissive (1.0, 0.35, 0.08 @ ≥2.5). Root flinch −0.045 rad. Soul on the fracture-helm. Lighting: breach rig. |

## Blending-rule compliance

Same rules as the scout build: rigid plates only; depart routes along each
slot's separation axis; per-part color carry-over (bruiser parts keep combat
grade, breach parts carry breach grade); staggered beat order; no mass
vanish (T-IGN stow arc; B-2 jettisoned hardware on the ground); soul
readable every frame.
