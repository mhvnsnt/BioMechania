"""Hero-shot poses for Render Lane A.

The pipeline assembles the mech neutral (parts socket-parented, rigid).
Lane A adds per-shot attitude by rotating the slot anchor empties
(head / arms / legs / shoulders / backpack / weapon) and the torso
anchor itself. Rotations are in DEGREES about canonical axes:

  Z-up, forward = +Y, mech-left = +X.
  rotation about +X: positive moves +Y toward +Z (nose-up / arms-forward).

Poses are subtle (5-35 deg) so QC gates 4 (no clipping) and 6 (grounding)
still pass: legs rotate as a pair, grounding re-seats after posing.

Table: (shot, mode) -> {anchor: (rx, ry, rz)}.
"""

import math

# anchor keys match assemble_mech() info['anchors'] (+ 'torso' for torso_anchor)
_POSES = {
    # M-1 racer: coiled aero tuck, slight low camera angle is in the rig.
    ("M-1", "racer"): {
        "torso": (-12, 0, 0),      # lean forward into the tuck
        "head": (-10, 0, 0),       # optics down the line of travel
        "arms": (-25, 0, 0),       # swept back along the flanks
        "legs": (-15, 0, 0),       # trailing
        "shoulders": (-8, 0, 0),
        "backpack": (6, 0, 0),      # thruster bus tips up into the slipstream
    },
    # M-1 combat: weapon deployed, planted.
    ("M-1", "combat"): {
        "torso": (-5, 0, 0),
        "head": (0, 8, 0),         # slight menace tilt
        "arms": (20, 0, 0),        # raised, weapon forward
        "weapon": (12, 0, 0),      # muzzle toward the threat
        "legs": (6, 0, 0),         # braced
        "shoulders": (10, 0, 0),
    },
    # M-1 breach: restraints off, glow hot, full release.
    ("M-1", "breach"): {
        "torso": (6, 0, 0),        # arched back
        "head": (8, 0, 0),         # chin up
        "arms": (35, 0, 0),        # thrown wide-up
        "weapon": (20, 0, 0),
        "legs": (10, 0, 0),
        "shoulders": (15, 0, 0),
        "backpack": (-10, 0, 0),   # venting
    },
    # M-2 / M-3: silhouette readability shots — neutral, camera does the work.
}

_SHOT_FALLBACK = {
    "M-1": ("M-1", "combat"),  # unknown mode -> combat attitude
}


def pose_for(shot, mode):
    """Return {anchor: (rx, ry, rz)} in degrees for a shot+mode."""
    if (shot, mode) in _POSES:
        return _POSES[(shot, mode)]
    return _POSES.get(_SHOT_FALLBACK.get(shot, (None, None)), {})


def apply_pose(info, shot, mode):
    """Rotate slot anchors per the pose table. Returns applied table."""
    import bpy

    table = pose_for(shot, mode)
    anchors = info["anchors"]
    targets = dict(anchors)
    targets["torso"] = info["torso_anchor"]
    for anchor, (rx, ry, rz) in table.items():
        obj = targets.get(anchor)
        if obj is None:
            continue
        obj.rotation_euler = (
            obj.rotation_euler.x + math.radians(rx),
            obj.rotation_euler.y + math.radians(ry),
            obj.rotation_euler.z + math.radians(rz),
        )
    # The weapon is mounted to the arm's hand socket but assemble.py parents
    # its anchor under the torso anchor. Rotating the arms then leaves the
    # weapon behind (floating detached). Re-parent it under the arms anchor,
    # preserving world transform, so it stays gripped through the pose.
    # Lane-local: only render_shot.py poses; other lanes unaffected.
    w = anchors.get("weapon")
    arms = anchors.get("arms")
    if w is not None and arms is not None and w.parent is not arms:
        bpy.context.view_layer.update()
        w.parent = arms
        w.matrix_parent_inverse = arms.matrix_world.inverted()
    return table
