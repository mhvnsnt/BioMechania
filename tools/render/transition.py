"""Transition + breach-entry staging for Lane B (design study §8 Device 2, §9.3).

Mid-transformation hybrids mount BOTH the from-mode and to-mode part sets on
the same anchor skeleton (built from the from-mode torso), with per-slot
travel offsets frozen at the spec's beat frames (6 / 12 / 18 of 24).
Breach-entry beats (B-1..B-3) stage per §9.3 with modeled restraint
hardware (Device 4 — restraints are geometry, not texture).

Blending rules honored (§8): rigid plates mid-travel (parts translate/rotate
as rigid bodies, never morph); travel routes follow panel lines (outward
along each slot's depart vector); color carry-over per part (from-parts keep
their mode grade, to-parts carry theirs — see grade_subset); limit
simultaneous movers (beat order: head → limbs → torso/backpack → lock);
no mass vanish (every part visible or explicitly stowed); soul locked and
readable every frame (placed on the identity-carrying head per shot).
"""

import math
from mathutils import Vector

import bpy

from . import assemble, builds
from . import generation as genmod
from . import grade as grademod


# Depart vectors in canonical space, as fractions of mech height H.
# Direction each slot's parts travel when leaving/entering the body.
DEPART = {
    "head":      ( 0.00, -0.15,  0.50),
    "torso":     ( 0.00, -0.10,  0.60),
    "arms":      ( 0.00,  0.00,  0.38),
    "legs":      ( 0.00,  0.00,  0.32),
    "shoulders": ( 0.00,  0.00,  0.45),
    "backpack":  ( 0.00, -0.38,  0.30),
    "weapon":    ( 0.38,  0.00,  0.28),
}

SLOTS = ("head", "torso", "arms", "legs", "shoulders", "backpack", "weapon")

# Per-shot state: slot -> (j_from, k_to, to_visible).
# j_from: 0 = seated, 1 = fully departed. k_to: 1 = far inbound, 0 = seated.
# T-25 = frame 6, T-50 = frame 12, T-75 = frame 18 (study §8 Device 2).
SHOT_STATES = {
    "T-25": {
        # Frames 0-6: head retracts, aero releases. Combat parts stowed
        # (Device 3: combat-only armor retracts in racer mode) except the
        # head, which begins its descent early for readability — kept close
        # (0.35) so it doesn't stretch the framing.
        "head":      ("retract", 0.35, True),
        "torso":     (0.00, 1.00, False),
        "arms":      (0.12, 1.00, False),
        "legs":      (0.12, 1.00, False),
        "shoulders": (0.12, 1.00, False),
        "backpack":  (0.12, 1.00, False),
        "weapon":    (0.12, 1.00, False),
    },
    "T-50": {
        # Frame 12: SIGNATURE hybrid — inner frame exposed, parts mid-travel.
        # From-parts mid-depart; to-parts clearly separated further out
        # (two distinct streams, never overlapping).
        "head":      (0.70, 0.60, True),
        "torso":     (0.55, 0.80, True),
        "arms":      (0.55, 0.70, True),
        "legs":      (0.55, 0.70, True),
        "shoulders": (0.55, 0.70, True),
        "backpack":  (0.55, 0.70, True),
        "weapon":    (0.55, 0.70, True),
    },
    "T-75": {
        # Frame 18: to-parts nearly seated, from-parts nearly departed.
        "head":      (0.95, 0.12, True),
        "torso":     (0.85, 0.15, True),
        "arms":      (0.90, 0.12, True),
        "legs":      (0.90, 0.12, True),
        "shoulders": (0.90, 0.12, True),
        "backpack":  (0.90, 0.12, True),
        "weapon":    (0.90, 0.12, True),
    },
}

# To-parts ride 2.0x further out than from-parts along the same depart line,
# so "inbound" and "departing" read as distinct streams, never overlapping.
INBOUND_MUL = 2.0


def _obj_materials(objects):
    mats = []
    seen = set()
    for o in objects:
        if o.type != "MESH":
            continue
        for m in o.data.materials:
            if m is not None and m.name not in seen:
                seen.add(m.name)
                mats.append(m)
    return mats


def grade_subset(mode, objects):
    """Grade only the materials used by the given objects."""
    grademod.grade_materials(mode, materials=_obj_materials(objects))


def mech_height(info):
    mn, mx = assemble.mesh_bounds(assemble.mech_meshes(info["mech_root"]))
    return max(mx.z - mn.z, 0.5)


def assemble_transition(build, mode_from, mode_to, parts_dir):
    """Mount from-mode AND to-mode part sets on one anchor skeleton.

    Returns tinfo dict:
      mech_root, torso_anchor, anchors, sock, N_from,
      from_objs {slot: [objects]}, to_objs {slot: [objects]},
      travel_from {slot: empty}, travel_to {slot: empty},
      undersuit, height H
    """
    spec_from = builds.BUILDS[build][mode_from]
    spec_to = builds.BUILDS[build][mode_to]

    info = assemble.assemble_mech(spec_from, parts_dir, undersuit=True)
    N_from = info["N"]

    # Detect the to-mode generation from its own torso's socket_head.
    # NOTE: the from-torso is already in the scene, so the probe import's
    # empties may be suffixed (.001) — match by prefix within the probe set.
    probe = assemble.import_part(parts_dir, spec_to["torso"])
    e = next((o for o in probe if o.name.startswith("socket_head")), None)
    if e is None:
        raise RuntimeError(f"to-torso {spec_to['torso']} missing socket_head")
    N_to = genmod.normalize_matrix(
        genmod.detect_generation(e.matrix_world.translation.copy()))

    tinfo = {
        "mech_root": info["mech_root"],
        "torso_anchor": info["torso_anchor"],
        "anchors": info["anchors"],
        "sock": info["sock"],
        "undersuit": info["undersuit"],
        "from_objs": {},
        "to_objs": {},
        "travel_from": {},
        "travel_to": {},
        "travel_base": {},
    }

    # Move the from-torso meshes under a travel empty (anchors stay put).
    t_torso_from = assemble.make_anchor(
        "travel_from_torso", (0, 0, 0), info["torso_anchor"])
    t_torso_to = assemble.make_anchor(
        "travel_to_torso", (0, 0, 0), info["torso_anchor"])
    tinfo["travel_from"]["torso"] = t_torso_from
    tinfo["travel_to"]["torso"] = t_torso_to
    tinfo["travel_base"]["torso"] = (t_torso_from.location.copy(),
                                     t_torso_to.location.copy())
    for o in info["slot_meshes"]["torso"]:
        assemble.parent_keep(o, t_torso_from)
    tinfo["from_objs"]["torso"] = info["slot_meshes"]["torso"]
    assemble.place_on_anchor(probe, t_torso_to)
    tinfo["to_objs"]["torso"] = [o for o in probe if o.type == "MESH"]

    # Remaining slots: reparent from-parts under travel empties, import
    # to-parts onto sibling travel empties.
    for slot in ("head", "arms", "legs", "shoulders", "backpack"):
        anchor = info["anchors"][slot]
        aloc = anchor.matrix_world.translation.copy()
        tf = assemble.make_anchor(f"travel_from_{slot}", aloc, anchor)
        tt = assemble.make_anchor(f"travel_to_{slot}", aloc, anchor)
        tinfo["travel_from"][slot] = tf
        tinfo["travel_to"][slot] = tt
        # Local base positions (travel empties start exactly on the anchor).
        tinfo["travel_base"][slot] = (tf.location.copy(), tt.location.copy())
        for o in info["slot_meshes"][slot]:
            assemble.parent_keep(o, tf)
        tinfo["from_objs"][slot] = info["slot_meshes"][slot]
        objs = assemble.import_part(parts_dir, spec_to[slot])
        assemble.apply_normalization(objs, N_to)
        assemble.place_on_anchor(objs, tt)
        tinfo["to_objs"][slot] = [o for o in objs if o.type == "MESH"]

    # Weapon: mounts to the from-arm's weapon socket position.
    anchor = info["anchors"]["weapon"]
    aloc = anchor.matrix_world.translation.copy()
    tf = assemble.make_anchor("travel_from_weapon", aloc, anchor)
    tt = assemble.make_anchor("travel_to_weapon", aloc, anchor)
    tinfo["travel_from"]["weapon"] = tf
    tinfo["travel_to"]["weapon"] = tt
    tinfo["travel_base"]["weapon"] = (tf.location.copy(), tt.location.copy())
    for o in info["slot_meshes"]["weapon"]:
        assemble.parent_keep(o, tf)
    tinfo["from_objs"]["weapon"] = info["slot_meshes"]["weapon"]
    wobjs = assemble.import_part(parts_dir, spec_to["weapon"])
    assemble.apply_normalization(wobjs, N_to)
    assemble.place_on_anchor(wobjs, tt)
    tinfo["to_objs"]["weapon"] = [o for o in wobjs if o.type == "MESH"]

    bpy.context.view_layer.update()
    tinfo["H"] = mech_height(tinfo)
    return tinfo


def _set_visible(objects, visible):
    for o in objects:
        o.hide_viewport = not visible
        o.hide_render = not visible
    bpy.context.view_layer.update()


def apply_shot_state(tinfo, shot):
    """Freeze the transition at a beat frame. shot in T-25/T-50/T-75."""
    H = tinfo["H"]
    state = SHOT_STATES[shot]
    head_h = 0.3
    hm = assemble.mesh_bounds(
        [o for o in tinfo["from_objs"]["head"] if o.type == "MESH"])
    head_h = max(hm[1].z - hm[0].z, 0.2)

    for slot in SLOTS:
        j, k, vis = state[slot]
        dv = Vector(DEPART[slot]) * H
        tf = tinfo["travel_from"][slot]
        tt = tinfo["travel_to"][slot]
        base_f, base_t = tinfo["travel_base"][slot]

        if j == "retract":
            # Beat 1: head assembly retracts/folds toward the torso.
            tf.location = base_f + Vector((0, 0, -0.30 * head_h))
        else:
            tf.location = base_f + dv * j
            if slot == "backpack" and j > 0:
                # Backpack swings as it departs (racer aero cowl release).
                tf.rotation_euler = (j * 0.9, 0, 0)
        tt.location = base_t + dv * (k * INBOUND_MUL)
        if slot == "backpack" and k > 0:
            # Inbound pack counter-rotates toward its upright seat.
            tt.rotation_euler = (-k * 0.9, 0, 0)
        _set_visible(tinfo["to_objs"][slot], vis)
    _set_visible(tinfo["from_objs"]["head"] +
                 [o for s in SLOTS if s != "head"
                  for o in tinfo["from_objs"][s]], True)
    bpy.context.view_layer.update()


def soul_shim(tinfo, head_slot):
    """Build the info shim place_soul() needs, keyed to one head set."""
    return {
        "slot_meshes": {
            "head": [o for o in tinfo[head_slot]["head"] if o.type == "MESH"],
            "torso": [o for o in tinfo[head_slot]["torso"] if o.type == "MESH"],
        },
        "anchors": tinfo["anchors"],
        "torso_anchor": tinfo["torso_anchor"],
    }


# ---------------------------------------------------------------------------
# Restraint hardware — Device 4 (EVA restraint language, modeled geometry).
# ---------------------------------------------------------------------------

def _restraint_material():
    m = bpy.data.materials.get("restraint_steel")
    if m is None:
        m = bpy.data.materials.new("restraint_steel")
        m.use_nodes = True
        bsdf = m.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (0.22, 0.20, 0.19, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.4
    return m


def _band(radius, tube, loc, mat, name, parent):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius, minor_radius=tube, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(mat)
    assemble.parent_keep(o, parent)
    bpy.context.view_layer.update()
    return o


def make_restraints(info):
    """Model restraint hardware on an assembled combat mech.

    Returns dict with collar, straps, cuffs, bolts. All parented under
    mech_root (world-ish placement, pre-grounding).
    """
    mat = _restraint_material()
    sock = info["sock"]
    root = info["mech_root"]
    r = {"bolts": []}

    # Neck collar: bolted ring at the neck.
    neck = Vector(sock["socket_head"]) + Vector((0, 0, -0.16))
    collar = _band(0.20, 0.045, neck, mat, "restraint_collar", root)
    r["collar"] = collar
    # Collar bolts: 8 small cubes ringing the collar.
    for i in range(8):
        a = math.radians(i * 45)
        bp = neck + Vector((0.20 * math.cos(a), 0.20 * math.sin(a), 0.05))
        bpy.ops.mesh.primitive_cube_add(size=0.05, location=bp)
        b = bpy.context.active_object
        b.name = f"restraint_bolt_{i}"
        b.data.materials.append(mat)
        assemble.parent_keep(b, root)
        r["bolts"].append(b)

    # Torso strap bands: two constrictive bands across the torso.
    tmn, tmx = assemble.mesh_bounds(
        [o for o in info["slot_meshes"]["torso"] if o.type == "MESH"])
    tw = (tmx.x - tmn.x) / 2
    straps = []
    for i, f in enumerate((0.38, 0.62)):
        z = tmn.z + f * (tmx.z - tmn.z)
        s = _band(tw + 0.06, 0.035, Vector((0, 0, z)), mat,
                  f"restraint_strap_{i}", root)
        straps.append(s)
    r["straps"] = straps

    # Limb joint cuffs at the four limb sockets.
    cuffs = []
    for i, s in enumerate(("socket_arm_l", "socket_arm_r",
                           "socket_leg_l", "socket_leg_r")):
        p = Vector(sock[s])
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.10, depth=0.14, location=p + Vector((0, 0, -0.05)))
        c = bpy.context.active_object
        c.name = f"restraint_cuff_{i}"
        c.data.materials.append(mat)
        assemble.parent_keep(c, root)
        cuffs.append(c)
    r["cuffs"] = cuffs
    bpy.context.view_layer.update()
    return r


def release_restraints(r, amount):
    """Split/snap restraints back (B-1: hardware mid-flight).

    amount 0 = fully worn, 1 = fully released.
    """
    c = r["collar"]
    c.location.z += 0.30 * amount
    c.scale = Vector((1 + 0.25 * amount,) * 3)
    for i, b in enumerate(r["bolts"]):
        # Bolts scatter outward — the violence read.
        d = (b.location - c.location)
        d.z = 0
        if d.length < 1e-6:
            d = Vector((1, 0, 0))
        d = d.normalized()
        b.location = (c.location + d * (0.28 + 0.35 * amount)
                      + Vector((0, 0, 0.10 + 0.12 * ((i * 37) % 5) / 5)))
    for s in r["straps"]:
        s.rotation_euler = (amount * 0.7, 0, 0)
        s.location.z += 0.10 * amount
        s.scale = Vector((1 + 0.18 * amount,) * 3)
    for cf in r["cuffs"]:
        cf.location.z += 0.12 * amount
    bpy.context.view_layer.update()


def jettison_restraints(r, root):
    """Lay the released hardware on the ground beside the mech (B-2/B-3).

    Keeps every part accounted for (QC gate 3) — the cage is OFF, not gone.
    Call AFTER grounding: positions are world targets converted to the
    root's local space.
    """
    off = root.location.copy()  # root-local = world - root.location
    c = r["collar"]
    c.location = Vector((1.05, 0.45, 0.055)) - off
    c.rotation_euler = (math.radians(90), 0, 0)
    c.scale = Vector((1.25,) * 3)
    for i, b in enumerate(r["bolts"]):
        a = math.radians(i * 45 + 12)
        b.location = Vector((1.05 + 0.38 * math.cos(a),
                             0.45 + 0.38 * math.sin(a), 0.03)) - off
    for i, s in enumerate(r["straps"]):
        s.location = Vector((-1.0 - 0.25 * i, 0.55, 0.045)) - off
        s.rotation_euler = (math.radians(90), 0, 0.3 * i)
    for i, cf in enumerate(r["cuffs"]):
        cf.location = Vector((-0.85 + 0.22 * i, -0.5, 0.07)) - off
    bpy.context.view_layer.update()


# ---------------------------------------------------------------------------
# Spec-level part import + stow cluster (T-IGN) + inbound parts (B-1).
# ---------------------------------------------------------------------------

def spec_generation(spec, parts_dir):
    """Detect the generation of a build spec from its torso's socket_head."""
    probe = assemble.import_part(parts_dir, spec["torso"])
    e = next((o for o in probe if o.name.startswith("socket_head")), None)
    if e is None:
        raise RuntimeError(f"torso {spec['torso']} missing socket_head")
    gen = genmod.detect_generation(e.matrix_world.translation.copy())
    N = genmod.normalize_matrix(gen)
    for o in probe:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.context.view_layer.update()
    return N


def import_spec_parts(spec, parts_dir, N):
    """Import all 7 slots of a spec, normalized; returns {slot: [meshes]}."""
    out = {}
    for slot in SLOTS:
        objs = assemble.import_part(parts_dir, spec[slot])
        assemble.apply_normalization(objs, N)
        out[slot] = [o for o in objs if o.type == "MESH"]
    return out


def stow_cluster(info, from_parts, H):
    """T-IGN: park the departed from-mode parts in a tidy arc above/behind
    the mech (QC gate 3 — the old parts are stowed, not vanished)."""
    root = info["mech_root"]
    for i, slot in enumerate(SLOTS):
        pos = Vector(((i - 3) * 0.22 * H, -0.38 * H,
                      1.28 * H + (i % 2) * 0.14 * H))
        stow = assemble.make_anchor(f"stow_{slot}", pos, root)
        stow.rotation_euler = (0.15 * (i % 3 - 1), 0, 0.12 * (i - 3))
        assemble.place_on_anchor(from_parts[slot], stow)
    bpy.context.view_layer.update()


def inbound_parts(info, breach_parts, H):
    """B-1: breach-exclusive parts floating mid-flight above the mech."""
    root = info["mech_root"]
    for i, slot in enumerate(SLOTS):
        pos = Vector(((i - 3) * 0.42, ((i * 37) % 5 - 2) * 0.18,
                      1.18 * H + ((i * 53) % 4) * 0.13))
        ib = assemble.make_anchor(f"inbound_{slot}", pos, root)
        ib.rotation_euler = (0.2 * ((i * 29) % 3 - 1), 0,
                             0.25 * ((i * 41) % 3 - 1))
        assemble.place_on_anchor(breach_parts[slot], ib)
    bpy.context.view_layer.update()

def _flame_material():
    m = bpy.data.materials.get("thruster_flame_fx")
    if m is None:
        m = bpy.data.materials.new("thruster_flame_fx")
        m.use_nodes = True
        bsdf = m.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (1.0, 0.55, 0.12, 1.0)
        bsdf.inputs["Emission Color"].default_value = (1.0, 0.45, 0.08, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 6.0
    return m


def thruster_flash(info, hot=(1.0, 0.45, 0.08)):
    """Ignition punctuation: emissive cones at the backpack thrusters + a
    point flash behind the mech. Created AFTER grading (fx materials are
    session-local)."""
    mat = _flame_material()
    bp = [o for o in info["slot_meshes"]["backpack"] if o.type == "MESH"]
    if not bp:
        return
    mn, mx = assemble.mesh_bounds(bp)
    root = info["mech_root"]
    for i, x in enumerate((-0.22, 0.22)):
        loc = Vector((x, mn.y - 0.10, mn.z + 0.05))
        bpy.ops.mesh.primitive_cone_add(
            radius1=0.09, radius2=0.035, depth=0.42, location=loc)
        cone = bpy.context.active_object
        cone.name = f"thruster_flame_{i}"
        # Cone points down-back: default cone axis is +Z; flip it.
        cone.rotation_euler = (math.radians(200), 0, 0)
        cone.data.materials.append(mat)
        assemble.parent_keep(cone, root)
    mid = (mn + mx) / 2
    bpy.ops.object.light_add(
        type="POINT", location=(mid.x, mn.y - 0.7, mid.z))
    flash = bpy.context.active_object
    flash.name = "ignition_flash"
    flash.data.energy = 400
    flash.data.color = hot
    flash.data.shadow_soft_size = 0.8
    bpy.context.view_layer.update()


def undersuit_heat():
    """Breach reveal: the under-plating runs hot (Device 4). Session-local
    mutation of the shared undersuit material — safe: fresh scene per shot.

    Kept to a hot HINT (0.8): the breach under-glow point light already
    carries the heat, and 1.6 blew the small breach mech out to white
    (measured 2026-10-10 on scout B-2).
    """
    m = bpy.data.materials.get("undersuit_dark")
    if m is None:
        return
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        return
    bsdf.inputs["Emission Color"].default_value = (1.0, 0.22, 0.05, 1.0)
    bsdf.inputs["Emission Strength"].default_value = 0.8
    bpy.context.view_layer.update()


def weapon_warmup(info):
    """B-3: breach-exclusive weapon deploying with warmup glow (Device 5).

    The weapon lifts partway out of its mount and its emitters run hot.
    """
    wobjs = [o for o in info["slot_meshes"]["weapon"] if o.type == "MESH"]
    anchor = info["anchors"]["weapon"]
    # Deploy: lift the weapon group out of the mount along +X (arm side).
    bpy.ops.object.empty_add(type="PLAIN_AXES",
                             location=anchor.matrix_world.translation)
    dep = bpy.context.active_object
    dep.name = "weapon_deploy"
    assemble.parent_keep(dep, anchor)
    for o in wobjs:
        assemble.parent_keep(o, dep)
    dep.location = Vector((0.30, 0.0, 0.12))
    dep.rotation_euler = (0, 0, math.radians(-18))
    # Warmup glow on the weapon's materials.
    for mt in _obj_materials(wobjs):
        bsdf = mt.node_tree.nodes.get("Principled BSDF") if mt.use_nodes else None
        if bsdf is None:
            continue
        bsdf.inputs["Emission Color"].default_value = (1.0, 0.35, 0.08, 1.0)
        estr = bsdf.inputs.get("Emission Strength")
        if estr is not None:
            estr.default_value = max(estr.default_value, 2.5)
    # Whole-mech flinch: slight lean-back on the root.
    info["mech_root"].rotation_euler = (-0.045, 0, 0)
    bpy.context.view_layer.update()
