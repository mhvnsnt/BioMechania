import { useEffect, useState, useSyncExternalStore } from "react";
import { GameScreen } from "@/components/game-screen";
import { YardHome } from "@/components/yard-home";
import { clonePack, parsePack, packJson, type GamePack } from "@/yard/packs";
import { primeRun, stopRun, getRuntime } from "@/yard/runtime";
import { readForks, subscribeForks } from "@/yard/storage";

const NO_FORKS: GamePack[] = [];

export function YardApp() {
  const forks = useSyncExternalStore(subscribeForks, readForks, () => NO_FORKS);
  const [screen, setScreen] = useState<"yard" | "play">("yard");
  const [run, setRun] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getRuntime()) {
      setRun((n) => n + 1);
      setScreen("play");
    }
  }, []);

  function start(pack: GamePack) {
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

  if (screen === "play") {
    return (
      <GameScreen
        key={run}
        onExit={() => {
          stopRun();
          setScreen("yard");
        }}
      />
    );
  }

  return (
    <>
      <YardHome forks={forks} onStart={start} />
      {error ? (
        <p className="mx-auto max-w-5xl px-4 pb-8 text-sm text-sodium" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
