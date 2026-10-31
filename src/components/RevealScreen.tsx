"use client";

import { useState } from "react";
import type { Round } from "@/lib/game";

type Props = {
  round: Round;
  showHint: boolean;
  onDone: () => void;
};

/** Reparto secreto: el celular pasa de mano en mano y cada quien toca para ver su rol. */
export default function RevealScreen({ round, showHint, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);

  const playerIdx = round.order[step];
  const name = round.names[playerIdx];
  const isImpostor = round.impostors.includes(playerIdx);
  const isLast = step === round.order.length - 1;

  function next() {
    setShown(false);
    if (isLast) onDone();
    else setStep(step + 1);
  }

  return (
    <div className="pop space-y-5" key={step}>
      <p className="text-center text-sm text-zinc-400">
        Carta {step + 1} de {round.order.length}
      </p>

      {!shown ? (
        <>
          <div className="card py-10 text-center">
            <p className="text-sm uppercase tracking-widest text-zinc-400">Pásale el celular a</p>
            <p className="mt-2 break-words text-4xl font-black text-violet-300">{name}</p>
            <p className="mt-4 text-sm text-zinc-500">Que nadie más mire la pantalla 👀</p>
          </div>
          <button className="btn-primary text-lg" onClick={() => setShown(true)}>
            Soy {name}: ver mi rol
          </button>
        </>
      ) : (
        <>
          <div
            className={`card py-10 text-center ${
              isImpostor ? "!border-rose-500/60 !bg-rose-950/40" : "!border-emerald-500/50 !bg-emerald-950/30"
            }`}
          >
            <p className="text-sm uppercase tracking-widest text-zinc-400">{name}, tu rol es</p>
            {isImpostor ? (
              <>
                <p className="mt-3 text-5xl">🕵️</p>
                <p className="mt-2 text-4xl font-black text-rose-400">IMPOSTOR</p>
                <p className="mt-3 text-sm text-zinc-300">
                  No conoces la palabra. Escucha y disimula.
                </p>
                {showHint && (
                  <p className="mt-4 inline-block rounded-full bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-200">
                    💡 Pista: {round.hint}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-zinc-300">La palabra secreta es</p>
                <p className="mt-2 break-words text-4xl font-black text-emerald-300">{round.word}</p>
                <p className="mt-3 text-sm text-zinc-400">Da pistas sin decirla.</p>
              </>
            )}
          </div>
          <button className="btn-secondary text-lg" onClick={next}>
            {isLast ? "Ocultar y empezar el debate" : "Ocultar y pasar el celular"}
          </button>
        </>
      )}
    </div>
  );
}
