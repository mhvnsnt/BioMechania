# BioMechania Render Pipeline (`tools/render/`)

Headless Blender pipeline that assembles the 7-slot part GLBs into a
mode-correct mech and renders still shots per the render production spec
(`docs/MECHA_DESIGN_STUDY.md` §9). **Stills only — this pipeline never
produces animation or video.**

## Quick start

```bash
cd ~/workspace/BioMechania
env -u PYTHONPATH ~/workspace/tools/blender/blender-4.0.2-linux-x64/blender \
  -b --python tools/render/render_shot.py -- \
  --build scout --mode racer --shot M-1 \
  --out docs/renders/scout/M-1-racer.png \
  --res 1920x1080 --samples 128
```

(`env -u PYTHONPATH` is mandatory — the system numpy leaks into Blender's
Python otherwise. See `~/TOOLS.md`.)

Options: `--build {scout,bruiser}`, `--mode {racer,combat,breach}`,
`--shot {M-1,M-2,M-3,T-FRONT,T-SIDE,T-BACK}`, `--res WxH`, `--samples N`,
`--parts-dir` (default `public/mecha/parts`).

## Modules

| File | Job |
|---|---|
| `builds.py` | Build definitions: build+mode → `{slot: part_id}`. Pure python, no bpy. |
| `generation.py` | Part-generation normalization (see below). |
| `assemble.py` | GLB import → socket-parented assembly, undersuit, grounding. |
| `soul_part.py` | The soul part (Device 1): canonical face-plate + chest sigil. |
| `grade.py` | Mode color identity treatments (Device 6). |
| `cameras.py` | Camera rigs: M-1 hero 3/4, M-2 ortho profile, M-3 rear, turnarounds. |
| `lighting.py` | 3-point studio rig + mid-gray seamless, per-mode light colors. |
| `render_shot.py` | CLI entry: runs the full pipeline for one shot. |
| `debug_layout.py` | Debug helper: prints per-slot world bboxes, no render. |

## Assembly

Canonical render space: **Z-up, forward = +Y, mech-left = +X**, ground at
**z = 0** (Blender's up; the "y=0" in the task brief).

1. The torso imports first — its `socket_*` empties (contract § Socket
   convention) define the build's coordinate generation.
2. **Generation normalization** (`generation.py`): the scout/bruiser part
   families were authored Y-up; the breach parts Z-up (measured from the
   shipped GLBs 2026-10-09). Old-generation parts get
   `N = Rz(180°) @ Rx(90°)`, mapping old +Y→+Z (up), old +Z→+Y (forward),
   old −X→+X (mech-left). Detected per build from the torso's
   `socket_head` empty. New-generation parts import unmodified.
3. Pair slots (arms/legs/shoulders) mount **once at the socket-pair
   midpoint**; the weapon mounts to the arm part's `socket_weapon_r`
   (falls back to `socket_weapon_l`, then the torso's `socket_arm_r`).
4. Parts are **translated so their GLB origin lands on the anchor**
   (`place_on_anchor`) — plain parenting leaves parts at the scene
   origin; this was caught by per-slot bbox debug and is documented in
   the function.
5. The mech is grounded by shifting `mech_root` so the lowest mesh point
   sits exactly on z = 0 (feet on the ground plane, QC gate 6).

## Soul part (Device 1 — the approach)

The study requires a fixed face-plate + chest sigil **identical across
all modes** of a build. Since head parts differ per mode, the pipeline
implements the soul as a **dedicated overlay**:

- `build_face_plate()` / `build_chest_sigil()` construct the soul
  **procedurally and deterministically** — no binary asset, so every mode
  gets bit-identical geometry and materials by construction.
- Face-plate: dark blue-steel plate + brow bar + **fixed twin-optic
  arrangement** (two emissive cyan lenses, symmetric, spaced
  proportionally to plate width) + center ridge. Mounts over the upper
  face (68% of head height) so the optics ARE the face read.
- Chest sigil: dark backing + angular broken-diamond mark in emissive
  cyan — an **abstract geometric mark, original to BioMechania**, never a
  franchise symbol.
- Placement is computed by **raycasting the actual part surfaces**, so
  the soul always sits proud of the real geometry (angled breastplates,
  protruding visors) rather than a bbox guess. Only the *position* adapts
  per part — geometry is never rescaled.
- Soul materials (`soul_plate`, `soul_optic`, `soul_sigil`) are **exempt
  from the mode color grading** — the soul keeps its colors in all modes
  (QC gate 1).

## Mode color grades (Device 6)

Closed-form HSV remaps of each part's authored base color, applied in
`grade.py`. Accents = high-saturation warm colors (sodium amber, red,
rust); everything else = armor; emission strength > 0.05 = emissive.

| Mode | Armor | Warm accents | Emissive |
|---|---|---|---|
| **racer** (cool/dark + aero stripes) | hue → blue 45%, sat ×0.72, val ×0.82; grays → cool steel (H 0.58, S 0.18) | → aero cyan (H 0.52, S 0.85) | → cyan (0.25, 0.80, 1.0), strength ×1.25 |
| **combat** (full saturation + armor bands) | sat ×1.45, val ×1.06 | sat ×1.3, keep hue | strength ×1.30, keep color |
| **breach** (hotter + glow) | hue → red-orange 50%, sat ×1.15, val ×0.92; grays → hot tint (H 0.05, S 0.25) | → hot orange (H 0.06, S 0.95) | → orange-red (1.0, 0.30, 0.06), strength ×2.20 |

Lighting follows the mode too (`lighting.py`): racer = cool key +
cyan-ish rim; combat = neutral-warm key; breach = warm key + hot orange
rim + orange under-glow point light (restraint-release heat).

## Undersuit (Device 9)

`build_undersuit()` generates a dark inner frame (spine, hip bar,
shoulder bar, neck post, limb stubs; near-black metallic) **fitted to
the torso's measured socket layout**. It is parametric rather than one
rigid mesh because the shipped part generations have different socket
spacings — same design language and same dark material in every mode,
which is what the device's readability trick requires.

## Cameras & lighting

- **M-1** (3/4 front hero): azimuth 35°, elevation 10°, 50mm — slight low
  angle, the money shot.
- **M-2** (side profile): azimuth 90°, **orthographic** — the silhouette
  readability check.
- **M-3** (rear power read): azimuth 215°, elevation 28° — backpack /
  weapon bus.
- **T-FRONT / T-SIDE / T-BACK**: neutral-stance turnarounds (az 0/90/180,
  elev 8°).
- All rigs auto-frame from the mech's measured bounds; the perspective
  rigs fit the full height in the vertical FOV with margin.
- Lighting: key + fill + rim area lights (soft shadows), mid-gray world
  (0.32) and ground plane (0.35), no environment clutter.

## Naming law note

"Scout"/"Bruiser" are **internal working labels only** (owner
2026-10-09). Public display names are TBD — the owner picks from a
naming slate personally. Nothing in this pipeline is canon as a public
name; the final rename pass applies his picks. Part ids are unchanged.

## Known findings for the parts lane (from pipeline construction)

1. **Generation split**: scout/bruiser parts are Y-up, breach parts Z-up
   in Blender space, with different socket spacings (head socket 0.98 vs
   0.42) and mirrored left/right. The pipeline normalizes this, but the
   viewer/customizer lanes should confirm they handle both.
2. **Breach parts are ~60–70% the scale of scout/bruiser** (legs 1.16 vs
   2.05 long). Breach mode renders noticeably smaller — intended, or a
   unit-scale slip in the breach parts lane?
3. `rupture-maul` (breach arms) carries **both** `socket_weapon_l` and
   `socket_weapon_r`; the pipeline uses `_r` per the task.
4. `src/mecha/parts.ts` `DEFAULT_BUILD.breach` still points at the
   bruiser set (stale placeholder comment) — the pipeline uses the
   7 breach-exclusive parts per the task brief.
