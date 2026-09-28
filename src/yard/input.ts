export type DriveInput = {
  throttle: number;
  steer: number;
  drift: boolean;
  reset: boolean;
};

const BLOCK = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export const keys = new Set<string>();

export const touch = {
  left: false,
  right: false,
  gas: false,
  brake: false,
  drift: false,
};

let forced: Set<string> | null = null;
let steerLock: number | null = null;
let bound = false;

declare global {
  interface Window {
    __yardHeld?: Set<string>;
    __yardSteer?: number | null;
    __yardYaw?: number;
    __yardSpeed?: number;
    __yardQueued?: string | null;
    __yardBoot?: () => void;
  }
}

function heldKeys() {
  const queued = typeof window !== "undefined" ? window.__yardHeld : undefined;
  if (queued && queued.size > 0) return queued;
  if (forced && forced.size > 0) return forced;
  return keys;
}

export function bindKeyboard() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.closest("input, textarea")) return;
    keys.add(e.code);
    if (BLOCK.has(e.code)) e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    keys.delete(e.code);
  });
  const clear = () => keys.clear();
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
}

let steerVisual = 0;

export function setSteerVisual(v: number) {
  steerVisual = v;
}

export function getSteerVisual() {
  return steerVisual;
}

export function setProbeKeys(codes: string[]) {
  forced = codes.length ? new Set(codes) : null;
  if (typeof window !== "undefined") window.__yardHeld = new Set(codes);
}

export function setProbeSteer(v: number) {
  steerLock = v;
  if (typeof window !== "undefined") window.__yardSteer = v;
}

export function readInput(): DriveInput {
  const held = heldKeys();
  let steer = 0;
  if (held.has("KeyA") || held.has("ArrowLeft")) steer += 1;
  if (held.has("KeyD") || held.has("ArrowRight")) steer -= 1;
  if (touch.left) steer += 1;
  if (touch.right) steer -= 1;
  if (typeof window !== "undefined" && window.__yardSteer != null) steer = window.__yardSteer;
  else if (steerLock !== null) steer = steerLock;
  let throttle = 0;
  if (held.has("KeyW") || held.has("ArrowUp")) throttle += 1;
  if (held.has("KeyS") || held.has("ArrowDown")) throttle -= 1;
  if (touch.gas) throttle += 1;
  if (touch.brake) throttle -= 1;
  if (steer > 1) steer = 1;
  else if (steer < -1) steer = -1;
  if (throttle > 1) throttle = 1;
  else if (throttle < -1) throttle = -1;
  const drift = held.has("Space") || held.has("ShiftLeft") || touch.drift;
  const reset = held.has("KeyR");
  return { throttle, steer, drift, reset };
}
