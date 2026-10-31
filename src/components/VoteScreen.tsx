"use client";

import { useState } from "react";
import type { Round } from "@/lib/game";

type Props = {
  round: Round;
  onConfirm: (target: number | null) => void;
  onBack: () => void;
};

const NONE = -1;

export default function VoteScreen({ round, onConfirm, onBack }: Props) {
  const [sel, setSel] = useState<number | undefined>(undefined);

  const candidates = round.names.map((name, i) => ({ name, i })).filter((c) => round.alive[c.i]);

  return (
    <div className="pop space-y-5">
      <div className="card text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Votación</p>
        <p className="mt-2 text-lg font-bold">Voten todos a la vez señalando a alguien</p>
        <p className="mt-1 text-sm text-zinc-400">Toca a la persona con más votos.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {candidates.map((c) => (
          <li key={c.i}>
            <button
              className={`w-full break-words rounded-2xl border px-3 py-5 text-lg font-bold transition active:scale-95 ${
                sel === c.i
                  ? "border-rose-400 bg-rose-500/25 text-white"
                  : "border-[var(--line)] bg-[var(--card-2)] text-zinc-100"
              }`}
              onClick={() => setSel(c.i)}
              aria-pressed={sel === c.i}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>

      <button
        className={`w-full rounded-2xl border px-4 py-4 font-bold transition active:scale-[0.98] ${
          sel === NONE
            ? "border-amber-400 bg-amber-500/20 text-white"
            : "border-dashed border-[var(--line)] text-zinc-300"
        }`}
        onClick={() => setSel(NONE)}
        aria-pressed={sel === NONE}
      >
        🤷 Creo que no hay impostor
      </button>

      <div className="space-y-2">
        <button
          className="btn-danger text-lg"
          disabled={sel === undefined}
          onClick={() => sel !== undefined && onConfirm(sel === NONE ? null : sel)}
        >
          {sel === undefined
            ? "Elige una opción"
            : sel === NONE
              ? "Confirmar: no hay impostor"
              : `Expulsar a ${round.names[sel]}`}
        </button>
        <button className="btn-secondary" onClick={onBack}>
          ← Seguir debatiendo
        </button>
      </div>
    </div>
  );
}
