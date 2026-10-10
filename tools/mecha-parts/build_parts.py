# BioMechania mecha parts builder — Blender 4.0.2 headless
# (migrated from theyard; BioMechania is the canonical mecha-game repo)
# ORIGINAL designs: EVA-inspired biomech language (ribbed organic plating over
# mechanical frames, hunched silhouettes, sinewy limbs) + demolition-derby grit.
# No EVA/Gundam/Bionicle likenesses, names, symbols, or color schemes.
import bpy, math, os, json

OUT = os.environ.get('PARTS_OUT', '/home/hatch/workspace/BioMechania/public/mecha/parts')
os.makedirs(OUT, exist_ok=True)

# Contract: pair slots (arms/legs/shoulders) ship ONE part id covering both
# sides — the GLB carries both halves, mirrored about X=0 (the socket-pair
# midpoint the viewer mounts at). Halves sit at ±dx matching the torso
# socket X offsets in torso_sockets().
PAIR_DX = {'arm': 0.40, 'leg': 0.20, 'shoulder': 0.46}
SLOT_PLURAL = {'arm': 'arms', 'leg': 'legs', 'shoulder': 'shoulders',
               'head': 'head', 'torso': 'torso',
               'backpack': 'backpack', 'weapon': 'weapon'}

def mirror_pair(dx):
    """One built half (centered x=0) -> both halves at +/-dx.

    Mechanical X-mirror via duplicate+offset (parts are X-symmetric, so no
    geometry mirroring is needed). Originals (at +dx) get an `_l` suffix,
    duplicates (at -dx) get `_r`. For arms this also splits the weapon
    socket: `socket_weapon_l` / `socket_weapon_r` (the viewer mounts the
    weapon on the arm part's `socket_weapon_r`).
    """
    objs = list(bpy.context.scene.objects)
    for o in objs:
        o.location.x += dx
    before = set(objs)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.duplicate()
    dups = [o for o in bpy.context.scene.objects if o not in before]
    for o in dups:
        o.location.x -= 2 * dx
        base = o.name[:-4] if o.name.endswith('.001') else o.name
        o.name = base + '_r'
    for o in objs:
        o.name = o.name + '_l'
    return dups

# ---------------- helpers ----------------
def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def _apply(obj, bevel_w=0.0, bevel_seg=1):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    if bevel_w > 0:
        m = obj.modifiers.new('bev', 'BEVEL')
        m.width = bevel_w; m.segments = bevel_seg; m.limit_method = 'ANGLE'
        bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

def box(name, sx, sy, sz, x, y, z, mat=None, rx=0, ry=0, rz=0, bev=0.0):
    bpy.ops.mesh.primitive_cube_add(location=(x, y, z), rotation=(rx, ry, rz))
    o = bpy.context.active_object; o.name = name
    o.scale = (sx/2.0, sy/2.0, sz/2.0)
    _apply(o, bevel_w=bev)
    if mat: o.data.materials.append(mat)
    return o

def cyl(name, r, h, x, y, z, mat=None, verts=14, rx=0, ry=0, rz=0, bev=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, ry, rz))
    o = bpy.context.active_object; o.name = name
    _apply(o, bevel_w=bev)
    if mat: o.data.materials.append(mat)
    return o

def cone(name, r1, r2, h, x, y, z, mat=None, verts=14, rx=0, ry=0, rz=0):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=h,
        location=(x, y, z), rotation=(rx, ry, rz))
    o = bpy.context.active_object; o.name = name
    _apply(o)
    if mat: o.data.materials.append(mat)
    return o

def sph(name, r, x, y, z, mat=None, sx=1.0, sy=1.0, sz=1.0, u=12, v=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=u, ring_count=v, radius=r, location=(x, y, z))
    o = bpy.context.active_object; o.name = name
    o.scale = (sx, sy, sz)
    _apply(o)
    if mat: o.data.materials.append(mat)
    return o

def torus(name, R, r, x, y, z, mat=None, rx=0, ry=0, rz=0, major=16, minor=10):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r,
        major_segments=major, minor_segments=minor, location=(x, y, z), rotation=(rx, ry, rz))
    o = bpy.context.active_object; o.name = name
    _apply(o)
    if mat: o.data.materials.append(mat)
    return o

def sock(name, x, y, z):
    bpy.ops.object.empty_add(type='SPHERE', location=(x, y, z))
    o = bpy.context.active_object; o.name = name
    o.empty_display_size = 0.05
    return o

_MATS = {}
def M(name, color, metallic=0.5, roughness=0.5):
    if name in _MATS: return _MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    _MATS[name] = m
    return m

def E(name, color, emission_strength=3.5, metallic=0.0, roughness=0.5):
    """Emissive material for the breach-glow cores (exports as glTF emissive)."""
    if name in _MATS: return _MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Emission Color'].default_value = (*color, 1.0)
    bsdf.inputs['Emission Strength'].default_value = emission_strength
    _MATS[name] = m
    return m

# palette: industrial derby grit, NO eva purple/green scheme
IRON   = ('iron',   (0.16,0.16,0.18), 0.80, 0.50)
STEEL  = ('steel',  (0.45,0.46,0.50), 0.85, 0.35)
RUST   = ('rust',   (0.50,0.25,0.10), 0.30, 0.70)
HAZ    = ('haz',    (0.95,0.62,0.05), 0.10, 0.60)
RUB    = ('rubber', (0.06,0.06,0.07), 0.00, 0.90)
BONE   = ('bone',   (0.72,0.66,0.55), 0.10, 0.55)   # organic plating
OILRED = ('oilred', (0.55,0.08,0.06), 0.40, 0.55)
BREACHGLOW = (1.0, 0.28, 0.04)   # molten core glow (emissive, via E())

def rivet_line(x0, x1, y, z, n, mat, r=0.012, axis='x'):
    for i in range(n):
        t = i/(n-1) if n > 1 else 0.5
        x = x0 + (x1-x0)*t if axis=='x' else x0
        sph(f'rivet', r, x, y, z, mat=mat, u=8, v=6)

def rib_stack(x, y, z0, z1, n, R, r, mat, taper=0.0):
    for i in range(n):
        t = i/(n-1) if n > 1 else 0.5
        z = z0 + (z1-z0)*t
        RR = R*(1.0 - taper*t)
        torus(f'rib{i}', RR, r, x, y, z, mat=mat, major=14, minor=8)

def piston(x, y, z0, z1, r_rod, r_sleeve, mat_rod, mat_sleeve):
    zm = (z0+z1)/2.0
    cyl('rod', r_rod, abs(z1-z0), x, y, zm, mat=mat_rod, verts=10)
    cyl('sleeve', r_sleeve, abs(z1-z0)*0.55, x, y, (z0+zm)/2.0, mat=mat_sleeve, verts=10)

# ============ DETAIL BAR tooling (owner 2026-10-10: HG Gunpla model-kit bar) ============
def groove(x, y, z, sx, sy, sz, rx=0, ry=0, rz=0):
    """Cut a panel-line groove into every mesh in the scene (boolean difference).

    sx/sy/sz = cutter dimensions; make one axis thin (0.004-0.008) to read
    as a panel line. Call AFTER all geometry for the part is placed.
    """
    bpy.ops.mesh.primitive_cube_add(location=(x, y, z), rotation=(rx, ry, rz))
    cutter = bpy.context.active_object; cutter.name = 'groove_cutter'
    cutter.scale = (sx/2.0, sy/2.0, sz/2.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH' or o is cutter:
            continue
        m = o.modifiers.new('groove', 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = cutter
        m.solver = 'EXACT'
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

def vent(x, y, z, w, h, n, mat_dark, mat_slat, depth=0.03, facing='+y'):
    """Recessed vent: dark inset box + n angled slats. facing '+y' puts the
    vent plane on the +Y side of the given point (use '-y', '+x', '-x' etc.)."""
    dw, dh, dd = w, depth, h
    if facing in ('+x', '-x'):
        dw, dh, dd = depth, w, h
    s = 1.0 if facing in ('+y', '+x') else -1.0
    ox = s*depth/2 if facing in ('+x', '-x') else 0
    oy = s*depth/2 if facing in ('+y', '-y') else 0
    box('ventwell', dw, dh, dd, x+ox, y+oy, z, mat=mat_dark)
    for i in range(n):
        t = (i+0.5)/n
        if facing in ('+y', '-y'):
            box(f'ventslat{i}', w*0.92, 0.008, h/n*0.7, x, y+s*0.004, z-h/2+t*h, mat=mat_slat, rx=0.5)
        else:
            box(f'ventslat{i}', 0.008, w*0.92, h/n*0.7, x+s*0.004, y, z-h/2+t*h, mat=mat_slat, ry=0.5)

def greebles(cx, cy, cz, spread, n, mats, seed=0):
    """Deterministic greeble cluster: small boxes/cyls scattered in a box
    volume. mats = list of materials to cycle through."""
    import random
    rnd = random.Random(seed)
    for i in range(n):
        x = cx + (rnd.random()-0.5)*spread[0]
        y = cy + (rnd.random()-0.5)*spread[1]
        z = cz + (rnd.random()-0.5)*spread[2]
        mat = mats[i % len(mats)]
        k = rnd.random()
        if k < 0.5:
            box(f'grb{i}', 0.015+rnd.random()*0.03, 0.015+rnd.random()*0.03,
                0.01+rnd.random()*0.03, x, y, z, mat=mat,
                rx=rnd.random()*0.6, ry=rnd.random()*0.6, bev=0.003)
        elif k < 0.8:
            cyl(f'grc{i}', 0.008+rnd.random()*0.012, 0.02+rnd.random()*0.04,
                x, y, z, mat=mat, verts=8,
                rx=rnd.random()*3.14, ry=rnd.random()*3.14)
        else:
            sph(f'grs{i}', 0.01+rnd.random()*0.015, x, y, z, mat=mat, u=8, v=6)

def layered_plate(x, y, z, w, h, t, layers, mat, bev=0.008, axis='z', gap=0.012):
    """Stack of `layers` beveled plates, each smaller than the last, offset
    along `axis` — reads as layered armor plating."""
    for i in range(layers):
        f = 1.0 - 0.14*i
        off = i*(t+gap)
        dx, dy, dz = (off,0,0) if axis=='x' else ((0,off,0) if axis=='y' else (0,0,off))
        box(f'plate{i}', w*f, h*f, t, x+dx, y+dy, z+dz, mat=mat, bev=bev)

def bolt_circle(x, y, z, R, n, r, mat, axis='z'):
    """Ring of n bolt heads around (x,y,z) in the plane perpendicular to axis."""
    for i in range(n):
        a = 2*math.pi*i/n
        if axis == 'z':
            sph(f'bolt{i}', r, x+R*math.cos(a), y+R*math.sin(a), z, mat=mat, u=8, v=6)
        elif axis == 'y':
            sph(f'bolt{i}', r, x+R*math.cos(a), y, z+R*math.sin(a), mat=mat, u=8, v=6)
        else:
            sph(f'bolt{i}', r, x, y+R*math.cos(a), z+R*math.sin(a), mat=mat, u=8, v=6)

def poly_count():
    return sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == 'MESH')

def export_part(pid, slot, name, desc, modes, stats):
    d = os.path.join(OUT, pid); os.makedirs(d, exist_ok=True)
    fp = os.path.join(d, pid + '.glb')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=fp, use_selection=True, export_format='GLB',
        export_apply=True, export_yup=True, export_materials='EXPORT')
    tris = poly_count()
    # Merge with the existing manifest when present: preserve the shipped
    # name/description/stats/modes, fix slot (plural per contract) + model
    # (bare filename per the zod schema) and refresh the tri count.
    pj = os.path.join(d, 'part.json')
    try:
        manifest = json.load(open(pj))
    except (OSError, ValueError):
        manifest = {}
    manifest.update({
        'id': pid, 'slot': SLOT_PLURAL[slot], 'name': name, 'description': desc,
        'modes': modes,
        'stats': stats,
        'model': f'{pid}.glb',
        'tris': tris,
    })
    json.dump(manifest, open(pj, 'w'), indent=1)
    print(f'EXPORTED {pid} tris={tris}')
    return tris

# ============ HEADS (origin = neck attach, face +Y) ============
def b_head_hound():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # neck ring
    cyl('neck', 0.075, 0.06, 0, 0, 0.03, mat=iron, verts=14)
    torus('neckring', 0.085, 0.014, 0, 0, 0.06, mat=steel, major=14, minor=8)
    # bestial elongated cowl: organic lump skull + jaw
    sph('skull', 0.10, 0, 0.01, 0.16, mat=bone, sx=1.0, sy=1.25, sz=1.0)
    sph('snout', 0.062, 0, 0.10, 0.115, mat=bone, sx=0.85, sy=1.3, sz=0.7)
    sph('jaw', 0.05, 0, 0.085, 0.055, mat=rust, sx=0.7, sy=1.15, sz=0.5)
    # brow plate with rivets
    box('brow', 0.15, 0.05, 0.055, 0, 0.085, 0.20, mat=steel, rx=-0.25, bev=0.008)
    rivet_line(-0.06, 0.06, 0.10, 0.215, 4, iron)
    # visor slit (glowing-ish hazard inset)
    box('visor', 0.11, 0.02, 0.028, 0, 0.105, 0.155, mat=haz)
    box('visorhood', 0.14, 0.03, 0.05, 0, 0.095, 0.175, mat=iron, rx=-0.2, bev=0.006)
    # exhaust nostrils
    cyl('nos_l', 0.014, 0.03, 0.035, 0.155, 0.10, mat=iron, verts=8, rx=1.2)
    cyl('nos_r', 0.014, 0.03, -0.035, 0.155, 0.10, mat=iron, verts=8, rx=1.2)
    # rear head cables
    for i, sx in enumerate([0.05, -0.05]):
        torus(f'cable{i}', 0.05, 0.012, sx, -0.09, 0.10, mat=rub, rx=0.5, major=12, minor=8)

def b_head_crown():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('neck', 0.08, 0.07, 0, 0, 0.035, mat=iron, verts=14)
    # riveted blocky cranium
    box('cranium', 0.19, 0.20, 0.17, 0, 0.0, 0.155, mat=steel, bev=0.012)
    rivet_line(-0.07, 0.07, 0.105, 0.20, 4, iron)
    rivet_line(-0.07, 0.07, 0.105, 0.12, 4, iron)
    # face grill
    box('grill', 0.11, 0.02, 0.09, 0, 0.10, 0.11, mat=iron, bev=0.004)
    for i in range(4):
        box(f'slat{i}', 0.10, 0.022, 0.012, 0, 0.10, 0.085+i*0.02, mat=rub)
    # optic band
    box('opticband', 0.16, 0.02, 0.035, 0, 0.095, 0.19, mat=iron)
    box('optic', 0.10, 0.022, 0.02, 0, 0.095, 0.19, mat=oil)
    # side plates + antenna stubs
    box('plate_l', 0.03, 0.16, 0.12, 0.105, 0.0, 0.15, mat=rust, bev=0.006)
    box('plate_r', 0.03, 0.16, 0.12, -0.105, 0.0, 0.15, mat=rust, bev=0.006)
    cyl('ant', 0.006, 0.09, 0.07, -0.05, 0.26, mat=iron, verts=6)

def b_head_dart():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('neck', 0.06, 0.05, 0, 0, 0.025, mat=iron, verts=12)
    # sleek teardrop aero head
    sph('pod', 0.085, 0, 0.02, 0.13, mat=steel, sx=0.8, sy=1.5, sz=0.85)
    sph('nose', 0.05, 0, 0.13, 0.10, mat=steel, sx=0.7, sy=1.4, sz=0.6)
    # canopy visor
    sph('canopy', 0.055, 0, 0.075, 0.16, mat=haz, sx=0.75, sy=1.0, sz=0.55)
    # swept rear fin
    box('fin', 0.012, 0.16, 0.10, 0, -0.10, 0.19, mat=oil, rx=0.5, bev=0.004)
    # side intake slits
    box('intake_l', 0.02, 0.08, 0.03, 0.065, 0.05, 0.10, mat=iron)
    box('intake_r', 0.02, 0.08, 0.03, -0.065, 0.05, 0.10, mat=iron)

def b_head_maul():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('neck', 0.095, 0.08, 0, 0, 0.04, mat=iron, verts=14)
    torus('neckring', 0.10, 0.018, 0, 0, 0.08, mat=rust, major=14, minor=8)
    # heavy jaw-crusher block
    box('block', 0.24, 0.22, 0.20, 0, 0.01, 0.18, mat=iron, bev=0.015)
    # armored cheeks
    box('cheek_l', 0.05, 0.16, 0.13, 0.125, 0.03, 0.16, mat=steel, bev=0.008)
    box('cheek_r', 0.05, 0.16, 0.13, -0.125, 0.03, 0.16, mat=steel, bev=0.008)
    rivet_line(-0.09, 0.09, 0.115, 0.24, 5, steel)
    # single cyclops optic under brow
    box('brow', 0.20, 0.06, 0.05, 0, 0.10, 0.245, mat=rust, rx=-0.3, bev=0.008)
    cyl('eye', 0.032, 0.03, 0, 0.115, 0.20, mat=oil, verts=12, rx=1.5708)
    # mouth crusher plates
    box('jawplate', 0.14, 0.03, 0.07, 0, 0.115, 0.10, mat=steel, bev=0.006)
    for i in range(3):
        box(f'tooth{i}', 0.03, 0.025, 0.03, -0.04+i*0.04, 0.115, 0.06, mat=haz)

# ============ TORSOS (origin = waist; MUST include socket empties) ============
def torso_sockets():
    sock('socket_head', 0, 0, 0.42)
    sock('socket_arm_l', 0.40, 0, 0.26); sock('socket_arm_r', -0.40, 0, 0.26)
    sock('socket_leg_l', 0.20, 0, 0.02); sock('socket_leg_r', -0.20, 0, 0.02)
    sock('socket_shoulder_l', 0.46, 0, 0.30); sock('socket_shoulder_r', -0.46, 0, 0.30)
    sock('socket_back', 0, -0.30, 0.22)

def b_torso_ribcage():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # pelvis block
    box('pelvis', 0.34, 0.26, 0.20, 0, 0, -0.06, mat=iron, bev=0.015)
    rivet_line(-0.13, 0.13, 0.135, -0.02, 4, steel)
    # spine column, hunched forward
    cyl('spine', 0.055, 0.42, 0, 0.02, 0.22, mat=steel, verts=12, rx=0.12)
    # organic ribs over the frame
    rib_stack(0, 0.03, 0.10, 0.40, 5, 0.16, 0.020, bone, taper=0.25)
    # rib side plates (scrap welded)
    box('ribplate_l', 0.03, 0.14, 0.22, 0.17, 0.03, 0.25, mat=rust, rx=0.1, bev=0.006)
    box('ribplate_r', 0.03, 0.14, 0.22, -0.17, 0.03, 0.25, mat=rust, rx=0.1, bev=0.006)
    # engine fan in chest
    cyl('fanring', 0.085, 0.03, 0, 0.16, 0.30, mat=iron, verts=16, rx=1.5708)
    for i in range(3):
        box(f'fan{i}', 0.14, 0.015, 0.03, 0, 0.165, 0.30, mat=steel, rz=i*1.047)
    cyl('fanhub', 0.025, 0.05, 0, 0.165, 0.30, mat=haz, verts=10, rx=1.5708)
    # shoulder yoke bar
    cyl('yoke', 0.035, 0.86, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    torso_sockets()

def b_torso_pitmono():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('pelvis', 0.30, 0.24, 0.16, 0, 0, -0.05, mat=iron, bev=0.012)
    # mono frame: central keel
    box('keel', 0.12, 0.14, 0.42, 0, 0.02, 0.20, mat=steel, rx=0.06, bev=0.01)
    # organic chest shell over keel
    sph('chest', 0.16, 0, 0.04, 0.34, mat=bone, sx=1.15, sy=0.9, sz=0.85)
    # chest vents
    for i in range(3):
        box(f'vent{i}', 0.20, 0.02, 0.025, 0, 0.155, 0.26+i*0.05, mat=iron, rx=-0.15)
    # side pods
    sph('pod_l', 0.07, 0.20, 0.0, 0.28, mat=rust, sx=1, sy=1, sz=1.3)
    sph('pod_r', 0.07, -0.20, 0.0, 0.28, mat=rust, sx=1, sy=1, sz=1.3)
    cyl('yoke', 0.032, 0.82, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    rivet_line(-0.11, 0.11, 0.125, -0.03, 4, steel)
    torso_sockets()

def b_torso_aerowedge():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('pelvis', 0.28, 0.22, 0.14, 0, 0, -0.05, mat=iron, bev=0.012)
    # streamlined wedge: nose low, tail high
    box('wedge', 0.30, 0.44, 0.20, 0, 0.05, 0.24, mat=steel, rx=-0.35, bev=0.02)
    sph('cockpit', 0.09, 0, 0.10, 0.30, mat=haz, sx=1.0, sy=1.3, sz=0.7)
    # aero strakes
    box('strake_l', 0.02, 0.30, 0.06, 0.16, 0.02, 0.20, mat=oil, rx=-0.3, bev=0.005)
    box('strake_r', 0.02, 0.30, 0.06, -0.16, 0.02, 0.20, mat=oil, rx=-0.3, bev=0.005)
    # rear diffuser
    for i in range(4):
        box(f'diff{i}', 0.03, 0.10, 0.08, -0.09+i*0.06, -0.16, 0.10, mat=iron, rx=0.4)
    cyl('yoke', 0.030, 0.78, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    torso_sockets()

def b_torso_siegeplate():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # heavy slab torso
    box('pelvis', 0.40, 0.30, 0.22, 0, 0, -0.07, mat=iron, bev=0.015)
    box('slab', 0.46, 0.34, 0.44, 0, 0.02, 0.24, mat=rust, bev=0.02)
    rivet_line(-0.18, 0.18, 0.195, 0.38, 6, steel)
    rivet_line(-0.18, 0.18, 0.195, 0.14, 6, steel)
    # boiler chest
    cyl('boiler', 0.11, 0.20, 0, 0.19, 0.28, mat=iron, verts=14, rx=1.5708)
    torus('boilerring', 0.11, 0.016, 0, 0.19, 0.28, mat=steel, rx=0, major=14, minor=8)
    cyl('gauge', 0.03, 0.02, 0.06, 0.20, 0.36, mat=haz, verts=10, rx=1.5708)
    # side exhaust
    cyl('exh', 0.035, 0.16, 0.24, -0.05, 0.30, mat=iron, verts=10)
    cone('exhflare', 0.035, 0.055, 0.05, 0.24, -0.05, 0.40, mat=rust, verts=10)
    # top yoke
    cyl('yoke', 0.04, 0.92, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    torso_sockets()

# ============ ARMS (origin = shoulder attach, hang -Z, X-symmetric) ============
def arm_weapon_socket():
    sock('socket_weapon', 0, 0.05, -0.60)

def b_arm_sinew():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('delt', 0.085, 0, 0, -0.05, mat=bone, sx=1, sy=1, sz=1.2)
    # sinewy upper arm: tapered organic segments
    sph('bicep', 0.062, 0, 0, -0.20, mat=bone, sx=0.95, sy=0.95, sz=1.5)
    sph('forearm', 0.055, 0, 0.01, -0.40, mat=bone, sx=0.9, sy=0.9, sz=1.4)
    # exposed piston along the back
    piston(0, -0.055, -0.12, -0.42, 0.014, 0.024, steel, iron)
    # elbow joint
    cyl('elbow', 0.045, 0.07, 0, 0, -0.30, mat=iron, verts=10, ry=1.5708)
    # plated knuckle hand
    box('hand', 0.075, 0.09, 0.09, 0, 0.02, -0.53, mat=steel, bev=0.01)
    for i in range(3):
        box(f'fing{i}', 0.02, 0.025, 0.07, -0.025+i*0.025, 0.03, -0.60, mat=iron, bev=0.004)
    arm_weapon_socket()

def b_arm_wrecker():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('upper', 0.065, 0.22, 0, 0, -0.15, mat=rust, verts=12)
    rib_stack(0, 0, -0.06, -0.24, 3, 0.075, 0.014, iron)
    cyl('elbow', 0.05, 0.08, 0, 0, -0.30, mat=iron, verts=10, ry=1.5708)
    box('forearm', 0.09, 0.10, 0.20, 0, 0, -0.42, mat=steel, bev=0.01)
    rivet_line(-0.03, 0.03, 0.055, -0.42, 3, iron)
    # three-finger claw
    cyl('palm', 0.05, 0.06, 0, 0.01, -0.55, mat=iron, verts=10)
    for i, a in enumerate([-0.5, 0, 0.5]):
        cone(f'claw{i}', 0.018, 0.004, 0.11, math.sin(a)*0.05, 0.01+math.cos(a)*0.03, -0.63, mat=haz, verts=8, rx=0.35)
    arm_weapon_socket()

def b_arm_quickjack():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('delt', 0.06, 0, 0, -0.04, mat=steel, sx=1, sy=1, sz=1.1)
    cyl('upper', 0.042, 0.20, 0, 0, -0.16, mat=steel, verts=10)
    cyl('fore', 0.036, 0.20, 0, 0.01, -0.38, mat=steel, verts=10)
    # aero fin on forearm
    box('fin', 0.008, 0.10, 0.14, 0, -0.05, -0.38, mat=oil, rx=0.15, bev=0.003)
    sph('hand', 0.035, 0, 0.02, -0.52, mat=iron, sx=1, sy=1.2, sz=1.3)
    arm_weapon_socket()

def b_arm_pilearm():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('upper', 0.13, 0.13, 0.24, 0, 0, -0.14, mat=iron, bev=0.012)
    rivet_line(-0.045, 0.045, 0.07, -0.10, 3, steel)
    box('fore', 0.15, 0.15, 0.24, 0, 0, -0.38, mat=rust, bev=0.012)
    rivet_line(-0.05, 0.05, 0.08, -0.34, 3, steel)
    # ram plate on forearm front
    box('ram', 0.16, 0.04, 0.14, 0, 0.085, -0.38, mat=steel, bev=0.008)
    cyl('fist', 0.055, 0.07, 0, 0.01, -0.54, mat=iron, verts=10)
    arm_weapon_socket()

# ============ LEGS (origin = hip attach, foot bottom at local z=-1.12) ============
def b_leg_stomp():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('hip', 0.085, 0, 0, -0.04, mat=iron, sx=1.1, sy=1.1, sz=0.9)
    box('thigh', 0.15, 0.16, 0.30, 0, 0, -0.24, mat=rust, bev=0.015)
    rivet_line(-0.05, 0.05, 0.085, -0.20, 3, steel)
    # knee with tread-like guard
    cyl('knee', 0.06, 0.10, 0, 0, -0.44, mat=iron, verts=10, ry=1.5708)
    box('shinguard', 0.13, 0.05, 0.34, 0, 0.075, -0.66, mat=steel, bev=0.01)
    for i in range(4):
        box(f'tread{i}', 0.135, 0.02, 0.05, 0, 0.085, -0.55-i*0.075, mat=rub)
    cyl('shin', 0.055, 0.30, 0, -0.01, -0.66, mat=iron, verts=10)
    # hydraulic piston behind shin
    piston(0, -0.075, -0.48, -0.82, 0.016, 0.026, steel, iron)
    # wide foot pad, sole at -1.12
    box('foot', 0.17, 0.30, 0.09, 0, 0.05, -1.075, mat=iron, bev=0.012)
    box('toe', 0.17, 0.10, 0.07, 0, 0.22, -1.085, mat=steel, bev=0.01)
    box('sole', 0.18, 0.32, 0.02, 0, 0.05, -1.11, mat=rub)

def b_leg_sinew():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('hip', 0.075, 0, 0, -0.03, mat=bone, sx=1, sy=1, sz=0.9)
    # sinewy digitigrade leg
    sph('thigh', 0.075, 0, 0.01, -0.25, mat=bone, sx=0.95, sy=1.0, sz=1.8)
    sph('calf', 0.06, 0, -0.03, -0.62, mat=bone, sx=0.9, sy=0.95, sz=1.7)
    # ribbed organic plating on thigh
    rib_stack(0, 0, -0.12, -0.36, 4, 0.085, 0.013, rust, taper=0.15)
    # exposed achilles piston
    piston(0, -0.08, -0.30, -0.66, 0.013, 0.022, steel, iron)
    # digitigrade foot: heel high, toe pad down
    box('ankle', 0.09, 0.10, 0.12, 0, -0.01, -0.85, mat=iron, bev=0.01)
    box('toeleg', 0.08, 0.09, 0.22, 0, 0.05, -0.99, mat=steel, rx=0.5, bev=0.01)
    box('toepad', 0.11, 0.20, 0.06, 0, 0.09, -1.09, mat=rub, bev=0.008)

def b_leg_sprinter():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('hip', 0.06, 0, 0, -0.03, mat=steel, sx=1, sy=1, sz=0.9)
    cyl('thigh', 0.055, 0.30, 0, 0, -0.22, mat=steel, verts=10)
    cyl('shin', 0.042, 0.42, 0, 0.01, -0.60, mat=steel, verts=10)
    # aero calf fairing
    box('fairing', 0.03, 0.16, 0.34, 0, -0.06, -0.62, mat=oil, rx=0.1, bev=0.008)
    # blade foot
    box('blade', 0.07, 0.26, 0.05, 0, 0.06, -1.095, mat=iron, bev=0.008)

def b_leg_tread():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('hip', 0.17, 0.18, 0.14, 0, 0, -0.06, mat=iron, bev=0.012)
    box('thigh', 0.18, 0.19, 0.30, 0, 0, -0.26, mat=iron, bev=0.015)
    rivet_line(-0.065, 0.065, 0.10, -0.22, 4, steel)
    # twin hydraulic rams
    piston(0.05, -0.09, -0.30, -0.62, 0.018, 0.028, steel, rust)
    piston(-0.05, -0.09, -0.30, -0.62, 0.018, 0.028, steel, rust)
    box('shin', 0.19, 0.20, 0.34, 0, 0, -0.62, mat=rust, bev=0.015)
    for i in range(5):
        box(f'tread{i}', 0.20, 0.02, 0.045, 0, 0.105, -0.50-i*0.06, mat=rub)
    # massive tread-plate foot
    box('foot', 0.22, 0.36, 0.10, 0, 0.06, -1.07, mat=iron, bev=0.012)
    box('sole', 0.23, 0.38, 0.02, 0, 0.06, -1.11, mat=rub)

# ============ SHOULDERS (origin = shoulder socket, X-symmetric cap) ============
def b_sh_cowl():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # ribbed organic shroud curving over the shoulder
    sph('cap', 0.11, 0, 0, 0.06, mat=bone, sx=1.15, sy=1.15, sz=0.9)
    rib_stack(0, 0, 0.0, 0.14, 3, 0.115, 0.013, rust)
    box('lip', 0.20, 0.05, 0.06, 0, 0.06, -0.03, mat=steel, bev=0.008)

def b_sh_rivetguard():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('plate', 0.22, 0.20, 0.05, 0, 0, 0.10, mat=steel, bev=0.01)
    rivet_line(-0.08, 0.08, 0.105, 0.10, 5, iron)
    box('skirt', 0.24, 0.22, 0.10, 0, 0, 0.02, mat=rust, bev=0.01)
    rivet_line(-0.09, 0.09, 0.115, 0.02, 5, iron)
    cyl('pin', 0.02, 0.06, 0, 0, -0.03, mat=iron, verts=8)

def b_sh_draftfin():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    sph('cap', 0.07, 0, 0, 0.03, mat=steel, sx=1, sy=1, sz=0.8)
    box('fin', 0.012, 0.22, 0.16, 0, -0.08, 0.12, mat=oil, rx=0.35, bev=0.004)
    box('fin2', 0.012, 0.14, 0.10, 0, -0.05, 0.06, mat=haz, rx=0.35, bev=0.004)

def b_sh_bullbar():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('plate', 0.20, 0.18, 0.12, 0, 0, 0.05, mat=iron, bev=0.012)
    # bullbar hoops facing forward
    torus('hoop1', 0.09, 0.016, 0, 0.10, 0.05, mat=steel, major=14, minor=8)
    torus('hoop2', 0.06, 0.014, 0, 0.135, 0.05, mat=steel, major=12, minor=8)
    box('cross', 0.20, 0.03, 0.03, 0, 0.10, 0.05, mat=steel)
    rivet_line(-0.07, 0.07, 0.095, 0.11, 4, haz)

# ============ BACKPACKS (origin = back socket, extends -Y) ============
def b_pk_stacks():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('frame', 0.24, 0.08, 0.30, 0, -0.05, 0.05, mat=iron, bev=0.01)
    for sx in [0.07, -0.07]:
        cyl(f'stack{sx}', 0.035, 0.34, sx, -0.06, 0.22, mat=rust, verts=12)
        torus(f'band{sx}', 0.038, 0.010, sx, -0.06, 0.14, mat=steel, major=12, minor=8)
        torus(f'band2{sx}', 0.038, 0.010, sx, -0.06, 0.28, mat=steel, major=12, minor=8)
        cone(f'flare{sx}', 0.035, 0.055, 0.06, sx, -0.06, 0.42, mat=iron, verts=12)
        # rain flap
        box(f'flap{sx}', 0.07, 0.02, 0.07, sx, -0.06, 0.47, mat=steel, rx=0.3, bev=0.004)

def b_pk_cage():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # roll-cage frame over the back
    for sx in [0.14, -0.14]:
        cyl(f'up{sx}', 0.018, 0.44, sx, -0.10, 0.18, mat=steel, verts=8)
    cyl('topbar', 0.018, 0.30, 0, -0.10, 0.40, mat=steel, verts=8, ry=1.5708)
    for sz in [0.05, 0.30]:
        cyl(f'cross{sz}', 0.015, 0.30, 0, -0.10, sz, mat=steel, verts=8, ry=1.5708)
    # diagonal braces
    for sx in [0.14, -0.14]:
        box(f'brace{sx}', 0.025, 0.025, 0.34, sx, -0.10, 0.16, mat=rust, rx=0.0, rz=sx*2.0)
    box('mount', 0.20, 0.06, 0.10, 0, -0.03, -0.02, mat=iron, bev=0.008)

def b_pk_aerosail():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('pylon', 0.06, 0.10, 0.22, 0, -0.08, 0.12, mat=iron, bev=0.008)
    # big spoiler sail
    box('sail', 0.44, 0.03, 0.20, 0, -0.14, 0.28, mat=oil, rx=-0.25, bev=0.008)
    box('sailstripe', 0.44, 0.032, 0.05, 0, -0.135, 0.24, mat=haz, rx=-0.25)
    box('endplate_l', 0.02, 0.12, 0.22, 0.22, -0.14, 0.28, mat=iron, rx=-0.25, bev=0.004)
    box('endplate_r', 0.02, 0.12, 0.22, -0.22, -0.14, 0.28, mat=iron, rx=-0.25, bev=0.004)

def b_pk_warrack():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('frame', 0.30, 0.10, 0.36, 0, -0.08, 0.10, mat=iron, bev=0.012)
    # ammo drums
    for sx in [0.08, -0.08]:
        cyl(f'drum{sx}', 0.055, 0.14, sx, -0.15, 0.12, mat=rust, verts=12, rx=1.5708)
        torus(f'drumband{sx}', 0.057, 0.009, sx, -0.15, 0.12, mat=steel, major=12, minor=8)
    # spare spike rack
    for i in range(3):
        cyl(f'spike{i}', 0.012, 0.20, -0.10+i*0.10, -0.15, 0.32, mat=haz, verts=8)
    box('rackbar', 0.30, 0.04, 0.04, 0, -0.15, 0.24, mat=steel)

# ============ WEAPONS (origin = grip point) ============
def b_wp_sledge():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('haft', 0.025, 0.55, 0, 0, 0.20, mat=rust, verts=10)
    cyl('grip', 0.032, 0.12, 0, 0, -0.02, mat=rub, verts=10)
    # welded plate head
    box('head', 0.16, 0.16, 0.22, 0, 0, 0.52, mat=steel, bev=0.012)
    box('face_l', 0.17, 0.17, 0.05, 0, 0, 0.64, mat=iron, bev=0.008)
    box('face_r', 0.17, 0.17, 0.05, 0, 0, 0.40, mat=iron, bev=0.008)
    rivet_line(-0.05, 0.05, 0.085, 0.52, 3, iron)
    box('spike', 0.05, 0.05, 0.10, 0, 0, 0.70, mat=haz, bev=0.006)

def b_wp_ripper():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('motor', 0.12, 0.14, 0.16, 0, 0, 0.05, mat=iron, bev=0.01)
    cyl('grip', 0.028, 0.10, 0, -0.08, 0.0, mat=rub, verts=8, rx=1.5708)
    # chain bar
    box('bar', 0.03, 0.10, 0.50, 0, 0.02, 0.38, mat=steel, bev=0.006)
    for i in range(9):
        box(f'tooth{i}', 0.045, 0.03, 0.04, 0, 0.02, 0.18+i*0.05, mat=haz, bev=0.003)
    cyl('sprocket', 0.045, 0.12, 0, 0, 0.10, mat=oil, verts=10, ry=1.5708)

def b_wp_ramlance():  # RACER exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('shaft', 0.022, 0.50, 0, 0, 0.22, mat=steel, verts=10)
    cyl('grip', 0.030, 0.12, 0, 0, -0.02, mat=rub, verts=8)
    # aero ram head
    cone('tip', 0.055, 0.008, 0.22, 0, 0, 0.58, mat=oil, verts=12)
    cyl('collar', 0.06, 0.06, 0, 0, 0.46, mat=iron, verts=12)
    # boost fins
    for sx in [0.05, -0.05]:
        box(f'boostfin{sx}', 0.008, 0.08, 0.14, sx, 0, 0.36, mat=haz, bev=0.003)
    # exhaust nozzle at butt
    cone('nozzle', 0.030, 0.045, 0.06, 0, 0, -0.10, mat=iron, verts=10)

def b_wp_pilespike():  # COMBAT exclusive
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('housing', 0.14, 0.16, 0.34, 0, 0, 0.14, mat=iron, bev=0.012)
    rivet_line(-0.05, 0.05, 0.085, 0.10, 3, steel)
    cyl('pistonrod', 0.030, 0.22, 0, 0, 0.40, mat=steel, verts=10)
    cone('spike', 0.035, 0.006, 0.20, 0, 0, 0.60, mat=haz, verts=10)
    cyl('collar', 0.055, 0.08, 0, 0, 0.32, mat=rust, verts=10)
    # pressure gauge
    cyl('gauge', 0.025, 0.02, 0.075, 0, 0.14, mat=oil, verts=10, rz=1.5708)
    cyl('grip', 0.030, 0.12, 0, -0.09, 0.02, mat=rub, verts=8, rx=1.5708)

# ============ BRUISER DISTINCT COMBAT SET (bruiser2) ============
# Design language: "layered siege bastion" — angular stacked armor, panel-line
# grooves, vents, rivet fields, exposed joint mechanics. Original designs,
# distinct from the shared scout combat set. All COMBAT-mode exclusive.
def b_head_bulwark():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('neck', 0.09, 0.08, 0, 0, 0.04, mat=iron, verts=14)
    torus('neckring', 0.10, 0.016, 0, 0, 0.08, mat=steel, major=14, minor=8)
    # heavy angular cranium
    box('cranium', 0.23, 0.21, 0.18, 0, 0.0, 0.18, mat=iron, bev=0.014)
    # panel grooves: two vertical cuts down the face
    box('cheekplate_l', 0.05, 0.17, 0.13, 0.12, 0.02, 0.17, mat=steel, bev=0.008)
    box('cheekplate_r', 0.05, 0.17, 0.13, -0.12, 0.02, 0.17, mat=steel, bev=0.008)
    # offset mono-eye sensor (asymmetric, right of center)
    box('eyehouse', 0.09, 0.06, 0.06, 0.055, 0.10, 0.22, mat=rust, bev=0.008)
    cyl('eye', 0.028, 0.03, 0.055, 0.115, 0.22, mat=oil, verts=12, rx=1.5708)
    bolt_circle(0.055, 0.115, 0.20, 0.045, 6, 0.008, steel, axis='y')
    # brow plate with rivets
    box('brow', 0.21, 0.06, 0.05, 0, 0.095, 0.26, mat=steel, rx=-0.25, bev=0.008)
    rivet_line(-0.08, 0.08, 0.11, 0.27, 5, iron)
    # cheek vents
    vent(0.145, 0.02, 0.15, 0.06, 0.08, 4, iron, rust, facing='+x')
    vent(-0.145, 0.02, 0.15, 0.06, 0.08, 4, iron, rust, facing='-x')
    # rear crest fin with grooves
    box('crest', 0.015, 0.14, 0.12, 0, -0.11, 0.24, mat=rust, rx=0.35, bev=0.004)
    greebles(0, -0.05, 0.10, (0.16, 0.08, 0.12), 6, [iron, steel, haz], seed=11)
    groove(0, 0.105, 0.18, 0.16, 0.006, 0.14)   # horizontal panel line, face
    groove(0.0, 0.105, 0.18, 0.006, 0.006, 0.14) # vertical panel line, face

def b_torso_bastion():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('pelvis', 0.36, 0.28, 0.20, 0, 0, -0.06, mat=iron, bev=0.015)
    rivet_line(-0.14, 0.14, 0.145, -0.02, 5, steel)
    # spine + layered front armor
    cyl('spine', 0.06, 0.44, 0, 0.02, 0.22, mat=steel, verts=12, rx=0.1)
    layered_plate(0, 0.14, 0.30, 0.30, 0.22, 0.035, 3, steel, axis='y')
    # panel grooves across the chest stack
    groove(0, 0.16, 0.30, 0.28, 0.006, 0.20)
    groove(0, 0.16, 0.22, 0.26, 0.006, 0.18)
    # side vents
    vent(0.19, 0.05, 0.28, 0.10, 0.14, 5, iron, rust, facing='+x')
    vent(-0.19, 0.05, 0.28, 0.10, 0.14, 5, iron, rust, facing='-x')
    # rivet fields on the pelvis flanks
    rivet_line(-0.14, -0.06, 0.145, -0.06, 3, steel)
    rivet_line(0.06, 0.14, 0.145, -0.06, 3, steel)
    # back greebles + shoulder yoke
    greebles(0, -0.20, 0.30, (0.30, 0.10, 0.20), 8, [iron, rust, haz], seed=22)
    cyl('yoke', 0.035, 0.88, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    torso_sockets()

def b_arm_forge():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # layered delt cap
    layered_plate(0, 0, -0.04, 0.16, 0.16, 0.03, 3, rust, axis='z')
    box('upper', 0.14, 0.14, 0.22, 0, 0, -0.16, mat=iron, bev=0.012)
    rivet_line(-0.05, 0.05, 0.075, -0.12, 3, steel)
    groove(0, 0.075, -0.16, 0.15, 0.006, 0.006)  # groove around upper arm
    # forearm with vent + piston
    box('fore', 0.16, 0.16, 0.22, 0, 0, -0.38, mat=steel, bev=0.012)
    vent(0, 0.085, -0.38, 0.09, 0.12, 4, iron, rust, facing='+y')
    piston(0, -0.09, -0.28, -0.46, 0.016, 0.026, steel, iron)
    # heavy fist with knuckle plates
    box('fist', 0.11, 0.12, 0.10, 0, 0.01, -0.55, mat=iron, bev=0.012)
    for i in range(3):
        box(f'knuckle{i}', 0.028, 0.05, 0.04, -0.035+i*0.035, 0.075, -0.56, mat=haz, bev=0.006)
    cyl('wrist', 0.05, 0.05, 0, 0, -0.50, mat=rust, verts=10)
    arm_weapon_socket()

def b_leg_pylon():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    box('hip', 0.18, 0.19, 0.14, 0, 0, -0.06, mat=iron, bev=0.012)
    box('thigh', 0.19, 0.20, 0.30, 0, 0, -0.26, mat=rust, bev=0.015)
    rivet_line(-0.07, 0.07, 0.105, -0.22, 4, steel)
    groove(0, 0.0, -0.26, 0.20, 0.20, 0.006)     # horizontal groove, thigh
    # knee shroud with vent
    box('kneeshroud', 0.20, 0.08, 0.14, 0, 0.10, -0.44, mat=steel, bev=0.010)
    vent(0, 0.145, -0.44, 0.12, 0.08, 4, iron, rust, facing='+y')
    # shin core: structural column knee -> ankle (greaves + pistons mount on it)
    box('shin', 0.13, 0.13, 0.40, 0, 0, -0.68, mat=iron, bev=0.010)
    rivet_line(-0.045, 0.045, 0.07, -0.60, 3, steel)
    # layered greaves
    layered_plate(0, 0.06, -0.68, 0.20, 0.12, 0.03, 3, steel, axis='y')
    # twin ankle pistons
    piston(0.05, -0.10, -0.80, -1.00, 0.016, 0.026, steel, iron)
    piston(-0.05, -0.10, -0.80, -1.00, 0.016, 0.026, steel, iron)
    box('foot', 0.22, 0.34, 0.10, 0, 0.06, -1.07, mat=iron, bev=0.012)
    box('toe', 0.22, 0.12, 0.08, 0, 0.24, -1.08, mat=steel, bev=0.010)
    box('sole', 0.23, 0.36, 0.02, 0, 0.06, -1.11, mat=rub)

def b_sh_slab():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # asymmetric layered slab: bigger outer stack
    layered_plate(0.02, 0, 0.02, 0.24, 0.20, 0.035, 3, steel, axis='z')
    layered_plate(0.06, 0, 0.10, 0.16, 0.14, 0.03, 2, rust, axis='z')
    # panel grooves across the top slab
    groove(0.02, 0, 0.12, 0.22, 0.18, 0.006)
    rivet_line(-0.06, 0.10, 0.10, 0.16, 4, iron)
    # under-greebles
    greebles(0.02, 0, -0.06, (0.16, 0.14, 0.06), 6, [iron, haz], seed=33)
    # side vent
    vent(0.15, 0, 0.04, 0.08, 0.10, 4, iron, rust, facing='+x')

def b_pk_furnace():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    # vented boiler drum
    cyl('boiler', 0.13, 0.30, 0, -0.34, 0.22, mat=rust, verts=16)
    for i in range(3):
        torus(f'band{i}', 0.135, 0.012, 0, -0.34, 0.12+i*0.10, mat=iron, major=16, minor=8)
    vent(0, -0.20, 0.22, 0.16, 0.16, 5, iron, rust, facing='+y')
    # twin stacks with flares
    for sx in [0.10, -0.10]:
        cyl(f'stack{sx}', 0.035, 0.26, sx, -0.34, 0.44, mat=iron, verts=12)
        cone(f'flare{sx}', 0.035, 0.055, 0.05, sx, -0.34, 0.59, mat=steel, verts=12)
        box(f'stackvent{sx}', 0.05, 0.02, 0.10, sx, -0.30, 0.44, mat=rub)
    rivet_line(-0.08, 0.08, -0.20, 0.10, 4, steel)
    greebles(0, -0.34, 0.05, (0.24, 0.10, 0.12), 6, [iron, steel, oil], seed=44)
    groove(0, -0.34, 0.22, 0.27, 0.006, 0.28)   # vertical groove down the boiler

def b_wp_shear():
    iron, steel, rust, haz, rub, bone, oil = (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE), M(*OILRED))
    cyl('haft', 0.028, 0.50, 0, 0, 0.18, mat=rust, verts=10)
    cyl('grip', 0.036, 0.14, 0, 0, -0.04, mat=rub, verts=10)
    # shear housing with grooves
    box('housing', 0.16, 0.14, 0.26, 0, 0, 0.50, mat=iron, bev=0.012)
    groove(0, 0.075, 0.50, 0.15, 0.006, 0.24)
    rivet_line(-0.06, 0.06, 0.075, 0.42, 3, steel)
    # hydraulic piston driving the jaws
    piston(0, -0.06, 0.40, 0.58, 0.018, 0.028, steel, iron)
    # twin shear jaws with teeth
    for sx, rz in [(0.05, 0.28), (-0.05, -0.28)]:
        box(f'jaw{sx}', 0.045, 0.10, 0.26, sx, 0.02, 0.74, mat=steel, rz=rz, bev=0.008)
        for i in range(4):
            box(f'tooth{sx}_{i}', 0.02, 0.04, 0.035, sx+math.copysign(0.02, sx), 0.02, 0.66+i*0.05, mat=haz, bev=0.003)
    cyl('pivot', 0.035, 0.16, 0, 0.02, 0.64, mat=oil, verts=10, ry=1.5708)

# ============ BRUISER DISTINCT BREACH SET (bruiser3) ============
# Design language: "contained inferno" — glowing cores venting through cracked
# plating, overbuilt hardware. Original designs, distinct from the fracture
# set. All BREACH-mode exclusive.
def b_head_cinder():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    cyl('neck', 0.085, 0.075, 0, 0, 0.038, mat=iron, verts=14)
    torus('neckring', 0.095, 0.015, 0, 0, 0.075, mat=rust, major=14, minor=8)
    # ember skull: glowing core under a split helm
    sph('core', 0.095, 0, 0.02, 0.17, mat=glow, sx=1.0, sy=1.1, sz=1.0)
    # split helm chunks with fault gaps
    box('helm_top', 0.15, 0.15, 0.05, 0, 0.0, 0.28, mat=steel, rx=0.2, bev=0.008)
    box('helm_l', 0.09, 0.12, 0.14, 0.10, 0.03, 0.19, mat=rust, rz=0.3, bev=0.006)
    box('helm_r', 0.09, 0.12, 0.14, -0.10, 0.03, 0.19, mat=rust, rz=-0.3, bev=0.006)
    # vent horns
    cone('horn_l', 0.022, 0.008, 0.13, 0.09, -0.08, 0.27, mat=iron, verts=8, rx=-0.55)
    cone('horn_r', 0.022, 0.008, 0.13, -0.09, -0.08, 0.27, mat=iron, verts=8, rx=-0.55)
    # glowing vent slits on the cheeks
    box('slit_l', 0.02, 0.06, 0.015, 0.115, 0.05, 0.15, mat=glow)
    box('slit_r', 0.02, 0.06, 0.015, -0.115, 0.05, 0.15, mat=glow)
    # visor slit + brow
    box('visor', 0.12, 0.02, 0.025, 0, 0.135, 0.175, mat=glow)
    box('brow', 0.19, 0.05, 0.045, 0, 0.10, 0.24, mat=iron, rx=-0.25, bev=0.008)
    rivet_line(-0.07, 0.07, 0.115, 0.25, 4, steel)

def b_torso_magma():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    box('pelvis', 0.37, 0.29, 0.21, 0, 0, -0.06, mat=iron, bev=0.015)
    rivet_line(-0.15, 0.15, 0.15, -0.02, 5, steel)
    cyl('spine', 0.06, 0.44, 0, 0.02, 0.22, mat=steel, verts=12, rx=0.1)
    # magma core window in the chest
    cyl('magmacore', 0.10, 0.28, 0, 0.07, 0.28, mat=glow, verts=16)
    for i, z in enumerate([0.18, 0.28, 0.38]):
        torus(f'corering{i}', 0.105, 0.015, 0, 0.07, z, mat=iron, major=16, minor=8)
    # cracked chest plates tilted away from the core
    box('plate_tl', 0.15, 0.16, 0.05, 0.11, 0.14, 0.42, mat=steel, rx=-0.4, rz=0.3, bev=0.008)
    box('plate_tr', 0.15, 0.16, 0.05, -0.11, 0.14, 0.42, mat=steel, rx=-0.4, rz=-0.3, bev=0.008)
    box('plate_ll', 0.16, 0.15, 0.05, 0.115, 0.13, 0.15, mat=rust, rx=0.35, rz=-0.25, bev=0.008)
    box('plate_lr', 0.16, 0.15, 0.05, -0.115, 0.13, 0.15, mat=rust, rx=0.35, rz=0.25, bev=0.008)
    # glowing side vents
    for sx in [0.23, -0.23]:
        box(f'ventwell{sx}', 0.03, 0.14, 0.16, sx, 0.0, 0.28, mat=iron)
        box(f'ventglow{sx}', 0.032, 0.10, 0.03, sx, 0.0, 0.28, mat=glow)
        box(f'ventglow2{sx}', 0.032, 0.10, 0.03, sx, 0.0, 0.34, mat=glow)
    bolt_circle(0, 0.07, 0.44, 0.06, 6, 0.009, steel, axis='y')
    torso_sockets()

def b_arm_ember():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    # delt with glow seam
    box('delt', 0.15, 0.15, 0.12, 0, 0, -0.05, mat=rust, bev=0.010)
    box('deltseam', 0.16, 0.02, 0.02, 0, 0.065, -0.05, mat=glow)
    box('upper', 0.13, 0.13, 0.22, 0, 0, -0.18, mat=iron, bev=0.012)
    groove(0, 0.07, -0.18, 0.14, 0.006, 0.20)
    # forearm with glowing vent
    box('fore', 0.15, 0.15, 0.22, 0, 0, -0.40, mat=steel, bev=0.012)
    box('forevent', 0.10, 0.02, 0.12, 0, 0.075, -0.40, mat=iron)
    box('foreglow', 0.08, 0.022, 0.025, 0, 0.075, -0.40, mat=glow)
    piston(0, -0.085, -0.28, -0.46, 0.015, 0.024, steel, iron)
    # ember fist: knuckle cores glow
    box('fist', 0.10, 0.11, 0.10, 0, 0.01, -0.55, mat=iron, bev=0.010)
    for i in range(3):
        box(f'core{i}', 0.026, 0.045, 0.035, -0.032+i*0.032, 0.068, -0.56, mat=glow, bev=0.004)
    arm_weapon_socket()

def b_leg_ash():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    box('hip', 0.17, 0.18, 0.14, 0, 0, -0.06, mat=iron, bev=0.012)
    box('thigh', 0.18, 0.19, 0.28, 0, 0, -0.25, mat=rust, bev=0.014)
    box('thighseam', 0.19, 0.02, 0.02, 0, 0.095, -0.25, mat=glow)  # glow seam
    rivet_line(-0.065, 0.065, 0.10, -0.20, 4, steel)
    # knee with glow core
    box('knee', 0.16, 0.07, 0.12, 0, 0.09, -0.43, mat=steel, bev=0.010)
    box('kneeglow', 0.10, 0.02, 0.03, 0, 0.125, -0.43, mat=glow)
    # shin core: structural column knee -> ankle
    box('shin', 0.12, 0.12, 0.38, 0, 0, -0.67, mat=iron, bev=0.010)
    box('shinseam', 0.13, 0.02, 0.02, 0, 0.06, -0.67, mat=glow)
    layered_plate(0, 0.05, -0.66, 0.19, 0.11, 0.03, 3, steel, axis='y')
    # ankle glow cores + piston
    box('ankle', 0.13, 0.14, 0.12, 0, 0, -0.92, mat=iron, bev=0.010)
    box('ankleglow_l', 0.03, 0.10, 0.04, 0.05, 0.03, -0.92, mat=glow)
    box('ankleglow_r', 0.03, 0.10, 0.04, -0.05, 0.03, -0.92, mat=glow)
    piston(0, -0.10, -0.70, -0.95, 0.016, 0.026, steel, iron)
    box('foot', 0.21, 0.33, 0.10, 0, 0.06, -1.07, mat=iron, bev=0.012)
    box('sole', 0.22, 0.35, 0.02, 0, 0.06, -1.11, mat=rub)

def b_sh_flare():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    # layered mantle with glow vents between layers
    layered_plate(0.02, 0, 0.02, 0.22, 0.19, 0.035, 3, steel, axis='z')
    box('ventglow1', 0.18, 0.16, 0.015, 0.02, 0, 0.055, mat=glow)
    box('ventglow2', 0.16, 0.14, 0.015, 0.02, 0, 0.10, mat=glow)
    groove(0.02, 0, 0.14, 0.20, 0.17, 0.006)
    rivet_line(-0.05, 0.09, 0.095, 0.17, 4, iron)
    # flare spikes on the rim
    for i, a in enumerate([-0.4, 0, 0.4]):
        cone(f'spike{i}', 0.015, 0.004, 0.07, 0.02+math.sin(a)*0.10, math.cos(a)*0.08, 0.15, mat=rust, verts=8, ry=a)

def b_pk_pyre():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    # pyre stack: central vent with glow core
    cyl('stack', 0.11, 0.34, 0, -0.34, 0.26, mat=iron, verts=16)
    cyl('pyrecore', 0.06, 0.30, 0, -0.34, 0.26, mat=glow, verts=12)
    # cracked shroud chunks around the stack
    for i, a in enumerate([0.5, 2.0, 3.6, 5.1]):
        box(f'shroud{i}', 0.10, 0.06, 0.20, math.cos(a)*0.13, -0.34+math.sin(a)*0.10, 0.26, mat=rust, rz=a*0.5, bev=0.006)
    cone('crown', 0.13, 0.09, 0.08, 0, -0.34, 0.47, mat=steel, verts=16)
    rivet_line(-0.09, 0.09, -0.22, 0.12, 4, steel)
    greebles(0, -0.34, 0.06, (0.26, 0.10, 0.12), 6, [iron, oil, haz], seed=55)

def b_wp_brand():
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    cyl('shaft', 0.026, 0.52, 0, 0, 0.20, mat=rust, verts=10)
    cyl('grip', 0.034, 0.14, 0, 0, -0.04, mat=rub, verts=10)
    # vented collar
    cyl('collar', 0.055, 0.10, 0, 0, 0.42, mat=iron, verts=12)
    for i in range(4):
        box(f'collarvent{i}', 0.02, 0.06, 0.05, 0.045*math.cos(i*1.57), 0.045*math.sin(i*1.57), 0.42, mat=glow)
    # glowing brand head: faceted spear tip
    cone('brand', 0.06, 0.010, 0.26, 0, 0, 0.60, mat=glow, verts=8)
    cyl('brandbase', 0.045, 0.06, 0, 0, 0.47, mat=steel, verts=8)
    # counterweight pommel
    sph('pommel', 0.04, 0, 0, -0.12, mat=iron, sx=1, sy=1, sz=1.2)
    groove(0, 0.0, 0.20, 0.056, 0.006, 0.40)   # groove down the shaft
# Design language: the mech's restrained power breaking loose — cracked armor
# plates split apart to reveal a molten breach-glow core, overbuilt siege
# hardware, barely-contained energy. EVA-biomech + derby grit, original
# designs only. All 7 are BREACH-mode exclusive.
def _bmats():
    return (M(*IRON), M(*STEEL), M(*RUST), M(*HAZ), M(*RUB), M(*BONE),
            M(*OILRED), E('breachglow', BREACHGLOW))

def b_head_fracture():  # BREACH exclusive
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    cyl('neck', 0.08, 0.07, 0, 0, 0.035, mat=iron, verts=14)
    torus('neckring', 0.088, 0.014, 0, 0, 0.065, mat=steel, major=14, minor=8)
    # revealed core: molten skull the armor split open around
    sph('core', 0.10, 0, 0.02, 0.16, mat=glow, sx=1.0, sy=1.15, sz=1.0)
    # cracked dome: tilted chunks with fault gaps between them
    box('dome_top', 0.14, 0.14, 0.045, 0, 0.01, 0.275, mat=steel, rx=0.25, bev=0.008)
    box('dome_fl', 0.10, 0.11, 0.05, 0.065, 0.09, 0.21, mat=rust, rx=-0.3, rz=0.35, bev=0.006)
    box('dome_fr', 0.10, 0.11, 0.05, -0.065, 0.09, 0.21, mat=rust, rx=-0.3, rz=-0.35, bev=0.006)
    box('dome_bl', 0.10, 0.10, 0.05, 0.06, -0.075, 0.20, mat=steel, rx=0.3, rz=-0.3, bev=0.006)
    box('dome_br', 0.10, 0.10, 0.05, -0.06, -0.075, 0.20, mat=steel, rx=0.3, rz=0.3, bev=0.006)
    rivet_line(-0.05, 0.05, 0.075, 0.285, 3, iron)
    # split brow: gap vents the core
    box('brow_l', 0.075, 0.05, 0.05, 0.055, 0.115, 0.235, mat=rust, rx=-0.25, bev=0.006)
    box('brow_r', 0.075, 0.05, 0.05, -0.055, 0.115, 0.235, mat=rust, rx=-0.25, bev=0.006)
    # glowing visor slit riding proud of the core
    box('visor', 0.12, 0.02, 0.025, 0, 0.14, 0.17, mat=glow)
    # split jaw plates
    box('jaw_l', 0.065, 0.09, 0.06, 0.05, 0.075, 0.075, mat=iron, bev=0.006)
    box('jaw_r', 0.065, 0.09, 0.06, -0.05, 0.075, 0.075, mat=iron, bev=0.006)
    # cheek vents + rear vent horns
    box('cheek_l', 0.025, 0.09, 0.05, 0.10, 0.045, 0.13, mat=iron)
    box('cheek_r', 0.025, 0.09, 0.05, -0.10, 0.045, 0.13, mat=iron)
    cone('horn_l', 0.02, 0.008, 0.12, 0.075, -0.075, 0.26, mat=iron, verts=8, rx=-0.6)
    cone('horn_r', 0.02, 0.008, 0.12, -0.075, -0.075, 0.26, mat=iron, verts=8, rx=-0.6)

def b_torso_burstcoil():  # BREACH exclusive
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    box('pelvis', 0.36, 0.28, 0.20, 0, 0, -0.06, mat=iron, bev=0.015)
    rivet_line(-0.14, 0.14, 0.145, -0.02, 5, steel)
    cyl('spine', 0.055, 0.42, 0, 0.02, 0.22, mat=steel, verts=12, rx=0.12)
    # burst core: glowing coil the chest plating split open around
    cyl('coilcore', 0.095, 0.26, 0, 0.06, 0.28, mat=glow, verts=16)
    for i, z in enumerate([0.20, 0.28, 0.36]):
        torus(f'coilring{i}', 0.10, 0.014, 0, 0.06, z, mat=iron, major=16, minor=8)
    # burst chest plates: big tilted chunks, gaps vent the coil
    box('plate_tl', 0.14, 0.15, 0.05, 0.10, 0.13, 0.40, mat=steel, rx=-0.35, rz=0.25, bev=0.008)
    box('plate_tr', 0.14, 0.15, 0.05, -0.10, 0.13, 0.40, mat=steel, rx=-0.35, rz=-0.25, bev=0.008)
    box('plate_ll', 0.15, 0.14, 0.05, 0.105, 0.12, 0.17, mat=rust, rx=0.3, rz=-0.2, bev=0.008)
    box('plate_lr', 0.15, 0.14, 0.05, -0.105, 0.12, 0.17, mat=rust, rx=0.3, rz=0.2, bev=0.008)
    rivet_line(0.05, 0.15, 0.20, 0.40, 3, iron)
    rivet_line(-0.15, -0.05, 0.20, 0.40, 3, iron)
    # over-pressure side stacks with glowing bands
    for sx in [0.22, -0.22]:
        cyl(f'stack{sx}', 0.03, 0.24, sx, -0.08, 0.32, mat=rust, verts=12)
        cyl(f'stackglow{sx}', 0.032, 0.035, sx, -0.08, 0.28, mat=glow, verts=12)
        cone(f'stackflare{sx}', 0.03, 0.05, 0.06, sx, -0.08, 0.47, mat=iron, verts=12)
    cyl('yoke', 0.038, 0.88, 0, 0, 0.26, mat=iron, verts=10, ry=1.5708)
    torso_sockets()

def b_arm_rupture():  # BREACH exclusive (pair: one half, X-symmetric)
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    # split delt: two half-domes with a glowing seam between
    box('deltseam', 0.025, 0.11, 0.13, 0, 0, -0.05, mat=glow)
    sph('delt_a', 0.095, 0.045, 0, -0.05, mat=steel, sx=1, sy=1, sz=1.15)
    sph('delt_b', 0.095, -0.045, 0, -0.05, mat=steel, sx=1, sy=1, sz=1.15)
    # overbuilt upper arm: chunk plates flanking a glow gap
    box('upper', 0.15, 0.15, 0.22, 0, 0, -0.19, mat=iron, bev=0.012)
    box('uchunk_l', 0.06, 0.16, 0.20, 0.055, 0, -0.19, mat=rust, rz=0.12, bev=0.008)
    box('uchunk_r', 0.06, 0.16, 0.20, -0.055, 0, -0.19, mat=rust, rz=-0.12, bev=0.008)
    box('useam', 0.025, 0.155, 0.19, 0, 0, -0.19, mat=glow)
    # oversized overdrive piston on the back
    piston(0, -0.095, -0.10, -0.40, 0.020, 0.032, steel, iron)
    cyl('elbow', 0.05, 0.08, 0, 0, -0.32, mat=iron, verts=10, ry=1.5708)
    # cracked gauntlet: heavy forearm with chunk plates + glowing knuckle line
    box('fore', 0.17, 0.17, 0.22, 0, 0, -0.44, mat=steel, bev=0.012)
    box('gchunk_l', 0.06, 0.18, 0.20, 0.075, 0, -0.44, mat=iron, rz=0.15, bev=0.008)
    box('gchunk_r', 0.06, 0.18, 0.20, -0.075, 0, -0.44, mat=iron, rz=-0.15, bev=0.008)
    box('gchunk_b', 0.17, 0.06, 0.20, 0, -0.075, -0.44, mat=iron, rx=0.15, bev=0.008)
    box('knuckleglow', 0.15, 0.025, 0.03, 0, 0.08, -0.53, mat=glow)
    # crusher fist with glowing cracks
    box('fist', 0.14, 0.13, 0.12, 0, 0.01, -0.62, mat=iron, bev=0.012)
    box('fistcrack', 0.145, 0.02, 0.02, 0, 0.01, -0.62, mat=glow)
    for i in range(3):
        box(f'stud{i}', 0.03, 0.03, 0.03, -0.045+i*0.045, 0.075, -0.62, mat=steel, bev=0.005)
    arm_weapon_socket()

def b_leg_surge():  # BREACH exclusive (pair: one half, X-symmetric)
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    sph('hip', 0.09, 0, 0, -0.04, mat=iron, sx=1.1, sy=1.1, sz=0.9)
    box('thigh', 0.17, 0.18, 0.30, 0, 0, -0.24, mat=rust, bev=0.015)
    # cracked thigh: chunk plates flanking glowing front seams
    box('tchunk_l', 0.07, 0.05, 0.28, 0.065, 0.075, -0.24, mat=iron, rx=0.08, rz=-0.1, bev=0.008)
    box('tchunk_r', 0.07, 0.05, 0.28, -0.065, 0.075, -0.24, mat=iron, rx=0.08, rz=0.1, bev=0.008)
    box('tseam_l', 0.025, 0.02, 0.26, 0.03, 0.09, -0.24, mat=glow)
    box('tseam_r', 0.025, 0.02, 0.26, -0.03, 0.09, -0.24, mat=glow)
    # twin drive pistons
    piston(0.06, -0.095, -0.30, -0.62, 0.020, 0.030, steel, rust)
    piston(-0.06, -0.095, -0.30, -0.62, 0.020, 0.030, steel, rust)
    cyl('knee', 0.065, 0.11, 0, 0, -0.44, mat=iron, verts=10, ry=1.5708)
    box('kneevent', 0.09, 0.025, 0.05, 0, 0.06, -0.44, mat=glow)
    # cracked greave: heavy shin with chunk plates + glowing center seam
    box('shin', 0.18, 0.19, 0.32, 0, 0, -0.64, mat=iron, bev=0.015)
    box('greave_l', 0.075, 0.06, 0.30, 0.07, 0.075, -0.64, mat=steel, rx=-0.06, rz=-0.1, bev=0.008)
    box('greave_r', 0.075, 0.06, 0.30, -0.07, 0.075, -0.64, mat=steel, rx=-0.06, rz=0.1, bev=0.008)
    box('greaveseam', 0.03, 0.025, 0.28, 0, 0.095, -0.64, mat=glow)
    # heavy foot, sole at -1.11
    box('foot', 0.20, 0.34, 0.10, 0, 0.06, -1.06, mat=iron, bev=0.012)
    box('toeglow', 0.16, 0.025, 0.04, 0, 0.225, -1.03, mat=glow)
    box('sole', 0.21, 0.36, 0.02, 0, 0.06, -1.11, mat=rub)
    # ankle connectors: twin pistons bridging shin (-0.80) -> foot (-1.01).
    # Fixes the floating-foot gap the render pipeline's QC caught
    # (2026-10-09): the foot previously had nothing connecting it above.
    piston(0.055, 0.0, -0.80, -1.01, 0.022, 0.032, steel, rust)
    piston(-0.055, 0.0, -0.80, -1.01, 0.022, 0.032, steel, rust)

def b_sh_fracturecrest():  # BREACH exclusive (pair: one half, X-symmetric)
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    sph('cap', 0.11, 0, 0, 0.05, mat=steel, sx=1.1, sy=1.1, sz=0.85)
    rivet_line(-0.07, 0.07, 0.10, 0.05, 4, iron)
    # glowing fault line splitting the crest
    box('fault', 0.03, 0.15, 0.17, 0, 0, 0.13, mat=glow)
    # jagged crest blades flanking the fault
    box('blade_l', 0.055, 0.17, 0.22, 0.055, -0.03, 0.22, mat=iron, rz=0.38, rx=-0.12, bev=0.008)
    box('blade_r', 0.055, 0.17, 0.22, -0.055, -0.03, 0.22, mat=iron, rz=-0.38, rx=-0.12, bev=0.008)
    box('blade_f', 0.10, 0.05, 0.16, 0, 0.075, 0.18, mat=rust, rx=-0.2, bev=0.006)
    cone('spike', 0.035, 0.008, 0.16, 0, -0.09, 0.24, mat=rust, verts=8, rx=-0.5)

def b_pk_ventsurge():  # BREACH exclusive
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    box('frame', 0.26, 0.09, 0.32, 0, -0.06, 0.06, mat=iron, bev=0.01)
    box('strut_l', 0.04, 0.10, 0.06, 0.10, -0.03, -0.02, mat=iron)
    box('strut_r', 0.04, 0.10, 0.06, -0.10, -0.03, -0.02, mat=iron)
    # triple vent stacks: glowing cores inside cracked shrouds
    for sx in [0.09, 0, -0.09]:
        cyl(f'core{sx}', 0.032, 0.30, sx, -0.075, 0.26, mat=glow, verts=12)
        box(f'shroud_l{sx}', 0.045, 0.06, 0.28, sx+0.055, -0.075, 0.26, mat=rust, rz=-0.10, bev=0.006)
        box(f'shroud_r{sx}', 0.045, 0.06, 0.28, sx-0.055, -0.075, 0.26, mat=rust, rz=0.10, bev=0.006)
        torus(f'band1{sx}', 0.048, 0.011, sx, -0.075, 0.17, mat=iron, major=12, minor=8)
        torus(f'band2{sx}', 0.048, 0.011, sx, -0.075, 0.35, mat=iron, major=12, minor=8)
        cone(f'flare{sx}', 0.042, 0.062, 0.06, sx, -0.075, 0.44, mat=iron, verts=12)
    # pressure gauge + side tanks + cracked deflector
    cyl('gauge', 0.028, 0.02, 0.135, -0.115, 0.10, mat=haz, verts=10, rx=1.5708)
    cyl('tank_l', 0.045, 0.20, 0.165, -0.075, 0.12, mat=steel, verts=12)
    cyl('tank_r', 0.045, 0.20, -0.165, -0.075, 0.12, mat=steel, verts=12)
    box('deflector', 0.30, 0.03, 0.10, 0, -0.115, 0.50, mat=rust, rx=0.35, bev=0.005)

def b_wp_coremaul():  # BREACH exclusive
    iron, steel, rust, haz, rub, bone, oil, glow = _bmats()
    cyl('haft', 0.026, 0.55, 0, 0, 0.20, mat=rust, verts=10)
    cyl('grip', 0.033, 0.12, 0, 0, -0.02, mat=rub, verts=10)
    sph('pommel', 0.035, 0, 0, -0.10, mat=iron)
    # molten core inside a cracked siege head
    box('core', 0.14, 0.14, 0.22, 0, 0, 0.52, mat=glow)
    box('chunk_top', 0.15, 0.15, 0.06, 0, 0, 0.645, mat=steel, bev=0.008)
    box('chunk_bot', 0.15, 0.15, 0.06, 0, 0, 0.395, mat=steel, bev=0.008)
    box('chunk_l', 0.055, 0.15, 0.17, 0.0775, 0, 0.52, mat=iron, rz=0.08, bev=0.006)
    box('chunk_r', 0.055, 0.15, 0.17, -0.0775, 0, 0.52, mat=iron, rz=-0.08, bev=0.006)
    box('chunk_f', 0.15, 0.055, 0.17, 0, 0.0775, 0.52, mat=iron, rx=-0.08, bev=0.006)
    box('chunk_b', 0.15, 0.055, 0.17, 0, -0.0775, 0.52, mat=iron, rx=0.08, bev=0.006)
    rivet_line(-0.05, 0.05, 0.078, 0.645, 3, iron)
    cone('spike', 0.035, 0.008, 0.14, 0, 0, 0.745, mat=haz, verts=8)

# ============ REGISTRY ============
PARTS = [
 # pid, slot, name, description, modes, stats, builder
 ('hound-vis','head','Hound Visor','Bestial cowl with a wide hazard visor slit, riveted brow and exhaust nostrils.',['racer','combat','breach'],{'armor':4,'speed':7,'power':4,'weight':4},'b_head_hound'),
 ('scrap-crown','head','Scrap Crown','Riveted blocky cranium with a grilled face and cyclops optic band.',['racer','combat','breach'],{'armor':6,'speed':5,'power':5,'weight':6},'b_head_crown'),
 ('dart-probe','head','Dart Probe','Sleek teardrop aero head with canopy and swept rear fin. Racer mode.',['racer','breach'],{'armor':2,'speed':10,'power':3,'weight':2},'b_head_dart'),
 ('siege-maw','head','Siege Maw','Heavy jaw-crusher block head with armored cheeks and crusher teeth. Combat mode.',['combat','breach'],{'armor':9,'speed':2,'power':6,'weight':9},'b_head_maul'),
 ('ribcage-core','torso','Ribcage Core','Exposed ribbed organic core over a hunched spine column with an engine fan.',['racer','combat','breach'],{'armor':5,'speed':6,'power':6,'weight':5},'b_torso_ribcage'),
 ('pit-mono','torso','Pit Mono','Central keel frame with an organic chest shell and vented side pods.',['racer','combat','breach'],{'armor':4,'speed':8,'power':5,'weight':4},'b_torso_pitmono'),
 ('aero-wedge','torso','Aero Wedge','Streamlined wedge cockpit torso with strakes and a rear diffuser. Racer mode.',['racer','breach'],{'armor':3,'speed':10,'power':4,'weight':3},'b_torso_aerowedge'),
 ('siege-plate','torso','Siege Plate','Heavy riveted slab armor with a boiler chest and side exhaust. Combat mode.',['combat','breach'],{'armor':10,'speed':2,'power':5,'weight':10},'b_torso_siegeplate'),
 ('sinew-arm','arm','Sinew Arm','Sinewy biomech arm with an exposed piston and a plated knuckle hand.',['racer','combat','breach'],{'armor':5,'speed':6,'power':7,'weight':5},'b_arm_sinew'),
 ('wrecker-claw','arm','Wrecker Claw','Heavy arm ending in a three-finger wrecker claw.',['racer','combat','breach'],{'armor':7,'speed':4,'power':8,'weight':7},'b_arm_wrecker'),
 ('quickjack-arm','arm','Quickjack Arm','Slim finned pit-crew arm built for speed. Racer mode.',['racer','breach'],{'armor':3,'speed':10,'power':4,'weight':3},'b_arm_quickjack'),
 ('pile-arm','arm','Pile Arm','Armored heavy arm with a forearm ram plate. Combat mode.',['combat','breach'],{'armor':9,'speed':2,'power':8,'weight':9},'b_arm_pilearm'),
 ('derby-stomp','leg','Derby Stomp','Wide plated legs with tread shin guards and a hydraulic piston.',['racer','combat','breach'],{'armor':6,'speed':5,'power':7,'weight':6},'b_leg_stomp'),
 ('sinew-stilt','leg','Sinew Stilt','Digitigrade sinewy legs with ribbed plating and an exposed achilles piston.',['racer','combat','breach'],{'armor':5,'speed':7,'power':5,'weight':5},'b_leg_sinew'),
 ('street-sprinter','leg','Street Sprinter','Slim runner legs with an aero calf fairing and blade feet. Racer mode.',['racer','breach'],{'armor':3,'speed':10,'power':3,'weight':3},'b_leg_sprinter'),
 ('crusher-tread','leg','Crusher Tread','Massive tread-plate legs on twin hydraulic rams. Combat mode.',['combat','breach'],{'armor':9,'speed':3,'power':6,'weight':9},'b_leg_tread'),
 ('cowl-shroud','shoulder','Cowl Shroud','Ribbed organic shroud curving over the shoulder.',['racer','combat','breach'],{'armor':5,'speed':5,'power':3,'weight':5},'b_sh_cowl'),
 ('rivet-guard','shoulder','Rivet Guard','Riveted plate guard with a scrap skirt.',['racer','combat','breach'],{'armor':6,'speed':4,'power':3,'weight':6},'b_sh_rivetguard'),
 ('draft-fin','shoulder','Draft Fin','Aero fin shoulder for slipstream speed. Racer mode.',['racer','breach'],{'armor':2,'speed':9,'power':1,'weight':2},'b_sh_draftfin'),
 ('bullbar-guard','shoulder','Bullbar Guard','Forward bullbar hoops over heavy plate. Combat mode.',['combat','breach'],{'armor':8,'speed':3,'power':4,'weight':8},'b_sh_bullbar'),
 ('stack-pipes','backpack','Stack Pipes','Twin exhaust stacks with bands, flares and rain flaps.',['racer','combat','breach'],{'armor':4,'speed':5,'power':6,'weight':5},'b_pk_stacks'),
 ('cage-rig','backpack','Cage Rig','Roll-cage frame bolted over the back.',['racer','combat','breach'],{'armor':6,'speed':4,'power':3,'weight':6},'b_pk_cage'),
 ('aero-sail','backpack','Aero Sail','Big spoiler sail with endplates for downforce. Racer mode.',['racer','breach'],{'armor':2,'speed':9,'power':3,'weight':3},'b_pk_aerosail'),
 ('war-rack','backpack','War Rack','Ammo drums and a spare spike rack. Combat mode.',['combat','breach'],{'armor':7,'speed':3,'power':7,'weight':7},'b_pk_warrack'),
 ('scrap-sledge','weapon','Scrap Sledge','Welded-plate sledgehammer with a spike poll.',['racer','combat','breach'],{'armor':2,'speed':5,'power':9,'weight':7},'b_wp_sledge'),
 ('ripper-chain','weapon','Ripper Chain','Motor-driven chain bar with hazard teeth.',['racer','combat','breach'],{'armor':1,'speed':7,'power':8,'weight':5},'b_wp_ripper'),
 ('ram-lance','weapon','Ram Lance','Streamlined boost lance with an aero ram head. Racer mode.',['racer','breach'],{'armor':1,'speed':9,'power':6,'weight':4},'b_wp_ramlance'),
 ('pile-spike','weapon','Pile Spike','Piston-driven spike driver. Combat mode.',['combat','breach'],{'armor':3,'speed':4,'power':10,'weight':7},'b_wp_pilespike'),
 # --- BREACH batch: rage-gated third form, all breach-exclusive ---
 ('fracture-helm','head','Fracture Helm','Cracked helm split open to vent a breach-glow core, split brow and vent horns. Breach mode.',['breach'],{'armor':8,'speed':3,'power':7,'weight':8},'b_head_fracture'),
 ('burst-coil','torso','Burst Coil','Siege torso whose chest plating burst open around a glowing coil core. Breach mode.',['breach'],{'armor':9,'speed':3,'power':8,'weight':9},'b_torso_burstcoil'),
 ('rupture-maul','arm','Rupture Maul','Overbuilt arm with cracked gauntlet plates, a split delt and overdrive pistons. Breach mode.',['breach'],{'armor':8,'speed':3,'power':10,'weight':9},'b_arm_rupture'),
 ('surge-stomp','leg','Surge Stomp','Heavy leg with cracked greaves, glowing seams and twin drive pistons. Breach mode.',['breach'],{'armor':9,'speed':3,'power':8,'weight':9},'b_leg_surge'),
 ('fracture-crest','shoulder','Fracture Crest','Jagged crest split by a glowing fault line. Breach mode.',['breach'],{'armor':7,'speed':3,'power':5,'weight':7},'b_sh_fracturecrest'),
 ('vent-surge','backpack','Vent Surge','Overloaded triple vent stack with cracked shrouds venting breach-glow. Breach mode.',['breach'],{'armor':6,'speed':4,'power':9,'weight':8},'b_pk_ventsurge'),
 ('core-maul','weapon','Core Maul','Siege maul with a cracked head venting a molten core. Breach mode.',['breach'],{'armor':2,'speed':4,'power':10,'weight':8},'b_wp_coremaul'),
 # --- BRUISER DISTINCT COMBAT SET (bruiser2): replaces the shared scout
 # combat set for the bruiser build. Layered siege-bastion language.
 ('head-bruiser2','head','Bulwark Helm','Heavy angular helm with an offset mono-eye sensor, cheek vents and a grooved crest fin. Bruiser combat.',['combat'],{'armor':16,'speed':4,'power':7,'weight':9},'b_head_bulwark'),
 ('torso-bruiser2','torso','Bastion Core','Layered front armor over a spine frame, panel grooves, side vents and rivet fields. Bruiser combat.',['combat'],{'armor':19,'speed':3,'power':6,'weight':10},'b_torso_bastion'),
 ('arms-bruiser2','arm','Forge Gauntlet','Heavy fists with knuckle plates, forearm vent and exposed piston. Bruiser combat.',['combat'],{'armor':16,'speed':3,'power':9,'weight':9},'b_arm_forge'),
 ('legs-bruiser2','leg','Pylon Stomp','Wide pylon legs with a vented knee shroud, layered greaves and twin ankle pistons. Bruiser combat.',['combat'],{'armor':17,'speed':3,'power':7,'weight':10},'b_leg_pylon'),
 ('shoulders-bruiser2','shoulder','Slab Pauldron','Asymmetric layered slab pauldrons with panel grooves and rivets. Bruiser combat.',['combat'],{'armor':15,'speed':3,'power':5,'weight':8},'b_sh_slab'),
 ('backpack-bruiser2','backpack','Furnace Pack','Vented boiler drum with twin exhaust stacks and flares. Bruiser combat.',['combat'],{'armor':13,'speed':4,'power':7,'weight':8},'b_pk_furnace'),
 ('weapon-bruiser2','weapon','Shear Jaws','Hydraulic demolition shear with toothed pincer jaws. Bruiser combat.',['combat'],{'armor':3,'speed':4,'power':10,'weight':8},'b_wp_shear'),
 # --- BRUISER DISTINCT BREACH SET (bruiser3): contained-inferno language,
 # glowing cores venting through cracked plating.
 ('head-bruiser3','head','Cinder Crown','Horned helm split around a glowing core, vent slits and a glow visor. Bruiser breach.',['breach'],{'armor':15,'speed':4,'power':8,'weight':9},'b_head_cinder'),
 ('torso-bruiser3','torso','Magma Heart','Magma core window ringed by cracked chest plates and glowing side vents. Bruiser breach.',['breach'],{'armor':18,'speed':3,'power':9,'weight':10},'b_torso_magma'),
 ('arms-bruiser3','arm','Ember Fist','Arms with glowing knuckle cores, forearm vent glow and a panel groove. Bruiser breach.',['breach'],{'armor':16,'speed':4,'power':10,'weight':9},'b_arm_ember'),
 ('legs-bruiser3','leg','Ash Stride','Legs with glowing knee, ankle and thigh-seam cores over layered greaves. Bruiser breach.',['breach'],{'armor':17,'speed':4,'power':8,'weight':10},'b_leg_ash'),
 ('shoulders-bruiser3','shoulder','Flare Mantle','Layered mantle with glow vents between the plates and rim flare spikes. Bruiser breach.',['breach'],{'armor':14,'speed':4,'power':6,'weight':8},'b_sh_flare'),
 ('backpack-bruiser3','backpack','Pyre Stack','Central vent stack with a glowing pyre core under cracked shroud chunks. Bruiser breach.',['breach'],{'armor':12,'speed':5,'power':9,'weight':8},'b_pk_pyre'),
 ('weapon-bruiser3','weapon','Brand Lance','Spear with a glowing faceted brand head, vented collar and grooved shaft. Bruiser breach.',['breach'],{'armor':2,'speed':5,'power':10,'weight':7},'b_wp_brand'),
]

def main():
    only = os.environ.get('PART_ONLY')
    results = {}
    for pid, slot, name, desc, modes, stats, builder in PARTS:
        if only and pid != only:
            continue
        clear()
        globals()[builder]()
        if slot in PAIR_DX:
            # Contract: pair-slot GLBs carry BOTH halves, mirrored about the
            # socket-pair midpoint (the viewer mounts once at the midpoint).
            mirror_pair(PAIR_DX[slot])
        tris = export_part(pid, slot, name, desc, modes, stats)
        results[pid] = tris
    summ = os.path.join(os.path.dirname(OUT), 'build_summary.json')
    # Merge with the existing summary so PART_ONLY runs don't clobber it.
    try:
        merged = json.load(open(summ))
    except (OSError, ValueError):
        merged = {}
    merged.update(results)
    json.dump(merged, open(summ, 'w'), indent=1)
    over = [k for k, v in results.items() if v > 8000]
    print(f'DONE parts={len(results)} over_8k={over}')

main()
