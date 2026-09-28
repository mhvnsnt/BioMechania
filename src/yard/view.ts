import * as THREE from "three";
import { LOOKS, type LookId, type VehicleId } from "./packs";
import { getSteerVisual } from "./input";
import type { Session } from "./sim";
import { frameAt, type Track } from "./track";

type Rig = {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  fronts: THREE.Object3D[];
  nose: THREE.MeshStandardMaterial;
  shadow: THREE.Mesh;
};

const _dummy = new THREE.Object3D();
const _look = new THREE.Vector3();
const _cam = new THREE.Vector3();

export class GameView {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(66, 1, 0.1, 280);
  private rigs: Rig[] = [];
  private beaconMeshes: THREE.Mesh[] = [];
  private hazardMeshes: THREE.Mesh[] = [];
  private gateMats: THREE.MeshStandardMaterial[] = [];
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private noseLight: THREE.PointLight;
  private lookId: LookId | null = null;
  private vehicle: VehicleId | null = null;
  private ready = false;
  private camInit = false;
  private shake = 0;
  private reduced: boolean;
  private skids: THREE.InstancedMesh | null = null;
  private skidLife: number[] = [];
  private skidCursor = 0;
  private disposed = false;
  failed = false;

  constructor(
    canvas: HTMLCanvasElement,
    private mini: HTMLCanvasElement | null,
    private session: Session,
  ) {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.hemi = new THREE.HemisphereLight("#f0e2c4", "#1a2420", 0.72);
    this.sun = new THREE.DirectionalLight("#fff4df", 1.35);
    this.sun.position.set(30, 48, 18);
    this.noseLight = new THREE.PointLight("#ffb703", 8, 22, 2);
    this.scene.add(this.hemi, this.sun, this.noseLight);
    try {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !coarse,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
    }
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  render(dt: number) {
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
      if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
    this.renderer?.dispose();
    this.renderer = null;
  }

  private buildWorld() {
    const track = this.session.track;
    const look = LOOKS[this.session.pack.look];
    if (track.kind === "sweep") {
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(track.arena, 48),
        new THREE.MeshStandardMaterial({ color: look.road, roughness: 1 }),
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.02;
      this.scene.add(disc);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(track.arena - 0.6, track.arena + 0.4, 48),
        new THREE.MeshStandardMaterial({ color: look.accent, roughness: 0.6, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      this.scene.add(ring);
    } else {
      this.scene.add(ribbon(track, track.half + 2.2, 0.02, look.shoulder));
      this.scene.add(ribbon(track, track.half, 0.07, look.road));
      this.addDashes(track, look.accent);
      this.addLamps(track, look.lamp);
      this.addGates(track, look.accent);
    }
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(230, 40),
      new THREE.MeshStandardMaterial({ color: look.ground, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.35;
    this.scene.add(ground);
    this.addHills(look.hill);
    this.addSkids();
    const beaconGeo = new THREE.OctahedronGeometry(0.72, 0);
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        beaconGeo,
        new THREE.MeshStandardMaterial({
          color: look.accent,
          emissive: look.accent,
          emissiveIntensity: 0.85,
          roughness: 0.35,
        }),
      );
      mesh.visible = false;
      this.scene.add(mesh);
      this.beaconMeshes.push(mesh);
    }
    const hazardGeo = new THREE.BoxGeometry(1.8, 1.15, 1.8);
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(
        hazardGeo,
        new THREE.MeshStandardMaterial({ color: "#3a2420", roughness: 0.7, metalness: 0.05 }),
      );
      mesh.visible = false;
      this.scene.add(mesh);
      this.hazardMeshes.push(mesh);
    }
  }

  private addDashes(track: Track, color: string) {
    const n = track.samples.length;
    const segs = track.closed ? n : n - 1;
    const count = Math.ceil(segs / 3);
    const geo = new THREE.BoxGeometry(0.16, 0.03, 1.5);
    const mesh = new THREE.InstancedMesh(
      geo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.15 }),
      count,
    );
    let k = 0;
    for (let i = 0; i < segs; i += 3) {
      const a = track.samples[i]!;
      const b = track.samples[(i + 1) % n]!;
      _dummy.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.09, (a.z + b.z) / 2);
      _dummy.lookAt(b.x, b.y + 0.09, b.z);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      mesh.setMatrixAt(k++, _dummy.matrix);
    }
    mesh.count = k;
    mesh.instanceMatrix.needsUpdate = true;
    this.scene.add(mesh);
  }

  private addLamps(track: Track, color: string) {
    const n = track.samples.length;
    const posts: number[] = [];
    for (let i = 0; i < n; i += 8) posts.push(i);
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 6);
    const bulbGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const postMesh = new THREE.InstancedMesh(
      postGeo,
      new THREE.MeshStandardMaterial({ color: "#2a2926", roughness: 0.8 }),
      posts.length,
    );
    const bulbMesh = new THREE.InstancedMesh(
      bulbGeo,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.4,
        roughness: 0.3,
      }),
      posts.length,
    );
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

  private addGates(track: Track, accent: string) {
    track.checkpoints.forEach((index) => {
      const f = frameAt(track, index);
      const group = new THREE.Group();
      group.position.set(f.x, f.y, f.z);
      group.lookAt(f.x + f.tx, f.y, f.z + f.tz);
      const mat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.85,
      });
      const postGeo = new THREE.BoxGeometry(0.16, 2.6, 0.16);
      const left = new THREE.Mesh(postGeo, mat);
      const right = new THREE.Mesh(postGeo, mat);
      left.position.set(-(track.half - 0.3), 1.3, 0);
      right.position.set(track.half - 0.3, 1.3, 0);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(track.half * 2, 0.14, 0.14), mat);
      bar.position.y = 2.55;
      group.add(left, right, bar);
      this.scene.add(group);
      this.gateMats.push(mat);
    });
  }

  private addHills(color: string) {
    const geo = new THREE.ConeGeometry(10, 22, 5);
    const mat = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 });
    const mesh = new THREE.InstancedMesh(geo, mat, 22);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const rad = 120 + (i % 4) * 14;
      const h = 0.7 + (i % 5) * 0.18;
      _dummy.position.set(Math.cos(a) * rad, 6 * h, Math.sin(a) * rad);
      _dummy.scale.set(1 + (i % 3) * 0.4, h, 1 + (i % 2) * 0.3);
      _dummy.rotation.set(0, a, 0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    this.scene.add(mesh);
  }

  private addSkids() {
    const geo = new THREE.PlaneGeometry(0.42, 1.15);
    const mat = new THREE.MeshBasicMaterial({
      color: "#0b0d0c",
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 56);
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

  private applyLook(first: boolean) {
    const pack = this.session.pack;
    const look = LOOKS[pack.look];
    const lookChanged = pack.look !== this.lookId;
    this.lookId = pack.look;
    this.scene.background = new THREE.Color(look.sky);
    this.scene.fog = new THREE.Fog(look.fog, look.near, look.far);
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

  private clearWorld() {
    const keep = new Set<THREE.Object3D>([this.hemi, this.sun, this.noseLight]);
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

  private rebuildCars() {
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

  private updateActors(dt: number) {
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
      rig.nose.emissiveIntensity = r.boost > 0 ? 1.3 : r.isPlayer ? 0.35 : 0.05;
      rig.shadow.position.set(r.x, r.y + 0.04, r.z);
    });
    this.gateMats.forEach((mat, i) => {
      const hot = i === player.next && !player.finished;
      mat.emissiveIntensity = hot ? 0.95 : 0.12;
      mat.opacity = hot ? 1 : 0.45;
    });
    this.session.beacons.forEach((b, i) => {
      const mesh = this.beaconMeshes[i];
      if (!mesh) return;
      mesh.visible = b.alive && this.session.track.kind === "sweep";
      mesh.position.set(b.x, 1.5 + Math.sin(this.session.time * 3 + i) * 0.25, b.z);
      mesh.rotation.y = b.spin;
      const mat = mesh.material;
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.color.set(look.accent);
        mat.emissive.set(look.accent);
      }
    });
    this.session.hazards.forEach((h, i) => {
      const mesh = this.hazardMeshes[i];
      if (!mesh) return;
      mesh.visible = this.session.track.kind === "sweep";
      mesh.position.set(h.x, 0.6, h.z);
      mesh.rotation.y = h.angle;
    });
    this.updateSkids(dt);
  }

  private updateSkids(dt: number) {
    const mesh = this.skids;
    if (!mesh) return;
    const p = this.session.player;
    if (p.charge > 0.08) {
      const fx = -Math.sin(p.yaw);
      const fz = -Math.cos(p.yaw);
      this.skidCursor = (this.skidCursor + 1) % this.skidLife.length;
      this.skidLife[this.skidCursor] = 1;
      _dummy.position.set(p.x - fx * 1.1, p.y + 0.06, p.z - fz * 1.1);
      _dummy.rotation.set(-Math.PI / 2, 0, 0);
      _dummy.rotateY(p.yaw);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      mesh.setMatrixAt(this.skidCursor, _dummy.matrix);
    }
    let dirty = p.charge > 0.08;
    for (let i = 0; i < this.skidLife.length; i++) {
      const life = this.skidLife[i] ?? 0;
      if (life <= 0) continue;
      this.skidLife[i] = Math.max(0, life - dt * 0.35);
      if (this.skidLife[i] === 0) {
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);
        dirty = true;
      }
    }
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  }

  private updateCamera(dt: number) {
    const p = this.session.player;
    const fx = -Math.sin(p.yaw);
    const fz = -Math.cos(p.yaw);
    const dist = this.session.track.kind === "haul" ? 10.5 : 8.4;
    const height = this.session.track.kind === "haul" ? 4.1 : 3.15;
    _cam.set(p.x - fx * dist, p.y + height, p.z - fz * dist);
    _look.set(p.x + fx * 6.5, p.y + 1.05, p.z + fz * 6.5);
    if (!this.reduced && this.shake > 0.001) {
      this.shake *= Math.exp(-6 * dt);
      _cam.x += Math.sin(this.session.time * 46) * this.shake;
      _cam.y += Math.cos(this.session.time * 37) * this.shake * 0.55;
    } else this.shake = 0;
    if (p.boost > 0.8) this.shake = Math.max(this.shake, 0.18);
    if (!this.camInit) {
      this.camera.position.copy(_cam);
      this.camInit = true;
    } else {
      const k = 1 - Math.exp(-4.2 * dt);
      this.camera.position.lerp(_cam, k);
    }
    this.camera.lookAt(_look);
    this.noseLight.position.set(p.x, p.y + 1.4, p.z);
    const fov = 66 + Math.min(14, Math.abs(p.speed) * 0.28);
    if (Math.abs(this.camera.fov - fov) > 0.25) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  private drawMini() {
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
      const scale = (w * 0.38) / track.arena;
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
    const mapX = (x: number) => ((x - minX) / span) * (w - 20) + 10;
    const mapZ = (z: number) => ((z - minZ) / span) * (h - 20) + 10;
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
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((node) => {
    if (node instanceof THREE.Mesh || node instanceof THREE.InstancedMesh) {
      node.geometry?.dispose();
      const mat = node.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
  });
}

function ribbon(track: Track, half: number, lift: number, color: string) {
  const pts = track.samples;
  const n = pts.length;
  const segs = track.closed ? n : Math.max(0, n - 1);
  const positions: number[] = [];
  for (let i = 0; i < segs; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % n]!;
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const len = Math.hypot(abx, abz) || 1;
    const sx = -abz / len;
    const sz = abx / len;
    const aL = [a.x - sx * half, a.y + lift, a.z - sz * half];
    const aR = [a.x + sx * half, a.y + lift, a.z + sz * half];
    const bL = [b.x - sx * half, b.y + lift, b.z - sz * half];
    const bR = [b.x + sx * half, b.y + lift, b.z + sz * half];
    positions.push(...aL, ...aR, ...bR, ...aL, ...bR, ...bL);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.02, side: THREE.DoubleSide }),
  );
}

function buildCar(vehicle: VehicleId, color: string, accent: string): Rig {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.18 });
  const nose = new THREE.MeshStandardMaterial({
    color: accent,
    emissive: accent,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const dark = new THREE.MeshStandardMaterial({ color: "#17191a", roughness: 0.55, metalness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({
    color: "#b7c6c4",
    roughness: 0.12,
    metalness: 0.08,
    transparent: true,
    opacity: 0.72,
  });
  if (vehicle === "buggy") {
    addBox(group, bodyMat, 1.45, 0.34, 2.15, 0, 0.48, 0.05);
    addBox(group, glass, 1.05, 0.42, 0.7, 0, 0.82, 0.15);
    addBox(group, nose, 1.15, 0.12, 0.35, 0, 0.4, -1.05);
  } else if (vehicle === "hauler") {
    addBox(group, bodyMat, 1.7, 0.55, 3.4, 0, 0.62, 0.35);
    addBox(group, glass, 1.35, 0.48, 0.85, 0, 1.05, -0.85);
    addBox(group, nose, 1.4, 0.16, 0.28, 0, 0.48, -1.55);
  } else {
    addBox(group, bodyMat, 1.55, 0.3, 2.65, 0, 0.42, 0);
    addBox(group, glass, 1.05, 0.26, 0.85, 0, 0.68, 0.2);
    addBox(group, nose, 1.15, 0.14, 0.55, 0, 0.36, -1.2);
  }
  const wheelGeo = new THREE.CylinderGeometry(vehicle === "hauler" ? 0.34 : 0.28, vehicle === "hauler" ? 0.34 : 0.28, 0.24, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  const zs =
    vehicle === "hauler" ? [-1.15, 1.15] : vehicle === "buggy" ? [-0.78, 0.82] : [-0.88, 0.92];
  const span = vehicle === "hauler" ? 0.82 : 0.72;
  const y = vehicle === "hauler" ? 0.34 : 0.28;
  const wheels: THREE.Object3D[] = [];
  const fronts: THREE.Object3D[] = [];
  for (const z of zs) {
    for (const x of [-span, span]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, z);
      const mesh = new THREE.Mesh(wheelGeo, dark);
      pivot.add(mesh);
      group.add(pivot);
      wheels.push(mesh);
      if (z < 0) fronts.push(pivot);
    }
  }
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(vehicle === "hauler" ? 1.7 : 1.25, 16),
    new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.32, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  return { group, wheels, fronts, nose, shadow };
}

function addBox(
  group: THREE.Group,
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
}
