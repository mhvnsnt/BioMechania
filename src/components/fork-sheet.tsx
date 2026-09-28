import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  KIND_LABEL,
  KINDS,
  LOOKS,
  LOOK_IDS,
  LOOK_LABEL,
  VEHICLE_LABEL,
  VEHICLES,
  packJson,
  parsePack,
  slugify,
  type GamePack,
  type Handling,
  type Kind,
  type LookId,
  type VehicleId,
} from "@/yard/packs";
import { saveFork } from "@/yard/storage";

const FEEL: { key: keyof Handling; label: string; min: number; max: number; step: number }[] = [
  { key: "accel", label: "Launch", min: 8, max: 60, step: 1 },
  { key: "maxSpeed", label: "Top speed", min: 14, max: 55, step: 1 },
  { key: "brake", label: "Brakes", min: 10, max: 70, step: 1 },
  { key: "turn", label: "Turn", min: 0.6, max: 4.2, step: 0.05 },
  { key: "grip", label: "Grip", min: 1, max: 16, step: 0.1 },
  { key: "driftGrip", label: "Drift slip", min: 0.3, max: 6, step: 0.05 },
  { key: "boost", label: "Boost", min: 1, max: 2.6, step: 0.05 },
  { key: "drag", label: "Coast", min: 0.1, max: 1.6, step: 0.05 },
];

export function ForkSheet({
  pack,
  origin,
  onClose,
  onRematch,
}: {
  pack: GamePack;
  origin: string;
  onClose: () => void;
  onRematch: () => void;
}) {
  const [, bump] = useState(0);
  const slugLocked = useRef(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pack.slug.startsWith("yard/")) {
      pack.forkedFrom = pack.slug;
      pack.slug = slugify("you", pack.title);
      bump((n) => n + 1);
    }
  }, [pack]);

  function refresh() {
    bump((n) => n + 1);
  }

  function setFeel(key: keyof Handling, value: number) {
    pack.handling[key] = value;
    refresh();
  }

  return (
    <div className="scrim absolute inset-0 z-30 flex justify-end">
      <div className="flex h-full w-full max-w-md flex-col border-l border-line bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <p className="font-mono text-xs text-sodium">Fork</p>
            <h2 className="font-display text-xl font-extrabold">Make it yours</h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close fork bench">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <label className="text-sm text-mist" htmlFor="fork-title">
            Name
          </label>
          <input
            id="fork-title"
            className="field mt-1"
            value={pack.title}
            maxLength={42}
            onChange={(e) => {
              pack.title = e.target.value;
              if (!slugLocked.current) {
                const owner = pack.slug.split("/")[0] || "you";
                pack.slug = slugify(owner, pack.title);
              }
              refresh();
            }}
          />
          <label className="mt-3 block text-sm text-mist" htmlFor="fork-slug">
            Pack id
          </label>
          <input
            id="fork-slug"
            className="field mt-1"
            value={pack.slug}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              slugLocked.current = true;
              pack.slug = e.target.value.toLowerCase();
              refresh();
            }}
          />
          <p className="mt-1 font-mono text-xs text-mist">from {pack.forkedFrom ?? origin}</p>

          <h3 className="mt-6 font-mono text-xs tracking-widest text-mist uppercase">Feel · live</h3>
          <ul className="mt-2">
            {FEEL.map((row) => (
              <li key={row.key} className="mt-1">
                <div className="flex items-baseline justify-between font-mono text-xs">
                  <span>{row.label}</span>
                  <span className="text-sodium tabular-nums">{formatNum(pack.handling[row.key])}</span>
                </div>
                <input
                  type="range"
                  min={row.min}
                  max={row.max}
                  step={row.step}
                  value={pack.handling[row.key]}
                  aria-label={row.label}
                  onChange={(e) => setFeel(row.key, Number(e.target.value))}
                />
              </li>
            ))}
          </ul>

          <h3 className="mt-4 font-mono text-xs tracking-widest text-mist uppercase">Paint · live</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {LOOK_IDS.map((id) => (
              <PaintButton key={id} id={id} active={pack.look === id} onPick={() => {
                pack.look = id;
                refresh();
              }} />
            ))}
          </div>

          <h3 className="mt-6 font-mono text-xs tracking-widest text-mist uppercase">Body · live</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {VEHICLES.map((id) => (
              <button
                key={id}
                type="button"
                className={pack.vehicle === id ? "btn btn-primary" : "btn btn-ghost"}
                onClick={() => {
                  pack.vehicle = id as VehicleId;
                  refresh();
                }}
              >
                {VEHICLE_LABEL[id]}
              </button>
            ))}
          </div>

          <h3 className="mt-6 font-mono text-xs tracking-widest text-mist uppercase">Base · on rematch</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {KINDS.map((id) => (
              <button
                key={id}
                type="button"
                className={pack.kind === id ? "btn btn-primary" : "btn btn-ghost"}
                onClick={() => {
                  pack.kind = id as Kind;
                  refresh();
                }}
              >
                {KIND_LABEL[id]}
              </button>
            ))}
          </div>
          <Rule
            label="Laps"
            min={1}
            max={9}
            step={1}
            value={pack.rules.laps}
            onChange={(v) => {
              pack.rules.laps = v;
              refresh();
            }}
          />
          <Rule
            label="Clock seconds"
            min={20}
            max={180}
            step={1}
            value={pack.rules.seconds}
            onChange={(v) => {
              pack.rules.seconds = v;
              refresh();
            }}
          />
          <Rule
            label="Rivals"
            min={0}
            max={5}
            step={1}
            value={pack.rules.bots}
            onChange={(v) => {
              pack.rules.bots = v;
              refresh();
            }}
          />
          <Rule
            label="Rival pace"
            min={0.7}
            max={1.15}
            step={0.01}
            value={pack.rules.botPace}
            onChange={(v) => {
              pack.rules.botPace = v;
              refresh();
            }}
          />
          <Rule
            label="Score to clear"
            min={3}
            max={30}
            step={1}
            value={pack.rules.target}
            onChange={(v) => {
              pack.rules.target = v;
              refresh();
            }}
          />
          <p className="mt-2 text-sm text-mist">
            Laps, clock, rivals, score, and which base you are driving apply when you rematch. Feel, paint, and body hit the car now.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-sodium" role="alert">
              {error}
            </p>
          ) : null}
          {status ? <p className="mt-3 text-sm text-mist">{status}</p> : null}
        </div>
        <div className="flex flex-col gap-2 border-t border-line p-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              try {
                const saved = parsePack(packJson({ ...pack, title: pack.title.trim() || "Fork" }));
                if (!saved.forkedFrom) saved.forkedFrom = origin;
                saveFork(saved);
                pack.slug = saved.slug;
                pack.title = saved.title;
                pack.forkedFrom = saved.forkedFrom;
                setError(null);
                setStatus(`Saved ${saved.slug} on this phone.`);
                refresh();
              } catch (err) {
                setStatus(null);
                setError(err instanceof Error ? err.message : "Couldn't save that fork.");
              }
            }}
          >
            Save fork
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(packJson(pack));
                  setStatus("Pack copied.");
                  setError(null);
                } catch {
                  setError("Clipboard blocked. Save the fork, then copy it from the yard.");
                }
              }}
            >
              Copy pack
            </button>
            <button type="button" className="btn btn-ghost flex-1" onClick={onRematch}>
              Rematch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rule({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-2 block">
      <span className="flex items-baseline justify-between font-mono text-xs">
        {label}
        <span className="text-sodium tabular-nums">{formatNum(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function PaintButton({ id, active, onPick }: { id: LookId; active: boolean; onPick: () => void }) {
  return (
    <button type="button" className={active ? "btn btn-primary" : "btn btn-ghost"} onClick={onPick}>
      <span
        className="inline-block size-3 rounded-full border border-line"
        style={{ background: LOOKS[id].accent }}
        aria-hidden="true"
      />
      {LOOK_LABEL[id]}
    </button>
  );
}

function formatNum(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
}
