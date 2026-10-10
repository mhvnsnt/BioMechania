# Lane C QC Results — detail shots (weapons / characteristics / turnarounds / damage)

Branch: `feature/renders-details`. Stills only. Every frame below was opened and
inspected by the lane worker (not just rendered). 6 QC gates per §9.9:
1. soul-part constancy · 2. mode delta · 3. no mass vanish · 4. no clipping ·
5. hybrid readability (n/a for lane C — no hybrids) · 6. grounding.

Naming law: `scout`/`bruiser` are INTERNAL working labels only. No public names
invented; owner picks display names personally.

Weapon staging notes (procedural, per §9.4 — VFX layering is a later lane):
- W-STOW: as-assembled weapon in its arm mount; close crop proves the stow point.
- W-WARM: emitter materials pushed to weapon-specific glow color, weapon anchor
  rotated -14°, barrel nudged +0.06Y forward, whole-mech flinch (root pitch 3.5°).
- W-FIRE: emitter glow + procedural muzzle cone/sparks/point light, weapon anchor
  -22°, barrel +0.10Y, recoil pose (root -0.12Y, pitch 5°).

Damage staging notes (per §9.7):
- D-CRACK (combat mode): 3 largest torso plates translated outward 0.045 to open
  gaps over the dark undersuit + hot under-glow point light inside the torso.
- D-WRECK (combat mode): head + shoulders + mech-left arm slot meshes hidden
  (destroyed), soul face-plate hidden with the head, hot under-glow, 4° list,
  re-grounded. Represents the 35%-hull threshold state.

Turnarounds: combat mode, neutral stance, T-FRONT/T-SIDE/T-BACK rigs.

Contact sheets: C-SOUL = soul face-plate close-ups across racer/combat/breach
per build (proves constancy); C-ZONE = M-2 ortho profiles across the three modes
per build (proves Device 6 color delta).

## Per-shot results

| Shot | File | Gates 1-6 | Notes |
|---|---|---|---|
| W-STOW-scrapblade | docs/renders/weapons/W-STOW-scrapblade.png | PASS | First render FAILED: pommel sphere floating 0.035u below grip (part-authoring defect in weapon-scrapblade.glb — pommel at local Y=-0.12 vs grip bottom -0.035). Diagnosed via headless assembly bbox dump; fixed at part level (pommel +0.04Y, now 0.005 overlap, verified by re-dump), matching the surge-stomp precedent. Original GLB backed up at /tmp/weapon-scrapblade-orig.glb. Re-rendered 2026-10-10 with fixed part; re-inspected (full frame + 4x zoom of mount): pommel now contacts grip, no floating gap. Gates 1-6 pass: blade folded in mount clamp, stow point visible; racer teal identity; no detached parts; full mech framed. |
| W-WARM-scrapblade | docs/renders/weapons/W-WARM-scrapblade.png | FAIL→re-render | Blade glow at emission strength 5.0 blew out to pure white — mount/housing detail and emitter origin unreadable (4x zoom of housing area shows total overexposure). Fix: warm glow 5.0→2.2, fire glow 6.0→2.8 in detail_shots.py (muzzle flash carries the heat). Queued for fixup pass after batch finishes (batch already passed shot 2; will not re-render within this pass). |
| W-FIRE-scrapblade | docs/renders/weapons/W-FIRE-scrapblade.png | FAIL→re-render | Two issues: (1) blade glow at 6.0 blew the whole weapon to flat white (no detail); (2) muzzle cone (radius2=0.16, depth=0.55) rendered as a giant peach marshmallow blob ~1/3 mech size, not a flash. Fixes in detail_shots.py: fire glow 6.0→2.8 (muzzle flash carries the heat); cone tightened to radius2=0.10, depth=0.35, centered +0.20 ahead of muzzle. Queued for fixup pass (batch already passed shot 3; running process had old script loaded). |
| W-STOW-siegeplow | docs/renders/weapons/W-STOW-siegeplow.png | PASS | Scout/combat. Weapon folded horizontally in arm mount; stow point (mount clamp) visible. Headless bbox audit of all 7 weapon meshes (barrel/body/drum/grip/muzzle/rail/stock): coherent Y-axis chain, no detached parts. Combat orange mode identity; full mech framed. |
| W-WARM-siegeplow | docs/renders/weapons/W-WARM-siegeplow.png | PENDING | |
| W-FIRE-siegeplow | docs/renders/weapons/W-FIRE-siegeplow.png | PENDING | |
| W-STOW-core-maul | docs/renders/weapons/W-STOW-core-maul.png | PENDING | |
| W-WARM-core-maul | docs/renders/weapons/W-WARM-core-maul.png | PENDING | |
| W-FIRE-core-maul | docs/renders/weapons/W-FIRE-core-maul.png | PENDING | |
| C-SOUL (scout) | docs/renders/scout/C-SOUL.png | PENDING | contact sheet, 3 modes |
| C-ZONE (scout) | docs/renders/scout/C-ZONE.png | PENDING | contact sheet, 3 modes |
| C-SOUL (bruiser) | docs/renders/bruiser/C-SOUL.png | PENDING | contact sheet, 3 modes |
| C-ZONE (bruiser) | docs/renders/bruiser/C-ZONE.png | PENDING | contact sheet, 3 modes |
| T-FRONT (scout) | docs/renders/scout/T-FRONT-combat.png | PENDING | |
| T-SIDE (scout) | docs/renders/scout/T-SIDE-combat.png | PENDING | |
| T-BACK (scout) | docs/renders/scout/T-BACK-combat.png | PENDING | |
| T-FRONT (bruiser) | docs/renders/bruiser/T-FRONT-combat.png | PENDING | |
| T-SIDE (bruiser) | docs/renders/bruiser/T-SIDE-combat.png | PENDING | |
| T-BACK (bruiser) | docs/renders/bruiser/T-BACK-combat.png | PENDING | |
| D-CRACK (scout) | docs/renders/scout/D-CRACK-combat.png | PENDING | |
| D-WRECK (scout) | docs/renders/scout/D-WRECK-combat.png | PENDING | |
| D-CRACK (bruiser) | docs/renders/bruiser/D-CRACK-combat.png | PENDING | |
| D-WRECK (bruiser) | docs/renders/bruiser/D-WRECK-combat.png | PENDING | |

## Proof sheet

`docs/renders/lane-c-proof.png` — labeled grid of all 23 lane-C deliverables.
