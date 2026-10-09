import * as THREE from "three";
import { HYBRID, MECH, VEHICLE, type Match, type Rig, type Shot } from "./sim";

type Actor = {
  rig: Rig;
  root: THREE.Group;
  torso: THREE.Group;
  wheels: THREE.Group;
  legs: THREE.Group;
  nose: THREE.Mesh;
};

export class GameView {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(68, 1, 0.1, 220);
  private actors: Actor[] = [];
  private shots: THREE.Mesh[] = [];
  private barriers: Array<{ blockIndex: number; mesh: THREE.Object3D }> = [];
  private camPos = new THREE.Vector3(0, 8, 18);
  private look = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x090c11, 1);
    this.scene.fog = new THREE.Fog(0x090c11, 28, 110);
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.35);
    sun.position.set(20, 40, 12);
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0x8ea0b8, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xc5d4ea, 0x1a140e, 0.35));
    this.buildArena();
  }

  bind(match: Match) {
    for (const actor of this.actors) this.scene.remove(actor.root);
    this.actors = match.rigs.map((rig) => this.makeActor(rig));
    this.barriers = [];
    match.blocks.forEach((block, index) => {
      if (!block.barrier) return;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(block.hx * 2, 1.3, block.hz * 2),
        new THREE.MeshStandardMaterial({ color: 0xc25420, roughness: 0.7 }),
      );
      mesh.position.set(block.x, 0.65, block.z);
      mesh.lookAt(0, 0.65, 0);
      this.scene.add(mesh);
      this.barriers.push({ blockIndex: index, mesh });
    });
  }

  resize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (canvas.width !== Math.floor(w * this.renderer.getPixelRatio()) || canvas.height !== Math.floor(h * this.renderer.getPixelRatio())) {
      this.renderer.setSize(w, h, false);
    }
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  render(match: Match, dt: number) {
    for (const actor of this.actors) this.pose(actor, dt);
    for (const barrier of this.barriers) {
      const block = match.blocks[barrier.blockIndex];
      barrier.mesh.visible = !!block && !block.dead;
    }
    const pool = this.shots;
    const live = match.shots.filter((s) => s.alive);
    while (pool.length < live.length) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 }),
      );
      this.scene.add(mesh);
      pool.push(mesh);
    }
    pool.forEach((mesh, i) => {
      const shot = live[i] as Shot | undefined;
      mesh.visible = !!shot;
      if (!shot) return;
      mesh.position.set(shot.x, shot.y, shot.z);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(shot.color);
      mat.emissive.setHex(shot.color);
    });
    const player = match.player;
    const focus = player.alive ? player : match.rigs.find((r) => r.alive) ?? player;
    const fwdX = -Math.sin(focus.yaw);
    const fwdZ = -Math.cos(focus.yaw);
    const back = focus.stance === MECH ? 9 : focus.stance === HYBRID ? 11 : 12;
    const up = focus.stance === MECH ? 5.6 : 4.8;
    const want = new THREE.Vector3(focus.x - fwdX * back, up + focus.y, focus.z - fwdZ * back);
    this.camPos.lerp(want, 1 - Math.exp(-5.5 * dt));
    this.camera.position.copy(this.camPos);
    this.look.set(focus.x, 1.3 + focus.y, focus.z);
    this.camera.lookAt(this.look);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }

  private pose(actor: Actor, dt: number) {
    const rig = actor.rig;
    actor.root.visible = rig.alive || rig.invuln > 0;
    actor.root.position.set(rig.x, rig.y, rig.z);
    actor.root.rotation.y = rig.yaw;
    const lift = rig.stance === HYBRID ? 0.85 : rig.stance === MECH ? 1.45 : 0;
    actor.torso.position.y = 0.7 + lift;
    actor.torso.visible = rig.stance !== VEHICLE;
    actor.legs.visible = rig.stance === MECH;
    actor.wheels.visible = rig.stance !== MECH;
    actor.nose.visible = rig.stance === VEHICLE;
    actor.torso.rotation.y = rig.stance === VEHICLE ? 0 : wrap(rig.turretYaw - rig.yaw);
    const spin = rig.speed * 0.12 * dt;
    for (const wheel of actor.wheels.children) wheel.rotateX(spin);
    actor.root.scale.setScalar(rig.invuln > 0 && Math.sin(rig.invuln * 28) > 0 ? 0.92 : 1);
  }

  private makeActor(rig: Rig): Actor {
    const root = new THREE.Group();
    const tint = rig.cls.color;
    const bodyW = rig.classId === "bike" ? 0.7 : rig.classId === "heavy" ? 2.4 : rig.classId === "loader" ? 2.2 : 1.9;
    const bodyL = rig.classId === "bike" ? 2.2 : rig.classId === "heavy" ? 5.6 : rig.classId === "loader" ? 4.2 : 3.6;
    const body = box(bodyW, rig.classId === "heavy" ? 0.8 : 0.55, bodyL, tint, 0.35);
    body.position.y = 0.55;
    root.add(body);
    const nose = box(0.45, 0.26, 0.7, lighten(tint), 0.1);
    nose.position.set(0, 0.62, -bodyL * 0.5);
    root.add(nose);
    const wheels = new THREE.Group();
    const wx = bodyW * 0.48;
    const wz = bodyL * 0.36;
    for (const p of [
      [-wx, 0.32, -wz],
      [wx, 0.32, -wz],
      [-wx, 0.32, wz],
      [wx, 0.32, wz],
    ] as const) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.22, 8),
        new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.6, metalness: 0.4 }),
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(p[0], p[1], p[2]);
      wheels.add(wheel);
    }
    root.add(wheels);
    const torso = new THREE.Group();
    const chest = box(1.1, 0.7, 0.7, darken(tint), 0.2);
    chest.position.y = 0.45;
    torso.add(chest);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 8),
      new THREE.MeshStandardMaterial({ color: lighten(tint), roughness: 0.45 }),
    );
    head.position.set(0, 0.95, -0.05);
    torso.add(head);
    const gunL = box(0.14, 0.14, 1.1, 0x26282c, 0.6);
    gunL.position.set(0.35, 0.45, -0.7);
    const gunR = box(0.14, 0.14, 1.1, 0x26282c, 0.6);
    gunR.position.set(-0.35, 0.45, -0.7);
    torso.add(gunL, gunR);
    torso.visible = false;
    root.add(torso);
    const legs = new THREE.Group();
    const legL = box(0.28, 0.9, 0.28, darken(tint), 0.4);
    legL.position.set(-0.28, 0.45, 0);
    const legR = box(0.28, 0.9, 0.28, darken(tint), 0.4);
    legR.position.set(0.28, 0.45, 0);
    legs.add(legL, legR);
    legs.visible = false;
    root.add(legs);
    this.scene.add(root);
    return { rig, root, torso, wheels, legs, nose };
  }

  private buildArena() {
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(160, 2, 160),
      new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.92 }),
    );
    ground.position.y = -1;
    this.scene.add(ground);
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(34, 48),
      new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.8 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.02;
    this.scene.add(pad);
    const pit = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.12, 16),
      new THREE.MeshStandardMaterial({
        color: 0x8c1410,
        emissive: 0x8c1410,
        emissiveIntensity: 0.7,
        roughness: 0.5,
      }),
    );
    pit.position.set(30, 0.08, -16);
    this.scene.add(pit);
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i) / 10;
      const x = Math.sin(a) * 40;
      const z = Math.cos(a) * 40;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 4.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x33363c }),
      );
      pole.position.set(x, 2.1, z);
      this.scene.add(pole);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 6),
        new THREE.MeshStandardMaterial({
          color: 0xffc66a,
          emissive: 0xffb347,
          emissiveIntensity: 2.2,
        }),
      );
      bulb.position.set(x, 4.3, z);
      this.scene.add(bulb);
    }
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x3a342c, roughness: 0.8 });
    const rampA = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 8), rampMat);
    rampA.position.set(-30, 0.6, 8);
    rampA.rotation.z = -0.28;
    this.scene.add(rampA);
    const rampB = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 8), rampMat);
    rampB.position.set(28, 0.6, -6);
    rampB.rotation.z = 0.28;
    this.scene.add(rampB);
  }
}

function box(w: number, h: number, d: number, color: number, metal: number) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: 0.58 }),
  );
}

function lighten(hex: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, 0.12);
  return c.getHex();
}

function darken(hex: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, -0.12);
  return c.getHex();
}

function wrap(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
