# Mecha parts

Each `<part-id>/` directory holds that part's `part.json` manifest
(schema: `src/mecha/schemas.ts`, contract: `docs/MECHA_CONTRACT.md`).

## For the parts lane

Every directory still needs its **`<part-id>.glb`** model file.
Conventions the viewer depends on:

- **Single parts** (head, torso, backpack, weapon): the GLB's **origin
  IS the attach point** (head origin at the neck joint, etc.).
- **Pair parts** (`arms` / `legs` / `shoulders`) are the exception: they
  carry **both halves** in one GLB, so their origin sits at the **PAIR
  MIDPOINT** between the halves (the socket-pair midpoint on the torso)
  — the viewer mounts them once there, not per side. Pair-midpoint
  wins; proven in the QC assembly renders.
- **Torso GLBs** must carry named empty nodes:
  `socket_head`, `socket_arm_l`, `socket_arm_r`, `socket_leg_l`,
  `socket_leg_r`, `socket_shoulder_l`, `socket_shoulder_r`, `socket_back`.
- **Arm-part GLBs** must carry `socket_weapon_r` (the weapon mount).

All designs original — biomechanical EVA-style inspiration, never copies.
