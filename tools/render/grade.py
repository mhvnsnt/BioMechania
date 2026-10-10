"""Mode color identity — Device 6 (design study §8).

Each mode gets a color-identity shift, not just a geometry shift:
  racer  = cool/dark with aero accent stripes (warm accents remap to cyan)
  combat = base livery at full saturation + armor-band highlights
  breach = base livery pushed hotter + glow accents (restraint-release look)

The soul part (soul_*) and undersuit (undersuit_dark) keep their colors in
ALL modes — they are the visual anchors (QC gate 1).

Reproducible: every treatment below is a closed-form HSV remap of the
part's authored base color. Exact parameters are documented in
tools/render/README.md § "Mode color grades".
"""

import colorsys

import bpy

EXEMPT_PREFIXES = ("soul_", "undersuit", "ground")


def _principled(mat):
    if not mat.use_nodes:
        return None
    for n in mat.node_tree.nodes:
        if n.type == "BSDF_PRINCIPLED":
            return n
    return None


def _hue_lerp(h1, h2, t):
    """Shortest-path hue interpolation."""
    d = (h2 - h1 + 0.5) % 1.0 - 0.5
    return (h1 + d * t) % 1.0


def _grade_color(mode, r, g, b, emissive):
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if mode == "racer":
        if emissive:
            return (0.25, 0.80, 1.0)
        if s < 0.08:  # achromatic armor -> cool steel
            return colorsys.hsv_to_rgb(0.58, 0.18, v * 0.85)
        h = _hue_lerp(h, 0.58, 0.45)
        return colorsys.hsv_to_rgb(h, min(1.0, s * 0.72), v * 0.82)
    if mode == "combat":
        if emissive:
            return (r, g, b)
        if s < 0.08:
            return (r, min(1.0, g * 1.06), min(1.0, b * 1.06))
        return colorsys.hsv_to_rgb(h, min(1.0, s * 1.45), min(1.0, v * 1.06))
    if mode == "breach":
        if emissive:
            return (1.0, 0.30, 0.06)
        if s < 0.08:  # achromatic armor -> hot tint
            return colorsys.hsv_to_rgb(0.05, 0.25, v * 0.95)
        h = _hue_lerp(h, 0.045, 0.50)
        return colorsys.hsv_to_rgb(h, min(1.0, s * 1.15), v * 0.92)
    raise ValueError(f"unknown mode {mode}")


def _is_accent(r, g, b):
    h, s, _v = colorsys.rgb_to_hsv(r, g, b)
    return s > 0.45 and (h < 0.13 or h > 0.90)


def grade_materials(mode):
    """Apply the mode color treatment to every imported part material."""
    for mat in bpy.data.materials:
        if mat.name.startswith(EXEMPT_PREFIXES):
            continue
        bsdf = _principled(mat)
        if bsdf is None:
            continue
        base_in = bsdf.inputs.get("Base Color")
        emis_in = bsdf.inputs.get("Emission Color")
        estr_in = bsdf.inputs.get("Emission Strength")
        if base_in is None:
            continue
        r, g, b = base_in.default_value[:3]
        emissive = (
            estr_in is not None and emis_in is not None
            and estr_in.default_value > 0.05
        )
        if emissive:
            er, eg, eb = _grade_color(mode, r, g, b, True)
            emis_in.default_value = (er, eg, eb, 1.0)
            if mode == "racer":
                estr_in.default_value *= 1.25
            elif mode == "combat":
                estr_in.default_value *= 1.30
            elif mode == "breach":
                estr_in.default_value *= 2.20
            continue
        if _is_accent(r, g, b):
            if mode == "racer":
                # aero accent stripes: warm accents become cyan
                _h, _s, v = colorsys.rgb_to_hsv(r, g, b)
                nr, ng, nb = colorsys.hsv_to_rgb(0.52, 0.85, min(1.0, v * 1.05))
            elif mode == "combat":
                h, s, v = colorsys.rgb_to_hsv(r, g, b)
                nr, ng, nb = colorsys.hsv_to_rgb(h, min(1.0, s * 1.3),
                                                min(1.0, v * 1.05))
            else:  # breach: accents go hot orange
                _h, _s, v = colorsys.rgb_to_hsv(r, g, b)
                nr, ng, nb = colorsys.hsv_to_rgb(0.06, 0.95, v)
        else:
            nr, ng, nb = _grade_color(mode, r, g, b, False)
        base_in.default_value = (
            max(0.0, min(1.0, nr)),
            max(0.0, min(1.0, ng)),
            max(0.0, min(1.0, nb)),
            1.0,
        )
    bpy.context.view_layer.update()
