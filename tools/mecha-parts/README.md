# mecha-parts — part build + QC tooling

Blender 4.0.2 headless pipeline that builds the part GLBs the customizer
assembles. Contract: `docs/MECHA_CONTRACT.md`. Code: `src/mecha/`.

## Files

- `build_parts.py` — builds every part GLB + `part.json` manifest from
  the `PARTS` registry table into `public/mecha/parts/` (or `$PARTS_OUT`).
  Original designs only: EVA-inspired biomech language (ribbed organic
  plating over mechanical frames, hunched silhouettes, sinewy limbs) +
  demolition-derby grit. Never copies of EVA/Gundam/Bionicle designs,
  names, symbols, or color schemes.
- `render_qc.py` — QC renderer: per-part turntable views + assembled
  mech views per mode.
- `mech_specs.json` — QC assembly specs (which part ids per mode).
- `build_summary.json` — last build's part/tris manifest.

## Attach-point convention (contract — pair-midpoint wins)

**Single parts** (head, torso, backpack, weapon): the GLB's origin IS the
attach point (head origin at the neck joint, etc.).

**Pair parts** (`arms` / `legs` / `shoulders`) are the exception: one GLB
carries BOTH halves (built halves at ±dx, mirrored about X=0), so the
origin sits at the **PAIR MIDPOINT** — the socket-pair midpoint on the
torso (between `socket_arm_l`/`_r` etc.) — and the viewer mounts the GLB
**once** there, not once per side. This is proven in the QC assembly
renders (`PAIR_MID` in `render_qc.py`); the old "origin IS the attach
point" phrasing is wrong for pairs and must not be reintroduced.

Torso GLBs carry the named socket empties
(`socket_head`, `socket_arm_l/_r`, `socket_leg_l/_r`,
`socket_shoulder_l/_r`, `socket_back`); arm-part GLBs carry
`socket_weapon_r` (the weapon mount).

## Modes

Every part's `modes` array lists the forms it equips in (`racer`,
`combat`, `breach` — see `MODES` in `src/mecha/schemas.ts`). The
`PARTS` table in `build_parts.py` is the source of truth; shipped
`part.json` manifests must match it. Breach-exclusive parts (rage
plating, etc.) are built like any other part with `modes: ["breach"]`.
