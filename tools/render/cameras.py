"""Camera rigs for the render production spec (§9).

Canonical space: Z-up, forward = +Y, mech-left = +X.
Azimuth convention: 0 deg = front (+Y), 90 deg = mech-left (+X),
180 deg = rear (-Y), 270 deg = mech-right.

Rigs:
  hero34     — M-1 3/4 front hero: azimuth 35, slight low angle (elev 10),
               perspective. The money shot.
  profile    — M-2 side profile: azimuth 90, ORTHOGRAPHIC (silhouette read).
  rear       — M-3 rear power read: azimuth 215, elevated (elev 28) —
               sells backpack/verniers/weapon bus.
  turnaround — neutral-stance front/side/back (az 0/90/180, elev 8).

All rigs auto-frame from the mech's measured bounds.
"""

import math
from mathutils import Vector

import bpy


def _get_camera():
    cam = bpy.context.scene.camera
    if cam is None:
        bpy.ops.object.camera_add()
        cam = bpy.context.active_object
        bpy.context.scene.camera = cam
    return cam


def frame_mech(azim_deg, elev_deg, dist_mul=2.6, zoff=0.0,
               ortho=False, bounds=None):
    """Point the scene camera at the mech bounds from (azim, elev)."""
    from .assemble import mesh_bounds, mech_meshes  # local import: needs bpy scene

    cam = _get_camera()
    if bounds is None:
        mech_root = bpy.data.objects.get("mech_root")
        if mech_root is None:
            raise RuntimeError("frame_mech: no mech_root in scene")
        mn, mx = mesh_bounds(mech_meshes(mech_root))
    else:
        mn, mx = bounds

    center = (mn + mx) / 2
    center.z += zoff
    size = max((mx - mn).x, (mx - mn).y, (mx - mn).z, 0.05)

    az = math.radians(azim_deg)
    el = math.radians(elev_deg)
    if ortho:
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = size * 1.45
        d = size * 4.0 + 1.0
    else:
        cam.data.type = "PERSP"
        cam.data.lens = 50
        # Fit the mech's full height in the vertical FOV with margin.
        # Blender default sensor: 36x24mm; vertical FOV from the 24mm side.
        fov_v = 2 * math.atan(12.0 / cam.data.lens)
        d = (size * 0.5 * 1.25) / math.tan(fov_v / 2)
        d = max(d, size * dist_mul / 2 + 0.3)
    cam.location = center + Vector((
        d * math.cos(el) * math.sin(az),
        d * math.cos(el) * math.cos(az),
        d * math.sin(el),
    ))
    dv = center - cam.location
    cam.rotation_euler = dv.to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()
    return cam


def rig_for_shot(shot, bounds=None):
    """Position the camera for a shot id. Returns the camera."""
    shot = shot.upper()
    if shot == "M-1":
        return frame_mech(35, 10, dist_mul=2.6, bounds=bounds)
    if shot == "M-2":
        return frame_mech(90, 6, ortho=True, bounds=bounds)
    if shot == "M-3":
        return frame_mech(215, 28, dist_mul=2.6, bounds=bounds)
    if shot in ("T-FRONT", "TURN-FRONT"):
        return frame_mech(0, 8, dist_mul=2.4, bounds=bounds)
    if shot in ("T-SIDE", "TURN-SIDE"):
        return frame_mech(90, 8, dist_mul=2.4, bounds=bounds)
    if shot in ("T-BACK", "TURN-BACK"):
        return frame_mech(180, 8, dist_mul=2.4, bounds=bounds)
    raise ValueError(f"unknown shot id {shot}")


SHOTS = ("M-1", "M-2", "M-3", "T-FRONT", "T-SIDE", "T-BACK")
