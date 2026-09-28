import { YardAudio } from "./audio";
import { bindKeyboard, readInput, setProbeKeys, setProbeSteer, setSteerVisual } from "./input";
import { BASES, clonePack, type GamePack } from "./packs";
import { Session, type HudSnap } from "./sim";

const STEP = 1 / 60;

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}

export class Runtime {
  session: Session;
  audio = new YardAudio();
  paused = false;
  private view: {
    render: (dt: number) => void;
    resize: () => void;
    dispose: () => void;
    failed: boolean;
  } | null = null;
  private raf = 0;
  private acc = 0;
  private dead = false;
  private listeners = new Set<(snap: HudSnap) => void>();
  private lastMessage = "";
  private attachSeq = 0;

  constructor(pack: GamePack) {
    this.session = new Session(pack);
  }

  start() {
    bindKeyboard();
    this.audio.start();
    this.installProbe();
    let last = performance.now();
    const frame = (now: number) => {
      if (this.dead) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!this.paused && this.session.phase === "live") {
        this.acc += dt;
        let steps = 0;
        const input = readInput();
        setSteerVisual(input.steer);
        while (this.acc >= STEP && steps < 5) {
          this.session.tick(STEP, input);
          this.acc -= STEP;
          steps++;
        }
        if (this.session.message && this.session.message !== this.lastMessage) {
          this.lastMessage = this.session.message;
          if (this.session.message === "BOOST") this.audio.blip(180);
          else if (this.session.message === "FINISH" || this.session.message === "DROP") this.audio.blip(660);
          else if (this.session.message === "GATE") this.audio.blip(520);
          else if (this.session.message === "HIT" || this.session.message === "CARGO") this.audio.blip(90);
        }
        if (!this.session.message) this.lastMessage = "";
      }
      this.audio.setSpeed(this.session.player.speed, this.session.pack.handling.maxSpeed, this.session.player.boost > 0);
      this.view?.resize();
      this.view?.render(dt);
      window.__yardSpeed = this.session.player.speed;
      window.__yardYaw = this.session.player.yaw;
      const snap = this.session.hud();
      for (const listener of this.listeners) listener(snap);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  attach(canvas: HTMLCanvasElement, mini: HTMLCanvasElement | null) {
    const seq = ++this.attachSeq;
    void import("./view").then(({ GameView }) => {
      if (this.dead || seq !== this.attachSeq) return;
      this.view?.dispose();
      this.view = new GameView(canvas, mini, this.session);
    });
  }

  detach() {
    this.view?.dispose();
    this.view = null;
  }

  subscribe(listener: (snap: HudSnap) => void) {
    this.listeners.add(listener);
    listener(this.session.hud());
    return () => this.listeners.delete(listener);
  }

  viewFailed() {
    return Boolean(this.view?.failed);
  }

  stop() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.detach();
    this.audio.stop();
  }

  private installProbe() {
    const session = this.session;
    window.__controlsTest = {
      getYaw: () => session.player.yaw,
      getSpeed: () => session.player.speed,
      setSteer: (v) => setProbeSteer(v),
      setKeys: (codes) => setProbeKeys(codes),
    };
  }
}

let current: Runtime | null = null;

export function primeRun(pack: GamePack) {
  current?.stop();
  current = new Runtime(pack);
  current.start();
  return current;
}

export function getRuntime() {
  return current;
}

export function stopRun() {
  current?.stop();
  current = null;
  delete window.__controlsTest;
}

const STARTERS: Record<string, number> = {
  "night-circuit": 0,
  "salt-sweep": 1,
  "ridge-haul": 2,
};

export function bootQueued() {
  const id = window.__yardQueued || "night-circuit";
  const pack = BASES[STARTERS[id] ?? 0];
  if (!pack) return;
  primeRun(clonePack(pack));
}

if (typeof window !== "undefined") {
  window.__yardBoot = () => {
    if (!getRuntime()) bootQueued();
  };
  if (window.__yardQueued) window.__yardBoot();
}
