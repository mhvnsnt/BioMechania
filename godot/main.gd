extends Node3D

const CLASS_IDS := ["muscle", "bike", "heavy", "loader"]

var player: Rig
var bots: Array[Rig] = []
var playing := false
var ended := false
var cam: Camera3D
var cam_pos := Vector3(0, 6, 18)
var shots: Array[MeshInstance3D] = []
var forced_stance := -1
var joy := Vector2.ZERO
var joy_id := -1
var joy_origin := Vector2.ZERO
var fire_held := false
var drift_held := false
var grab_held := false
var hud: Label
var banner: Label
var menu: Control
var end_panel: Control
var hint: Label

func _ready() -> void:
	add_to_group("derby")
	_world()
	_shots_pool()
	_ui()
	_install_probe()

func _physics_process(dt: float) -> void:
	if not playing:
		var boot := _js("(window.__stanceBoot||(window.parent&&window.parent!==window&&window.parent.__stanceBoot)||'')")
		if CLASS_IDS.has(boot):
			_begin(boot)
		_publish_probe()
		return
	if player and player.alive:
		player.drive(_read_input(), dt, false)
	elif player:
		player.velocity = Vector3.ZERO
	for b in bots:
		if b.alive and player:
			b.drive(b.think(player, dt), dt, true)
	_shots(dt)
	_hazards(dt)
	_smash()
	_camera(dt)
	_hud()
	_publish_probe()
	_check_end()

func _world() -> void:
	var env := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.035, 0.043, 0.06)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color(0.45, 0.5, 0.62)
	e.ambient_light_energy = 0.45
	e.fog_enabled = true
	e.fog_mode = Environment.FOG_MODE_EXPONENTIAL
	e.fog_density = 0.012
	e.fog_light_color = Color(0.04, 0.05, 0.08)
	env.environment = e
	add_child(env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48, 28, 0)
	sun.light_energy = 1.15
	sun.light_color = Color(1.0, 0.93, 0.82)
	sun.shadow_enabled = false
	add_child(sun)
	_static_box(Vector3(180, 2, 180), Vector3(0, -1, 0), Color(0.09, 0.1, 0.11), 1)
	_static_box(Vector3(86, 0.08, 86), Vector3(0, 0.02, 0), Color(0.16, 0.17, 0.18), 1, false)
	_ring_walls()
	_static_box(Vector3(18, 0.6, 10), Vector3(-32, 0.7, 6), Color(0.22, 0.18, 0.14), 1).rotation.z = deg_to_rad(-16)
	_static_box(Vector3(18, 0.6, 10), Vector3(32, 0.7, -8), Color(0.22, 0.18, 0.14), 1).rotation.z = deg_to_rad(16)
	for i in 8:
		var a := TAU * float(i) / 8.0
		var p := Vector3(sin(a) * 28.0, 0.0, cos(a) * 28.0)
		var bar := _static_box(Vector3(1.2, 1.3, 6.0), p + Vector3(0, 0.65, 0), Color(0.75, 0.32, 0.12), 1)
		bar.rotation.y = a
		bar.add_to_group("barrier")
		_lamp(Vector3(sin(a) * 40.0, 0.0, cos(a) * 40.0))
	_static_box(Vector3(14, 0.12, 16), Vector3(50, 0.08, -8), Color(0.55, 0.08, 0.07), 1, false)
	var tag := Label3D.new()
	tag.text = "PIT"
	tag.font_size = 48
	tag.modulate = Color(1, 0.35, 0.25)
	tag.position = Vector3(50, 1.6, -8)
	tag.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(tag)

func _ring_walls() -> void:
	var thick := 4.0
	var span := 96.0
	_static_box(Vector3(span, 6, thick), Vector3(0, 3, -48), Color(0.12, 0.13, 0.15), 1)
	_static_box(Vector3(span, 6, thick), Vector3(0, 3, 48), Color(0.12, 0.13, 0.15), 1)
	_static_box(Vector3(thick, 6, span), Vector3(-48, 3, 0), Color(0.12, 0.13, 0.15), 1)
	_static_box(Vector3(thick, 6, span), Vector3(48, 3, 0), Color(0.12, 0.13, 0.15), 1)

func _static_box(size: Vector3, pos: Vector3, color: Color, layer: int, solid := true) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.position = pos
	body.collision_layer = layer if solid else 0
	body.collision_mask = 0
	var shape := BoxShape3D.new()
	shape.size = size
	var col := CollisionShape3D.new()
	col.shape = shape
	body.add_child(col)
	var mi := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mi.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.86
	if color.r > 0.4 and color.g < 0.2:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 0.6
	mi.material_override = mat
	body.add_child(mi)
	add_child(body)
	return body

func _lamp(pos: Vector3) -> void:
	var pole := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.08
	mesh.bottom_radius = 0.1
	mesh.height = 4.2
	pole.mesh = mesh
	pole.position = pos + Vector3(0, 2.1, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.2, 0.2, 0.22)
	pole.material_override = mat
	add_child(pole)
	var bulb := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = 0.28
	sm.height = 0.56
	bulb.mesh = sm
	bulb.position = pos + Vector3(0, 4.3, 0)
	var bm := StandardMaterial3D.new()
	bm.albedo_color = Color(1, 0.78, 0.42)
	bm.emission_enabled = true
	bm.emission = Color(1, 0.72, 0.35)
	bm.emission_energy_multiplier = 2.4
	bulb.material_override = bm
	add_child(bulb)
	var light := OmniLight3D.new()
	light.position = bulb.position
	light.light_color = Color(1, 0.78, 0.45)
	light.light_energy = 1.1
	light.omni_range = 14.0
	light.shadow_enabled = false
	add_child(light)

func _shots_pool() -> void:
	for i in 28:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = 0.18
		sm.height = 0.36
		mi.mesh = sm
		mi.visible = false
		var mat := StandardMaterial3D.new()
		mat.emission_enabled = true
		mat.emission_energy_multiplier = 3.0
		mi.material_override = mat
		add_child(mi)
		shots.append(mi)

func spawn_shot(origin: Vector3, dir: Vector3, speed: float, dmg: float, owner: Node, color: Color, splash: bool) -> void:
	for mi in shots:
		if mi.visible:
			continue
		mi.visible = true
		mi.global_position = origin
		var mat := mi.material_override as StandardMaterial3D
		mat.albedo_color = color
		mat.emission = color
		mi.set_meta("vel", dir.normalized() * speed)
		mi.set_meta("life", 1.35)
		mi.set_meta("dmg", dmg)
		mi.set_meta("owner", owner.get_instance_id())
		mi.set_meta("splash", splash)
		return

func _shots(dt: float) -> void:
	for mi in shots:
		if not mi.visible:
			continue
		var life := float(mi.get_meta("life")) - dt
		mi.set_meta("life", life)
		var v: Vector3 = mi.get_meta("vel")
		mi.global_position += v * dt
		if life <= 0.0 or abs(mi.global_position.x) > 70.0 or abs(mi.global_position.z) > 70.0:
			mi.visible = false
			continue
		for n in get_tree().get_nodes_in_group("rig"):
			var rig := n as Rig
			if rig == null or not rig.alive:
				continue
			if rig.get_instance_id() == int(mi.get_meta("owner")):
				continue
			if rig.global_position.distance_to(mi.global_position) > 1.8:
				continue
			rig.hurt(float(mi.get_meta("dmg")), null)
			if bool(mi.get_meta("splash")):
				for m in get_tree().get_nodes_in_group("rig"):
					var other := m as Rig
					if other and other.alive and other.global_position.distance_to(mi.global_position) < 4.5:
						other.hurt(float(mi.get_meta("dmg")) * 0.45, null)
			mi.visible = false
			break

func _hazards(dt: float) -> void:
	for n in get_tree().get_nodes_in_group("rig"):
		var rig := n as Rig
		if rig == null or not rig.alive:
			continue
		var p := rig.global_position
		if abs(p.x - 50.0) < 7.0 and abs(p.z + 8.0) < 8.0:
			rig.hurt(16.0 * dt, null)

func _smash() -> void:
	for n in get_tree().get_nodes_in_group("rig"):
		var rig := n as Rig
		if rig == null or not rig.alive:
			continue
		if not bool(rig.cls.smash) or rig.stance != Rig.VEHICLE or rig.planar_speed() < 13.0:
			continue
		for b in get_tree().get_nodes_in_group("barrier"):
			if not is_instance_valid(b):
				continue
			if rig.global_position.distance_to(b.global_position) < 3.4:
				b.queue_free()

func _begin(id: String) -> void:
	if playing:
		return
	playing = true
	if menu:
		menu.visible = false
	player = _spawn(id, false, Vector3(0, 0.2, 30), PI)
	var seats := [
		["bike", Vector3(-24, 0.2, -18), 0.4],
		["heavy", Vector3(22, 0.2, -20), -0.6],
		["loader", Vector3(-8, 0.2, -28), 0.2],
	]
	for seat in seats:
		if str(seat[0]) == id:
			continue
		bots.append(_spawn(str(seat[0]), true, seat[1], float(seat[2])))
	if bots.size() < 3:
		bots.append(_spawn("muscle" if id != "muscle" else "bike", true, Vector3(18, 0.2, 10), 2.2))
	cam_pos = player.global_position + Vector3(0, 6, 14)
	cam.global_position = cam_pos

func _spawn(id: String, bot: bool, pos: Vector3, face: float) -> Rig:
	var rig := Rig.new()
	rig.setup(id, bot)
	add_child(rig)
	rig.global_position = pos
	rig.yaw = face
	rig.turret_yaw = face
	rig.rotation.y = face
	return rig

func _read_input() -> Dictionary:
	var held := _held_keys()
	var steer_js := _js("window.__stanceSteer==null?'':String(window.__stanceSteer)")
	var throttle := 0.0
	var steer := 0.0
	var strafe := 0.0
	var aim := 0.0
	if held.has("KeyW") or held.has("ArrowUp"):
		throttle += 1.0
	if held.has("KeyS") or held.has("ArrowDown"):
		throttle -= 1.0
	if held.has("KeyA") or held.has("ArrowLeft"):
		steer += 1.0
		strafe += 1.0
	if held.has("KeyD") or held.has("ArrowRight"):
		steer -= 1.0
		strafe -= 1.0
	if held.has("KeyQ"):
		aim += 1.0
	if held.has("KeyE"):
		aim -= 1.0
	if joy.length() > 0.15:
		throttle += -joy.y
		steer += -joy.x
		strafe += -joy.x
	if steer_js != "":
		var sv := float(steer_js)
		steer = sv
		strafe = sv
	throttle = clampf(throttle, -1.0, 1.0)
	steer = clampf(steer, -1.0, 1.0)
	strafe = clampf(strafe, -1.0, 1.0)
	var want := player.stance
	if held.has("Digit1"):
		want = Rig.VEHICLE
	elif held.has("Digit2"):
		want = Rig.HYBRID
	elif held.has("Digit3"):
		want = Rig.MECH
	elif forced_stance >= 0:
		want = forced_stance
	var drift := held.has("Space") or drift_held
	var mouse_fire := Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT)
	var over_dock := get_viewport().get_mouse_position().y > get_viewport().get_visible_rect().size.y - 170.0
	var fire := held.has("KeyJ") or held.has("KeyF") or fire_held or (mouse_fire and not over_dock)
	var grab := held.has("KeyG") or grab_held
	if player.stance == Rig.VEHICLE:
		strafe = 0.0
	elif player.stance == Rig.HYBRID:
		steer = 0.0
	else:
		strafe = 0.0
	return {
		"throttle": throttle,
		"steer": steer,
		"strafe": strafe,
		"aim": aim,
		"drift": drift,
		"fire": fire,
		"grapple": grab,
		"stance": want,
	}

func _camera(dt: float) -> void:
	if player == null:
		return
	var back := 12.0
	var up := 4.8
	if player.stance == Rig.MECH:
		back = 9.0
		up = 5.6
	elif player.stance == Rig.HYBRID:
		back = 11.0
		up = 5.4
	var focus := player.global_position
	if not player.alive and bots.size() > 0:
		focus = bots[0].global_position
	var want := focus - player.forward() * back + Vector3.UP * up
	cam_pos = cam_pos.lerp(want, 1.0 - exp(-5.5 * dt))
	cam.global_position = cam_pos
	cam.look_at(focus + Vector3.UP * 1.3, Vector3.UP)

func _hud() -> void:
	if player == null:
		return
	var mph := int(round(player.planar_speed() * 2.237))
	hud.text = "%s   %s\n%d mph    hull %d    lives %d\n%s" % [
		str(player.cls.name).to_upper(),
		player.stance_name(),
		mph,
		int(round(player.hull)),
		player.lives,
		_hint_line(),
	]
	hint.text = _hint_line()

func _hint_line() -> String:
	if player == null:
		return ""
	if player.stance == Rig.HYBRID:
		return "W drive   A/D slide   Q/E aim   J fire   1 2 3 stance"
	if player.stance == Rig.MECH:
		return "W walk   A/D turn   Space punch   G grab   1 2 3 stance"
	return "W gas   A/D steer   Space drift   J fire   1 car  2 hybrid  3 mech"

func _check_end() -> void:
	if ended or player == null:
		return
	var foes := 0
	for b in bots:
		if b.alive:
			foes += 1
	if not player.alive:
		_finish("WRECKED")
	elif foes == 0:
		_finish("YARD IS YOURS")

func _finish(text: String) -> void:
	ended = true
	playing = false
	banner.text = text
	end_panel.visible = true

func _ui() -> void:
	cam = Camera3D.new()
	cam.fov = 68
	add_child(cam)
	var layer := CanvasLayer.new()
	add_child(layer)
	menu = Control.new()
	menu.set_anchors_preset(Control.PRESET_FULL_RECT)
	menu.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(menu)
	var bg := ColorRect.new()
	bg.color = Color(0.03, 0.035, 0.05, 0.92)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	menu.add_child(bg)
	var title := Label.new()
	title.text = "STANCE DERBY"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.set_anchors_preset(Control.PRESET_TOP_WIDE)
	title.offset_top = 48
	title.offset_bottom = 110
	title.add_theme_font_size_override("font_size", 42)
	title.add_theme_color_override("font_color", Color(0.96, 0.93, 0.86))
	menu.add_child(title)
	var sub := Label.new()
	sub.text = "Pick a rig. Shift stance mid-fight.\nCar for speed. Hybrid to strafe and aim. Mech to grab."
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.set_anchors_preset(Control.PRESET_TOP_WIDE)
	sub.offset_top = 112
	sub.offset_bottom = 180
	sub.add_theme_font_size_override("font_size", 16)
	sub.add_theme_color_override("font_color", Color(0.75, 0.72, 0.64))
	menu.add_child(sub)
	var row := HBoxContainer.new()
	row.set_anchors_preset(Control.PRESET_CENTER)
	row.offset_left = -360
	row.offset_right = 360
	row.offset_top = -30
	row.offset_bottom = 50
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 12)
	menu.add_child(row)
	for id in CLASS_IDS:
		var spec: Dictionary = Rig.CLASSES[id]
		var b := Button.new()
		b.text = str(spec.name)
		b.custom_minimum_size = Vector2(160, 64)
		b.add_theme_font_size_override("font_size", 18)
		var cid: String = id
		b.pressed.connect(func(): _begin(cid))
		row.add_child(b)
	hud = Label.new()
	hud.set_anchors_preset(Control.PRESET_TOP_LEFT)
	hud.offset_left = 16
	hud.offset_top = 12
	hud.offset_right = 640
	hud.offset_bottom = 120
	hud.add_theme_font_size_override("font_size", 18)
	hud.add_theme_color_override("font_color", Color(0.96, 0.93, 0.86))
	layer.add_child(hud)
	hint = Label.new()
	hint.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	hint.offset_top = -196
	hint.offset_bottom = -168
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.add_theme_font_size_override("font_size", 14)
	hint.add_theme_color_override("font_color", Color(0.85, 0.8, 0.7))
	layer.add_child(hint)
	_touch_dock(layer)
	end_panel = Control.new()
	end_panel.visible = false
	end_panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	end_panel.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(end_panel)
	var dim := ColorRect.new()
	dim.color = Color(0, 0, 0, 0.55)
	dim.set_anchors_preset(Control.PRESET_FULL_RECT)
	end_panel.add_child(dim)
	banner = Label.new()
	banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	banner.set_anchors_preset(Control.PRESET_CENTER)
	banner.offset_left = -220
	banner.offset_right = 220
	banner.offset_top = -80
	banner.offset_bottom = -10
	banner.add_theme_font_size_override("font_size", 40)
	banner.add_theme_color_override("font_color", Color(0.96, 0.84, 0.45))
	end_panel.add_child(banner)
	var again := Button.new()
	again.text = "Rematch"
	again.set_anchors_preset(Control.PRESET_CENTER)
	again.offset_left = -80
	again.offset_right = 80
	again.offset_top = 10
	again.offset_bottom = 58
	again.pressed.connect(func(): get_tree().reload_current_scene())
	end_panel.add_child(again)

func _touch_dock(layer: CanvasLayer) -> void:
	var dock := Control.new()
	dock.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	dock.offset_top = -150
	dock.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(dock)
	var pad := ColorRect.new()
	pad.color = Color(1, 1, 1, 0.06)
	pad.position = Vector2(16, 16)
	pad.size = Vector2(128, 128)
	pad.gui_input.connect(_joy_input)
	dock.add_child(pad)
	var knob := ColorRect.new()
	knob.color = Color(0.96, 0.84, 0.45, 0.9)
	knob.size = Vector2(46, 46)
	knob.position = Vector2(41, 41)
	knob.mouse_filter = Control.MOUSE_FILTER_IGNORE
	pad.add_child(knob)
	pad.set_meta("knob", knob)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.anchor_left = 1.0
	grid.anchor_right = 1.0
	grid.anchor_bottom = 1.0
	grid.offset_left = -236
	grid.offset_right = -8
	grid.offset_top = -150
	grid.offset_bottom = -8
	grid.add_theme_constant_override("h_separation", 6)
	grid.add_theme_constant_override("v_separation", 6)
	dock.add_child(grid)
	_hold_button(grid, "FIRE", func(v): fire_held = v)
	_hold_button(grid, "DRIFT", func(v): drift_held = v)
	_hold_button(grid, "GRAB", func(v): grab_held = v)
	_tap_button(grid, "CAR", func(): forced_stance = Rig.VEHICLE)
	_tap_button(grid, "HYBRID", func(): forced_stance = Rig.HYBRID)
	_tap_button(grid, "MECH", func(): forced_stance = Rig.MECH)

func _hold_button(parent: Node, text: String, set_down: Callable) -> void:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(72, 44)
	b.button_down.connect(func(): set_down.call(true))
	b.button_up.connect(func(): set_down.call(false))
	parent.add_child(b)

func _tap_button(parent: Node, text: String, fn: Callable) -> void:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(72, 44)
	b.pressed.connect(fn)
	parent.add_child(b)

func _joy_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var t := event as InputEventScreenTouch
		if t.pressed:
			joy_id = t.index
			joy_origin = t.position
			joy = Vector2.ZERO
		elif t.index == joy_id:
			joy_id = -1
			joy = Vector2.ZERO
	elif event is InputEventScreenDrag:
		var d := event as InputEventScreenDrag
		if d.index != joy_id:
			return
		var delta := d.position - joy_origin
		if delta.length() > 52.0:
			delta = delta.normalized() * 52.0
		joy = delta / 52.0
	elif event is InputEventMouseButton:
		var m := event as InputEventMouseButton
		if m.button_index != MOUSE_BUTTON_LEFT:
			return
		if m.pressed:
			joy_origin = m.position
			joy_id = 0
		else:
			joy_id = -1
			joy = Vector2.ZERO
	elif event is InputEventMouseMotion and joy_id == 0 and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		var motion := event as InputEventMouseMotion
		var delta2 := motion.position - joy_origin
		if delta2.length() > 52.0:
			delta2 = delta2.normalized() * 52.0
		joy = delta2 / 52.0

func _install_probe() -> void:
	if not OS.has_feature("web"):
		return
	JavaScriptBridge.eval("""
		(function(){
			var w = window;
			w.__stanceHeld = w.__stanceHeld || new Set();
			var api = {
				setKeys: function(c){ w.__stanceHeld = new Set(c || []); },
				setSteer: function(v){ w.__stanceSteer = v; },
				getYaw: function(){ return w.__stanceYaw || 0; },
				getSpeed: function(){ return w.__stanceSpeed || 0; }
			};
			w.__controlsTest = api;
			try { if (w.parent && w.parent !== w) w.parent.__controlsTest = api; } catch (e) {}
		})();
	""", true)

func _publish_probe() -> void:
	if not OS.has_feature("web"):
		return
	var yaw := player.yaw if player else 0.0
	var spd := player.planar_speed() if player else 0.0
	JavaScriptBridge.eval("window.__stanceYaw=%s;window.__stanceSpeed=%s;" % [yaw, spd], true)

func _held_keys() -> Dictionary:
	var out := {}
	if OS.has_feature("web"):
		var raw := _js("(function(){var a=window.__stanceHeld?Array.from(window.__stanceHeld):[];try{if(window.parent&&window.parent!==window&&window.parent.__stanceHeld){a=a.concat(Array.from(window.parent.__stanceHeld));}}catch(e){}return a.join(',');})()")
		for code in raw.split(",", false):
			out[code] = true
	if Input.is_physical_key_pressed(KEY_W):
		out["KeyW"] = true
	if Input.is_physical_key_pressed(KEY_S):
		out["KeyS"] = true
	if Input.is_physical_key_pressed(KEY_A):
		out["KeyA"] = true
	if Input.is_physical_key_pressed(KEY_D):
		out["KeyD"] = true
	if Input.is_physical_key_pressed(KEY_Q):
		out["KeyQ"] = true
	if Input.is_physical_key_pressed(KEY_E):
		out["KeyE"] = true
	if Input.is_physical_key_pressed(KEY_J):
		out["KeyJ"] = true
	if Input.is_physical_key_pressed(KEY_F):
		out["KeyF"] = true
	if Input.is_physical_key_pressed(KEY_G):
		out["KeyG"] = true
	if Input.is_physical_key_pressed(KEY_SPACE):
		out["Space"] = true
	if Input.is_physical_key_pressed(KEY_1):
		out["Digit1"] = true
	if Input.is_physical_key_pressed(KEY_2):
		out["Digit2"] = true
	if Input.is_physical_key_pressed(KEY_3):
		out["Digit3"] = true
	return out

func _js(expr: String) -> String:
	if not OS.has_feature("web"):
		return ""
	var v = JavaScriptBridge.eval(expr, true)
	if v == null:
		return ""
	return str(v)
