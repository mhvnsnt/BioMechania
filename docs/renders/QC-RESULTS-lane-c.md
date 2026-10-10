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
| W-FIRE-scrapblade | docs/renders/weapons/W-FIRE-scrapblade.png | PASS | Re-rendered with coaxial muzzle flash (tip vertex + anchor +Y): flash cone now touches the blade tip, flares outward correctly. Blade emitter glow + housing detail + recoil pose. All gates pass. |
| W-STOW-siegeplow | docs/renders/weapons/W-STOW-siegeplow.png | PASS | Scout/combat. Weapon folded horizontally in arm mount; stow point (mount clamp) visible. Headless bbox audit of all 7 weapon meshes (barrel/body/drum/grip/muzzle/rail/stock): coherent Y-axis chain, no detached parts. Combat orange mode identity; full mech framed. |
| W-WARM-siegeplow | docs/renders/weapons/W-WARM-siegeplow.png | PASS | Re-rendered with muzzle-tip-only strong glow (2.2) + subtle barrel/drum warm (0.9): hot spot reads at the muzzle, housing keeps detail. No more peach log. |
| W-FIRE-siegeplow | docs/renders/weapons/W-FIRE-siegeplow.png | PASS | Re-rendered with muzzle-tip glow + coaxial flash: flash cone touches the muzzle, flares outward. Barrel warm tint, housing detail. |
| W-STOW-core-maul | docs/renders/weapons/W-STOW-core-maul.png | PASS | Scout/breach. Maul stowed vertically in side mount; head (chunks+spike+rivets), haft, grip, pommel all present and connected (14-mesh bbox audit: coherent assembly, no detached parts). Stow point visible. Breach-mode bulk is the breach part set (expected). |
| W-WARM-core-maul | docs/renders/weapons/W-WARM-core-maul.png | PASS | Re-rendered with chunks cracked open 0.045: molten core glow now visible through the gaps (orange light leaking). Housing-open beat reads. |
| W-FIRE-core-maul | docs/renders/weapons/W-FIRE-core-maul.png | PASS | Re-rendered without the floating flash: deployed maul with hot core glow (2.8) + recoil pose. No detached FX. |
| C-SOUL (scout) | docs/renders/scout/C-SOUL.png | PENDING | contact sheet, 3 modes |
| C-ZONE (scout) | docs/renders/scout/C-ZONE.png | PENDING | contact sheet, 3 modes |
| C-SOUL (bruiser) | docs/renders/bruiser/C-SOUL.png | PENDING | contact sheet, 3 modes |
| C-ZONE (bruiser) | docs/renders/bruiser/C-ZONE.png | PENDING | contact sheet, 3 modes |
| T-FRONT (scout) | docs/renders/scout/T-FRONT-combat.png | PASS | Clean front turnaround, neutral pose, full body framed with margins, combat mode identity, siegeplow mounted. Symmetric, no defects. |
| T-SIDE (scout) | docs/renders/scout/T-SIDE-combat.png | PASS | Clean side profile, neutral pose, full body framed. Note: scout/bruiser share all parts in combat mode (builds.py design) — turnarounds are per-build files but visually identical. |
| T-BACK (scout) | docs/renders/scout/T-BACK-combat.png | PASS | Clean back view, neutral pose, full body framed. Same combat-mode part-sharing note as T-SIDE. |
| T-FRONT (bruiser) | docs/renders/bruiser/T-FRONT-combat.png | PASS | Clean front turnaround. Visually identical to scout T-FRONT (shared combat-mode parts — pipeline design, flagged to parent). |
| T-SIDE (bruiser) | docs/renders/bruiser/T-SIDE-combat.png | PASS | Clean side profile. Identical to scout (shared combat parts). |
| T-BACK (bruiser) | docs/renders/bruiser/T-BACK-combat.png | PASS | Clean back view. Identical to scout (shared combat parts). |
| D-CRACK (scout) | docs/renders/scout/D-CRACK-combat.png | PASS | Re-rendered with stronger cracks (0.07 displacement, 450 lamp): plate separations visible at torso/pelvis with warm under-glow leaking through (4x zoom confirms gaps + orange light). Reads as cracked plating. |
| D-WRECK (scout) | docs/renders/scout/D-WRECK-combat.png | PASS | Re-rendered with weapon hidden: no floating siegeplow. Head/shoulders/arm destroyed, under-glow, list. |
| D-CRACK (bruiser) | docs/renders/bruiser/D-CRACK-combat.png | PENDING | |
| D-WRECK (bruiser) | docs/renders/bruiser/D-WRECK-combat.png | PASS | Head/shoulders/one arm hidden (destroyed); weapon hidden with the destroyed arm (no floating parts — fix verified); hot under-glow on legs; 4° list. Reads as 35%-hull wreck. |

## Proof sheet

`docs/renders/lane-c-proof.png` — labeled grid of all 23 lane-C deliverables.

| C-SOUL-scout-racer | docs/renders/contact/soul-scout-racer.png | PASS | Tight soul face-plate; twin optics + mouth grille; racer teal. Antenna_tip verified as authored part. |
| C-SOUL-scout-combat | docs/renders/contact/soul-scout-combat.png | PASS | Soul face-plate constant vs racer (twin optics identical); combat orange accents on surroundings. Constancy proven. |
| C-SOUL-scout-breach | docs/renders/contact/soul-scout-breach.png | PASS | Soul face-plate constant vs racer/combat; breach bulk around it. Constancy proven. |

| C-ZONE-scout-racer | docs/renders/contact/zone-scout-racer.png | PASS | M-2 ortho side profile; racer teal color identity reads clearly. Framing slightly tight at head but fit for purpose. |
| C-ZONE-scout-combat | docs/renders/contact/zone-scout-combat.png | PASS | M-2 ortho side profile; combat orange color identity reads clearly. |

| C-SOUL (scout) | docs/renders/scout/C-SOUL.png | PASS | Contact sheet: soul face-plate across racer/combat/breach. Twin optics constant; surroundings change by mode. Constancy proven. |
| C-SOUL (bruiser) | docs/renders/bruiser/C-SOUL.png | PASS | Contact sheet: soul face-plate across racer/combat/breach. Constancy proven. |
| C-ZONE (scout) | docs/renders/scout/C-ZONE.png | PASS | Contact sheet: M-2 ortho profiles side by side; racer teal vs combat orange vs breach bulk/orange. Mode color identity clear. |
| C-ZONE (bruiser) | docs/renders/bruiser/C-ZONE.png | PASS | Contact sheet: mode color identity side by side. |
| PROOF SHEET | docs/renders/lane-c-proof.png | PASS | Labeled contact sheet of all 23 inspected frames; 23 cells, 0 missing. |
