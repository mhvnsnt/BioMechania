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

### scout / M-2 / racer (1280x720/64sp) — v1 FAIL (framing), v2 re-rendering
- v1 inspected ~08:32Z. Clean orthographic side profile otherwise: neutral stance, soul parts + racer kit readable, weapon seated at hand in neutral (confirms the M-1 v2 pommel/grip relationship matches part design), no clipping, grounded.
- **v1 FAIL (framing): head top/antenna and feet cut off by the frame edges** — cameras.py ortho branch set `ortho_scale = size*1.45`, but ortho_scale is the HORIZONTAL extent; at 16:9 the vertical extent was only size*1.45*9/16 ≈ 0.81×size < mech height. Fix: aspect-aware `ortho_scale = size*1.25*aspect` (committed f5479df). Defective v1 retired; v2 re-render launched in parallel (batch is on M-3, no file conflict).
- v1 inspected 2026-10-10 ~07:42Z. Pose: coiled aero tuck reads well (torso pitched fwd, arms swept back, legs trailing). Gates: 1 PASS (face-plate optics + chest sigil readable), 2 PASS (racer cyan aero kit), 4 PASS (no clipping), 6 PASS (feet planted, soft shadows), 5 N/A.
- **v1 FAIL gate 3 (assembly integrity): the scrapblade weapon floated detached from the hand** — weapon anchor is parented to the torso anchor in assemble.py, so the arms -25° sweep left the weapon behind (~0.5 m gap); pommel sphere also read as floating debris. Cyan dot above head is the antenna tip light — not a defect.
- **Fix:** pose.py apply_pose() now re-parents the weapon anchor under the arms anchor (world-transform-preserving, lane-local; other lanes don't pose) — committed 4b274bd. Defective v1 retired (git rm); v2 rendered 08:17Z.
- v2 inspected ~08:20Z (full frame + weapon-region crop + 640x360 pose test render). **PASS all gates:** tuck pose confirmed (torso fwd, head down, arms swept, legs trailing); weapon now travels with the hand (re-parent verified — no more 0.5 m gap); soul parts readable; racer kit reads; no clipping; grounded. Note: pommel sphere sits slightly proud of the grip per the part's own node layout (pommel z+0.12 in weapon-scrapblade.glb) — matches part design, not a pose defect; will cross-check against neutral M-2. The batch runner died post-render (pre-commit); v2 committed manually.
