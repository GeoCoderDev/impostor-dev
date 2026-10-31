"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  MIN_PLAYERS,
  createRound,
  maxImpostors,
  resolveVote,
  type Round,
  type Settings,
} from "@/lib/game";
import {
  hasSeenHelp,
  loadCustomPacks,
  loadSettings,
  markHelpSeen,
  saveCustomPacks,
  saveSettings,
} from "@/lib/storage";
import { BUILTIN_PACKS, mixPack, type Pack } from "@/lib/words";
import DiscussScreen from "./DiscussScreen";
import EndScreen from "./EndScreen";
import HelpModal from "./HelpModal";
import RevealScreen from "./RevealScreen";
import SetupScreen from "./SetupScreen";
import VoteScreen from "./VoteScreen";

type Phase = "setup" | "reveal" | "discuss" | "vote" | "verdict" | "end";

type Verdict = { expelled: number; wasImpostor: boolean };
type Ending = { winner: "group" | "impostors"; reason: string; canGuess: boolean };

export default function Game() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customPacks, setCustomPacks] = useState<Pack[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);

  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<Round | null>(null);
  const [debateNo, setDebateNo] = useState(1);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);

  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  // Carga de datos guardados (solo en el cliente, para evitar desajustes de hidratación).
  useEffect(() => {
    setSettings(loadSettings());
    setCustomPacks(loadCustomPacks());
    if (!hasSeenHelp()) {
      setHelpOpen(true);
      markHelpSeen();
    }
    setReady(true);

    fetch("/api/words")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d) => setAiEnabled(Boolean(d?.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  useEffect(() => {
    if (ready) saveSettings(settings);
  }, [settings, ready]);

  const packs = useMemo<Pack[]>(() => {
    const base = [...BUILTIN_PACKS, ...customPacks];
    return [...base, mixPack(base)];
  }, [customPacks]);

  const addPack = useCallback((p: Pack) => {
    setCustomPacks((prev) => {
      const next = [...prev, p].slice(-8); // máximo 8 packs propios
      saveCustomPacks(next);
      return next;
    });
  }, []);

  const removePack = useCallback((id: string) => {
    setCustomPacks((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveCustomPacks(next);
      return next;
    });
    setSettings((s) => (s.packId === id ? { ...s, packId: BUILTIN_PACKS[0].id } : s));
  }, []);

  function startRound() {
    const pack = packs.find((p) => p.id === settings.packId) ?? packs[0];
    const fixed: Settings = {
      ...settings,
      impostors: Math.min(settings.impostors, maxImpostors(settings.players.length)),
    };
    setRound(createRound(fixed, pack));
    setDebateNo(1);
    setVerdict(null);
    setEnding(null);
    setConfirmExit(false);
    setPhase("reveal");
  }

  function onVoteConfirm(target: number | null) {
    if (!round) return;
    const out = resolveVote(round, target);
    setRound({ ...round, alive: out.alive });

    if (out.kind === "continue") {
      setVerdict({ expelled: out.expelled, wasImpostor: out.wasImpostor });
      setPhase("verdict");
      return;
    }
    // Última oportunidad: solo si los inocentes ganaron atrapando a un impostor.
    const canGuess = out.winner === "group" && round.impostors.length > 0 && target !== null;
    setEnding({ winner: out.winner, reason: out.reason, canGuess });
    setPhase("end");
  }

  function onGuess(correct: boolean) {
    setEnding((e) =>
      e
        ? correct
          ? {
              winner: "impostors",
              reason: "El impostor atrapado adivinó la palabra y le roba la victoria al grupo.",
              canGuess: false,
            }
          : { ...e, canGuess: false }
        : e,
    );
  }

  const inGame = phase !== "setup";
  const playersOk = settings.players.length >= MIN_PLAYERS;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            🕵️ El <span className="text-violet-400">Impostor</span>
          </h1>
          {!inGame && <p className="text-xs text-zinc-500">Un celular, una palabra, un mentiroso (o ninguno).</p>}
        </div>
        <div className="flex items-center gap-2">
          {inGame &&
            (confirmExit ? (
              <>
                <button
                  className="chip !border-rose-400 !text-rose-200"
                  onClick={() => {
                    setConfirmExit(false);
                    setPhase("setup");
                  }}
                >
                  Sí, salir
                </button>
                <button className="chip" onClick={() => setConfirmExit(false)}>
                  No
                </button>
              </>
            ) : (
              phase !== "end" && (
                <button className="chip" onClick={() => setConfirmExit(true)} aria-label="Terminar partida">
                  Terminar
                </button>
              )
            ))}
          <button className="chip !px-4" onClick={() => setHelpOpen(true)} aria-label="Ayuda: cómo se juega">
            ? Ayuda
          </button>
        </div>
      </header>

      {!ready ? null : (
        <>
          {phase === "setup" && (
            <SetupScreen
              settings={settings}
              onChange={setSettings}
              packs={packs}
              aiEnabled={aiEnabled}
              onAddPack={addPack}
              onRemovePack={removePack}
              onStart={playersOk ? startRound : () => undefined}
            />
          )}

          {phase === "reveal" && round && (
            <RevealScreen round={round} showHint={settings.hint} onDone={() => setPhase("discuss")} />
          )}

          {phase === "discuss" && round && (
            <DiscussScreen
              key={debateNo}
              round={round}
              timer={settings.timer}
              roundNumber={debateNo}
              onVote={() => setPhase("vote")}
            />
          )}

          {phase === "vote" && round && (
            <VoteScreen round={round} onConfirm={onVoteConfirm} onBack={() => setPhase("discuss")} />
          )}

          {phase === "verdict" && round && verdict && (
            <div className="pop space-y-5">
              <div
                className={`card py-8 text-center ${
                  verdict.wasImpostor ? "!border-emerald-500/50 !bg-emerald-950/30" : "!border-amber-400/50 !bg-amber-950/20"
                }`}
              >
                <p className="text-5xl">{verdict.wasImpostor ? "🎯" : "😬"}</p>
                <p className="mt-2 text-2xl font-black">
                  {round.names[verdict.expelled]} {verdict.wasImpostor ? "era IMPOSTOR" : "era INOCENTE"}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {verdict.wasImpostor
                    ? "¡Bien! Pero todavía queda al menos un impostor entre ustedes."
                    : "Ups. El impostor sigue entre ustedes. Otra ronda de pistas y debate."}
                </p>
              </div>
              <button
                className="btn-primary text-lg"
                onClick={() => {
                  // El siguiente en hablar debe seguir en juego: lo resuelve DiscussScreen con `alive`.
                  setDebateNo((n) => n + 1);
                  setPhase("discuss");
                }}
              >
                Seguir jugando
              </button>
            </div>
          )}

          {phase === "end" && round && ending && (
            <EndScreen
              round={round}
              winner={ending.winner}
              reason={ending.reason}
              canGuess={ending.canGuess}
              onGuess={onGuess}
              onAgain={startRound}
              onSetup={() => setPhase("setup")}
            />
          )}
        </>
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </main>
  );
}
