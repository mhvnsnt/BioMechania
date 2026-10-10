"""Part-generation normalization.

PROBLEM: the two shipped part generations were authored in different
coordinate conventions (measured 2026-10-09 from the actual GLBs):

  OLD generation (scout/bruiser families, tools/mecha-parts/build_parts.py):
      Y-up in Blender space.  socket_head ~= (0, 0.98, 0) on the torso,
      forward = +Z, mech-left = -X.
  NEW generation (breach parts, PR #5):
      Z-up in Blender space.  socket_head ~= (0, 0, 0.42) on the torso,
      forward = +Y, mech-left = +X.

CANONICAL render space (this pipeline): Z-up, forward = +Y, mech-left = +X,
ground plane at z = 0. Matches the new generation, so breach parts import
with the identity transform.

Old-generation parts are normalized with:
    N_old = Rz(180 deg) @ Rx(90 deg)
which maps old +Y (up) -> +Z, old +Z (forward) -> +Y, old -X (left) -> +X.
Verified axis-by-axis against socket empties in both generations.

Detection is per-BUILD from the torso's socket_head empty (all parts in one
build+mode are the same generation today): if the socket's dominant axis is
Y, the build is old-generation; if Z, new-generation. Mixed-generation
builds would need per-part detection — flagged, not implemented.
"""

import math
from mathutils import Matrix

IDENTITY = Matrix.Identity(3)

# Old-generation (Y-up) -> canonical (Z-up, +Y forward, +X = mech-left).
N_OLD = Matrix.Rotation(math.radians(180), 3, "Z") @ Matrix.Rotation(
    math.radians(90), 3, "X"
)


def detect_generation(socket_head_pos) -> str:
    """Return 'old' (Y-up) or 'new' (Z-up) from a torso socket_head position."""
    ax = abs(socket_head_pos.x)
    ay = abs(socket_head_pos.y)
    az = abs(socket_head_pos.z)
    if ay >= ax and ay >= az:
        return "old"
    return "new"


def normalize_matrix(generation: str) -> Matrix:
    """3x3 normalization matrix: part-local -> canonical render space."""
    return N_OLD if generation == "old" else IDENTITY
