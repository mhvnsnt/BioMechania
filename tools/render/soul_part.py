"""The soul part — Device 1 (design study §8).

Every biomech carries ONE rigid identity component through transformation:
a head face-plate with a fixed optic arrangement + a chest sigil plate.
The soul part NEVER changes across racer/combat/breach modes: same
geometry, same mount, same colors. When you see the face-plate, you know
whose mech it is regardless of mode.

IMPLEMENTATION: the soul part is built ONCE, deterministically, by
build_soul() below — procedural geometry, no binary asset, so every mode
assembly gets bit-identical geometry and materials by construction.
Placement adapts to each head/torso's MEASURED extents (position offset
only — geometry is never rescaled), and the soul materials are exempt
from the per-mode color grading (QC gate 1: soul-part constancy).

The sigil is an abstract geometric mark, original to BioMechania —
never a faction symbol from another franchise.
"""

from mathutils import Vector

import bpy


def soul_materials():
    """Create (or reuse) the three soul materials. Constant in all modes."""
    defs = {
        "soul_plate": {"color": (0.16, 0.19, 0.24, 1.0), "metallic": 0.7,
                       "rough": 0.35, "emission": None},
        "soul_optic": {"color": (0.55, 0.92, 1.0, 1.0), "metallic": 0.0,
                       "rough": 0.4,
                       "emission": ((0.55, 0.92, 1.0, 1.0), 3.0)},
        "soul_sigil": {"color": (0.55, 0.92, 1.0, 1.0), "metallic": 0.0,
                       "rough": 0.4,
                       "emission": ((0.55, 0.92, 1.0, 1.0), 2.5)},
    }
    mats = {}
    for name, d in defs.items():
        m = bpy.data.materials.get(name)
        if m is None:
            m = bpy.data.materials.new(name)
            m.use_nodes = True
            bsdf = m.node_tree.nodes["Principled BSDF"]
            bsdf.inputs["Base Color"].default_value = d["color"]
            bsdf.inputs["Metallic"].default_value = d["metallic"]
            bsdf.inputs["Roughness"].default_value = d["rough"]
            if d["emission"]:
                ecolor, estr = d["emission"]
                bsdf.inputs["Emission Color"].default_value = ecolor
                bsdf.inputs["Emission Strength"].default_value = estr
        mats[name] = m
    return mats


def _box(name, dims, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = Vector(dims)
    bpy.context.view_layer.update()
    o.data.materials.append(mat)
    return o


def build_face_plate(mats, width=0.30):
    """Canonical face-plate: dark plate + brow bar + fixed twin-optic
    arrangement. Faces +Y (canonical forward). The optic layout is FIXED —
    only the plate width adapts to the head. Returns the objects."""
    objs = []
    plate, optic = mats["soul_plate"], mats["soul_optic"]
    height = 0.20
    # Main plate, 0.035 thick.
    objs.append(_box("soul_face_plate", (width, 0.035, height), (0, 0, 0), plate))
    # Brow bar across the top.
    objs.append(_box("soul_face_brow", (width * 0.85, 0.03, 0.035),
                     (0, 0.004, height / 2 - 0.018), plate))
    # Fixed optic arrangement: twin lenses, symmetric about the centerline,
    # spaced proportionally to the plate width.
    ox = width * 0.22
    for side, x in (("l", -ox), ("r", ox)):
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.040, segments=16, ring_count=8, location=(x, 0.030, 0.012)
        )
        lens = bpy.context.active_object
        lens.name = f"soul_optic_{side}"
        lens.scale = Vector((1.0, 0.55, 1.25))
        bpy.context.view_layer.update()
        lens.data.materials.append(optic)
        objs.append(lens)
    # Center ridge between the optics.
    objs.append(_box("soul_face_ridge", (0.022, 0.028, 0.10), (0, 0.006, 0.005), plate))
    return objs


def build_chest_sigil(mats):
    """Abstract geometric sigil: dark backing + angular broken-diamond mark.
    Original design — not a symbol from any other franchise."""
    objs = []
    plate, _optic, sigil = mats["soul_plate"], mats["soul_optic"], mats["soul_sigil"]
    # Backing plate: 0.24 x 0.17, thin.
    objs.append(_box("soul_sigil_back", (0.24, 0.022, 0.17), (0, 0, 0), plate))
    # Broken diamond: two diagonal bars (chevron halves)...
    import math
    for side, ang in (("l", 38), ("r", -38)):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.016, 0))
        bar = bpy.context.active_object
        bar.name = f"soul_sigil_bar_{side}"
        bar.scale = Vector((0.032, 0.020, 0.120))
        bar.rotation_euler = (0, math.radians(ang), 0)
        bpy.context.view_layer.update()
        bar.data.materials.append(sigil)
        # offset each bar toward its side after rotation
        bar.location.x = -0.044 if side == "l" else 0.044
        bpy.context.view_layer.update()
        objs.append(bar)
    # ...plus the center diamond pip.
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.018, -0.014))
    pip = bpy.context.active_object
    pip.name = "soul_sigil_pip"
    pip.scale = Vector((0.034, 0.020, 0.034))
    pip.rotation_euler = (0, math.radians(45), 0)
    bpy.context.view_layer.update()
    pip.data.materials.append(sigil)
    objs.append(pip)
    return objs


def _bounds_world(objects):
    mn = Vector((1e9,) * 3)
    mx = Vector((-1e9,) * 3)
    for o in objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w))
            mx = Vector(map(max, mx, w))
    return mn, mx


def _surface_y(target_meshes, x, z, fallback_y):
    """Raycast from +Y toward -Y at (x, z); return the front-most surface y
    among the target meshes (ignores soul/undersuit/ground). Falls back to
    fallback_y when the ray hits nothing (e.g. sample point off the part)."""
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    origin = Vector((x, 50.0, z))
    direction = Vector((0.0, -1.0, 0.0))
    hit_y = None
    # Walk all hits along the ray manually: ray_cast returns the closest;
    # re-cast past soul/undersuit hits (shouldn't occur pre-placement, but
    # this keeps the helper safe to reuse after placement too).
    target_ids = {o.as_pointer() for o in target_meshes if o.type == "MESH"}
    for _ in range(8):
        result, loc, _n, _i, obj, _m = bpy.context.scene.ray_cast(
            depsgraph, origin, direction
        )
        if not result or obj is None:
            break
        if obj.as_pointer() in target_ids:
            hit_y = loc.y
            break
        # Skip anything that isn't one of our target part meshes.
        origin = loc - Vector((0.0, 0.001, 0.0))
    if hit_y is None:
        return fallback_y
    return hit_y


def place_soul(info):
    """Position the canonical soul geometry on the assembled mech.

    Placement is computed by RAYCASTING the actual part surfaces, so the
    soul always sits proud of the real geometry (angled breastplates,
    protruding visors) instead of a bbox guess:

    - face-plate: upper face (68% of head height), centered x=0, plate
      front clear of the measured surface + 0.035. The plate covers the
      upper-face zone so the twin optics ARE the face read — the visual
      constant across modes (study §8, Device 1).
    - chest sigil: torso front at 62% torso height, clear of the measured
      chest surface + 0.025.

    Geometry is identical in every mode; only the placement adapts.
    Call AFTER grounding (uses world positions).
    """
    from .assemble import parent_keep

    bpy.context.view_layer.update()
    mats = soul_materials()
    head_meshes = [o for o in info["slot_meshes"]["head"] if o.type == "MESH"]
    torso_meshes = [o for o in info["slot_meshes"]["torso"] if o.type == "MESH"]

    hmn, hmx = _bounds_world(head_meshes)
    tmn, tmx = _bounds_world(torso_meshes)
    head_w = hmx.x - hmn.x

    # --- face-plate: upper face, proud of the measured surface ---
    plate_w = min(0.34, head_w * 0.80)
    z_face = hmn.z + 0.68 * (hmx.z - hmn.z)
    surf_y = _surface_y(head_meshes, 0.0, z_face, hmx.y)
    face = build_face_plate(mats, width=plate_w)
    face_loc = Vector((0.0, surf_y + 0.035, z_face))
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=face_loc)
    face_anchor = bpy.context.active_object
    face_anchor.name = "soul_face_anchor"
    for o in face:
        parent_keep(o, face_anchor)
    parent_keep(face_anchor, info["anchors"]["head"])

    # --- chest sigil: torso front at 62% height, proud of the surface ---
    chest_z = tmn.z + 0.62 * (tmx.z - tmn.z)
    chest_y = _surface_y(torso_meshes, 0.0, chest_z, tmx.y)
    sigil = build_chest_sigil(mats)
    sigil_loc = Vector((0.0, chest_y + 0.025, chest_z))
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=sigil_loc)
    sigil_anchor = bpy.context.active_object
    sigil_anchor.name = "soul_sigil_anchor"
    for o in sigil:
        parent_keep(o, sigil_anchor)
    parent_keep(sigil_anchor, info["torso_anchor"])

    bpy.context.view_layer.update()
    return {"face": face, "sigil": sigil,
            "face_anchor": face_anchor, "sigil_anchor": sigil_anchor}
