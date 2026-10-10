# BioMechania Renders

Production stills for the starter builds, rendered with the pipeline in
`tools/render/` (see its README for the assembly, soul-part, grading,
camera, and lighting specs).

## Naming convention

```
docs/renders/<build>/<shot-id>.png
```

- `<build>` — internal working-label build id: `scout`, `bruiser`.
  **Display names are TBD** — per the owner's naming law (2026-10-09),
  "Scout"/"Bruiser" are retired as public names; the owner picks
  replacements personally from a naming slate, and a final rename pass
  applies them. Never treat the directory names as final public names.
- `<shot-id>` — `<block>-<n>-<mode>`, e.g. `M-1-racer.png`,
  `T-50-combat.png`, `W-FIRE-siegeplow.png`.

## Shot list (per build — `docs/MECHA_DESIGN_STUDY.md` §9)

| Block | Shot ids | Count |
|---|---|---|
| Mode heroes (§9.1) | `M-1-<mode>` 3/4 front hero, `M-2-<mode>` ortho side profile, `M-3-<mode>` rear power read — for racer, combat, breach | 9 |
| Transition hybrids (§9.2) | `T-25`, `T-50`, `T-75`, `T-IGN` (racer→combat freeze frames) | 4 |
| Breach entry (§9.3) | `B-1` restraint release, `B-2` reveal + palette shift, `B-3` weapon payoff | 3 |
| Weapon callouts (§9.4) | `W-STOW-<weapon>`, `W-WARM-<weapon>`, `W-FIRE-<weapon>` per weapon | 2–3/weapon |
| Characteristic callouts (§9.5) | `C-SOUL` soul-part constancy sheet, `C-ZONE` mode color-identity sheet | 2 |
| Turnarounds (§9.6) | `T-FRONT`, `T-SIDE`, `T-BACK` neutral stance | 3 |
| Damage states (§9.7) | `D-CRACK` cracked plating, `D-WRECK` 35%-hull state | 2 |

**Current status (foundation build):** smoke-test heroes only —
`scout/M-1-racer.png`, `scout/M-1-combat.png`, `scout/M-1-breach.png`.
The pipeline assembles a **neutral stance**; dynamic per-shot posing
(racer tuck, combat planted weapon pose, breach restraint-release) is
the render lanes' pass on top of this foundation. The full
~25-shot-per-build production is the render lanes' work, using
this pipeline. Every shot must pass the 6 QC gates (§9.9): soul-part
constancy, mode delta, no mass vanish, no clipping, hybrid readability,
grounding.

## Render QC checklist (per shot, before it ships)

1. Soul-part constancy — face-plate/optics read identically across the
   build's mode shots.
2. Mode delta — silhouette + color identity unmistakable between modes.
3. No mass vanish — every part accounted for across modes.
4. No clipping — parts never interpenetrate (hybrids included).
5. Hybrid readability — T-50 reads as intentional, not broken.
6. Grounding — feet on the ground plane, facing matches stance,
   left/right symmetry on paired parts.
