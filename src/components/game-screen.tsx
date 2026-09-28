import { useEffect, useRef, useState } from "react";
import { Pause, SlidersHorizontal, Volume2, VolumeX } from "lucide-react";
import { ForkSheet } from "@/components/fork-sheet";
import { touch } from "@/yard/input";
import { clonePack, type GamePack } from "@/yard/packs";
import { getRuntime, primeRun, type Runtime } from "@/yard/runtime";
import type { HudSnap } from "@/yard/sim";
import { saveFork } from "@/yard/storage";

const EMPTY: HudSnap = {
  phase: "live",
  outcome: "",
  kmh: 0,
  charge: 0,
  boost: false,
  lap: 1,
  laps: 3,
  place: 1,
  field: 1,
  elapsed: 0,
  remain: 0,
  score: 0,
  target: 0,
  cargo: 100,
  step: 0,
  steps: 0,
  wrong: false,
  message: "",
  kind: "circuit",
  title: "",
  slug: "",
};

export function GameScreen({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const rtRef = useRef<Runtime | null>(null);
  const [snap, setSnap] = useState<HudSnap>(EMPTY);
  const [paused, setPaused] = useState(false);
  const [forkOpen, setForkOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const unsub = useRef<(() => void) | null>(null);
  const hudStamp = useRef(0);
  const hudPhase = useRef<HudSnap["phase"]>("live");
  const hudMessage = useRef("");

  function listen(run: Runtime) {
    unsub.current?.();
    unsub.current = run.subscribe((next) => {
      const now = performance.now();
      const urgent = next.phase !== hudPhase.current || next.message !== hudMessage.current;
      hudPhase.current = next.phase;
      hudMessage.current = next.message;
      if (!urgent && now - hudStamp.current < 100) return;
      hudStamp.current = now;
      setSnap(next);
      if (run.viewFailed()) setGlFailed(true);
    });
  }

  useEffect(() => {
    const rt = getRuntime();
    const canvas = canvasRef.current;
    if (!rt || !canvas) return;
    rtRef.current = rt;
    rt.attach(canvas, miniRef.current);
    if (rt.viewFailed()) setGlFailed(true);
    listen(rt);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.closest("input, textarea")) return;
      if (e.code === "Escape") {
        rt.paused = !rt.paused;
        setPaused(rt.paused);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unsub.current?.();
      unsub.current = null;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (getRuntime() === rt) rt.detach();
    };
  }, []);

  const rt = rtRef.current ?? getRuntime();
  const pack = rt?.session.pack;

  function rematch(next?: GamePack) {
    const source = next ?? getRuntime()?.session.pack;
    if (!source) return;
    const run = primeRun(clonePack(source));
    rtRef.current = run;
    const canvas = canvasRef.current;
    if (canvas) {
      run.attach(canvas, miniRef.current);
      setGlFailed(run.viewFailed());
    }
    listen(run);
    setPaused(false);
    setSaved(null);
    setSnap(run.session.hud());
  }

  return (
    <div className="fixed inset-0 bg-ink text-bone">
      <canvas ref={canvasRef} className="h-full w-full touch-none" aria-label="3D game view" />
      <canvas ref={miniRef} width={192} height={192} className="mini-map pointer-events-none absolute top-24 right-3 z-10 h-24 w-24 border border-line" />

      <header className="hud-top pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="chip pointer-events-auto min-w-0 flex-1 px-3 py-2">
          <p className="truncate font-mono text-xs text-sodium">{snap.slug}</p>
          <p className="truncate font-display text-lg font-extrabold leading-tight">{snap.title}</p>
          <p className="truncate font-mono text-xs text-mist tabular-nums">{lineFor(snap)}</p>
        </div>
        <div className="pointer-events-auto flex shrink-0 gap-2">
          <button
            type="button"
            className="btn btn-ghost px-3"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const audio = getRuntime()?.audio;
              if (!audio) return;
              audio.muted = !audio.muted;
              setMuted(audio.muted);
            }}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <button
            type="button"
            className="btn btn-ghost px-3"
            aria-label="Pause"
            onClick={() => {
              const run = getRuntime();
              if (!run) return;
              run.paused = !run.paused;
              setPaused(run.paused);
            }}
          >
            <Pause className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-primary px-3" onClick={() => setForkOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Fork
          </button>
        </div>
      </header>

      {snap.wrong ? (
        <p className="chip pointer-events-none absolute top-28 left-1/2 z-10 -translate-x-1/2 px-3 py-2 font-mono text-xs text-sodium">
          Wrong way
        </p>
      ) : null}
      {snap.message ? (
        <p className="pointer-events-none absolute top-36 left-1/2 z-10 -translate-x-1/2 font-display text-4xl font-extrabold text-sodium">
          {snap.message}
        </p>
      ) : null}

      <div className="hud-speed pointer-events-none absolute bottom-4 left-3 z-10">
        <p className="font-mono text-5xl leading-none font-semibold tabular-nums">{Math.round(snap.kmh)}</p>
        <p className="font-mono text-xs text-mist">km/h</p>
        <div className="mt-2 h-2 w-36 bg-panel-2">
          <div
            className="h-full origin-left bg-sodium"
            style={{ transform: `scaleX(${Math.max(0.02, snap.charge)})` }}
          />
        </div>
        <p className="mt-1 font-mono text-xs text-mist">{snap.boost ? "Boost" : "Drift"}</p>
      </div>

      <p className="keys-hint chip pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 px-3 py-2 font-mono text-xs text-mist sm:block">
        W gas · A left · D right · Space drift · R rescue
      </p>

      <div className="touch-dock">
        <Hold label="Left" className="" onHold={(v) => (touch.left = v)} />
        <Hold label="Gas" className="gas btn-primary" primary onHold={(v) => (touch.gas = v)} />
        <Hold label="Drift" className="" onHold={(v) => (touch.drift = v)} />
        <Hold label="Right" className="" onHold={(v) => (touch.right = v)} />
        <Hold label="Brake" className="" onHold={(v) => (touch.brake = v)} />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const run = getRuntime();
            if (!run) return;
            run.session.tick(1 / 60, { throttle: 0, steer: 0, drift: false, reset: true });
          }}
        >
          Rescue
        </button>
      </div>

      {glFailed ? (
        <p className="chip absolute bottom-28 left-3 z-10 px-3 py-2 text-sm" role="alert">
          This browser couldn't start WebGL.
        </p>
      ) : null}

      {paused && snap.phase !== "done" ? (
        <div className="scrim absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="chip w-full max-w-sm p-5">
            <h2 className="font-display text-3xl font-extrabold">Paused</h2>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const run = getRuntime();
                  if (!run) return;
                  run.paused = false;
                  setPaused(false);
                }}
              >
                Resume
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setForkOpen(true)}>
                Fork
              </button>
              <button type="button" className="btn btn-ghost" onClick={onExit}>
                Back to yard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {snap.phase === "done" ? (
        <div className="scrim absolute inset-0 z-40 flex items-center justify-center p-4">
          <div className="chip w-full max-w-sm p-5">
            <p className="font-mono text-xs text-sodium">{snap.slug}</p>
            <h2 className="font-display text-4xl font-extrabold">{resultTitle(snap)}</h2>
            <p className="mt-1 font-mono text-lg tabular-nums text-mist">{resultDetail(snap)}</p>
            {saved ? <p className="mt-2 text-sm text-mist">{saved}</p> : null}
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className="btn btn-primary" onClick={() => rematch()}>
                Rematch
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const current = getRuntime()?.session.pack;
                  if (!current) return;
                  try {
                    const copy = clonePack(current);
                    if (copy.slug.startsWith("yard/")) {
                      copy.forkedFrom = copy.slug;
                      copy.slug = `you/${copy.slug.split("/")[1] ?? "fork"}`;
                    }
                    saveFork(copy);
                    setSaved(`Saved ${copy.slug}`);
                  } catch {
                    setSaved("Couldn't save that fork.");
                  }
                }}
              >
                Save fork
              </button>
              <button type="button" className="btn btn-ghost" onClick={onExit}>
                Back to yard
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {forkOpen && pack && rt ? (
        <ForkSheet
          pack={pack}
          origin={rt.session.origin}
          onClose={() => setForkOpen(false)}
          onRematch={() => {
            setForkOpen(false);
            rematch(pack);
          }}
        />
      ) : null}
    </div>
  );
}

function Hold({
  label,
  className,
  primary,
  onHold,
}: {
  label: string;
  className: string;
  primary?: boolean;
  onHold: (down: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`btn ${primary ? "btn-primary" : "btn-ghost"} ${className}`}
      style={{ touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      onLostPointerCapture={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function lineFor(snap: HudSnap) {
  if (snap.kind === "circuit") {
    return `Lap ${snap.lap}/${snap.laps} · P${snap.place}/${snap.field} · ${clock(snap.elapsed)}`;
  }
  if (snap.kind === "sweep") {
    return `${snap.score}/${snap.target} beacons · ${clock(snap.remain)}`;
  }
  return `Gate ${snap.step}/${snap.steps} · cargo ${Math.round(snap.cargo)} · ${clock(snap.remain)}`;
}

function resultTitle(snap: HudSnap) {
  switch (snap.outcome) {
    case "finish":
      return `P${snap.place}`;
    case "clear":
      return "Clear";
    case "short":
      return "Short";
    case "delivered":
      return "Delivered";
    case "lost":
      return "Cargo gone";
    case "late":
      return "Late";
    default:
      return "Done";
  }
}

function resultDetail(snap: HudSnap) {
  if (snap.outcome === "finish") return clock(snap.elapsed);
  if (snap.outcome === "clear" || snap.outcome === "short") return `${snap.score} / ${snap.target} beacons`;
  if (snap.outcome === "delivered" || snap.outcome === "lost") return `${Math.round(snap.cargo)}% cargo left`;
  if (snap.outcome === "late") return `${snap.step} / ${snap.steps} gates`;
  return snap.title;
}

function clock(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(1).padStart(4, "0")}`;
}
