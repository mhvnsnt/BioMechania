"""Render one Lane B shot: transition hybrid (T-25/T-50/T-75), thruster
ignition (T-IGN), or breach-entry beat (B-1/B-2/B-3). Still image only.

Usage:
    blender -b --python tools/render/render_transition.py -- \\
        --build scout --shot T-50 \\
        --out docs/renders/scout/T-50.png \\
        [--res 1280x720] [--samples 64] [--parts-dir public/mecha/parts]

Transition direction per build (the only part-swap each build offers):
  scout   : racer -> combat
  bruiser : combat -> breach   (bruiser racer/combat share the same part set)
Breach-entry beats stage from the combat-mode base for both builds.

Camera: M-1 hero 3/4 rig for every shot so the 7-frame sequence reads as
one continuous transformation.
"""

import argparse
import os
import sys

import bpy

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from render import assemble, builds, cameras, lighting, soul_part  # noqa: E402
from render import transition as TR  # noqa: E402
from render.render_shot import clear_scene, configure  # noqa: E402

TRANSITION_SHOTS = ("T-25", "T-50", "T-75")
ALL_SHOTS = TRANSITION_SHOTS + ("T-IGN", "B-1", "B-2", "B-3")

# (mode_from, mode_to) for the T-block per build.
DIRECTION = {
    "scout": ("racer", "combat"),
    "bruiser": ("combat", "breach"),
}

# Studio lighting mode per shot (Device 6 accents follow the dominant mode).
LIGHT_MODE = {
    "T-25": None,  # = mode_from
    "T-50": "combat",
    "T-75": "combat",
    "T-IGN": None,  # = mode_to
    "B-1": "combat",
    "B-2": "breach",
    "B-3": "breach",
}


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default="scout", choices=list(builds.BUILDS))
    ap.add_argument("--shot", default="T-50", choices=ALL_SHOTS)
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", default="1280x720")
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--parts-dir", default=None)
    argv = sys.argv
    return ap.parse_args(argv[argv.index("--") + 1:] if "--" in argv else [])


def _all_slot_meshes(d):
    return [o for objs in d.values() for o in objs]


def _grade_tinfo(tinfo, mode_from, mode_to):
    TR.grade_subset(mode_from, _all_slot_meshes(tinfo["from_objs"]))
    TR.grade_subset(mode_to, _all_slot_meshes(tinfo["to_objs"]))


def render_transition_shot(args, parts_dir, build, shot):
    mode_from, mode_to = DIRECTION[build]
    light_mode = LIGHT_MODE[shot] or (
        mode_from if shot == "T-25" else mode_to)
    lighting.setup_studio(light_mode)
    if light_mode == "breach":
        # Lane B: tame the breach under-glow for reveal/ignition beats. The
        # shared rig's 220W point light sits inside the small breach mech's
        # leg volume and blows the legs out to white (measured 2026-10-10).
        # 110W keeps the hot-from-below read. Lane A mode heroes keep 220W.
        ug = bpy.data.objects.get("breach_underglow")
        if ug is not None:
            ug.data.energy = 110.0

    if shot in TRANSITION_SHOTS:
        tinfo = TR.assemble_transition(build, mode_from, mode_to, parts_dir)
        _grade_tinfo(tinfo, mode_from, mode_to)
        TR.apply_shot_state(tinfo, shot)
        # Soul rides the identity-carrying head: the retracting from-head at
        # T-25/T-50, the seating to-head at T-75.
        head_src = "from_objs" if shot in ("T-25", "T-50") else "to_objs"
        soul = soul_part.place_soul(TR.soul_shim(tinfo, head_src))
        dropped = assemble.ground_mech(tinfo["mech_root"])
        info_summary = {
            "root": tinfo["mech_root"], "H": tinfo["H"],
            "from": mode_from, "to": mode_to,
        }
    elif shot == "T-IGN":
        spec_to = builds.BUILDS[build][mode_to]
        spec_from = builds.BUILDS[build][mode_from]
        info = assemble.assemble_mech(spec_to, parts_dir, undersuit=True)
        TR.grade_subset(mode_to, assemble.mech_meshes(info["mech_root"]))
        # Departed from-parts: stowed in an arc, not vanished (gate 3).
        N_from = TR.spec_generation(spec_from, parts_dir)
        from_parts = TR.import_spec_parts(spec_from, parts_dir, N_from)
        H = TR.mech_height(info)
        TR.grade_subset(mode_from, _all_slot_meshes(from_parts))
        TR.stow_cluster(info, from_parts, H)
        soul = soul_part.place_soul(info)
        TR.thruster_flash(info)
        dropped = assemble.ground_mech(info["mech_root"])
        info_summary = {"root": info["mech_root"], "H": H,
                        "from": mode_from, "to": mode_to}
    elif shot == "B-1":
        spec_base = builds.BUILDS[build]["combat"]
        spec_breach = builds.BUILDS[build]["breach"]
        info = assemble.assemble_mech(spec_base, parts_dir, undersuit=True)
        TR.grade_subset("combat", assemble.mech_meshes(info["mech_root"]))
        r = TR.make_restraints(info)
        TR.release_restraints(r, 1.0)
        N_br = TR.spec_generation(spec_breach, parts_dir)
        breach_parts = TR.import_spec_parts(spec_breach, parts_dir, N_br)
        H = TR.mech_height(info)
        TR.grade_subset("breach", _all_slot_meshes(breach_parts))
        TR.inbound_parts(info, breach_parts, H)
        soul = soul_part.place_soul(info)
        dropped = assemble.ground_mech(info["mech_root"])
        info_summary = {"root": info["mech_root"], "H": H,
                        "from": "combat", "to": "breach"}
    elif shot in ("B-2", "B-3"):
        spec_breach = builds.BUILDS[build]["breach"]
        info = assemble.assemble_mech(spec_breach, parts_dir, undersuit=True)
        TR.grade_subset("breach", assemble.mech_meshes(info["mech_root"]))
        # Restraints were worn in combat; show them jettisoned on the ground.
        r = TR.make_restraints(info)
        soul = soul_part.place_soul(info)
        dropped = assemble.ground_mech(info["mech_root"])
        TR.jettison_restraints(r, info["mech_root"])
        TR.undersuit_heat()
        if shot == "B-3":
            TR.weapon_warmup(info)
        info_summary = {"root": info["mech_root"],
                        "H": TR.mech_height(info),
                        "from": "combat", "to": "breach"}
    else:
        raise ValueError(f"unknown lane-B shot {shot}")

    mn, mx = assemble.mesh_bounds(assemble.mech_meshes(info_summary["root"]))
    cameras.rig_for_shot("M-1", bounds=(mn, mx))
    return info_summary, dropped, soul


def main():
    args = parse_args()
    parts_dir = args.parts_dir or os.path.join(os.getcwd(), "public",
                                               "mecha", "parts")
    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    clear_scene()
    configure(args.samples, args.res)
    summary, dropped, soul = render_transition_shot(
        args, parts_dir, args.build, args.shot.upper())

    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {out}")
    print(f"  lane=B build={args.build} shot={args.shot} "
          f"{summary['from']}->{summary['to']} H={summary['H']:.2f} "
          f"ground_drop={dropped:.3f}")
    print(f"  soul face z={soul['face_anchor'].location.z:.3f} "
          f"sigil z={soul['sigil_anchor'].location.z:.3f}")


if __name__ == "__main__":
    main()
