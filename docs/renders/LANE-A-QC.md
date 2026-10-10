# Lane A hero shots — QC inspection log (owner: my eyes on EVERY frame)

Shot list: scout + bruiser builds × M-1/M-2/M-3 × racer/combat/breach = 18.
Finals: M-1 @ 1920x1080/64sp (denoised), M-2/M-3 @ 1280x720/64sp.
Poses: tools/render/pose.py. Camera rigs: M-1 = 3/4 front hero low angle;
M-2 = side profile orthographic; M-3 = rear elevated (tools/render/cameras.py).

6 QC gates (docs/MECHA_DESIGN_STUDY.md §9.9):
1. soul-part constancy (face-plate + chest sigil present & readable)
2. mode delta (racer/combat/breach reads distinct per build's mode kit)
3. no mass vanish (no missing major parts vs assembly)
4. no clipping (parts don't interpenetrate after posing)
5. hybrid readability (n/a for heroes — note R)
6. grounding (feet planted, no float/sink)

## Results

### scout / M-1 / racer (1920x1080/64sp) — v1 FAIL, v2 PASS
- v1 inspected 2026-10-10 ~07:42Z. Pose: coiled aero tuck reads well (torso pitched fwd, arms swept back, legs trailing). Gates: 1 PASS (face-plate optics + chest sigil readable), 2 PASS (racer cyan aero kit), 4 PASS (no clipping), 6 PASS (feet planted, soft shadows), 5 N/A.
- **v1 FAIL gate 3 (assembly integrity): the scrapblade weapon floated detached from the hand** — weapon anchor is parented to the torso anchor in assemble.py, so the arms -25° sweep left the weapon behind (~0.5 m gap). Cyan dot above head is the antenna tip light — not a defect.
- **Fix:** pose.py apply_pose() now re-parents the weapon anchor under the arms anchor (world-transform-preserving, lane-local; other lanes don't pose) — committed 4b274bd. Defective v1 retired (git rm); v2 rendered 08:17Z.
- v2 inspected ~08:20Z (full frame + weapon-region crop + 640x360 pose test render). **PASS all gates:** tuck pose confirmed; weapon now travels with the hand (no more 0.5 m gap); soul parts readable; racer kit reads; no clipping; grounded. Note: pommel sphere sits slightly proud of the grip per the part's own node layout (pommel z+0.12 in weapon-scrapblade.glb) — matches part design, not a pose defect; cross-checked against neutral M-2.

### scout / M-2 / racer (1280x720/64sp) — v1 FAIL (framing), v2 PASS
- v1 inspected ~08:32Z. Clean orthographic side profile otherwise: neutral stance, soul parts + racer kit readable, weapon seated at hand in neutral (confirms the M-1 v2 pommel/grip relationship matches part design), no clipping, grounded.
- **v1 FAIL (framing): head top/antenna and feet cut off by the frame edges** — cameras.py ortho branch set `ortho_scale = size*1.45`, but ortho_scale is the HORIZONTAL extent; at 16:9 the vertical extent was only size*1.45*9/16 ≈ 0.81×size < mech height. Fix: aspect-aware `ortho_scale = size*1.25*aspect` (committed f5479df). Defective v1 retired; v2 rendered ~08:43Z.
- v2 inspected ~08:44Z. **PASS all gates:** full silhouette with margins (antenna tip + feet inside frame), soul parts readable, racer kit reads, no clipping, grounded, neutral profile as specified.

### scout / M-3 / racer (1280x720/64sp) — PASS
- Inspected ~08:50Z. Rear elevated view as specified: backpack thruster nozzles (twin glowing cyan) dominate — strong "rear power read"; backpack cyan accents, racer kit readable.
- Gates: 1 N/A from rear (face-plate/sigil occluded by angle; confirmed present in M-1/M-2), 2 PASS (racer thruster bus + cyan kit), 3 PASS (all parts present; weapon seated at hand, blade visible at side), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### scout / M-1 / combat (1920x1080/64sp) — PASS
- Inspected ~09:20Z. Planted combat stance as specified: torso slightly fwd, head menace tilt, right arm raised with weapon-siegeplow deployed forward, legs braced.
- Gates: 1 PASS (face-plate optics + chest sigil readable), 2 PASS (combat orange/red kit clearly distinct from racer cyan), 3 PASS (all parts present; weapon firmly gripped — re-parent fix verified via weapon-region crop, no floating), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### scout / M-2 / combat (1280x720/64sp) — PASS
- Inspected ~09:25Z. Clean side profile with fixed framing (full silhouette, margins top/bottom). Heavy bruiser combat build reads distinct from the light racer set.
- Gates: 1 PASS (face-plate + sigil readable in profile), 2 PASS (combat orange/red kit), 3 PASS (all parts; siegeplow seated at hand, extends horizontally), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted).

### scout / M-3 / combat (1280x720/64sp) — PASS
- Inspected ~09:36Z. Rear elevated: heavy bruiser backpack with combat orange stripe dominates — good rear power read; siegeplow visible at the hand on the left.
- Gates: 1 N/A from rear (confirmed in M-1/M-2), 2 PASS (combat kit + heavy build), 3 PASS (all parts; weapon at hand), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### scout / M-1 / breach (1920x1080/64sp) — PASS
- Inspected ~10:10Z. "Restraints off, glow hot" reads unmistakably: full emissive orange breach glow, torso arched back, head up, arms spread in release.
- Gates: 1 PASS (face-plate optics + chest sigil readable through glow), 2 PASS (breach emissive-hot kit overwhelmingly distinct from racer cyan / combat orange-red accents), 3 PASS (all 7 breach-exclusive parts present; core-maul confirmed via blender diagnostic: 14 meshes parented to arms anchor — attached, not floating), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### scout / M-2 / breach (1280x720/64sp) — PASS
- Inspected ~10:20Z. Clean side profile with fixed framing; breach glow reads strong.
- Gates: 1 PASS (face-plate + sigil readable), 2 PASS (breach hot kit), 3 PASS (all parts; core-maul geometrically verified at the right hand via blender diagnostic — weapon (-0.4,0.05,-0.34) coincides with right fist; occluded by torso in this side view, which is expected. The vertical maul-like shape behind is the vent-surge backpack), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted).

### scout / M-3 / breach (1280x720/64sp) — PASS
- Inspected ~10:32Z. Rear elevated: vent-surge backpack with glowing vent stacks dominates — strong breach rear power read; core-maul visible at the hand on the left.
- Gates: 1 N/A from rear (confirmed in M-1/M-2), 2 PASS (breach glow + vent stacks), 3 PASS (all parts; weapon at hand), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### bruiser / M-1 / racer (1920x1080/64sp) — PASS
- Inspected ~10:48Z. Heavy bruiser build in the coiled aero tuck: torso pitched fwd, arms swept back, legs trailing — the racer attitude reads on the bulky frame.
- Gates: 1 PASS (face-plate optics + chest sigil readable), 2 PASS (racer cyan kit on heavy build — clearly distinct from scout), 3 PASS (all parts; siegeplow firmly gripped — weapon-region crop confirms no floating, re-parent fix holds), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### bruiser / M-2 / racer (1280x720/64sp) — PASS
- Inspected ~10:52Z. Clean side profile; heavy bruiser silhouette with racer cyan accents; siegeplow extends horizontally from the hand.
- Gates: 1 PASS (face-plate + sigil), 2 PASS (racer kit on heavy build), 3 PASS (all parts; weapon at hand), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### bruiser / M-3 / racer (1280x720/64sp) — PASS
- Inspected ~11:02Z. Rear elevated: heavy backpack with racer cyan stripe — good rear power read; siegeplow visible at the hand on the left.
- Gates: 1 N/A from rear (confirmed in M-1/M-2), 2 PASS (racer kit + heavy build), 3 PASS (all parts; weapon at hand), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.

### bruiser / M-1 / combat (1920x1080/64sp) — PASS (pixel-identical to scout/M-1/combat)
- Inspected ~11:18Z. **SPEC NOTE: builds.py defines scout/combat and bruiser/combat with the IDENTICAL part set** (both = bruiser parts + siegeplow); likewise scout/breach = bruiser/breach (same 7 breach parts). Pixel diff vs scout/M-1-combat.png: mean abs diff 0.0 — bit-identical renders. So 6 of the 18 spec'd shots are duplicates by construction (bruiser combat M-1/M-2/M-3, bruiser breach M-1/M-2/M-3). Rendering all 18 per spec; flagging for owner/parent whether bruiser wants distinct combat/breach parts.
- Gates (verified on this frame): 1 PASS (face-plate + sigil), 2 PASS (combat kit), 3 PASS (all parts; weapon gripped), 4 PASS (no clipping), 5 N/A, 6 PASS (feet planted). Framing: full mech with margins.
- v1 inspected 2026-10-10 ~07:42Z. Pose: coiled aero tuck reads well (torso pitched fwd, arms swept back, legs trailing). Gates: 1 PASS (face-plate optics + chest sigil readable), 2 PASS (racer cyan aero kit), 4 PASS (no clipping), 6 PASS (feet planted, soft shadows), 5 N/A.
- **v1 FAIL gate 3 (assembly integrity): the scrapblade weapon floated detached from the hand** — weapon anchor is parented to the torso anchor in assemble.py, so the arms -25° sweep left the weapon behind (~0.5 m gap); pommel sphere also read as floating debris. Cyan dot above head is the antenna tip light — not a defect.
- **Fix:** pose.py apply_pose() now re-parents the weapon anchor under the arms anchor (world-transform-preserving, lane-local; other lanes don't pose) — committed 4b274bd. Defective v1 retired (git rm); v2 rendered 08:17Z.
- v2 inspected ~08:20Z (full frame + weapon-region crop + 640x360 pose test render). **PASS all gates:** tuck pose confirmed (torso fwd, head down, arms swept, legs trailing); weapon now travels with the hand (re-parent verified — no more 0.5 m gap); soul parts readable; racer kit reads; no clipping; grounded. Note: pommel sphere sits slightly proud of the grip per the part's own node layout (pommel z+0.12 in weapon-scrapblade.glb) — matches part design, not a pose defect; will cross-check against neutral M-2. The batch runner died post-render (pre-commit); v2 committed manually.
