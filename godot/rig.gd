class_name Rig
extends CharacterBody3D

const VEHICLE := 0
const HYBRID := 1
const MECH := 2

const CLASSES := {
	"muscle": {
		"name": "Muscle",
		"speed": 34.0, "accel": 42.0, "turn": 2.35,
		"armor": 120.0, "mass": 1.35,
		"grip": 6.5, "drift": 1.15,
		"grapple": true, "jets": false, "smash": false, "pivot": false,
		"gun": 9.0, "gun_cd": 0.16, "shot": 46.0,
		"color": Color(0.878, 0.541, 0.173),
	},
	"bike": {
		"name": "Superbike",
		"speed": 46.0, "accel": 54.0, "turn": 3.15,
		"armor": 72.0, "mass": 0.55,
		"grip": 4.2, "drift": 1.4,
		"grapple": false, "jets": true, "smash": false, "pivot": false,
		"gun": 16.0, "gun_cd": 0.42, "shot": 72.0,
		"color": Color(0.243, 0.780, 1.0),
	},
	"heavy": {
		"name": "Heavy Rig",
		"speed": 22.0, "accel": 16.0, "turn": 1.15,
		"armor": 200.0, "mass": 2.7,
		"grip": 9.0, "drift": 2.4,
		"grapple": true, "jets": false, "smash": true, "pivot": false,
		"gun": 18.0, "gun_cd": 0.38, "shot": 32.0,
		"color": Color(0.824, 0.294, 0.294),
	},
	"loader": {
		"name": "Loader",
		"speed": 18.0, "accel": 18.0, "turn": 2.05,
		"armor": 168.0, "mass": 2.2,
		"grip": 10.0, "drift": 3.2,
		"grapple": true, "jets": false, "smash": true, "pivot": true,
		"gun": 8.0, "gun_cd": 0.2, "shot": 38.0,
		"color": Color(0.886, 0.757, 0.290),
	},
}

var class_id := "muscle"
var is_bot := false
var cls: Dictionary = {}
var stance := VEHICLE
var yaw := 0.0
var turret_yaw := 0.0
var hull := 100.0
var hull_max := 100.0
var lives := 3
var alive := true
var invuln := 0.0
var stance_lock := 0.0
var fire_cd := 0.0
var melee_cd := 0.0
var grab_cd := 0.0
var ram_cd := {}
var vel := Vector3.ZERO

var _hull_shape: BoxShape3D
var _visual: Node3D
var _torso: Node3D
var _legs: Node3D
var _wheels: Node3D
var _nose: MeshInstance3D

func setup(id: String, bot: bool) -> void:
	class_id = id
	is_bot = bot

func _ready() -> void:
	cls = CLASSES[class_id]
	hull_max = float(cls.armor)
	hull = hull_max
	lives = 2 if is_bot else 3
	collision_layer = 2
	collision_mask = 3
	floor_max_angle = deg_to_rad(50)
	floor_snap_length = 0.45
	_hull_shape = BoxShape3D.new()
	var col := CollisionShape3D.new()
	col.shape = _hull_shape
	col.name = "Hull"
	add_child(col)
	_build_visual()
	_apply_hull()
	add_to_group("rig")

func forward() -> Vector3:
	return Vector3(-sin(yaw), 0.0, -cos(yaw))

func right() -> Vector3:
	return Vector3(cos(yaw), 0.0, -sin(yaw))

func turret_forward() -> Vector3:
	return Vector3(-sin(turret_yaw), 0.0, -cos(turret_yaw))

func planar_speed() -> float:
	return Vector2(vel.x, vel.z).length()

func stance_name() -> String:
	match stance:
		VEHICLE:
			return "VEHICLE"
		HYBRID:
			return "HYBRID"
		_:
			return "MECH"

func set_stance(next: int) -> void:
	if not alive or next == stance or stance_lock > 0.0:
		return
	if next < VEHICLE or next > MECH:
		return
	stance = next
	stance_lock = 0.4
	var mul := 1.0
	if stance == HYBRID:
		mul = 0.5
	elif stance == MECH:
		mul = 0.3
	vel *= mul
	if stance != HYBRID:
		turret_yaw = yaw
	_apply_hull()

func drive(inp: Dictionary, dt: float, _bot: bool) -> void:
	if not alive:
		return
	stance_lock = max(0.0, stance_lock - dt)
	fire_cd = max(0.0, fire_cd - dt)
	melee_cd = max(0.0, melee_cd - dt)
	grab_cd = max(0.0, grab_cd - dt)
	invuln = max(0.0, invuln - dt)
	var want: int = int(inp.get("stance", stance))
	if want != stance:
		set_stance(want)
	var throttle := float(inp.get("throttle", 0.0))
	var steer := float(inp.get("steer", 0.0))
	var strafe := float(inp.get("strafe", 0.0))
	var aim := float(inp.get("aim", 0.0))
	var drift: bool = bool(inp.get("drift", false))
	var fire: bool = bool(inp.get("fire", false))
	var grab: bool = bool(inp.get("grapple", false))
	var accel := float(cls.accel)
	var turn := float(cls.turn) * (1.35 if bool(cls.pivot) else 1.0)
	var fwd := forward()
	var rt := right()
	var max_speed := float(cls.speed)
	if stance == HYBRID:
		max_speed *= 0.5
		var slide := 1.5
		vel += fwd * throttle * accel * dt
		vel += -rt * strafe * accel * 0.9 * dt
		yaw += strafe * turn * 0.45 * dt
		_bleed(fwd, slide)
		turret_yaw = wrapf(turret_yaw + aim * 2.4 * dt, -PI, PI)
	elif stance == MECH:
		max_speed *= 0.3
		yaw += steer * turn * 1.35 * dt
		turret_yaw = yaw
		var wish := fwd * throttle * max_speed
		var k := 1.0 - exp(-7.0 * dt)
		vel = vel.lerp(wish, k)
	else:
		vel += fwd * throttle * accel * dt
		var grip := float(cls.drift if drift else cls.grip)
		_bleed(fwd, grip)
		var lon := vel.dot(fwd)
		var factor := clampf(planar_speed() / 7.0, 0.2, 1.0)
		var reverse := -1.0 if lon < -0.8 else 1.0
		yaw += steer * turn * factor * reverse * dt
		turret_yaw = yaw
		if bool(cls.jets) and drift:
			velocity.y = 7.5
	if stance == HYBRID and bool(cls.jets) and drift:
		velocity.y = 8.0
	if vel.length() > max_speed:
		vel = vel.normalized() * max_speed
	velocity.x = vel.x
	velocity.z = vel.z
	if is_on_floor():
		if velocity.y < 0.0:
			velocity.y = -0.4
	else:
		velocity.y -= 30.0 * dt
	move_and_slide()
	vel.x = velocity.x
	vel.z = velocity.z
	rotation.y = yaw
	_pose_visual()
	_ram()
	if fire:
		_attack()
	if grab:
		_grapple()

func think(target: Rig, dt: float) -> Dictionary:
	var inp := {
		"throttle": 0.0, "steer": 0.0, "strafe": 0.0, "aim": 0.0,
		"fire": false, "drift": false, "grapple": false, "stance": stance,
	}
	if target == null or not target.alive:
		inp.throttle = 0.35
		inp.steer = 0.4
		return inp
	var to := target.global_position - global_position
	to.y = 0.0
	var dist := to.length()
	var desired := atan2(-to.x, -to.z)
	var diff := wrapf(desired - yaw, -PI, PI)
	var want := VEHICLE
	if dist < 8.0 and bool(cls.grapple):
		want = MECH
	elif dist < 26.0:
		want = HYBRID
	inp.stance = want
	inp.throttle = 1.0 if dist > 9.0 else 0.35
	if dist < 6.0 and stance == MECH:
		inp.throttle = 0.2
	if stance == HYBRID:
		inp.strafe = clampf(diff * 1.4, -1.0, 1.0)
		var adiff := wrapf(desired - turret_yaw, -PI, PI)
		inp.aim = clampf(adiff * 3.0, -1.0, 1.0)
		inp.fire = dist < 30.0 and abs(adiff) < 0.45
	elif stance == MECH:
		inp.steer = clampf(diff * 2.2, -1.0, 1.0)
		inp.fire = dist < 5.2
		inp.grapple = dist < 7.5 and bool(cls.grapple) and grab_cd <= 0.0
	else:
		inp.steer = clampf(diff * 2.0, -1.0, 1.0)
		inp.drift = abs(diff) > 0.7 and planar_speed() > 10.0
		inp.fire = dist < 22.0 and abs(diff) < 0.35
	if dt < 0.0:
		pass
	return inp

func hurt(amount: float, _from: Node) -> void:
	if not alive or invuln > 0.0 or amount <= 0.0:
		return
	var soak := 1.0
	if stance == HYBRID:
		soak = 1.0 / 1.2
	elif stance == MECH:
		soak = 1.0 / 1.5
	hull -= amount * soak
	if hull > 0.0:
		return
	lives -= 1
	if lives <= 0:
		alive = false
		hull = 0.0
		visible = false
		vel = Vector3.ZERO
		velocity = Vector3.ZERO
		collision_layer = 0
		return
	hull = hull_max
	invuln = 1.6
	vel = Vector3.ZERO
	velocity = Vector3.ZERO
	stance = VEHICLE
	_apply_hull()

func shot_origin() -> Vector3:
	var dir := turret_forward() if stance != VEHICLE else forward()
	return global_position + Vector3.UP * (1.7 if stance != VEHICLE else 0.7) + dir * 2.2

func shot_dir() -> Vector3:
	if stance == VEHICLE:
		return forward()
	return turret_forward()

func _bleed(fwd: Vector3, grip: float) -> void:
	var rt := Vector3(fwd.z, 0.0, -fwd.x)
	var lon := vel.dot(fwd)
	var lat := vel.dot(rt)
	lat *= exp(-grip * get_physics_process_delta_time())
	vel = fwd * lon + rt * lat

func _attack() -> void:
	if stance == MECH:
		if melee_cd > 0.0:
			return
		melee_cd = 0.48
		var reach := 6.2 if bool(cls.smash) else 4.4
		var dmg := 28.0 if bool(cls.smash) else 16.0
		for n in get_tree().get_nodes_in_group("rig"):
			var other := n as Rig
			if other == null or other == self or not other.alive:
				continue
			var rel := other.global_position - global_position
			rel.y = 0.0
			if rel.length() > reach:
				continue
			if rel.normalized().dot(forward()) < 0.25 and not bool(cls.smash):
				continue
			other.hurt(dmg * float(cls.mass), self)
			other.vel += forward() * (10.0 if bool(cls.smash) else 6.0)
		return
	if fire_cd > 0.0:
		return
	fire_cd = float(cls.gun_cd) * (0.7 if stance == HYBRID else 1.0)
	var dmg := float(cls.gun) * (1.15 if stance == HYBRID else 1.0)
	var splash := stance == HYBRID and bool(cls.smash)
	get_tree().call_group("derby", "spawn_shot", shot_origin(), shot_dir(), float(cls.shot), dmg, self, cls.color, splash)

func _grapple() -> void:
	if stance != MECH or not bool(cls.grapple) or grab_cd > 0.0:
		return
	grab_cd = 0.9
	var best: Rig = null
	var best_d := 8.0 if not bool(cls.pivot) else 9.5
	for n in get_tree().get_nodes_in_group("rig"):
		var other := n as Rig
		if other == null or other == self or not other.alive:
			continue
		var d := global_position.distance_to(other.global_position)
		if d < best_d:
			best_d = d
			best = other
	if best == null:
		return
	if not bool(cls.grapple):
		return
	if class_id == "bike":
		return
	best.global_position = global_position + forward() * 2.4
	best.vel = forward() * (16.0 if bool(cls.smash) else 11.0)
	best.hurt(22.0 * float(cls.mass), self)

func _ram() -> void:
	if stance != VEHICLE:
		return
	var speed := planar_speed()
	if speed < 8.0:
		return
	for i in get_slide_collision_count():
		var hit := get_slide_collision(i)
		var other := hit.get_collider()
		if other is Rig and other != self and other.alive:
			var key := str(other.get_instance_id())
			var until: float = float(ram_cd.get(key, 0.0))
			if Time.get_ticks_msec() / 1000.0 < until:
				continue
			ram_cd[key] = Time.get_ticks_msec() / 1000.0 + 0.45
			var punch := speed * float(cls.mass) * 0.85
			other.hurt(punch, self)
			other.vel += forward() * min(speed, 18.0) * 0.35

func _apply_hull() -> void:
	var size := Vector3(2.1, 1.0, 4.3)
	if class_id == "bike":
		size = Vector3(1.1, 0.9, 2.6)
	elif class_id == "heavy":
		size = Vector3(2.6, 1.4, 6.4)
	elif class_id == "loader":
		size = Vector3(2.4, 1.3, 4.8)
	if stance == HYBRID:
		size.y += 1.3
	elif stance == MECH:
		size = Vector3(1.5, 2.8, 1.5)
		if bool(cls.smash):
			size = Vector3(2.2, 3.4, 2.2)
	_hull_shape.size = size
	var col := get_node("Hull") as CollisionShape3D
	col.position = Vector3(0, size.y * 0.5, 0)

func _pose_visual() -> void:
	var lift := 0.0
	if stance == HYBRID:
		lift = 0.85
	elif stance == MECH:
		lift = 1.45
	_torso.position = Vector3(0, 0.7 + lift, -0.1)
	_torso.visible = stance != VEHICLE
	_legs.visible = stance == MECH
	_wheels.visible = stance != MECH
	_nose.visible = stance == VEHICLE
	if stance != VEHICLE:
		_torso.rotation.y = wrapf(turret_yaw - yaw, -PI, PI)
	else:
		_torso.rotation.y = 0.0
	var spin := planar_speed() * 0.12
	for w in _wheels.get_children():
		w.rotate_object_local(Vector3.RIGHT, spin * get_physics_process_delta_time())

func _build_visual() -> void:
	_visual = Node3D.new()
	add_child(_visual)
	var tint: Color = cls.color
	var body := _box(Vector3(1.9, 0.55, 3.6), Vector3(0, 0.55, 0), tint, 0.35)
	if class_id == "bike":
		body.mesh.size = Vector3(0.7, 0.45, 2.2)
	elif class_id == "heavy":
		body.mesh.size = Vector3(2.4, 0.8, 5.6)
	elif class_id == "loader":
		body.mesh.size = Vector3(2.2, 0.7, 4.2)
	_visual.add_child(body)
	_nose = _box(Vector3(0.5, 0.28, 0.7), Vector3(0, 0.62, -1.9), tint.lightened(0.25), 0.1)
	_visual.add_child(_nose)
	_wheels = Node3D.new()
	_visual.add_child(_wheels)
	var wx := 0.85
	var wz := 1.25
	if class_id == "heavy":
		wx = 1.15
		wz = 2.1
	for p in [Vector3(-wx, 0.32, -wz), Vector3(wx, 0.32, -wz), Vector3(-wx, 0.32, wz), Vector3(wx, 0.32, wz)]:
		var wheel := _cyl(0.32, 0.22, p, Color(0.08, 0.08, 0.09))
		wheel.rotation.z = PI * 0.5
		_wheels.add_child(wheel)
	_torso = Node3D.new()
	_visual.add_child(_torso)
	_torso.add_child(_box(Vector3(1.1, 0.7, 0.7), Vector3(0, 0.45, 0), tint.darkened(0.15), 0.2))
	_torso.add_child(_sphere(0.28, Vector3(0, 0.95, -0.05), tint.lightened(0.35)))
	var gun := _box(Vector3(0.16, 0.16, 1.1), Vector3(0.35, 0.45, -0.7), Color(0.15, 0.16, 0.18), 0.6)
	_torso.add_child(gun)
	_torso.add_child(_box(Vector3(0.16, 0.16, 1.1), Vector3(-0.35, 0.45, -0.7), Color(0.15, 0.16, 0.18), 0.6))
	_legs = Node3D.new()
	_visual.add_child(_legs)
	_legs.add_child(_box(Vector3(0.28, 0.9, 0.28), Vector3(-0.28, 0.45, 0), tint.darkened(0.3), 0.4))
	_legs.add_child(_box(Vector3(0.28, 0.9, 0.28), Vector3(0.28, 0.45, 0), tint.darkened(0.3), 0.4))
	_torso.visible = false
	_legs.visible = false

func _box(size: Vector3, pos: Vector3, color: Color, metal: float) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mi.mesh = mesh
	mi.position = pos
	mi.material_override = _mat(color, metal)
	return mi

func _cyl(radius: float, height: float, pos: Vector3, color: Color) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mi.mesh = mesh
	mi.position = pos
	mi.material_override = _mat(color, 0.5)
	return mi

func _sphere(radius: float, pos: Vector3, color: Color) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mi.mesh = mesh
	mi.position = pos
	mi.material_override = _mat(color, 0.15)
	return mi

func _mat(color: Color, metal: float) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.metallic = metal
	m.roughness = 0.62
	return m
