"""Debug: assemble a build+mode, print per-slot world bboxes. No render."""
import os, sys
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))
import bpy
from render import assemble, builds, soul_part, grade

build, mode = sys.argv[sys.argv.index("--") + 1:][:2]
parts_dir = os.path.join(os.getcwd(), "public", "mecha", "parts")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

spec = builds.BUILDS[build][mode]
info = assemble.assemble_mech(spec, parts_dir, undersuit=True)
grade.grade_materials(mode)
soul = soul_part.place_soul(info)
assemble.ground_mech(info["mech_root"])
bpy.context.view_layer.update()

for slot, meshes in info["slot_meshes"].items():
    mn, mx = assemble.mesh_bounds(meshes)
    print(f"{slot:10s} min=({mn.x:6.3f},{mn.y:6.3f},{mn.z:6.3f}) "
          f"max=({mx.x:6.3f},{mx.y:6.3f},{mx.z:6.3f})")
fa = soul["face_anchor"]
sa = soul["sigil_anchor"]
print("face world:", tuple(round(v, 3) for v in (fa.matrix_world.translation)))
print("sigil world:", tuple(round(v, 3) for v in (sa.matrix_world.translation)))
print("anchors:")
for k, a in info["anchors"].items():
    print(f"  {k:10s} world:", tuple(round(v, 3) for v in (a.matrix_world.translation)))
print("generation:", info["generation"])
