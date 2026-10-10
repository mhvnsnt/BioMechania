"""Render one pipeline shot (still image).

Usage:
    blender -b --python tools/render/render_shot.py -- \\
        --build scout --mode racer --shot M-1 \\
        --out docs/renders/scout/M-1-racer.png \\
        [--res 1920x1080] [--samples 128] [--parts-dir public/mecha/parts]

STILLS ONLY — this pipeline never produces animation or video.

Pipeline order per shot:
  1. clear scene, configure Cycles
  2. studio lighting (per-mode light colors)
  3. assemble build+mode (generation normalization, socket parenting)
  4. mode color grade (Device 6; soul + undersuit exempt)
  5. soul part placement (Device 1; identical geometry every mode)
  6. ground the mech (feet on z=0)
  7. camera rig for the shot id, render PNG
"""

import argparse
import os
import sys

import bpy

# Make `render` importable as a package (this file runs as __main__).
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from render import assemble, builds, cameras, grade, lighting, soul_part  # noqa: E402


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default="scout", choices=list(builds.BUILDS))
    ap.add_argument("--mode", default="racer", choices=list(builds.MODES))
    ap.add_argument("--shot", default="M-1",
                    choices=list(cameras.SHOTS))
    ap.add_argument("--out", required=True)
    ap.add_argument("--res", default="1280x720")
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--parts-dir", default=None)
    argv = sys.argv
    args = ap.parse_args(argv[argv.index("--") + 1:] if "--" in argv else [])
    return args


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


def main():
    args = parse_args()
    parts_dir = args.parts_dir or os.path.join(os.getcwd(), "public", "mecha", "parts")
    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    clear_scene()
    configure(args.samples, args.res)
    lighting.setup_studio(args.mode)

    spec = builds.BUILDS[args.build][args.mode]
    info = assemble.assemble_mech(spec, parts_dir, undersuit=True)
    grade.grade_materials(args.mode)
    soul = soul_part.place_soul(info)
    dropped = assemble.ground_mech(info["mech_root"])

    mn, mx = assemble.mesh_bounds(assemble.mech_meshes(info["mech_root"]))
    cameras.rig_for_shot(args.shot, bounds=(mn, mx))

    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)

    height = mx.z - mn.z
    n_meshes = len(assemble.mech_meshes(info["mech_root"]))
    print(f"RENDERED {out}")
    print(f"  build={args.build} mode={args.mode} shot={args.shot} "
          f"generation={info['generation']}")
    print(f"  mech height={height:.3f} meshes={n_meshes} "
          f"ground_drop={dropped:.3f}")
    print(f"  soul face z={soul['face_anchor'].location.z:.3f} "
          f"sigil z={soul['sigil_anchor'].location.z:.3f}")


if __name__ == "__main__":
    main()
