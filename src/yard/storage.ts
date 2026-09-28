import { packSchema, type GamePack } from "./packs";

const KEY = "yard.forks.v1";
const EMPTY: GamePack[] = [];

let cacheRaw: string | null = null;
let cacheList: GamePack[] = EMPTY;

export function readForks(): GamePack[] {
  if (typeof localStorage === "undefined") return EMPTY;
  const raw = localStorage.getItem(KEY) ?? "";
  if (raw === cacheRaw) return cacheList;
  cacheRaw = raw;
  if (!raw) {
    cacheList = EMPTY;
    return cacheList;
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) {
      cacheList = EMPTY;
      return cacheList;
    }
    const next: GamePack[] = [];
    for (const item of data) {
      const parsed = packSchema.safeParse(item);
      if (parsed.success) next.push(parsed.data);
    }
    cacheList = next;
  } catch {
    cacheList = EMPTY;
  }
  return cacheList;
}

function write(list: GamePack[]) {
  cacheList = list;
  cacheRaw = JSON.stringify(list);
  localStorage.setItem(KEY, cacheRaw);
  window.dispatchEvent(new Event("yard-forks"));
}

export function saveFork(pack: GamePack) {
  const rest = readForks().filter((f) => f.slug !== pack.slug);
  write([pack, ...rest]);
}

export function deleteFork(slug: string) {
  write(readForks().filter((f) => f.slug !== slug));
}

export function subscribeForks(cb: () => void) {
  const on = () => cb();
  window.addEventListener("yard-forks", on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener("yard-forks", on);
    window.removeEventListener("storage", on);
  };
}
