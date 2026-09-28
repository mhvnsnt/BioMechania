import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Trash2, c as Pause, l as Download, n as VolumeX, o as Smartphone, r as Volume2, s as SlidersHorizontal, t as X } from "../_libs/lucide-react.mjs";
import { a as string, i as object, n as literal, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CknzUnx7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var KINDS = [
	"circuit",
	"sweep",
	"haul"
];
var VEHICLES = [
	"wedge",
	"buggy",
	"hauler"
];
var LOOK_IDS = [
	"sodium",
	"salt",
	"ridge",
	"ember"
];
var LOOKS = {
	sodium: {
		sky: "#14110c",
		fog: "#1b1712",
		ground: "#141a16",
		road: "#2c322e",
		shoulder: "#1a221e",
		accent: "#f0a202",
		lamp: "#ffb703",
		hill: "#1a1612",
		near: 16,
		far: 78,
		exposure: 1.2
	},
	salt: {
		sky: "#d7ded8",
		fog: "#c9d1cb",
		ground: "#b7c0b4",
		road: "#8d968b",
		shoulder: "#a7b0a3",
		accent: "#f0a202",
		lamp: "#fff1cc",
		hill: "#9aa396",
		near: 28,
		far: 130,
		exposure: .92
	},
	ridge: {
		sky: "#10151b",
		fog: "#182028",
		ground: "#12181c",
		road: "#2a343a",
		shoulder: "#1a2328",
		accent: "#d5e2ea",
		lamp: "#9ad0ff",
		hill: "#1a2228",
		near: 14,
		far: 70,
		exposure: 1.15
	},
	ember: {
		sky: "#140c0a",
		fog: "#1c100e",
		ground: "#1a1210",
		road: "#342826",
		shoulder: "#241614",
		accent: "#e85d04",
		lamp: "#ff7a3c",
		hill: "#1c1210",
		near: 14,
		far: 72,
		exposure: 1.18
	}
};
var LOOK_LABEL = {
	sodium: "Sodium",
	salt: "Salt",
	ridge: "Ridge",
	ember: "Ember"
};
var VEHICLE_LABEL = {
	wedge: "Wedge",
	buggy: "Buggy",
	hauler: "Hauler"
};
var KIND_LABEL = {
	circuit: "Circuit",
	sweep: "Sweep",
	haul: "Haul"
};
var handlingSchema = object({
	accel: number().min(6).max(80),
	brake: number().min(8).max(90),
	maxSpeed: number().min(10).max(70),
	reverse: number().min(2).max(24),
	turn: number().min(.4).max(5),
	grip: number().min(.4).max(24),
	driftGrip: number().min(.15).max(12),
	drag: number().min(.05).max(3),
	boost: number().min(1).max(3.5),
	offDrag: number().min(0).max(8)
});
var rulesSchema = object({
	laps: number().int().min(1).max(9),
	seconds: number().min(20).max(240),
	bots: number().int().min(0).max(5),
	botPace: number().min(.55).max(1.25),
	target: number().int().min(1).max(40)
});
var packSchema = object({
	format: literal("yard-pack"),
	version: literal(1),
	slug: string().min(3).max(48).regex(/^[a-z0-9]+\/[a-z0-9-]+$/),
	title: string().min(1).max(42),
	summary: string().min(1).max(180),
	kind: _enum(KINDS),
	vehicle: _enum(VEHICLES),
	look: _enum(LOOK_IDS),
	handling: handlingSchema,
	rules: rulesSchema,
	forkedFrom: string().max(48).optional()
});
function clonePack(pack) {
	return structuredClone(pack);
}
function slugify(owner, title) {
	return `${owner}/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 28) || "fork"}`;
}
function parsePack(raw) {
	let data;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error("That text isn't JSON.");
	}
	const parsed = packSchema.safeParse(data);
	if (!parsed.success) {
		const issue = parsed.error.issues[0];
		const path = issue?.path?.join(".") || "pack";
		throw new Error(`${path}: ${issue?.message ?? "invalid pack"}`);
	}
	return parsed.data;
}
async function pullPack(url) {
	let parsed;
	try {
		parsed = new URL(url.trim());
	} catch {
		throw new Error("That isn't a link.");
	}
	if (parsed.protocol !== "https:") throw new Error("Pack links have to be https.");
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 8e3);
	try {
		const res = await fetch(parsed.toString(), { signal: ctrl.signal });
		if (!res.ok) throw new Error(`Couldn't pull that link (${res.status}).`);
		const text = await res.text();
		if (text.length > 8e4) throw new Error("That file is too big to be a pack.");
		return parsePack(text);
	} catch (err) {
		if (err instanceof Error && err.name === "AbortError") throw new Error("The link timed out.");
		if (err instanceof Error) throw err;
		throw new Error("Couldn't pull that link.");
	} finally {
		clearTimeout(timer);
	}
}
var BASES = [
	{
		format: "yard-pack",
		version: 1,
		slug: "yard/night-circuit",
		title: "Night Circuit",
		summary: "Full race. Three laps, three rivals, drift to bank a boost. Rescue if you nose into the wall.",
		kind: "circuit",
		vehicle: "wedge",
		look: "sodium",
		handling: {
			accel: 28,
			brake: 42,
			maxSpeed: 34,
			reverse: 8,
			turn: 2.25,
			grip: 8,
			driftGrip: 1.2,
			drag: .34,
			boost: 1.55,
			offDrag: 2.6
		},
		rules: {
			laps: 3,
			seconds: 180,
			bots: 3,
			botPace: .8,
			target: 8
		}
	},
	{
		format: "yard-pack",
		version: 1,
		slug: "yard/salt-sweep",
		title: "Salt Sweep",
		summary: "Open salt pan, loose tires. Grab beacons before the clock dies. Sweepers punish a greedy line.",
		kind: "sweep",
		vehicle: "buggy",
		look: "salt",
		handling: {
			accel: 32,
			brake: 36,
			maxSpeed: 30,
			reverse: 9,
			turn: 2.45,
			grip: 3.4,
			driftGrip: 1.05,
			drag: .42,
			boost: 1.4,
			offDrag: .4
		},
		rules: {
			laps: 1,
			seconds: 75,
			bots: 0,
			botPace: .9,
			target: 12
		}
	},
	{
		format: "yard-pack",
		version: 1,
		slug: "yard/ridge-haul",
		title: "Ridge Haul",
		summary: "Narrow ridge, heavy truck. Clear every gate with cargo left. Walls chip the load.",
		kind: "haul",
		vehicle: "hauler",
		look: "ridge",
		handling: {
			accel: 16,
			brake: 28,
			maxSpeed: 22,
			reverse: 6,
			turn: 1.55,
			grip: 9.5,
			driftGrip: 2.4,
			drag: .4,
			boost: 1.25,
			offDrag: 3.2
		},
		rules: {
			laps: 1,
			seconds: 58,
			bots: 0,
			botPace: .88,
			target: 6
		}
	}
];
function packJson(pack) {
	return JSON.stringify(pack, null, 2);
}
var KEY = "yard.forks.v1";
var EMPTY$1 = [];
var cacheRaw = null;
var cacheList = EMPTY$1;
function readForks() {
	if (typeof localStorage === "undefined") return EMPTY$1;
	const raw = localStorage.getItem(KEY) ?? "";
	if (raw === cacheRaw) return cacheList;
	cacheRaw = raw;
	if (!raw) {
		cacheList = EMPTY$1;
		return cacheList;
	}
	try {
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) {
			cacheList = EMPTY$1;
			return cacheList;
		}
		const next = [];
		for (const item of data) {
			const parsed = packSchema.safeParse(item);
			if (parsed.success) next.push(parsed.data);
		}
		cacheList = next;
	} catch {
		cacheList = EMPTY$1;
	}
	return cacheList;
}
function write(list) {
	cacheList = list;
	cacheRaw = JSON.stringify(list);
	localStorage.setItem(KEY, cacheRaw);
	window.dispatchEvent(new Event("yard-forks"));
}
function saveFork(pack) {
	write([pack, ...readForks().filter((f) => f.slug !== pack.slug)]);
}
function deleteFork(slug) {
	write(readForks().filter((f) => f.slug !== slug));
}
function subscribeForks(cb) {
	const on = () => cb();
	window.addEventListener("yard-forks", on);
	window.addEventListener("storage", on);
	return () => {
		window.removeEventListener("yard-forks", on);
		window.removeEventListener("storage", on);
	};
}
var FEEL = [
	{
		key: "accel",
		label: "Launch",
		min: 8,
		max: 60,
		step: 1
	},
	{
		key: "maxSpeed",
		label: "Top speed",
		min: 14,
		max: 55,
		step: 1
	},
	{
		key: "brake",
		label: "Brakes",
		min: 10,
		max: 70,
		step: 1
	},
	{
		key: "turn",
		label: "Turn",
		min: .6,
		max: 4.2,
		step: .05
	},
	{
		key: "grip",
		label: "Grip",
		min: 1,
		max: 16,
		step: .1
	},
	{
		key: "driftGrip",
		label: "Drift slip",
		min: .3,
		max: 6,
		step: .05
	},
	{
		key: "boost",
		label: "Boost",
		min: 1,
		max: 2.6,
		step: .05
	},
	{
		key: "drag",
		label: "Coast",
		min: .1,
		max: 1.6,
		step: .05
	}
];
function ForkSheet({ pack, origin, onClose, onRematch }) {
	const [, bump] = (0, import_react.useState)(0);
	const slugLocked = (0, import_react.useRef)(false);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (pack.slug.startsWith("yard/")) {
			pack.forkedFrom = pack.slug;
			pack.slug = slugify("you", pack.title);
			bump((n) => n + 1);
		}
	}, [pack]);
	function refresh() {
		bump((n) => n + 1);
	}
	function setFeel(key, value) {
		pack.handling[key] = value;
		refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "scrim absolute inset-0 z-30 flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full max-w-md flex-col border-l border-line bg-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-line px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-sodium",
						children: "Fork"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-extrabold",
						children: "Make it yours"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: onClose,
						"aria-label": "Close fork bench",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm text-mist",
							htmlFor: "fork-title",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "fork-title",
							className: "field mt-1",
							value: pack.title,
							maxLength: 42,
							onChange: (e) => {
								pack.title = e.target.value;
								if (!slugLocked.current) pack.slug = slugify(pack.slug.split("/")[0] || "you", pack.title);
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm text-mist",
							htmlFor: "fork-slug",
							children: "Pack id"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "fork-slug",
							className: "field mt-1",
							value: pack.slug,
							autoCapitalize: "off",
							autoCorrect: "off",
							spellCheck: false,
							onChange: (e) => {
								slugLocked.current = true;
								pack.slug = e.target.value.toLowerCase();
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-mist",
							children: ["from ", pack.forkedFrom ?? origin]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-6 font-mono text-xs tracking-widest text-mist uppercase",
							children: "Feel · live"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2",
							children: FEEL.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between font-mono text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sodium tabular-nums",
										children: formatNum(pack.handling[row.key])
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: row.min,
									max: row.max,
									step: row.step,
									value: pack.handling[row.key],
									"aria-label": row.label,
									onChange: (e) => setFeel(row.key, Number(e.target.value))
								})]
							}, row.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-mono text-xs tracking-widest text-mist uppercase",
							children: "Paint · live"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: LOOK_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaintButton, {
								id,
								active: pack.look === id,
								onPick: () => {
									pack.look = id;
									refresh();
								}
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-6 font-mono text-xs tracking-widest text-mist uppercase",
							children: "Body · live"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: VEHICLES.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: pack.vehicle === id ? "btn btn-primary" : "btn btn-ghost",
								onClick: () => {
									pack.vehicle = id;
									refresh();
								},
								children: VEHICLE_LABEL[id]
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-6 font-mono text-xs tracking-widest text-mist uppercase",
							children: "Base · on rematch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: KINDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: pack.kind === id ? "btn btn-primary" : "btn btn-ghost",
								onClick: () => {
									pack.kind = id;
									refresh();
								},
								children: KIND_LABEL[id]
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							label: "Laps",
							min: 1,
							max: 9,
							step: 1,
							value: pack.rules.laps,
							onChange: (v) => {
								pack.rules.laps = v;
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							label: "Clock seconds",
							min: 20,
							max: 180,
							step: 1,
							value: pack.rules.seconds,
							onChange: (v) => {
								pack.rules.seconds = v;
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							label: "Rivals",
							min: 0,
							max: 5,
							step: 1,
							value: pack.rules.bots,
							onChange: (v) => {
								pack.rules.bots = v;
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							label: "Rival pace",
							min: .7,
							max: 1.15,
							step: .01,
							value: pack.rules.botPace,
							onChange: (v) => {
								pack.rules.botPace = v;
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							label: "Score to clear",
							min: 3,
							max: 30,
							step: 1,
							value: pack.rules.target,
							onChange: (v) => {
								pack.rules.target = v;
								refresh();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-mist",
							children: "Laps, clock, rivals, score, and which base you are driving apply when you rematch. Feel, paint, and body hit the car now."
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-sodium",
							role: "alert",
							children: error
						}) : null,
						status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-mist",
							children: status
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 border-t border-line p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-primary",
						onClick: () => {
							try {
								const saved = parsePack(packJson({
									...pack,
									title: pack.title.trim() || "Fork"
								}));
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
						},
						children: "Save fork"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost flex-1",
							onClick: async () => {
								try {
									await navigator.clipboard.writeText(packJson(pack));
									setStatus("Pack copied.");
									setError(null);
								} catch {
									setError("Clipboard blocked. Save the fork, then copy it from the yard.");
								}
							},
							children: "Copy pack"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost flex-1",
							onClick: onRematch,
							children: "Rematch"
						})]
					})]
				})
			]
		})
	});
}
function Rule({ label, min, max, step, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-2 block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-baseline justify-between font-mono text-xs",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sodium tabular-nums",
				children: formatNum(value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min,
			max,
			step,
			value,
			"aria-label": label,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
function PaintButton({ id, active, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: active ? "btn btn-primary" : "btn btn-ghost",
		onClick: onPick,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-block size-3 rounded-full border border-line",
			style: { background: LOOKS[id].accent },
			"aria-hidden": "true"
		}), LOOK_LABEL[id]]
	});
}
function formatNum(n) {
	return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
}
var BLOCK = /* @__PURE__ */ new Set([
	"Space",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
var keys = /* @__PURE__ */ new Set();
var touch = {
	left: false,
	right: false,
	gas: false,
	brake: false,
	drift: false
};
var forced = null;
var steerLock = null;
var bound = false;
function heldKeys() {
	const queued = typeof window !== "undefined" ? window.__yardHeld : void 0;
	if (queued && queued.size > 0) return queued;
	if (forced && forced.size > 0) return forced;
	return keys;
}
function bindKeyboard() {
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
var steerVisual = 0;
function setSteerVisual(v) {
	steerVisual = v;
}
function getSteerVisual() {
	return steerVisual;
}
function setProbeKeys(codes) {
	forced = codes.length ? new Set(codes) : null;
	if (typeof window !== "undefined") window.__yardHeld = new Set(codes);
}
function setProbeSteer(v) {
	steerLock = v;
	if (typeof window !== "undefined") window.__yardSteer = v;
}
function readInput() {
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
	return {
		throttle,
		steer,
		drift,
		reset
	};
}
var YardAudio = class {
	ctx = null;
	osc = null;
	gain = null;
	muted = false;
	start() {
		if (this.ctx) {
			if (this.ctx.state === "suspended") this.ctx.resume();
			return;
		}
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return;
		const ctx = new AC();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.value = 46;
		gain.gain.value = 1e-4;
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		this.ctx = ctx;
		this.osc = osc;
		this.gain = gain;
		ctx.resume();
	}
	setSpeed(speed, max, boosting) {
		if (!this.ctx || !this.osc || !this.gain || this.muted) {
			if (this.gain && this.muted) this.gain.gain.value = 0;
			return;
		}
		const t = this.ctx.currentTime;
		const norm = Math.min(1, Math.abs(speed) / Math.max(8, max));
		this.osc.frequency.setTargetAtTime(42 + norm * 78 + (boosting ? 24 : 0), t, .08);
		this.gain.gain.setTargetAtTime(norm > .04 ? .018 + norm * .02 : 1e-4, t, .08);
	}
	blip(freq) {
		if (!this.ctx || this.muted) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "square";
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(.04, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(1e-4, this.ctx.currentTime + .12);
		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + .13);
	}
	stop() {
		try {
			this.osc?.stop();
		} catch {}
		this.ctx?.close();
		this.ctx = null;
		this.osc = null;
		this.gain = null;
	}
};
function loopControls() {
	const pts = [];
	const n = 16;
	for (let i = 0; i < n; i++) {
		const a = i / n * Math.PI * 2;
		const wobble = 1 + .16 * Math.sin(a * 2) + .06 * Math.sin(a * 3 + .4);
		const pinch = Math.exp(-(Math.atan2(Math.sin(a - 1.15), Math.cos(a - 1.15)) ** 2) / .05);
		const rad = (30 + 8 * Math.cos(a)) * wobble * (1 - pinch * .28);
		pts.push({
			x: Math.cos(a) * rad * 1.45,
			y: 0,
			z: Math.sin(a) * rad
		});
	}
	return pts;
}
function haulControls() {
	const pts = [];
	for (let i = 0; i < 11; i++) {
		const t = i / 10;
		pts.push({
			x: -78 + t * 156,
			y: 0,
			z: Math.sin(t * Math.PI * 2.15) * 24 + Math.sin(t * Math.PI) * 6
		});
	}
	return pts;
}
function cr(p0, p1, p2, p3, t) {
	const t2 = t * t;
	const t3 = t2 * t;
	return {
		x: .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
		y: 0,
		z: .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
	};
}
function catmull(controls, perSeg, closed) {
	const n = controls.length;
	const out = [];
	const segs = closed ? n : n - 1;
	const at = (i) => {
		if (closed) return controls[(i + n) % n];
		return controls[Math.max(0, Math.min(n - 1, i))];
	};
	for (let i = 0; i < segs; i++) {
		const p0 = at(i - 1);
		const p1 = at(i);
		const p2 = at(i + 1);
		const p3 = at(i + 2);
		for (let s = 0; s < perSeg; s++) out.push(cr(p0, p1, p2, p3, s / perSeg));
	}
	if (!closed) {
		const last = controls[n - 1];
		out.push({
			x: last.x,
			y: 0,
			z: last.z
		});
	}
	return out;
}
function buildTrack(kind) {
	if (kind === "sweep") return {
		kind,
		samples: [],
		closed: false,
		half: 34,
		checkpoints: [],
		arena: 34,
		spawn: 0
	};
	const closed = kind === "circuit";
	const samples = catmull(closed ? loopControls() : haulControls(), 8, closed);
	const amp = closed ? 1.7 : 3.1;
	samples.forEach((s, i) => {
		s.y = Math.sin(i * .085) * amp + Math.sin(i * .21 + .7) * amp * .28;
	});
	const n = samples.length;
	const cpCount = closed ? 4 : 6;
	const checkpoints = [];
	for (let i = 1; i <= cpCount; i++) checkpoints.push(Math.min(n - 1, Math.round(i * n / (cpCount + 1))));
	const spawn = closed ? (checkpoints[checkpoints.length - 1] + 10) % n : 2;
	return {
		kind,
		samples,
		closed,
		half: closed ? 7 : 4.5,
		checkpoints,
		arena: 0,
		spawn
	};
}
function frameAt(track, index) {
	const n = track.samples.length;
	const i = (index % n + n) % n;
	const a = track.samples[i];
	let j = track.closed ? (i + 1) % n : Math.min(n - 1, i + 1);
	if (j === i) j = Math.max(0, i - 1);
	const b = track.samples[j];
	let dx = b.x - a.x;
	let dz = b.z - a.z;
	if (j < i && !track.closed) {
		dx = -dx;
		dz = -dz;
	}
	const len = Math.hypot(dx, dz) || 1;
	const tx = dx / len;
	const tz = dz / len;
	const sx = -tz;
	const sz = tx;
	return {
		x: a.x,
		y: a.y,
		z: a.z,
		tx,
		tz,
		sx,
		sz,
		yaw: Math.atan2(-tx, -tz)
	};
}
function projectPoint(x, z, track) {
	const pts = track.samples;
	const n = pts.length;
	const segs = track.closed ? n : n - 1;
	let best = Infinity;
	let found = null;
	for (let i = 0; i < segs; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		const abx = b.x - a.x;
		const abz = b.z - a.z;
		const len2 = abx * abx + abz * abz;
		if (len2 < 1e-6) continue;
		let t = ((x - a.x) * abx + (z - a.z) * abz) / len2;
		if (t < 0) t = 0;
		else if (t > 1) t = 1;
		const px = a.x + abx * t;
		const pz = a.z + abz * t;
		const dx = x - px;
		const dz = z - pz;
		const d2 = dx * dx + dz * dz;
		if (d2 < best) {
			best = d2;
			const len = Math.sqrt(len2);
			const tx = abx / len;
			const tz = abz / len;
			const sx = -tz;
			const sz = tx;
			found = {
				dist: Math.sqrt(d2),
				side: dx * sx + dz * sz,
				seg: i,
				t,
				tx,
				tz,
				sx,
				sz,
				px,
				pz,
				y: a.y + (b.y - a.y) * t
			};
		}
	}
	if (!found) return {
		dist: 0,
		side: 0,
		seg: 0,
		t: 0,
		tx: 0,
		tz: -1,
		sx: 1,
		sz: 0,
		px: x,
		pz: z,
		y: 0
	};
	return found;
}
function crossedGate(x0, z0, x1, z1, gate, tx, tz, sx, sz, half) {
	const d0 = (x0 - gate.x) * tx + (z0 - gate.z) * tz;
	const d1 = (x1 - gate.x) * tx + (z1 - gate.z) * tz;
	if (!(d0 < .15 && d1 >= -.05) || d1 < d0) return false;
	const denom = d0 - d1;
	const t = Math.abs(denom) < 1e-6 ? 0 : d0 / denom;
	const ix = x0 + (x1 - x0) * t;
	const iz = z0 + (z1 - z0) * t;
	return Math.abs((ix - gate.x) * sx + (iz - gate.z) * sz) < half + 1.8;
}
var BOT_COLORS = [
	"#c4553a",
	"#d9d3c4",
	"#6e7f74",
	"#c9842a",
	"#8d6b8a"
];
var BOT_NAMES = [
	"Moth",
	"Rust",
	"Bone",
	"Kiln",
	"Soot"
];
var ZERO = {
	throttle: 0,
	steer: 0,
	drift: false,
	reset: false
};
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function wrap(a) {
	while (a > Math.PI) a -= Math.PI * 2;
	while (a < -Math.PI) a += Math.PI * 2;
	return a;
}
function mulberry32(seed) {
	let s = seed >>> 0;
	return () => {
		s = s + 1831565813 | 0;
		let t = Math.imul(s ^ s >>> 15, 1 | s);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hashSlug(slug) {
	let h = 2166136261;
	for (let i = 0; i < slug.length; i++) {
		h ^= slug.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
var Session = class {
	pack;
	origin;
	track;
	racers = [];
	beacons = [];
	hazards = [];
	time = 0;
	phase = "live";
	outcome = "";
	cargo = 100;
	message = "";
	messageT = 0;
	resetHeld = false;
	player;
	constructor(pack) {
		this.pack = pack;
		this.origin = pack.slug;
		this.track = buildTrack(pack.kind);
		this.player = this.spawnField();
		if (pack.kind === "sweep") this.seedSweep();
	}
	spawnField() {
		const field = 1 + (this.track.kind === "circuit" ? this.pack.rules.bots : 0);
		const make = (i, isPlayer) => ({
			id: isPlayer ? "you" : `bot-${i}`,
			name: isPlayer ? "You" : BOT_NAMES[i - 1] ?? `Bot ${i}`,
			isPlayer,
			color: isPlayer ? "#e7e1d4" : BOT_COLORS[(i - 1) % BOT_COLORS.length],
			x: 0,
			y: 0,
			z: 0,
			yaw: 0,
			pitch: 0,
			vx: 0,
			vz: 0,
			speed: 0,
			charge: 0,
			boost: 0,
			stun: 0,
			drifting: false,
			next: 0,
			laps: 0,
			finished: false,
			finishTime: 0,
			score: 0,
			progress: 0,
			place: i + 1,
			wrong: false,
			side: 0
		});
		const racers = [];
		for (let i = 0; i < field; i++) racers.push(make(i, i === 0));
		this.racers = racers;
		const player = racers[0];
		if (this.track.kind === "sweep") {
			racers.forEach((r, i) => {
				const a = i / field * Math.PI * 2;
				r.x = Math.cos(a) * 3.2;
				r.z = Math.sin(a) * 3.2;
				r.yaw = a + Math.PI / 2;
			});
			return player;
		}
		const frame = frameAt(this.track, this.track.spawn);
		racers.forEach((r, i) => {
			const side = (i - (field - 1) / 2) * Math.min(2.4, this.track.half * 1.35 / field);
			r.x = frame.x + frame.sx * side;
			r.z = frame.z + frame.sz * side;
			r.y = frame.y;
			r.yaw = frame.yaw;
			r.side = side;
		});
		return player;
	}
	seedSweep() {
		const rand = mulberry32(hashSlug(this.pack.slug));
		const arena = this.track.arena;
		this.beacons = [];
		for (let i = 0; i < 6; i++) this.beacons.push({
			x: (rand() * 2 - 1) * arena * .72,
			z: (rand() * 2 - 1) * arena * .72,
			alive: true,
			spin: rand() * Math.PI
		});
		this.hazards = [];
		for (let i = 0; i < 4; i++) this.hazards.push({
			x: 0,
			z: 0,
			angle: i / 4 * Math.PI * 2,
			orbit: 10 + i * 5.5,
			rate: .35 + i * .12
		});
	}
	tick(dt, input) {
		if (this.phase === "done") return;
		this.time += dt;
		if (this.messageT > 0) {
			this.messageT -= dt;
			if (this.messageT <= 0) this.message = "";
		}
		for (let i = 0; i < this.racers.length; i++) {
			const r = this.racers[i];
			if (r.finished && this.track.kind === "circuit") continue;
			const drive = r.isPlayer ? input : this.botDrive(r, i);
			if (r.stun > 0) r.stun = Math.max(0, r.stun - dt);
			const x0 = r.x;
			const z0 = r.z;
			this.integrate(r, drive, this.handlingFor(i), dt);
			let proj = null;
			if (this.track.kind === "sweep") this.constrainArena(r);
			else proj = this.constrainRoad(r, dt, i);
			if (this.track.kind === "circuit") this.progressCircuit(r, x0, z0);
			else if (this.track.kind === "haul") this.progressHaul(r, x0, z0);
			if (proj && r.isPlayer) r.wrong = r.vx * proj.tx + r.vz * proj.tz < -4;
			else r.wrong = false;
			if (r.isPlayer) this.tryRescue(r, drive.reset);
		}
		if (this.track.kind === "sweep") this.tickSweep(dt);
		this.rank();
		this.tickEnd();
	}
	handlingFor(index) {
		const base = this.pack.handling;
		if (index === 0) return base;
		const pace = this.pack.rules.botPace * (.9 + (index - 1) * .035);
		return {
			...base,
			maxSpeed: base.maxSpeed * pace,
			accel: base.accel * .92
		};
	}
	integrate(r, input, h, dt) {
		const fx = -Math.sin(r.yaw);
		const fz = -Math.cos(r.yaw);
		const rx = Math.cos(r.yaw);
		const rz = -Math.sin(r.yaw);
		let throttle = input.throttle;
		if (r.stun > 0) throttle = Math.min(0, throttle);
		const powered = throttle >= 0 ? h.accel : h.brake;
		const boostMul = r.boost > 0 ? h.boost : 1;
		r.vx += fx * throttle * powered * (throttle > 0 ? boostMul : 1) * dt;
		r.vz += fz * throttle * powered * (throttle > 0 ? boostMul : 1) * dt;
		const coast = Math.abs(throttle) < .05 ? .9 : 0;
		const keep = Math.max(0, 1 - (h.drag + coast) * dt);
		r.vx *= keep;
		r.vz *= keep;
		let fwd = r.vx * fx + r.vz * fz;
		let lat = r.vx * rx + r.vz * rz;
		const drifting = input.drift && fwd > 8 && Math.abs(input.steer) > .12;
		const grip = drifting ? h.driftGrip : h.grip;
		lat *= Math.exp(-grip * dt);
		const max = h.maxSpeed * (r.boost > 0 ? 1.12 : 1);
		fwd = clamp(fwd, -h.reverse, max);
		r.vx = fx * fwd + rx * lat;
		r.vz = fz * fwd + rz * lat;
		r.speed = fwd;
		const speedFactor = clamp(Math.abs(fwd) / (h.maxSpeed * .42), .22, 1);
		const reverse = fwd >= 0 ? 1 : -1;
		r.yaw += input.steer * h.turn * speedFactor * reverse * dt;
		if (drifting) {
			r.charge = Math.min(1, r.charge + dt * .72);
			r.drifting = true;
		} else if (r.drifting) {
			if (r.charge > .42 && fwd > 8) {
				r.boost = .5 + r.charge * .85;
				r.vx += fx * (6 + r.charge * 8);
				r.vz += fz * (6 + r.charge * 8);
				if (r.isPlayer) this.say("BOOST");
			}
			r.charge = 0;
			r.drifting = false;
		}
		if (r.boost > 0) r.boost = Math.max(0, r.boost - dt);
		r.x += r.vx * dt;
		r.z += r.vz * dt;
	}
	constrainArena(r) {
		const rad = Math.hypot(r.x, r.z);
		const limit = this.track.arena;
		if (rad > limit) {
			const k = (limit - .2) / rad;
			r.x *= k;
			r.z *= k;
			const nx = r.x / (limit || 1);
			const nz = r.z / (limit || 1);
			const outward = r.vx * nx + r.vz * nz;
			if (outward > 0) {
				r.vx -= nx * outward;
				r.vz -= nz * outward;
			}
		}
		r.y = 0;
		r.pitch = 0;
	}
	constrainRoad(r, dt, index) {
		const proj = projectPoint(r.x, r.z, this.track);
		const half = this.track.half;
		const h = this.handlingFor(index);
		if (Math.abs(proj.side) > half) {
			const sign = proj.side >= 0 ? 1 : -1;
			const latVel = r.vx * proj.sx + r.vz * proj.sz;
			const impact = latVel * sign;
			r.x = proj.px + proj.sx * sign * (half - .15);
			r.z = proj.pz + proj.sz * sign * (half - .15);
			if (impact > 0) {
				r.vx -= proj.sx * latVel;
				r.vz -= proj.sz * latVel;
				r.speed *= .82;
				if (r.isPlayer && this.track.kind === "haul" && impact > 8) {
					this.cargo = Math.max(0, this.cargo - impact * .45);
					this.say("CARGO");
				}
			}
		} else if (Math.abs(proj.side) > half * .78) {
			const keep = Math.max(0, 1 - h.offDrag * dt);
			r.vx *= keep;
			r.vz *= keep;
			r.speed *= keep;
		}
		const next = this.track.samples[(proj.seg + 1) % this.track.samples.length];
		const aheadY = next ? next.y : proj.y;
		r.y = proj.y;
		r.pitch = Math.atan2(aheadY - proj.y, 4);
		return proj;
	}
	progressCircuit(r, x0, z0) {
		const cps = this.track.checkpoints;
		if (cps.length === 0 || r.finished) return;
		const gate = cps[r.next];
		const sample = this.track.samples[gate];
		if (!sample) return;
		const frame = frameAt(this.track, gate);
		if (!crossedGate(x0, z0, r.x, r.z, sample, frame.tx, frame.tz, frame.sx, frame.sz, this.track.half)) return;
		r.next += 1;
		if (r.next >= cps.length) {
			r.laps += 1;
			r.next = 0;
			if (r.laps >= this.pack.rules.laps) {
				r.finished = true;
				r.finishTime = this.time;
				if (r.isPlayer) this.say("FINISH");
			} else if (r.isPlayer) this.say(`LAP ${r.laps + 1}`);
		} else if (r.isPlayer) this.say("GATE");
	}
	progressHaul(r, x0, z0) {
		if (!r.isPlayer || r.finished) return;
		const cps = this.track.checkpoints;
		if (r.next >= cps.length) return;
		const gate = cps[r.next];
		const sample = this.track.samples[gate];
		if (!sample) return;
		const frame = frameAt(this.track, gate);
		if (!crossedGate(x0, z0, r.x, r.z, sample, frame.tx, frame.tz, frame.sx, frame.sz, this.track.half)) return;
		r.next += 1;
		this.say(r.next >= cps.length ? "DROP" : "GATE");
		if (r.next >= cps.length) {
			r.finished = true;
			r.finishTime = this.time;
		}
	}
	tickSweep(dt) {
		const p = this.player;
		for (const b of this.beacons) {
			b.spin += dt * 2;
			if (!b.alive) continue;
			if (Math.hypot(b.x - p.x, b.z - p.z) < 2.35) {
				b.alive = false;
				p.score += 1;
				this.say(String(p.score));
				this.relocate(b);
				b.alive = true;
			}
		}
		for (const h of this.hazards) {
			h.angle += h.rate * dt * (h.orbit > 18 ? -1 : 1);
			h.x = Math.cos(h.angle) * h.orbit;
			h.z = Math.sin(h.angle) * h.orbit;
			if (p.stun <= 0 && Math.hypot(h.x - p.x, h.z - p.z) < 2.15) {
				p.stun = .45;
				p.vx *= .25;
				p.vz *= .25;
				p.speed *= .25;
				p.score = Math.max(0, p.score - 1);
				this.say("HIT");
			}
		}
	}
	relocate(b) {
		const rand = mulberry32((hashSlug(this.pack.slug) ^ Math.imul(this.player.score + 1, 997)) >>> 0);
		const arena = this.track.arena * .75;
		for (let n = 0; n < 8; n++) {
			const x = (rand() * 2 - 1) * arena;
			const z = (rand() * 2 - 1) * arena;
			if (Math.hypot(x - this.player.x, z - this.player.z) > 10) {
				b.x = x;
				b.z = z;
				return;
			}
		}
		b.x = -this.player.x * .8;
		b.z = -this.player.z * .8;
	}
	botDrive(r, index) {
		if (this.track.kind === "sweep") {
			const ang = this.time * .35 + index;
			return this.steerToward(r, Math.cos(ang) * 16, Math.sin(ang) * 16, false);
		}
		const pts = this.track.samples;
		const n = pts.length;
		if (!n) return ZERO;
		const proj = projectPoint(r.x, r.z, this.track);
		const target = pts[this.track.closed ? (proj.seg + 12) % n : Math.min(n - 1, proj.seg + 12)];
		let steerToward = this.steerToward(r, target.x, target.z, false);
		if (Math.abs(proj.side) > this.track.half * .62) {
			const back = proj.side > 0 ? 1 : -1;
			steerToward = {
				...steerToward,
				steer: clamp(steerToward.steer * .35 + back * .85, -1, 1),
				throttle: .65
			};
		}
		return steerToward;
	}
	steerToward(r, x, z, drift) {
		const diff = wrap(Math.atan2(-(x - r.x), -(z - r.z)) - r.yaw);
		const steer = clamp(diff / .5, -1, 1);
		return {
			throttle: Math.abs(diff) > .9 ? .45 : 1,
			steer,
			drift,
			reset: false
		};
	}
	tryRescue(r, reset) {
		if (reset && !this.resetHeld) {
			this.resetHeld = true;
			if (this.track.kind === "sweep") {
				r.x = 0;
				r.z = 0;
				r.vx = 0;
				r.vz = 0;
				r.speed = 0;
				r.stun = 0;
				return;
			}
			const cps = this.track.checkpoints;
			const passed = r.next === 0 ? cps.length - 1 : r.next - 1;
			const anchor = r.laps === 0 && r.next === 0 ? this.track.spawn : cps[passed] ?? this.track.spawn;
			const n = this.track.samples.length;
			const idx = this.track.closed ? (anchor + 4) % n : Math.min(n - 1, anchor + 2);
			const frame = frameAt(this.track, idx);
			r.x = frame.x;
			r.z = frame.z;
			r.y = frame.y;
			r.yaw = frame.yaw;
			r.vx = frame.tx * 8;
			r.vz = frame.tz * 8;
			r.speed = 8;
			r.stun = 0;
			r.charge = 0;
			this.say("RESCUE");
		} else if (!reset) this.resetHeld = false;
	}
	say(text) {
		this.message = text;
		this.messageT = text === "GATE" ? .45 : 1.15;
	}
	rank() {
		if (this.track.kind !== "circuit") {
			this.player.place = 1;
			return;
		}
		const cps = this.track.checkpoints;
		for (const r of this.racers) {
			const gate = cps[Math.min(r.next, cps.length - 1)] ?? 0;
			const s = this.track.samples[gate];
			const d = s ? Math.hypot(r.x - s.x, r.z - s.z) : 0;
			r.progress = r.laps * 100 + r.next * 10 - Math.min(d, 80) / 80;
		}
		[...this.racers].sort((a, b) => {
			if (a.finished && b.finished) return a.finishTime - b.finishTime;
			if (a.finished) return -1;
			if (b.finished) return 1;
			return b.progress - a.progress;
		}).forEach((r, i) => {
			r.place = i + 1;
		});
	}
	tickEnd() {
		const rules = this.pack.rules;
		if (this.track.kind === "circuit") {
			if (this.player.finished) {
				this.phase = "done";
				this.outcome = "finish";
			}
			return;
		}
		const remain = rules.seconds - this.time;
		if (this.track.kind === "sweep" && remain <= 0) {
			this.phase = "done";
			this.outcome = this.player.score >= rules.target ? "clear" : "short";
			return;
		}
		if (this.track.kind === "haul") {
			if (this.player.finished) {
				this.phase = "done";
				this.outcome = "delivered";
			} else if (this.cargo <= 0) {
				this.phase = "done";
				this.outcome = "lost";
			} else if (remain <= 0) {
				this.phase = "done";
				this.outcome = "late";
			}
		}
	}
	hud() {
		const p = this.player;
		const rules = this.pack.rules;
		const steps = this.track.checkpoints.length;
		return {
			phase: this.phase,
			outcome: this.outcome,
			kmh: Math.abs(p.speed) * 3.6,
			charge: p.charge,
			boost: p.boost > 0,
			lap: p.finished ? rules.laps : p.laps + 1,
			laps: rules.laps,
			place: p.place,
			field: this.racers.length,
			elapsed: p.finished ? p.finishTime : this.time,
			remain: Math.max(0, rules.seconds - this.time),
			score: p.score,
			target: rules.target,
			cargo: this.cargo,
			step: Math.min(p.next, steps),
			steps,
			wrong: p.wrong,
			message: this.message,
			kind: this.track.kind,
			title: this.pack.title,
			slug: this.pack.slug
		};
	}
};
var STEP = 1 / 60;
var Runtime = class {
	session;
	audio = new YardAudio();
	paused = false;
	view = null;
	raf = 0;
	acc = 0;
	dead = false;
	listeners = /* @__PURE__ */ new Set();
	lastMessage = "";
	attachSeq = 0;
	constructor(pack) {
		this.session = new Session(pack);
	}
	start() {
		bindKeyboard();
		this.audio.start();
		this.installProbe();
		let last = performance.now();
		const frame = (now) => {
			if (this.dead) return;
			const dt = Math.min(.05, (now - last) / 1e3);
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
	attach(canvas, mini) {
		const seq = ++this.attachSeq;
		import("./view-COTNwJ5k.mjs").then(({ GameView }) => {
			if (this.dead || seq !== this.attachSeq) return;
			this.view?.dispose();
			this.view = new GameView(canvas, mini, this.session);
		});
	}
	detach() {
		this.view?.dispose();
		this.view = null;
	}
	subscribe(listener) {
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
	installProbe() {
		const session = this.session;
		window.__controlsTest = {
			getYaw: () => session.player.yaw,
			getSpeed: () => session.player.speed,
			setSteer: (v) => setProbeSteer(v),
			setKeys: (codes) => setProbeKeys(codes)
		};
	}
};
var current = null;
function primeRun(pack) {
	current?.stop();
	current = new Runtime(pack);
	current.start();
	return current;
}
function getRuntime() {
	return current;
}
function stopRun() {
	current?.stop();
	current = null;
	delete window.__controlsTest;
}
var STARTERS = {
	"night-circuit": 0,
	"salt-sweep": 1,
	"ridge-haul": 2
};
function bootQueued() {
	const pack = BASES[STARTERS[window.__yardQueued || "night-circuit"] ?? 0];
	if (!pack) return;
	primeRun(clonePack(pack));
}
if (typeof window !== "undefined") {
	window.__yardBoot = () => {
		if (!getRuntime()) bootQueued();
	};
	if (window.__yardQueued) window.__yardBoot();
}
var EMPTY = {
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
	slug: ""
};
function GameScreen({ onExit }) {
	const canvasRef = (0, import_react.useRef)(null);
	const miniRef = (0, import_react.useRef)(null);
	const rtRef = (0, import_react.useRef)(null);
	const [snap, setSnap] = (0, import_react.useState)(EMPTY);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [forkOpen, setForkOpen] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [glFailed, setGlFailed] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(null);
	const unsub = (0, import_react.useRef)(null);
	const hudStamp = (0, import_react.useRef)(0);
	const hudPhase = (0, import_react.useRef)("live");
	const hudMessage = (0, import_react.useRef)("");
	function listen(run) {
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
	(0, import_react.useEffect)(() => {
		const rt = getRuntime();
		const canvas = canvasRef.current;
		if (!rt || !canvas) return;
		rtRef.current = rt;
		rt.attach(canvas, miniRef.current);
		if (rt.viewFailed()) setGlFailed(true);
		listen(rt);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
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
	function rematch(next) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 bg-ink text-bone",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "h-full w-full touch-none",
				"aria-label": "3D game view"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: miniRef,
				width: 192,
				height: 192,
				className: "mini-map pointer-events-none absolute top-24 right-3 z-10 h-24 w-24 border border-line"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "hud-top pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "chip pointer-events-auto min-w-0 flex-1 px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-xs text-sodium",
							children: snap.slug
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-extrabold leading-tight",
							children: snap.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-xs text-mist tabular-nums",
							children: lineFor(snap)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex shrink-0 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost px-3",
							"aria-label": muted ? "Unmute" : "Mute",
							onClick: () => {
								const audio = getRuntime()?.audio;
								if (!audio) return;
								audio.muted = !audio.muted;
								setMuted(audio.muted);
							},
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-ghost px-3",
							"aria-label": "Pause",
							onClick: () => {
								const run = getRuntime();
								if (!run) return;
								run.paused = !run.paused;
								setPaused(run.paused);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
								className: "size-4",
								"aria-hidden": "true"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn btn-primary px-3",
							onClick: () => setForkOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Fork"]
						})
					]
				})]
			}),
			snap.wrong ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "chip pointer-events-none absolute top-28 left-1/2 z-10 -translate-x-1/2 px-3 py-2 font-mono text-xs text-sodium",
				children: "Wrong way"
			}) : null,
			snap.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute top-36 left-1/2 z-10 -translate-x-1/2 font-display text-4xl font-extrabold text-sodium",
				children: snap.message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hud-speed pointer-events-none absolute bottom-4 left-3 z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-5xl leading-none font-semibold tabular-nums",
						children: Math.round(snap.kmh)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-mist",
						children: "km/h"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-2 w-36 bg-panel-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full origin-left bg-sodium",
							style: { transform: `scaleX(${Math.max(.02, snap.charge)})` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-mist",
						children: snap.boost ? "Boost" : "Drift"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "keys-hint chip pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 px-3 py-2 font-mono text-xs text-mist sm:block",
				children: "W gas · A left · D right · Space drift · R rescue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "touch-dock",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hold, {
						label: "Left",
						className: "",
						onHold: (v) => touch.left = v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hold, {
						label: "Gas",
						className: "gas btn-primary",
						primary: true,
						onHold: (v) => touch.gas = v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hold, {
						label: "Drift",
						className: "",
						onHold: (v) => touch.drift = v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hold, {
						label: "Right",
						className: "",
						onHold: (v) => touch.right = v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hold, {
						label: "Brake",
						className: "",
						onHold: (v) => touch.brake = v
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost",
						onClick: () => {
							const run = getRuntime();
							if (!run) return;
							run.session.tick(1 / 60, {
								throttle: 0,
								steer: 0,
								drift: false,
								reset: true
							});
						},
						children: "Rescue"
					})
				]
			}),
			glFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "chip absolute bottom-28 left-3 z-10 px-3 py-2 text-sm",
				role: "alert",
				children: "This browser couldn't start WebGL."
			}) : null,
			paused && snap.phase !== "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrim absolute inset-0 z-40 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "chip w-full max-w-sm p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-extrabold",
						children: "Paused"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-primary",
								onClick: () => {
									const run = getRuntime();
									if (!run) return;
									run.paused = false;
									setPaused(false);
								},
								children: "Resume"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => setForkOpen(true),
								children: "Fork"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: onExit,
								children: "Back to yard"
							})
						]
					})]
				})
			}) : null,
			snap.phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrim absolute inset-0 z-40 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "chip w-full max-w-sm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-sodium",
							children: snap.slug
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl font-extrabold",
							children: resultTitle(snap)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-lg tabular-nums text-mist",
							children: resultDetail(snap)
						}),
						saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-mist",
							children: saved
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-primary",
									onClick: () => rematch(),
									children: "Rematch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-ghost",
									onClick: () => {
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
									},
									children: "Save fork"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn btn-ghost",
									onClick: onExit,
									children: "Back to yard"
								})
							]
						})
					]
				})
			}) : null,
			forkOpen && pack && rt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForkSheet, {
				pack,
				origin: rt.session.origin,
				onClose: () => setForkOpen(false),
				onRematch: () => {
					setForkOpen(false);
					rematch(pack);
				}
			}) : null
		]
	});
}
function Hold({ label, className, primary, onHold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: `btn ${primary ? "btn-primary" : "btn-ghost"} ${className}`,
		style: { touchAction: "none" },
		onContextMenu: (e) => e.preventDefault(),
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			onHold(true);
		},
		onPointerUp: () => onHold(false),
		onPointerCancel: () => onHold(false),
		onLostPointerCapture: () => onHold(false),
		children: label
	});
}
function lineFor(snap) {
	if (snap.kind === "circuit") return `Lap ${snap.lap}/${snap.laps} · P${snap.place}/${snap.field} · ${clock(snap.elapsed)}`;
	if (snap.kind === "sweep") return `${snap.score}/${snap.target} beacons · ${clock(snap.remain)}`;
	return `Gate ${snap.step}/${snap.steps} · cargo ${Math.round(snap.cargo)} · ${clock(snap.remain)}`;
}
function resultTitle(snap) {
	switch (snap.outcome) {
		case "finish": return `P${snap.place}`;
		case "clear": return "Clear";
		case "short": return "Short";
		case "delivered": return "Delivered";
		case "lost": return "Cargo gone";
		case "late": return "Late";
		default: return "Done";
	}
}
function resultDetail(snap) {
	if (snap.outcome === "finish") return clock(snap.elapsed);
	if (snap.outcome === "clear" || snap.outcome === "short") return `${snap.score} / ${snap.target} beacons`;
	if (snap.outcome === "delivered" || snap.outcome === "lost") return `${Math.round(snap.cargo)}% cargo left`;
	if (snap.outcome === "late") return `${snap.step} / ${snap.steps} gates`;
	return snap.title;
}
function clock(seconds) {
	const s = Math.max(0, seconds);
	const m = Math.floor(s / 60);
	return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
}
function YardHome({ forks, onStart }) {
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [raw, setRaw] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [pulling, setPulling] = (0, import_react.useState)(false);
	const featured = BASES[0];
	async function copyPack(pack) {
		const text = packJson(pack);
		try {
			await navigator.clipboard.writeText(text);
			setNotice(`Copied ${pack.slug}`);
			setError(null);
		} catch {
			setRaw(text);
			setNotice("Clipboard blocked. The pack is in the box below.");
		}
	}
	async function pullLink() {
		setPulling(true);
		setError(null);
		try {
			onStart(await pullPack(url));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't pull that pack.");
		} finally {
			setPulling(false);
		}
	}
	function pullText() {
		setError(null);
		try {
			const pack = JSON.parse(raw);
			if (!pack || typeof pack !== "object") throw new Error("That text isn't a pack.");
			onStart(clonePack(pack));
		} catch (err) {
			setError(err instanceof Error ? err.message : "That text isn't a pack.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh max-w-5xl px-4 py-6 sm:px-6 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid gap-6 border-b border-line pb-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-sodium uppercase",
						children: "Chrome · home screen"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl font-extrabold tracking-tight text-bone sm:text-6xl",
						children: "Yard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-base text-mist",
						children: "Pull a full 3D game, drive it, then fork the grip, the clock, and the body into your own pack. Packs are the repo. The race is already built."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-start gap-3 text-sm text-mist",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
						className: "mt-0.5 size-5 shrink-0 text-sodium",
						"aria-hidden": "true"
					}), "In Chrome, use the browser menu and install Yard. It opens fullscreen from your home screen, phone or desktop."]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 border border-line bg-panel p-4 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs text-sodium",
								children: featured.slug
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-3xl font-extrabold",
								children: featured.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-lg text-sm text-mist",
								children: featured.summary
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackGlyph, { kind: featured.kind })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-primary sm:min-w-40",
							"data-yard-start": "night-circuit",
							onClick: () => onStart(featured),
							children: "Start"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: () => copyPack(featured),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Copy pack"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-xs text-mist",
						children: "3 laps · drift boost · rivals on the grid · touch or keys"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-xs tracking-widest text-mist uppercase",
					children: "Bases"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line border-y border-line",
					children: BASES.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-sodium",
									children: pack.slug
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl font-bold",
									children: pack.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-mist",
									children: [
										KIND_LABEL[pack.kind],
										" · ",
										pack.summary
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => onStart(pack),
								children: "Pull"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => copyPack(pack),
								"aria-label": `Copy ${pack.title} pack`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})]
						})]
					}, pack.slug))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-xs tracking-widest text-mist uppercase",
					children: "On this phone"
				}), forks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-mist",
					children: "No forks yet. Start a base, open Fork, and save."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line border-y border-line",
					children: forks.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs text-sodium",
									children: pack.slug
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-bold",
									children: pack.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-mist",
									children: pack.forkedFrom ? `from ${pack.forkedFrom}` : KIND_LABEL[pack.kind]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								onClick: () => onStart(pack),
								children: "Pull"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn btn-ghost",
								"aria-label": `Delete ${pack.title}`,
								onClick: () => deleteFork(pack.slug),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})]
						})]
					}, pack.slug))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-8 border border-line bg-panel-2 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-display text-lg font-bold",
						children: "Pull a pack"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mist",
						children: "A pack is the whole game as JSON: base, handling, paint. Paste one, or give an https link to a raw .json file. Arbitrary game repos do not boot in a phone browser. This format does."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm text-mist",
						htmlFor: "pack-url",
						children: "Pack link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "pack-url",
							className: "field",
							value: url,
							placeholder: "https://…/my-game.json",
							onChange: (e) => setUrl(e.target.value),
							inputMode: "url",
							autoCapitalize: "off",
							autoCorrect: "off",
							spellCheck: false
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-primary",
							disabled: pulling || !url.trim(),
							onClick: pullLink,
							children: pulling ? "Pulling" : "Pull link"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm text-mist",
						htmlFor: "pack-json",
						children: "Pack JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "pack-json",
						className: "field mt-1 min-h-36",
						value: raw,
						onChange: (e) => setRaw(e.target.value),
						spellCheck: false,
						placeholder: "{\"format\":\"yard-pack\",\"version\":1,…}"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-ghost mt-2",
						disabled: !raw.trim(),
						onClick: pullText,
						children: "Pull JSON"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-sodium",
				role: "alert",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-mist",
				children: notice
			}) : null
		]
	});
}
function TrackGlyph({ kind }) {
	const d = (0, import_react.useMemo)(() => glyphPath(kind), [kind]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 160 96",
		className: "h-24 w-40 shrink-0 text-sodium",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "160",
			height: "96",
			className: "fill-ink"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "3"
		})]
	});
}
function glyphPath(kind) {
	const track = buildTrack(kind);
	if (kind === "sweep") return "M80 18 a30 30 0 1 0 0.1 0";
	const pts = track.samples;
	let minX = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxZ = -Infinity;
	for (const p of pts) {
		minX = Math.min(minX, p.x);
		minZ = Math.min(minZ, p.z);
		maxX = Math.max(maxX, p.x);
		maxZ = Math.max(maxZ, p.z);
	}
	const span = Math.max(maxX - minX, maxZ - minZ) || 1;
	return `M${pts.map((p) => {
		const x = (p.x - minX) / span * 136 + 12;
		const y = (p.z - minZ) / span * 72 + 12;
		return `${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(" L")}${track.closed ? " Z" : ""}`;
}
var NO_FORKS = [];
function YardApp() {
	const forks = (0, import_react.useSyncExternalStore)(subscribeForks, readForks, () => NO_FORKS);
	const [screen, setScreen] = (0, import_react.useState)("yard");
	const [run, setRun] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (getRuntime()) {
			setRun((n) => n + 1);
			setScreen("play");
		}
	}, []);
	function start(pack) {
		let next = pack;
		try {
			next = parsePack(packJson(pack));
		} catch (err) {
			setError(err instanceof Error ? err.message : "That pack is invalid.");
			return;
		}
		setError(null);
		primeRun(clonePack(next));
		setRun((n) => n + 1);
		setScreen("play");
	}
	if (screen === "play") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameScreen, { onExit: () => {
		stopRun();
		setScreen("yard");
	} }, run);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YardHome, {
		forks,
		onStart: start
	}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mx-auto max-w-5xl px-4 pb-8 text-sm text-sodium",
		role: "alert",
		children: error
	}) : null] });
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => SplitComponent });
var SplitComponent = YardApp;
//#endregion
export { LOOKS as i, frameAt as n, getSteerVisual as r, routes_exports as t };
