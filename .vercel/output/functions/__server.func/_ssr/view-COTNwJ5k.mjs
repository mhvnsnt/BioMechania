import { i as LOOKS, n as frameAt, r as getSteerVisual } from "./routes-CknzUnx7.mjs";
import { C as SRGBColorSpace, E as Vector3, S as RingGeometry, T as SphereGeometry, _ as Object3D, a as Color, b as PlaneGeometry, c as DirectionalLight, d as Group, f as HemisphereLight, g as MeshStandardMaterial, h as MeshBasicMaterial, i as CircleGeometry, l as Float32BufferAttribute, m as Mesh, n as BoxGeometry, o as ConeGeometry, p as InstancedMesh, r as BufferGeometry, s as CylinderGeometry, t as WebGLRenderer, u as Fog, v as OctahedronGeometry, w as Scene, x as PointLight, y as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/view-COTNwJ5k.js
var _dummy = new Object3D();
var _look = new Vector3();
var _cam = new Vector3();
var GameView = class {
	mini;
	session;
	renderer = null;
	scene = new Scene();
	camera = new PerspectiveCamera(66, 1, .1, 280);
	rigs = [];
	beaconMeshes = [];
	hazardMeshes = [];
	gateMats = [];
	hemi;
	sun;
	noseLight;
	lookId = null;
	vehicle = null;
	ready = false;
	camInit = false;
	shake = 0;
	reduced;
	skids = null;
	skidLife = [];
	skidCursor = 0;
	disposed = false;
	failed = false;
	constructor(canvas, mini, session) {
		this.mini = mini;
		this.session = session;
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.hemi = new HemisphereLight("#f0e2c4", "#1a2420", .72);
		this.sun = new DirectionalLight("#fff4df", 1.35);
		this.sun.position.set(30, 48, 18);
		this.noseLight = new PointLight("#ffb703", 8, 22, 2);
		this.scene.add(this.hemi, this.sun, this.noseLight);
		try {
			const coarse = window.matchMedia("(pointer: coarse)").matches;
			const renderer = new WebGLRenderer({
				canvas,
				antialias: !coarse,
				alpha: false,
				powerPreference: "high-performance"
			});
			renderer.outputColorSpace = SRGBColorSpace;
			renderer.toneMapping = 4;
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.35 : 1.75));
			this.renderer = renderer;
			if (!renderer.getContext()) {
				this.failed = true;
				return;
			}
		} catch {
			this.failed = true;
			return;
		}
		this.buildWorld();
		this.applyLook(true);
		this.resize();
		this.ready = true;
	}
	resize() {
		const renderer = this.renderer;
		if (!renderer) return;
		const canvas = renderer.domElement;
		const w = canvas.clientWidth || 1;
		const h = canvas.clientHeight || 1;
		if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
		this.camera.aspect = w / Math.max(1, h);
		this.camera.updateProjectionMatrix();
	}
	render(dt) {
		if (!this.ready || !this.renderer || this.disposed) return;
		const pack = this.session.pack;
		if (pack.look !== this.lookId || pack.vehicle !== this.vehicle) this.applyLook(false);
		this.updateActors(dt);
		this.updateCamera(dt);
		this.drawMini();
		this.renderer.render(this.scene, this.camera);
	}
	dispose() {
		this.disposed = true;
		this.ready = false;
		this.scene.traverse((obj) => {
			if (obj instanceof Mesh || obj instanceof InstancedMesh) {
				obj.geometry?.dispose();
				const mat = obj.material;
				if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
				else mat?.dispose();
			}
		});
		this.renderer?.dispose();
		this.renderer = null;
	}
	buildWorld() {
		const track = this.session.track;
		const look = LOOKS[this.session.pack.look];
		if (track.kind === "sweep") {
			const disc = new Mesh(new CircleGeometry(track.arena, 48), new MeshStandardMaterial({
				color: look.road,
				roughness: 1
			}));
			disc.rotation.x = -Math.PI / 2;
			disc.position.y = .02;
			this.scene.add(disc);
			const ring = new Mesh(new RingGeometry(track.arena - .6, track.arena + .4, 48), new MeshStandardMaterial({
				color: look.accent,
				roughness: .6,
				side: 2
			}));
			ring.rotation.x = -Math.PI / 2;
			ring.position.y = .04;
			this.scene.add(ring);
		} else {
			this.scene.add(ribbon(track, track.half + 2.2, .02, look.shoulder));
			this.scene.add(ribbon(track, track.half, .07, look.road));
			this.addDashes(track, look.accent);
			this.addLamps(track, look.lamp);
			this.addGates(track, look.accent);
		}
		const ground = new Mesh(new CircleGeometry(230, 40), new MeshStandardMaterial({
			color: look.ground,
			roughness: 1
		}));
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -.35;
		this.scene.add(ground);
		this.addHills(look.hill);
		this.addSkids();
		const beaconGeo = new OctahedronGeometry(.72, 0);
		for (let i = 0; i < 6; i++) {
			const mesh = new Mesh(beaconGeo, new MeshStandardMaterial({
				color: look.accent,
				emissive: look.accent,
				emissiveIntensity: .85,
				roughness: .35
			}));
			mesh.visible = false;
			this.scene.add(mesh);
			this.beaconMeshes.push(mesh);
		}
		const hazardGeo = new BoxGeometry(1.8, 1.15, 1.8);
		for (let i = 0; i < 4; i++) {
			const mesh = new Mesh(hazardGeo, new MeshStandardMaterial({
				color: "#3a2420",
				roughness: .7,
				metalness: .05
			}));
			mesh.visible = false;
			this.scene.add(mesh);
			this.hazardMeshes.push(mesh);
		}
	}
	addDashes(track, color) {
		const n = track.samples.length;
		const segs = track.closed ? n : n - 1;
		const count = Math.ceil(segs / 3);
		const geo = new BoxGeometry(.16, .03, 1.5);
		const mesh = new InstancedMesh(geo, new MeshStandardMaterial({
			color,
			roughness: .5,
			emissive: color,
			emissiveIntensity: .15
		}), count);
		let k = 0;
		for (let i = 0; i < segs; i += 3) {
			const a = track.samples[i];
			const b = track.samples[(i + 1) % n];
			_dummy.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + .09, (a.z + b.z) / 2);
			_dummy.lookAt(b.x, b.y + .09, b.z);
			_dummy.scale.set(1, 1, 1);
			_dummy.updateMatrix();
			mesh.setMatrixAt(k++, _dummy.matrix);
		}
		mesh.count = k;
		mesh.instanceMatrix.needsUpdate = true;
		this.scene.add(mesh);
	}
	addLamps(track, color) {
		const n = track.samples.length;
		const posts = [];
		for (let i = 0; i < n; i += 8) posts.push(i);
		const postGeo = new CylinderGeometry(.08, .1, 3.2, 6);
		const bulbGeo = new SphereGeometry(.22, 8, 8);
		const postMesh = new InstancedMesh(postGeo, new MeshStandardMaterial({
			color: "#2a2926",
			roughness: .8
		}), posts.length);
		const bulbMesh = new InstancedMesh(bulbGeo, new MeshStandardMaterial({
			color,
			emissive: color,
			emissiveIntensity: 1.4,
			roughness: .3
		}), posts.length);
		posts.forEach((index, k) => {
			const f = frameAt(track, index);
			const side = k % 2 === 0 ? 1 : -1;
			const x = f.x + f.sx * side * (track.half + 1.3);
			const z = f.z + f.sz * side * (track.half + 1.3);
			_dummy.position.set(x, f.y + 1.6, z);
			_dummy.rotation.set(0, 0, 0);
			_dummy.scale.set(1, 1, 1);
			_dummy.updateMatrix();
			postMesh.setMatrixAt(k, _dummy.matrix);
			_dummy.position.set(x, f.y + 3.25, z);
			_dummy.updateMatrix();
			bulbMesh.setMatrixAt(k, _dummy.matrix);
		});
		postMesh.instanceMatrix.needsUpdate = true;
		bulbMesh.instanceMatrix.needsUpdate = true;
		this.scene.add(postMesh, bulbMesh);
	}
	addGates(track, accent) {
		track.checkpoints.forEach((index) => {
			const f = frameAt(track, index);
			const group = new Group();
			group.position.set(f.x, f.y, f.z);
			group.lookAt(f.x + f.tx, f.y, f.z + f.tz);
			const mat = new MeshStandardMaterial({
				color: accent,
				emissive: accent,
				emissiveIntensity: .2,
				transparent: true,
				opacity: .85
			});
			const postGeo = new BoxGeometry(.16, 2.6, .16);
			const left = new Mesh(postGeo, mat);
			const right = new Mesh(postGeo, mat);
			left.position.set(-(track.half - .3), 1.3, 0);
			right.position.set(track.half - .3, 1.3, 0);
			const bar = new Mesh(new BoxGeometry(track.half * 2, .14, .14), mat);
			bar.position.y = 2.55;
			group.add(left, right, bar);
			this.scene.add(group);
			this.gateMats.push(mat);
		});
	}
	addHills(color) {
		const geo = new ConeGeometry(10, 22, 5);
		const mat = new MeshStandardMaterial({
			color,
			flatShading: true,
			roughness: 1
		});
		const mesh = new InstancedMesh(geo, mat, 22);
		for (let i = 0; i < 22; i++) {
			const a = i / 22 * Math.PI * 2;
			const rad = 120 + i % 4 * 14;
			const h = .7 + i % 5 * .18;
			_dummy.position.set(Math.cos(a) * rad, 6 * h, Math.sin(a) * rad);
			_dummy.scale.set(1 + i % 3 * .4, h, 1 + i % 2 * .3);
			_dummy.rotation.set(0, a, 0);
			_dummy.updateMatrix();
			mesh.setMatrixAt(i, _dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
		this.scene.add(mesh);
	}
	addSkids() {
		const geo = new PlaneGeometry(.42, 1.15);
		const mat = new MeshBasicMaterial({
			color: "#0b0d0c",
			transparent: true,
			opacity: .45,
			depthWrite: false
		});
		const mesh = new InstancedMesh(geo, mat, 56);
		this.skidLife = Array.from({ length: 56 }, () => 0);
		for (let i = 0; i < 56; i++) {
			_dummy.scale.set(0, 0, 0);
			_dummy.updateMatrix();
			mesh.setMatrixAt(i, _dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
		this.scene.add(mesh);
		this.skids = mesh;
	}
	applyLook(first) {
		const pack = this.session.pack;
		const look = LOOKS[pack.look];
		const lookChanged = pack.look !== this.lookId;
		this.lookId = pack.look;
		this.scene.background = new Color(look.sky);
		this.scene.fog = new Fog(look.fog, look.near, look.far);
		if (this.renderer) this.renderer.toneMappingExposure = look.exposure;
		this.hemi.color.set(look.lamp);
		this.hemi.groundColor.set(look.ground);
		this.noseLight.color.set(look.lamp);
		if (lookChanged && !first) {
			this.clearWorld();
			this.buildWorld();
			this.rebuildCars();
			return;
		}
		if (this.vehicle !== pack.vehicle || first) this.rebuildCars();
	}
	clearWorld() {
		const keep = /* @__PURE__ */ new Set([
			this.hemi,
			this.sun,
			this.noseLight
		]);
		for (const child of [...this.scene.children]) {
			if (keep.has(child)) continue;
			this.scene.remove(child);
			disposeObject(child);
		}
		this.rigs = [];
		this.beaconMeshes = [];
		this.hazardMeshes = [];
		this.gateMats = [];
		this.skids = null;
		this.skidLife = [];
		this.vehicle = null;
	}
	rebuildCars() {
		for (const rig of this.rigs) this.scene.remove(rig.group);
		for (const rig of this.rigs) this.scene.remove(rig.shadow);
		this.rigs = [];
		this.vehicle = this.session.pack.vehicle;
		const look = LOOKS[this.session.pack.look];
		this.session.racers.forEach((racer) => {
			const rig = buildCar(this.session.pack.vehicle, racer.color, racer.isPlayer ? look.accent : "#2a2c2b");
			this.scene.add(rig.group);
			this.scene.add(rig.shadow);
			this.rigs.push(rig);
		});
	}
	updateActors(dt) {
		const look = LOOKS[this.session.pack.look];
		const player = this.session.player;
		this.session.racers.forEach((r, i) => {
			const rig = this.rigs[i];
			if (!rig) return;
			rig.group.visible = true;
			rig.group.position.set(r.x, r.y, r.z);
			rig.group.rotation.order = "YXZ";
			rig.group.rotation.y = r.yaw;
			rig.group.rotation.x = r.pitch;
			const rate = r.speed * dt * 1.6;
			for (const wheel of rig.wheels) wheel.rotation.x -= rate;
			const visual = r.isPlayer ? -getSteerVisual() : 0;
			for (const front of rig.fronts) front.rotation.y = visual;
			rig.nose.emissiveIntensity = r.boost > 0 ? 1.3 : r.isPlayer ? .35 : .05;
			rig.shadow.position.set(r.x, r.y + .04, r.z);
		});
		this.gateMats.forEach((mat, i) => {
			const hot = i === player.next && !player.finished;
			mat.emissiveIntensity = hot ? .95 : .12;
			mat.opacity = hot ? 1 : .45;
		});
		this.session.beacons.forEach((b, i) => {
			const mesh = this.beaconMeshes[i];
			if (!mesh) return;
			mesh.visible = b.alive && this.session.track.kind === "sweep";
			mesh.position.set(b.x, 1.5 + Math.sin(this.session.time * 3 + i) * .25, b.z);
			mesh.rotation.y = b.spin;
			const mat = mesh.material;
			if (mat instanceof MeshStandardMaterial) {
				mat.color.set(look.accent);
				mat.emissive.set(look.accent);
			}
		});
		this.session.hazards.forEach((h, i) => {
			const mesh = this.hazardMeshes[i];
			if (!mesh) return;
			mesh.visible = this.session.track.kind === "sweep";
			mesh.position.set(h.x, .6, h.z);
			mesh.rotation.y = h.angle;
		});
		this.updateSkids(dt);
	}
	updateSkids(dt) {
		const mesh = this.skids;
		if (!mesh) return;
		const p = this.session.player;
		if (p.charge > .08) {
			const fx = -Math.sin(p.yaw);
			const fz = -Math.cos(p.yaw);
			this.skidCursor = (this.skidCursor + 1) % this.skidLife.length;
			this.skidLife[this.skidCursor] = 1;
			_dummy.position.set(p.x - fx * 1.1, p.y + .06, p.z - fz * 1.1);
			_dummy.rotation.set(-Math.PI / 2, 0, 0);
			_dummy.rotateY(p.yaw);
			_dummy.scale.set(1, 1, 1);
			_dummy.updateMatrix();
			mesh.setMatrixAt(this.skidCursor, _dummy.matrix);
		}
		let dirty = p.charge > .08;
		for (let i = 0; i < this.skidLife.length; i++) {
			const life = this.skidLife[i] ?? 0;
			if (life <= 0) continue;
			this.skidLife[i] = Math.max(0, life - dt * .35);
			if (this.skidLife[i] === 0) {
				_dummy.scale.set(0, 0, 0);
				_dummy.updateMatrix();
				mesh.setMatrixAt(i, _dummy.matrix);
				dirty = true;
			}
		}
		if (dirty) mesh.instanceMatrix.needsUpdate = true;
	}
	updateCamera(dt) {
		const p = this.session.player;
		const fx = -Math.sin(p.yaw);
		const fz = -Math.cos(p.yaw);
		const dist = this.session.track.kind === "haul" ? 10.5 : 8.4;
		const height = this.session.track.kind === "haul" ? 4.1 : 3.15;
		_cam.set(p.x - fx * dist, p.y + height, p.z - fz * dist);
		_look.set(p.x + fx * 6.5, p.y + 1.05, p.z + fz * 6.5);
		if (!this.reduced && this.shake > .001) {
			this.shake *= Math.exp(-6 * dt);
			_cam.x += Math.sin(this.session.time * 46) * this.shake;
			_cam.y += Math.cos(this.session.time * 37) * this.shake * .55;
		} else this.shake = 0;
		if (p.boost > .8) this.shake = Math.max(this.shake, .18);
		if (!this.camInit) {
			this.camera.position.copy(_cam);
			this.camInit = true;
		} else {
			const k = 1 - Math.exp(-4.2 * dt);
			this.camera.position.lerp(_cam, k);
		}
		this.camera.lookAt(_look);
		this.noseLight.position.set(p.x, p.y + 1.4, p.z);
		const fov = 66 + Math.min(14, Math.abs(p.speed) * .28);
		if (Math.abs(this.camera.fov - fov) > .25) {
			this.camera.fov = fov;
			this.camera.updateProjectionMatrix();
		}
	}
	drawMini() {
		const canvas = this.mini;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "rgba(16,19,17,0.8)";
		ctx.fillRect(0, 0, w, h);
		const track = this.session.track;
		if (track.kind === "sweep") {
			const scale = w * .38 / track.arena;
			const cx = w / 2;
			const cy = h / 2;
			ctx.beginPath();
			ctx.arc(cx, cy, track.arena * scale, 0, Math.PI * 2);
			ctx.strokeStyle = "#f0a202";
			ctx.lineWidth = 2;
			ctx.stroke();
			for (const b of this.session.beacons) {
				ctx.fillStyle = "#f0a202";
				ctx.fillRect(cx + b.x * scale - 2, cy + b.z * scale - 2, 4, 4);
			}
			const p = this.session.player;
			ctx.fillStyle = "#e8efe9";
			ctx.beginPath();
			ctx.arc(cx + p.x * scale, cy + p.z * scale, 4, 0, Math.PI * 2);
			ctx.fill();
			return;
		}
		let minX = Infinity;
		let minZ = Infinity;
		let maxX = -Infinity;
		let maxZ = -Infinity;
		for (const s of track.samples) {
			minX = Math.min(minX, s.x);
			minZ = Math.min(minZ, s.z);
			maxX = Math.max(maxX, s.x);
			maxZ = Math.max(maxZ, s.z);
		}
		const span = Math.max(maxX - minX, maxZ - minZ) || 1;
		const mapX = (x) => (x - minX) / span * (w - 20) + 10;
		const mapZ = (z) => (z - minZ) / span * (h - 20) + 10;
		ctx.beginPath();
		track.samples.forEach((s, i) => {
			const x = mapX(s.x);
			const y = mapZ(s.z);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		if (track.closed) ctx.closePath();
		ctx.strokeStyle = "#8d9a91";
		ctx.lineWidth = 3;
		ctx.stroke();
		for (const r of this.session.racers) {
			ctx.fillStyle = r.isPlayer ? "#f0a202" : "#e8efe9";
			ctx.beginPath();
			ctx.arc(mapX(r.x), mapZ(r.z), r.isPlayer ? 4 : 2.4, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};
function disposeObject(obj) {
	obj.traverse((node) => {
		if (node instanceof Mesh || node instanceof InstancedMesh) {
			node.geometry?.dispose();
			const mat = node.material;
			if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
			else mat?.dispose();
		}
	});
}
function ribbon(track, half, lift, color) {
	const pts = track.samples;
	const n = pts.length;
	const segs = track.closed ? n : Math.max(0, n - 1);
	const positions = [];
	for (let i = 0; i < segs; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		const abx = b.x - a.x;
		const abz = b.z - a.z;
		const len = Math.hypot(abx, abz) || 1;
		const sx = -abz / len;
		const sz = abx / len;
		const aL = [
			a.x - sx * half,
			a.y + lift,
			a.z - sz * half
		];
		const aR = [
			a.x + sx * half,
			a.y + lift,
			a.z + sz * half
		];
		const bL = [
			b.x - sx * half,
			b.y + lift,
			b.z - sz * half
		];
		const bR = [
			b.x + sx * half,
			b.y + lift,
			b.z + sz * half
		];
		positions.push(...aL, ...aR, ...bR, ...aL, ...bR, ...bL);
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geo.computeVertexNormals();
	return new Mesh(geo, new MeshStandardMaterial({
		color,
		roughness: .95,
		metalness: .02,
		side: 2
	}));
}
function buildCar(vehicle, color, accent) {
	const group = new Group();
	const bodyMat = new MeshStandardMaterial({
		color,
		roughness: .48,
		metalness: .18
	});
	const nose = new MeshStandardMaterial({
		color: accent,
		emissive: accent,
		emissiveIntensity: .3,
		roughness: .4
	});
	const dark = new MeshStandardMaterial({
		color: "#17191a",
		roughness: .55,
		metalness: .35
	});
	const glass = new MeshStandardMaterial({
		color: "#b7c6c4",
		roughness: .12,
		metalness: .08,
		transparent: true,
		opacity: .72
	});
	if (vehicle === "buggy") {
		addBox(group, bodyMat, 1.45, .34, 2.15, 0, .48, .05);
		addBox(group, glass, 1.05, .42, .7, 0, .82, .15);
		addBox(group, nose, 1.15, .12, .35, 0, .4, -1.05);
	} else if (vehicle === "hauler") {
		addBox(group, bodyMat, 1.7, .55, 3.4, 0, .62, .35);
		addBox(group, glass, 1.35, .48, .85, 0, 1.05, -.85);
		addBox(group, nose, 1.4, .16, .28, 0, .48, -1.55);
	} else {
		addBox(group, bodyMat, 1.55, .3, 2.65, 0, .42, 0);
		addBox(group, glass, 1.05, .26, .85, 0, .68, .2);
		addBox(group, nose, 1.15, .14, .55, 0, .36, -1.2);
	}
	const wheelGeo = new CylinderGeometry(vehicle === "hauler" ? .34 : .28, vehicle === "hauler" ? .34 : .28, .24, 10);
	wheelGeo.rotateZ(Math.PI / 2);
	const zs = vehicle === "hauler" ? [-1.15, 1.15] : vehicle === "buggy" ? [-.78, .82] : [-.88, .92];
	const span = vehicle === "hauler" ? .82 : .72;
	const y = vehicle === "hauler" ? .34 : .28;
	const wheels = [];
	const fronts = [];
	for (const z of zs) for (const x of [-span, span]) {
		const pivot = new Group();
		pivot.position.set(x, y, z);
		const mesh = new Mesh(wheelGeo, dark);
		pivot.add(mesh);
		group.add(pivot);
		wheels.push(mesh);
		if (z < 0) fronts.push(pivot);
	}
	const shadow = new Mesh(new CircleGeometry(vehicle === "hauler" ? 1.7 : 1.25, 16), new MeshBasicMaterial({
		color: "#000000",
		transparent: true,
		opacity: .32,
		depthWrite: false
	}));
	shadow.rotation.x = -Math.PI / 2;
	return {
		group,
		wheels,
		fronts,
		nose,
		shadow
	};
}
function addBox(group, mat, w, h, d, x, y, z) {
	const mesh = new Mesh(new BoxGeometry(w, h, d), mat);
	mesh.position.set(x, y, z);
	group.add(mesh);
}
//#endregion
export { GameView };
