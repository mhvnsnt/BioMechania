import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from "react";
import { HYBRID, MECH, VEHICLE, Match, type ClassId, type DriveInput } from "./sim";
import type { GameView } from "./view";

const CLASS_IDS: ClassId[] = ["muscle", "bike", "heavy", "loader"];
const held = new Set<string>();
let steerOverride: number | null = null;

function installProbe() {
  const w = window as Window & {
    __stanceHeld?: Set<string>;
    __stanceSteer?: number | null;
    __stanceYaw?: number;
    __stanceSpeed?: number;
    __controlsTest?: {
      setKeys: (codes: string[]) => void;
      setSteer: (v: number) => void;
      getYaw: () => number;
      getSpeed: () => number;
    };
  };
  w.__stanceHeld = held;
  w.__controlsTest = {
    setKeys(codes) {
      held.clear();
      for (const code of codes ?? []) held.add(code);
    },
    setSteer(v) {
      steerOverride = v;
      w.__stanceSteer = v;
    },
    getYaw() {
      return w.__stanceYaw ?? 0;
    },
    getSpeed() {
      return w.__stanceSpeed ?? 0;
    },
  };
}

if (typeof window !== "undefined") installProbe();

function readInput(stance: number, touch: { x: number; y: number }, fire: boolean, drift: boolean, grab: boolean, forced: number): DriveInput {
  let throttle = 0;
  let steer = 0;
  let strafe = 0;
  let aim = 0;
  if (held.has("KeyW") || held.has("ArrowUp")) throttle += 1;
  if (held.has("KeyS") || held.has("ArrowDown")) throttle -= 1;
  if (held.has("KeyA") || held.has("ArrowLeft")) {
    steer += 1;
    strafe += 1;
  }
  if (held.has("KeyD") || held.has("ArrowRight")) {
    steer -= 1;
    strafe -= 1;
  }
  if (held.has("KeyQ")) aim += 1;
  if (held.has("KeyE")) aim -= 1;
  if (Math.hypot(touch.x, touch.y) > 0.12) {
    throttle += -touch.y;
    steer += -touch.x;
    strafe += -touch.x;
  }
  if (steerOverride != null && Number.isFinite(steerOverride)) {
    steer = steerOverride;
    strafe = steerOverride;
  }
  throttle = clamp(throttle, -1, 1);
  steer = clamp(steer, -1, 1);
  strafe = clamp(strafe, -1, 1);
  let want = stance;
  if (held.has("Digit1")) want = VEHICLE;
  else if (held.has("Digit2")) want = HYBRID;
  else if (held.has("Digit3")) want = MECH;
  else if (forced >= 0) want = forced;
  if (stance === VEHICLE || stance === MECH) strafe = 0;
  if (stance === HYBRID || stance === MECH) {
    if (stance === HYBRID) steer = 0;
  }
  if (stance === HYBRID) steer = 0;
  if (stance !== HYBRID) strafe = stance === VEHICLE || stance === MECH ? 0 : strafe;
  return {
    throttle,
    steer,
    strafe: stance === HYBRID ? strafe : 0,
    aim,
    drift: held.has("Space") || drift,
    fire: held.has("KeyJ") || held.has("KeyF") || fire,
    grapple: held.has("KeyG") || grab,
    stance: want,
  };
}

export function Derby() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [picked, setPicked] = useState<ClassId>("muscle");
  const [playing, setPlaying] = useState(false);
  const [banner, setBanner] = useState("");
  const hudRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [forced, setForced] = useState(-1);
  const [fireHeld, setFireHeld] = useState(false);
  const [driftHeld, setDriftHeld] = useState(false);
  const [grabHeld, setGrabHeld] = useState(false);
  const touch = useRef({ x: 0, y: 0 });
  const flags = useRef({ fire: false, drift: false, grab: false, forced: -1 });
  flags.current = { fire: fireHeld, drift: driftHeld, grab: grabHeld, forced };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      held.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      held.delete(e.code);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !playing) return;
    let dead = false;
    let view: GameView | null = null;
    let raf = 0;
    const match = new Match(picked);
    const w = window as Window & { __stanceYaw?: number; __stanceSpeed?: number };
    let last = performance.now();
    let acc = 0;
    let announced = false;
    const loop = (now: number) => {
      if (dead) return;
      const frame = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += frame;
      const step = 1 / 60;
      while (acc >= step) {
        const player = match.player;
        const input = readInput(
          player.stance,
          touch.current,
          flags.current.fire,
          flags.current.drift,
          flags.current.grab,
          flags.current.forced,
        );
        match.step(step, input);
        acc -= step;
      }
      w.__stanceYaw = match.player.yaw;
      w.__stanceSpeed = match.player.speed;
      view?.resize();
      view?.render(match, frame);
      const player = match.player;
      const mph = Math.round(player.speed * 2.237);
      if (hudRef.current) {
        hudRef.current.textContent = `${player.cls.name.toUpperCase()}   ${player.stanceName()}\n${mph} mph    hull ${Math.round(player.hull)}    lives ${player.lives}`;
      }
      if (hintRef.current) {
        hintRef.current.textContent =
          player.stance === HYBRID
            ? "W drive · A/D slide · Q/E aim · J fire · 1 2 3 stance"
            : player.stance === MECH
              ? "W walk · A/D turn · Space punch · G grab · 1 2 3 stance"
              : "W gas · A/D steer · Space drift · J fire · 1 car 2 hybrid 3 mech";
      }
      if (!announced && match.ended) {
        announced = true;
        setBanner(match.ended === "win" ? "YARD IS YOURS" : "WRECKED");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    void import("./view").then(({ GameView: View }) => {
      if (dead || !canvasRef.current) return;
      view = new View(canvasRef.current);
      view.bind(match);
      view.resize();
    });
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      view?.dispose();
    };
  }, [playing, picked]);

  return (
    <div className="derby-root">
      <canvas ref={canvasRef} className="derby-canvas" />
      <div className="derby-hud">
        <p className="derby-readout" ref={hudRef}>
          Pick a rig
        </p>
        <p className="derby-hint" ref={hintRef}>
          W gas · A/D steer · Space drift · J fire · 1 2 3 stance
        </p>
      </div>
      {!playing ? (
        <div className="derby-menu">
          <p className="derby-kicker">Three stances</p>
          <h1>Stance Derby</h1>
          <p className="derby-lead">Car to close. Hybrid to strafe and shoot. Mech to grab them and put them in the pit.</p>
          <div className="derby-classes">
            {CLASS_IDS.map((id) => (
              <button key={id} type="button" className={picked === id ? "is-on" : ""} onClick={() => setPicked(id)}>
                {id === "muscle" ? "Muscle" : id === "bike" ? "Superbike" : id === "heavy" ? "Heavy Rig" : "Loader"}
              </button>
            ))}
          </div>
          <button type="button" className="derby-start" onClick={() => setPlaying(true)}>
            Start
          </button>
        </div>
      ) : null}
      {banner ? (
        <div className="derby-end">
          <p>{banner}</p>
          <button
            type="button"
            onClick={() => {
              setBanner("");
              setPlaying(false);
              held.clear();
            }}
          >
            Rematch
          </button>
        </div>
      ) : null}
      <div className="derby-dock">
        <div
          className="derby-stick"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            moveStick(e, touch);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) moveStick(e, touch);
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
            touch.current = { x: 0, y: 0 };
          }}
        />
        <div className="derby-actions">
          <Hold label="Fire" on={setFireHeld} />
          <Hold label="Drift" on={setDriftHeld} />
          <Hold label="Grab" on={setGrabHeld} />
          <button type="button" onClick={() => setForced(VEHICLE)}>
            Car
          </button>
          <button type="button" onClick={() => setForced(HYBRID)}>
            Hybrid
          </button>
          <button type="button" onClick={() => setForced(MECH)}>
            Mech
          </button>
        </div>
      </div>
    </div>
  );
}

function Hold({ label, on }: { label: string; on: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        on(true);
      }}
      onPointerUp={() => on(false)}
      onPointerCancel={() => on(false)}
      onPointerLeave={() => on(false)}
    >
      {label}
    </button>
  );
}

function moveStick(e: ReactPointerEvent<HTMLDivElement>, touch: MutableRefObject<{ x: number; y: number }>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  const len = Math.hypot(x, y) || 1;
  const scale = Math.min(1, len);
  touch.current = { x: (x / len) * scale, y: (y / len) * scale };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
