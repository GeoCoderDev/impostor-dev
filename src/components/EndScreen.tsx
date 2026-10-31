"use client";

import type { Round } from "@/lib/game";

type Props = {
  round: Round;
  winner: "group" | "impostors";
  reason: string;
  /** Mostrar el botón de "última oportunidad" del impostor atrapado. */
  canGuess: boolean;
  onGuess: (correct: boolean) => void;
  onAgain: () => void;
  onSetup: () => void;
};

export default function EndScreen({ round, winner, reason, canGuess, onGuess, onAgain, onSetup }: Props) {
  const group = winner === "group";
  const total = round.impostors.length;

  return (
    <div className="pop space-y-5">
      <div
        className={`card py-8 text-center ${
          group ? "!border-emerald-500/50 !bg-emerald-950/30" : "!border-rose-500/60 !bg-rose-950/40"
        }`}
      >
        <p className="text-5xl">{group ? "🎉" : "😈"}</p>
        <p className={`mt-2 text-3xl font-black ${group ? "text-emerald-300" : "text-rose-300"}`}>
          {group
            ? "¡Ganan los inocentes!"
            : total === 0
              ? "¡Gana la paranoia!"
              : total === 1
                ? "¡Gana el impostor!"
                : "¡Ganan los impostores!"}
        </p>
        <p className="mt-2 text-sm text-zinc-300">{reason}</p>
      </div>

      {canGuess && (
        <div className="card border-amber-400/50 text-center">
          <p className="font-bold text-amber-200">🎯 Última oportunidad</p>
          <p className="mt-1 text-sm text-zinc-300">
            El impostor atrapado puede intentar adivinar la palabra en voz alta. Si acierta, ¡gana igual!
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary" onClick={() => onGuess(true)}>
              ✅ La adivinó
            </button>
            <button className="btn-secondary" onClick={() => onGuess(false)}>
              ❌ No la adivinó
            </button>
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <div>
          <span className="label">La palabra era</span>
          <p className="text-2xl font-black text-violet-300">{round.word}</p>
          <p className="text-xs text-zinc-500">Categoría: {round.packName}</p>
        </div>
        <div>
          <span className="label">{total === 0 ? "Impostores" : total === 1 ? "El impostor era" : "Los impostores eran"}</span>
          {total === 0 ? (
            <p className="font-bold text-amber-300">
              Nadie. {round.surprise ? "El modo sorpresa sacó 0 impostores." : "Esta ronda no tenía impostores."}
            </p>
          ) : (
            <p className="text-xl font-black text-rose-300">
              {round.impostors.map((i) => round.names[i]).join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button className="btn-primary text-lg" onClick={onAgain}>
          🔁 Jugar otra ronda
        </button>
        <button className="btn-secondary" onClick={onSetup}>
          ⚙️ Cambiar configuración
        </button>
      </div>
    </div>
  );
}
