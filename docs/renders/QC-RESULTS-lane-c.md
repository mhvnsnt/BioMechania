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
| W-WARM-scrapblade | docs/renders/weapons/W-WARM-scrapblade.png | PASS | Re-rendered with emitter-only glow (EMITTER_MESHES): blade+edge glow cold white-cyan as the energy edge; grip/guard/pommel/housing keep authored dark-gray detail. Anchor -14deg (housing open), blade extended +0.06Y, whole-mech flinch. All 6 gates pass. |
| W-FIRE-scrapblade | docs/renders/weapons/W-FIRE-scrapblade.png | FAIL→re-render | Re-render (09:43) STILL shows the flash floating beside the blade tip: root cause is the muzzle POINT — bbox center is wrong when the -22° anchor tilt moves the tip off-center in Z, and the cone pointed straight +Y instead of along the tilted barrel. Fix: muzzle = actual most-forward vertex; flash oriented coaxially via the anchor's +Y (to_track_quat), cone base overlapping the tip. Queued for fixup pass. |
| W-STOW-siegeplow | docs/renders/weapons/W-STOW-siegeplow.png | PASS | Scout/combat. Weapon folded horizontally in arm mount; stow point (mount clamp) visible. Headless bbox audit of all 7 weapon meshes (barrel/body/drum/grip/muzzle/rail/stock): coherent Y-axis chain, no detached parts. Combat orange mode identity; full mech framed. |
| W-WARM-siegeplow | docs/renders/weapons/W-WARM-siegeplow.png | FAIL→re-render | Re-render (09:53) fixed the shared-material leak (housing keeps detail) but muzzle+barrel+drum ALL glowing at 2.2 merged into one flat peach log — no hot spot reads. Fix: strong glow limited to the muzzle tip only; barrel/drum get a subtle 0.9 warm. Queued for fixup pass. |
| W-FIRE-siegeplow | docs/renders/weapons/W-FIRE-siegeplow.png | FAIL→re-render | Re-render crashed: to_track_quat('+Z','Y') raised ValueError (Blender wants 'Z' not '+Z') — 10-second silent fail, no PNG. Fixed to to_track_quat('Z','Y') and verified headless. Will re-render in this pass (batch continues past it). |
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
| D-CRACK (scout) | docs/renders/scout/D-CRACK-combat.png | FAIL→re-render | Cracks unreadable: 0.045u plate shifts invisible at 1280x720, under-glow lamp (260) too subtle — damage didn't read. Fix: crack displacement 0.045→0.07, crack lamp 260→450. Queued for fixup pass. |
| D-WRECK (scout) | docs/renders/scout/D-WRECK-combat.png | FAIL→re-render | Real defect: the destroyed arm (x>0) was hidden but the WEAPON mounted on it was not — siegeplow floated detached in mid-air (4x zoom of mount area). Fix: stage_damage_wreck now hides the "weapon" slot too. Queued for fixup pass. |
| D-CRACK (bruiser) | docs/renders/bruiser/D-CRACK-combat.png | PENDING | |
| D-WRECK (bruiser) | docs/renders/bruiser/D-WRECK-combat.png | PENDING | |

## Proof sheet

`docs/renders/lane-c-proof.png` — labeled grid of all 23 lane-C deliverables.
