"""Lane C detail shots: weapons, damage states, soul/zone close-ups.

Runs as a Blender background script (same pattern as render_shot.py):

    blender -b --python tools/render/detail_shots.py -- \\
        --shot W-STOW-scrapblade --out docs/renders/weapons/W-STOW-scrapblade.png

Shot ids:
  Weapons: W-STOW-<w>, W-WARM-<w>, W-FIRE-<w>
           w in {scrapblade, siegeplow, core-maul}
           weapon->build/mode: scrapblade=scout/racer, siegeplow=scout/combat,
           core-maul=scout/breach
  Damage:  D-CRACK-<build>, D-WRECK-<build>   (build in {scout, bruiser}, combat mode)
  Soul:    C-SOUL-<build>-<mode>  (tight head close-up; composited into C-SOUL sheet)
  Zone:    C-ZONE-<build>-<mode>  (M-2 ortho profile; composited into C-ZONE sheet)

STILLS ONLY. Effect passes (muzzle flash, glow) are staged procedurally;
the study notes VFX layering comes later — the render must sell the pose.
"""

import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from render import assemble, builds, cameras, grade, lighting, soul_part  # noqa: E402

WEAPON_BUILD_MODE = {
    "scrapblade": ("scout", "racer", "weapon-scrapblade"),
    "siegeplow": ("scout", "combat", "weapon-siegeplow"),
    "core-maul": ("scout", "breach", "core-maul"),
}

# Warm emitter glow per weapon (sodium edge / drum feed / molten core).
WEAPON_GLOW = {    "scrapblade": (0.75, 0.95, 1.0),   # sodium cutting edge: cold white-cyan
    "siegeplow": (1.0, 0.45, 0.10),    # drum feed: hot orange
    "core-maul": (1.0, 0.28, 0.06),    # molten core vent: deep orange-red
}

# Meshes that carry the emitter glow (audited from part GLBs 2026-10-10).
# Glowing the whole weapon washed every mesh into a flat monochrome
# silhouette; the brief says EMITTER glowing, so only these meshes glow
# and the housing keeps its authored detail.
EMITTER_MESHES = {
    "scrapblade": ("blade", "edge"),
    "siegeplow": ("muzzle", "barrel", "drum"),
    "core-maul": ("core.001",),
}


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", default="1280x720")
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--parts-dir", default=None)
    argv = sys.argv
    return ap.parse_args(argv[argv.index("--") + 1:] if "--" in argv else [])


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.context.view_layer.update()


def configure(samples, res):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except TypeError:
        pass
    w, h = (int(v) for v in res.lower().split("x"))
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"


def _emission_material(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
    bsdf.inputs["Emission Strength"].default_value = strength
    return m


def _glow_weapon_meshes(info, weapon, strength, only=None):
    """Push the weapon's emitter meshes toward their emitter glow.

    only: iterable of mesh-name prefixes to glow (None = all weapon meshes).
    Names match exactly or with a Blender .NNN duplicate suffix.
    Emitter meshes get single-user material copies first: weapon parts
    share material datablocks, so glowing a shared material would leak the
    glow onto non-emitter meshes (caught 2026-10-10: whole siegeplow
    glowed peach despite the name filter)."""
    color = WEAPON_GLOW[weapon]
    for o in info["slot_meshes"]["weapon"]:
        if o.type != "MESH":
            continue
        if only is not None and not any(
                o.name == p or o.name.startswith(p + ".") for p in only):
            continue
        for i, ms in enumerate(o.data.materials):
            if ms is not None:
                o.data.materials[i] = ms.copy()
        for ms in o.data.materials:
            if not ms.use_nodes:
                continue
            for n in ms.node_tree.nodes:
                if n.type != "BSDF_PRINCIPLED":
                    continue
                ec = n.inputs.get("Emission Color")
                es = n.inputs.get("Emission Strength")
                if ec is not None:
                    ec.default_value = (*color, 1.0)
                if es is not None:
                    es.default_value = max(es.default_value, strength)
    bpy.context.view_layer.update()


def _weapon_bounds(info, pad=0.30):
    mn, mx = assemble.mesh_bounds(
        [o for o in info["slot_meshes"]["weapon"] if o.type == "MESH"])
    return mn - Vector((pad, pad, pad)), mx + Vector((pad, pad, pad))


# ---------------------------------------------------------------- weapons ---
def stage_weapon_stow(info, weapon):
    """W-STOW: as-assembled weapon in its arm mount. No extra staging —
    the close crop proves the stow point."""
    return {"staged": "none (as-assembled stow)"}


def stage_weapon_warm(info, weapon):
    """W-WARM: emitter glowing, housing open, barrel extending,
    whole-mech flinch."""
    _glow_weapon_meshes(info, weapon, 2.2, only=EMITTER_MESHES[weapon])
    # Housing open: rotate the weapon anchor slightly out of the mount.
    info["anchors"]["weapon"].rotation_euler = (math.radians(-14), 0, 0)
    # Barrel extending: nudge weapon meshes forward (+Y canonical).
    for o in info["slot_meshes"]["weapon"]:
        o.location.y += 0.06
    # Whole-mech flinch: pitch the root back a touch, then re-ground.
    info["mech_root"].rotation_euler = (math.radians(3.5), 0, 0)
    bpy.context.view_layer.update()
    assemble.ground_mech(info["mech_root"])
    return {"staged": "emitter glow + anchor -14deg + barrel +0.06Y + flinch 3.5deg"}


def stage_weapon_fire(info, weapon):
    """W-FIRE: deployed + firing pose, muzzle/emitter effect, recoil."""
    _glow_weapon_meshes(info, weapon, 2.8, only=EMITTER_MESHES[weapon])  # 6.0 blew out weapon detail; muzzle flash carries the heat
    info["anchors"]["weapon"].rotation_euler = (math.radians(-22), 0, 0)
    for o in info["slot_meshes"]["weapon"]:
        o.location.y += 0.10
    bpy.context.view_layer.update()

    # Muzzle point: the actual most-forward VERTEX of the weapon meshes.
    # (Bbox center was wrong: the -22° anchor tilt moves the tip off the
    # bbox center in Z, leaving the flash floating beside the barrel.)
    wmeshes = [o for o in info["slot_meshes"]["weapon"] if o.type == "MESH"]
    tip = None
    for o in wmeshes:
        for v in o.data.vertices:
            w = o.matrix_world @ v.co
            if tip is None or w.y > tip.y:
                tip = w
    # Forward = the weapon anchor's +Y in world space (canonical forward,
    # includes the -22° tilt), so the flash is coaxial with the barrel.
    fwd = (info["anchors"]["weapon"].matrix_world.to_quaternion()
           @ Vector((0, 1, 0)))
    if fwd.length < 1e-6:
        fwd = Vector((0, 1, 0))
    fwd.normalize()

    # Procedural muzzle flash: short emissive cone + spark orbs + point light.
    # Narrow end (-Z) at the muzzle, wide end (+Z) flaring along fwd; the
    # cone base overlaps the tip so the flash visibly touches the barrel.
    fmat = _emission_material("fx_muzzle", (1.0, 0.45, 0.08), 9.0)
    cone_depth = 0.30
    cone_center = tip + fwd * (cone_depth / 2 - 0.05)
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.025, radius2=0.085, depth=cone_depth,
        location=cone_center)
    cone = bpy.context.active_object
    cone.name = "fx_muzzle_cone"
    cone.rotation_euler = fwd.to_track_quat("+Z", "Y").to_euler()
    cone.data.materials.append(fmat)
    # Side vector for spark offsets (perpendicular to fwd).
    side = fwd.cross(Vector((0, 0, 1)))
    if side.length < 1e-6:
        side = Vector((1, 0, 0))
    side.normalize()
    for i, (s, d) in enumerate(((0.03, 0.10), (-0.025, 0.16), (0.008, 0.22))):
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.02, segments=10, ring_count=6,
            location=tip + fwd * d + side * s)
        orb = bpy.context.active_object
        orb.name = f"fx_spark_{i}"
        orb.data.materials.append(fmat)
    bpy.ops.object.light_add(type="POINT",
                             location=tip + fwd * 0.32)
    lamp = bpy.context.active_object
    lamp.name = "fx_muzzle_light"
    lamp.data.energy = 900
    lamp.data.color = (1.0, 0.5, 0.15)

    # Recoil pose: shove the root back and pitch it, then re-ground.
    info["mech_root"].location.y -= 0.12
    info["mech_root"].rotation_euler = (math.radians(5.0), 0, 0)
    bpy.context.view_layer.update()
    assemble.ground_mech(info["mech_root"])
    return {"staged": "emitter glow + muzzle cone/sparks/light + recoil -0.12Y 5deg"}


# ---------------------------------------------------------------- damage ----
def stage_damage_crack(info):
    """D-CRACK: crack torso plating open; dark undersuit + hot under-glow
    visible through the breaks."""
    tmeshes = [o for o in info["slot_meshes"]["torso"] if o.type == "MESH"]

    def vol(o):
        mn, mx = assemble.mesh_bounds([o])
        d = mx - mn
        return d.x * d.y * d.z

    tmeshes.sort(key=vol, reverse=True)
    center = Vector(info["sock"]["socket_back"]) * 0 + Vector((0, 0, 0))
    cracked = []
    for o in tmeshes[:3]:
        mn, mx = assemble.mesh_bounds([o])
        c = (mn + mx) / 2
        d = c - Vector((0, c.y, 1.0))
        d.z = 0
        if d.length < 1e-6:
            d = Vector((0, 1, 0))
        d.normalize()
        o.location += d * 0.07  # 0.045 was unreadable at 1280x720; cracks must read
        cracked.append(o.name)
    bpy.context.view_layer.update()

    # Hot under-glow leaking through the cracks.
    bpy.ops.object.light_add(type="POINT",
                             location=(0, 0.1, info["sock"]["socket_head"].z * 0.55))
    lamp = bpy.context.active_object
    lamp.name = "fx_crack_glow"
    lamp.data.energy = 450  # 260 was too subtle; under-glow must be visible
    lamp.data.color = (1.0, 0.38, 0.10)
    return {"staged": f"cracked plates {cracked} + crack under-glow"}


def stage_damage_wreck(info, soul):
    """D-WRECK: 35%-hull state — head + shoulders + one arm slot hidden
    (destroyed), hot under-glow, slight list. Maximum restraint release
    short of full breach."""
    hidden = []
    # The weapon rode on the destroyed arm — hide it too, or it floats
    # detached in mid-air (caught 2026-10-10 in D-WRECK-scout QC).
    for slot in ("head", "shoulders", "weapon"):
        for o in info["slot_meshes"][slot]:
            o.hide_render = True
            o.hide_viewport = True
            hidden.append(o.name)
    # One arm (mech-left, +X side) destroyed: hide arm meshes with x > 0.
    for o in info["slot_meshes"]["arms"]:
        mn, mx = assemble.mesh_bounds([o])
        if (mn.x + mx.x) / 2 > 0:
            o.hide_render = True
            o.hide_viewport = True
            hidden.append(o.name)
    # The soul face-plate rode on the destroyed head — hide it too.
    for o in soul["face"]:
        o.hide_render = True
        o.hide_viewport = True
    # Restraint-release heat: hot under-glow + hot rim already on breach;
    # here use combat lighting + an added hot point light.
    bpy.ops.object.light_add(type="POINT",
                             location=(0, 0.2, info["sock"]["socket_head"].z * 0.5))
    lamp = bpy.context.active_object
    lamp.name = "fx_wreck_glow"
    lamp.data.energy = 500
    lamp.data.color = (1.0, 0.30, 0.08)
    # Battle list: roll a few degrees, then re-ground.
    info["mech_root"].rotation_euler = (0, math.radians(4.0), 0)
    bpy.context.view_layer.update()
    assemble.ground_mech(info["mech_root"])
    return {"staged": f"hidden {len(hidden)} meshes (head/shoulders/left arm) "
                      f"+ wreck glow + 4deg list"}


# ---------------------------------------------------------------- drivers ---
def assemble_common(build, mode, parts_dir):
    if parts_dir is None:
        parts_dir = os.path.join(os.getcwd(), "public", "mecha", "parts")
    spec = builds.BUILDS[build][mode]
    info = assemble.assemble_mech(spec, parts_dir, undersuit=True)
    grade.grade_materials(mode)
    soul = soul_part.place_soul(info)
    assemble.ground_mech(info["mech_root"])
    return info, soul


def render_weapon(shot, out):
    # shot = W-<STATE>-<weapon>; weapon itself may contain hyphens (core-maul),
    # so strip the W-<STATE>- prefix rather than splitting on the last hyphen.
    # (rsplit("-",1) parsed "core-maul" as "maul" -> KeyError, crashing all 3
    # core-maul shots; found 2026-10-10 during batch.)
    weapon = "-".join(shot.split("-")[2:]).lower()
    state = shot.split("-")[1]
    build, mode, _pid = WEAPON_BUILD_MODE[weapon]
    info, _soul = assemble_common(build, mode, None)
    lighting.setup_studio(mode)
    if state == "STOW":
        staged = stage_weapon_stow(info, weapon)
    elif state == "WARM":
        staged = stage_weapon_warm(info, weapon)
    elif state == "FIRE":
        staged = stage_weapon_fire(info, weapon)
    else:
        raise ValueError(f"unknown weapon state {state}")
    mn, mx = _weapon_bounds(info)
    cameras.frame_mech(35, 10, dist_mul=1.5, bounds=(mn, mx))
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {out} state={state} weapon={weapon} staged={staged}")


def render_damage(shot, out):
    kind = shot.split("-")[1]
    build = shot.split("-")[2].lower()
    info, soul = assemble_common(build, "combat", None)
    lighting.setup_studio("combat")
    if kind == "CRACK":
        staged = stage_damage_crack(info)
    elif kind == "WRECK":
        staged = stage_damage_wreck(info, soul)
    else:
        raise ValueError(f"unknown damage kind {kind}")
    mn, mx = assemble.mesh_bounds(assemble.mech_meshes(info["mech_root"]))
    cameras.rig_for_shot("M-1", bounds=(mn, mx))
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {out} kind={kind} build={build} staged={staged}")


def render_soul_closeup(shot, out):
    # C-SOUL-<build>-<mode>: tight shot of the soul face-plate.
    _c, _s, build, mode = shot.split("-")
    build, mode = build.lower(), mode.lower()
    info, soul = assemble_common(build, mode, None)
    lighting.setup_studio(mode)
    head_objs = [o for o in info["slot_meshes"]["head"] if o.type == "MESH"]
    mn, mx = assemble.mesh_bounds(head_objs + soul["face"])
    cameras.frame_mech(25, 5, dist_mul=1.1, bounds=(mn, mx))
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {out} soul closeup build={build} mode={mode}")


def render_zone_profile(shot, out):
    # C-ZONE-<build>-<mode>: M-2 ortho profile for the color-identity sheet.
    _c, _z, build, mode = shot.split("-")
    build, mode = build.lower(), mode.lower()
    info, _soul = assemble_common(build, mode, None)
    lighting.setup_studio(mode)
    mn, mx = assemble.mesh_bounds(assemble.mech_meshes(info["mech_root"]))
    cameras.rig_for_shot("M-2", bounds=(mn, mx))
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {out} zone profile build={build} mode={mode}")


def main():
    args = parse_args()
    parts_dir = args.parts_dir or os.path.join(os.getcwd(), "public", "mecha", "parts")
    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    clear_scene()
    configure(args.samples, args.res)

    shot = args.shot.upper()
    if shot.startswith("W-"):
        render_weapon(shot, out)
    elif shot.startswith("D-"):
        render_damage(shot, out)
    elif shot.startswith("C-SOUL-"):
        render_soul_closeup(shot, out)
    elif shot.startswith("C-ZONE-"):
        render_zone_profile(shot, out)
    else:
        raise ValueError(f"unknown lane-C shot {shot}")


if __name__ == "__main__":
    main()
