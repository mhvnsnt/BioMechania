"""Mech assembly: part GLBs -> socket-parented mech in canonical render space.

Canonical space: Z-up, forward = +Y, mech-left = +X, ground at z = 0.
Part generations are normalized per tools/render/generation.py.

Assembly hierarchy (all under mech_root):
    mech_root
    └── torso_anchor                      (torso part objects, normalized)
        ├── head_anchor       @ socket_head
        │   └── head part objects
        ├── arms_anchor       @ midpoint(socket_arm_l, socket_arm_r)
        │   └── arm pair objects
        ├── legs_anchor       @ midpoint(socket_leg_l, socket_leg_r)
        ├── shoulders_anchor  @ midpoint(socket_shoulder_l, socket_shoulder_r)
        ├── backpack_anchor   @ socket_back
        ├── weapon_anchor     @ arms_anchor + arm-local socket_weapon_r
        ├── undersuit meshes  (parametric dark inner frame)
        └── (soul part placed later by soul_part.py)

Contract notes honored here:
- Pair slots (arms/legs/shoulders) mount ONCE at the socket-pair midpoint.
- Weapon mounts to the arm part's socket_weapon_r (falls back to
  socket_weapon_l, then to socket_arm_r on the torso).
"""

import os
from mathutils import Vector

import bpy

from . import generation as genmod
from .builds import SOCKETS


def _all_objects():
    return set(bpy.context.scene.objects)


def import_part(parts_dir, pid):
    """Import <pid>.glb from parts_dir/<pid>/; return the new objects."""
    before = _all_objects()
    bpy.ops.import_scene.gltf(
        filepath=os.path.join(parts_dir, pid, pid + ".glb")
    )
    bpy.context.view_layer.update()
    return [o for o in bpy.context.scene.objects if o not in before]


def find_by_name(objects, name):
    for o in objects:
        if o.name == name:
            return o
    return None


def parent_keep(child, parent):
    """Parent child to parent, preserving the child's world transform."""
    bpy.context.view_layer.update()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()
    bpy.context.view_layer.update()


def place_on_anchor(objects, anchor):
    """Seat a part on its anchor: translate the objects so the part's GLB
    origin (its attach point, per the contract) lands exactly on the
    anchor's world position, then parent (keeping the seated transform).

    NOTE: plain parent_keep() is NOT enough here — it preserves the world
    transform, which would leave every part sitting at the scene origin
    instead of at its socket. This was caught by per-slot bbox debug
    (2026-10-09): parts must be TRANSLATED onto their anchors.
    """
    from mathutils import Matrix

    bpy.context.view_layer.update()
    target = anchor.matrix_world.translation.copy()
    T = Matrix.Translation(target)
    for o in objects:
        o.matrix_world = T @ o.matrix_world
    bpy.context.view_layer.update()
    for o in objects:
        parent_keep(o, anchor)


def make_anchor(name, location, parent):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=location)
    a = bpy.context.active_object
    a.name = name
    if parent is not None:
        parent_keep(a, parent)
    bpy.context.view_layer.update()
    return a


def apply_normalization(objects, N):
    """Apply the 3x3 generation-normalization matrix to object transforms."""
    if N == genmod.IDENTITY:
        return
    for o in objects:
        o.matrix_world = N.to_4x4() @ o.matrix_world
    bpy.context.view_layer.update()


def _undersuit_material():
    m = bpy.data.materials.get("undersuit_dark")
    if m is None:
        m = bpy.data.materials.new("undersuit_dark")
        m.use_nodes = True
        bsdf = m.node_tree.nodes["Principled BSDF"]
        # Near-black inner frame. Exempt from mode grading (name-based).
        bsdf.inputs["Base Color"].default_value = (0.045, 0.05, 0.06, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.55
        bsdf.inputs["Roughness"].default_value = 0.5
    return m


def _strut(a, b, radius, mat, name):
    a, b = Vector(a), Vector(b)
    d = b - a
    if d.length < 1e-6:
        return None
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=d.length, location=(a + b) / 2
    )
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    bpy.context.view_layer.update()
    o.data.materials.append(mat)
    return o


def build_undersuit(sock, torso_anchor):
    """Device 9 — parametric dark inner frame fitted to the torso's measured
    socket layout. Same design language + same dark material in every mode;
    parametric (not one rigid mesh) because the shipped part generations
    have different socket spacings (see generation.py)."""
    mat = _undersuit_material()
    parts = []
    head = Vector(sock["socket_head"])
    arm_l, arm_r = Vector(sock["socket_arm_l"]), Vector(sock["socket_arm_r"])
    leg_l, leg_r = Vector(sock["socket_leg_l"]), Vector(sock["socket_leg_r"])
    leg_mid = (leg_l + leg_r) / 2

    parts.append(_strut(leg_mid, head - Vector((0, 0, 0.10)), 0.055, mat, "undersuit_spine"))
    parts.append(_strut(leg_l, leg_r, 0.045, mat, "undersuit_hip"))
    parts.append(_strut(arm_l, arm_r, 0.045, mat, "undersuit_shoulder_bar"))
    parts.append(_strut(head - Vector((0, 0, 0.12)), head, 0.04, mat, "undersuit_neck"))
    for side, p in (("l", arm_l), ("r", arm_r)):
        parts.append(_strut(p, p - Vector((0, 0, 0.30)), 0.04, mat, f"undersuit_armstub_{side}"))
    for side, p in (("l", leg_l), ("r", leg_r)):
        parts.append(_strut(p, p - Vector((0, 0, 0.45)), 0.05, mat, f"undersuit_legstub_{side}"))

    parts = [p for p in parts if p is not None]
    for p in parts:
        parent_keep(p, torso_anchor)
    return parts


def assemble_mech(spec, parts_dir, undersuit=True):
    """Assemble one mode's 7-slot part set. Returns a dict:

    {
      'mech_root', 'torso_anchor', 'anchors': {slot: empty},
      'sock': {socket_name: Vector (canonical torso space)},
      'slot_meshes': {slot: [mesh objects]},
      'generation': 'old' | 'new',
      'undersuit': [objects],
    }
    """
    info = {}
    info["mech_root"] = make_anchor("mech_root", (0, 0, 0), None)
    info["torso_anchor"] = make_anchor(
        "torso_anchor", (0, 0, 0), info["mech_root"]
    )

    # --- torso first: it carries the sockets + sets the generation ---
    tobjs = import_part(parts_dir, spec["torso"])
    sock_empties = {}
    for s in SOCKETS:
        e = find_by_name(tobjs, s)
        if e is None:
            raise RuntimeError(
                f"torso part {spec['torso']} is missing socket empty '{s}'"
            )
        sock_empties[s] = e
    bpy.context.view_layer.update()
    raw_head = sock_empties["socket_head"].matrix_world.translation.copy()
    generation = genmod.detect_generation(raw_head)
    N = genmod.normalize_matrix(generation)
    info["generation"] = generation

    # Normalized socket positions in canonical torso space.
    sock = {}
    for s, e in sock_empties.items():
        sock[s] = (N.to_4x4() @ e.matrix_world).translation.copy()
    info["sock"] = sock

    apply_normalization(tobjs, N)
    place_on_anchor(tobjs, info["torso_anchor"])
    info["slot_meshes"] = {"torso": [o for o in tobjs if o.type == "MESH"]}

    def mid(a, b):
        return (Vector(sock[a]) + Vector(sock[b])) / 2

    anchors = {}
    anchors["head"] = make_anchor("anchor_head", sock["socket_head"], info["torso_anchor"])
    anchors["arms"] = make_anchor(
        "anchor_arms", mid("socket_arm_l", "socket_arm_r"), info["torso_anchor"]
    )
    anchors["legs"] = make_anchor(
        "anchor_legs", mid("socket_leg_l", "socket_leg_r"), info["torso_anchor"]
    )
    anchors["shoulders"] = make_anchor(
        "anchor_shoulders",
        mid("socket_shoulder_l", "socket_shoulder_r"),
        info["torso_anchor"],
    )
    anchors["backpack"] = make_anchor(
        "anchor_backpack", sock["socket_back"], info["torso_anchor"]
    )
    info["anchors"] = anchors

    # --- remaining slots ---
    weapon_socket_local = None
    for slot in ("head", "arms", "legs", "shoulders", "backpack"):
        objs = import_part(parts_dir, spec[slot])
        if slot == "arms":
            # Capture the weapon-mount socket BEFORE parenting/normalization.
            wprobe = find_by_name(objs, "socket_weapon_r") or find_by_name(
                objs, "socket_weapon_l"
            )
            if wprobe is not None:
                weapon_socket_local = wprobe.location.copy()
        apply_normalization(objs, N)
        place_on_anchor(objs, anchors[slot])
        info["slot_meshes"][slot] = [o for o in objs if o.type == "MESH"]

    # --- weapon: mounts to the ARM part's socket_weapon_r ---
    # (contract extension; falls back to socket_weapon_l, then socket_arm_r)
    if weapon_socket_local is not None:
        # Arm-local offset from the pair midpoint (the arm GLB origin).
        weapon_pos = Vector(anchors["arms"].location) + (
            N.to_4x4() @ weapon_socket_local
        ).to_3d()
    else:
        weapon_pos = Vector(sock["socket_arm_r"])
    anchors["weapon"] = make_anchor("anchor_weapon", weapon_pos, info["torso_anchor"])
    wobjs = import_part(parts_dir, spec["weapon"])
    apply_normalization(wobjs, N)
    place_on_anchor(wobjs, anchors["weapon"])
    info["slot_meshes"]["weapon"] = [o for o in wobjs if o.type == "MESH"]

    if undersuit:
        info["undersuit"] = build_undersuit(sock, info["torso_anchor"])
    else:
        info["undersuit"] = []

    bpy.context.view_layer.update()
    return info


def mech_meshes(mech_root):
    """All MESH objects under the mech root (excludes ground/lights/cameras)."""
    return [o for o in mech_root.children_recursive if o.type == "MESH"]


def mesh_bounds(objects):
    """World-space (min, max) over mesh objects' bound boxes."""
    from mathutils import Vector as V

    mn = V((1e9,) * 3)
    mx = V((-1e9,) * 3)
    for o in objects:
        if o.type != "MESH":
            continue
        for c in o.bound_box:
            w = o.matrix_world @ V(c)
            mn = V(map(min, mn, w))
            mx = V(map(max, mx, w))
    return mn, mx


def ground_mech(mech_root):
    """Shift mech_root so the lowest mesh point sits exactly on z = 0."""
    bpy.context.view_layer.update()
    mn, _mx = mesh_bounds(mech_meshes(mech_root))
    mech_root.location.z -= mn.z
    bpy.context.view_layer.update()
    return mn.z
