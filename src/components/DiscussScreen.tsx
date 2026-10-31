"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTime, type Round } from "@/lib/game";

type Props = {
  round: Round;
  timer: number; // segundos, 0 = sin temporizador
  roundNumber: number;
  onVote: () => void;
};

export default function DiscussScreen({ round, timer, roundNumber, onVote }: Props) {
  const [left, setLeft] = useState(timer);
  const [running, setRunning] = useState(false);

  // Orden de participación: desde el que empieza, solo jugadores que siguen en la partida.
  const speakers = useMemo(() => {
    const n = round.names.length;
    const list: number[] = [];
    for (let k = 0; k < n; k++) {
      const i = (round.starter + k) % n;
      if (round.alive[i]) list.push(i);
    }
    return list;
  }, [round]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRunning(false);
          try {
            navigator.vibrate?.([300, 150, 300]);
          } catch {
            /* sin vibración */
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const over = timer > 0 && left === 0;
  const low = timer > 0 && left > 0 && left <= 10 && running;

  return (
    <div className="pop space-y-5">
      <div className="card text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          {roundNumber > 1 ? `Ronda de debate ${roundNumber}` : "Ronda de pistas"}
        </p>
        <p className="mt-2 text-sm text-zinc-300">Empieza</p>
        <p className="break-words text-3xl font-black text-violet-300">{round.names[speakers[0]]}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Cada uno dice una palabra o frase corta sobre la palabra secreta, en este orden:
        </p>
        <ol className="mt-3 flex flex-wrap justify-center gap-2">
          {speakers.map((i, k) => (
            <li key={i} className="chip">
              <span className="text-zinc-500">{k + 1}.</span> {round.names[i]}
            </li>
          ))}
        </ol>
      </div>

      {timer > 0 && (
        <div className="card text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400">⏱️ Tiempo de debate</p>
          <p
            className={`my-2 text-7xl font-black tabular-nums ${over ? "text-rose-400" : low ? "timer-low" : ""}`}
            aria-live="off"
          >
            {formatTime(left)}
          </p>
          {over && <p className="mb-2 font-bold text-rose-300">¡Se acabó el tiempo! Hora de votar.</p>}
          <div className="flex gap-2">
            {!over && (
              <button className="btn-secondary" onClick={() => setRunning((r) => !r)}>
                {running ? "⏸️ Pausar" : left === timer ? "▶️ Iniciar" : "▶️ Continuar"}
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => {
                setRunning(false);
                setLeft(timer);
              }}
            >
              ↺ Reiniciar
            </button>
          </div>
        </div>
      )}

      <button className="btn-primary text-lg" onClick={onVote}>
        🗳️ Ir a votar
      </button>
    </div>
  );
}
