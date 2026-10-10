"""Studio lighting — clean 3-point setup, mid-gray seamless.

- Background: mid-gray world (NOT pure white), large ground plane at z=0,
  matte gray. No environment clutter — the mech is the subject.
- Key: large area light, front-left-top. Fill: softer area, front-right.
  Rim: area from behind-top for edge separation.
- Per-mode light color accents (Device 6 support): racer = cool key,
  combat = neutral-warm key, breach = warm key + hot rim + under-glow
  point light (restraint-release heat from below).
- Soft shadows come from the area lights (Cycles).
"""

import math
from mathutils import Vector

import bpy

GROUND_MAT = "ground_mat"


def _ground_material():
    m = bpy.data.materials.get(GROUND_MAT)
    if m is None:
        m = bpy.data.materials.new(GROUND_MAT)
        m.use_nodes = True
        bsdf = m.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (0.35, 0.355, 0.36, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.95
        bsdf.inputs["Metallic"].default_value = 0.0
    return m


def _area(name, color, energy, size, azim_deg, elev_deg, dist):
    az = math.radians(azim_deg)
    el = math.radians(elev_deg)
    loc = Vector((
        dist * math.cos(el) * math.sin(az),
        dist * math.cos(el) * math.cos(az),
        dist * math.sin(el),
    ))
    bpy.ops.object.light_add(type="AREA", location=loc)
    lamp = bpy.context.active_object
    lamp.name = name
    lamp.data.energy = energy
    lamp.data.size = size
    lamp.data.color = color
    # Aim at the origin (mech center height ~1; aim slightly up).
    dv = Vector((0, 0, 1.0)) - loc
    lamp.rotation_euler = dv.to_track_quat("-Z", "Y").to_euler()
    return lamp


MODE_LIGHT = {
    # key color, rim color, under-glow on/off
    "racer": {"key": (0.88, 0.94, 1.06), "rim": (0.65, 0.85, 1.0), "underglow": False},
    "combat": {"key": (1.0, 0.96, 0.90), "rim": (1.0, 0.95, 0.88), "underglow": False},
    "breach": {"key": (1.0, 0.90, 0.78), "rim": (1.0, 0.35, 0.10), "underglow": True},
}


def setup_studio(mode):
    """Build the seamless + 3-point rig. Safe to call on an empty scene."""
    cfg = MODE_LIGHT[mode]

    # World: mid-gray, no HDRI, no clutter.
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("studio_world")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg is None:
        bg = world.node_tree.nodes.new(type="ShaderNodeBackground")
        world.node_tree.links.new(
            bg.outputs["Background"],
            world.node_tree.nodes["World Output"].inputs["Surface"],
        )
    bg.inputs["Color"].default_value = (0.32, 0.32, 0.33, 1.0)
    bg.inputs["Strength"].default_value = 1.0

    # Ground plane at z = 0 (the task's "y=0" in Blender's Z-up space).
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "ground"
    ground.data.materials.append(_ground_material())

    # 3-point rig. Azimuth convention matches cameras.py (0 = front/+Y).
    _area("key_light", cfg["key"], 1000, 5.0, azim_deg=30, elev_deg=38, dist=9)
    _area("fill_light", (0.85, 0.90, 1.0), 350, 4.0, azim_deg=-45, elev_deg=16, dist=8)
    _area("rim_light", cfg["rim"], 800, 3.0, azim_deg=180, elev_deg=42, dist=8)

    if cfg["underglow"]:
        bpy.ops.object.light_add(type="POINT", location=(0, 0, 0.55))
        ug = bpy.context.active_object
        ug.name = "breach_underglow"
        ug.data.energy = 220
        ug.data.color = (1.0, 0.30, 0.08)
        ug.data.shadow_soft_size = 0.6

    bpy.context.view_layer.update()
