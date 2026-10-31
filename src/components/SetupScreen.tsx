"use client";

import { useState } from "react";
import { MAX_PLAYERS, MIN_PLAYERS, maxImpostors, type Settings } from "@/lib/game";
import type { Pack } from "@/lib/words";

type Props = {
  settings: Settings;
  onChange: (s: Settings) => void;
  packs: Pack[];
  aiEnabled: boolean;
  onAddPack: (p: Pack) => void;
  onRemovePack: (id: string) => void;
  onStart: () => void;
};

const TIMERS = [
  { label: "Sin tiempo", value: 0 },
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export default function SetupScreen({
  settings,
  onChange,
  packs,
  aiEnabled,
  onAddPack,
  onRemovePack,
  onStart,
}: Props) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const n = settings.players.length;
  const max = maxImpostors(n);
  const impostors = Math.min(settings.impostors, max);
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  const setPlayer = (i: number, v: string) =>
    set({ players: settings.players.map((p, idx) => (idx === i ? v.slice(0, 20) : p)) });
  const addPlayer = () => n < MAX_PLAYERS && set({ players: [...settings.players, ""] });
  const removePlayer = (i: number) =>
    n > MIN_PLAYERS && set({ players: settings.players.filter((_, idx) => idx !== i) });

  const selectedPack = packs.find((p) => p.id === settings.packId);

  async function generate() {
    if (loading) return;
    setAiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: 25 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo generar el pack.");
      const pack: Pack = {
        id: `ai-${Date.now()}`,
        name: data.name,
        emoji: data.emoji,
        entries: data.entries,
        custom: true,
      };
      onAddPack(pack);
      set({ packId: pack.id });
      setTopic("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const impostorNote = settings.surprise
    ? "Modo sorpresa: la cantidad se sortea (puede salir 0) y nadie la sabe."
    : impostors === 0
      ? "Nadie es impostor: todos ven la palabra. ¡Que cunda la paranoia!"
      : impostors === 1
        ? "Un solo impostor entre ustedes."
        : `${impostors} impostores trabajando en equipo (¡pero no se conocen entre sí!).`;

  return (
    <div className="space-y-5 pop">
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <span className="label !mb-0">Jugadores ({n})</span>
          <span className="text-xs text-zinc-500">mín. {MIN_PLAYERS} · máx. {MAX_PLAYERS}</span>
        </div>
        <ul className="space-y-2">
          {settings.players.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                className="input"
                value={p}
                placeholder={`Jugador ${i + 1}`}
                maxLength={20}
                onChange={(e) => setPlayer(i, e.target.value)}
                aria-label={`Nombre del jugador ${i + 1}`}
              />
              <button
                className="chip !px-3 !py-3 disabled:opacity-30"
                onClick={() => removePlayer(i)}
                disabled={n <= MIN_PLAYERS}
                aria-label={`Quitar jugador ${i + 1}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button className="btn-secondary mt-3" onClick={addPlayer} disabled={n >= MAX_PLAYERS}>
          + Agregar jugador
        </button>
      </section>

      <section className="card">
        <span className="label">Categoría</span>
        <div className="flex flex-wrap gap-2">
          {packs.map((p) => (
            <button
              key={p.id}
              onClick={() => set({ packId: p.id })}
              className={`chip ${settings.packId === p.id ? "chip-on" : ""}`}
              aria-pressed={settings.packId === p.id}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
        {selectedPack?.custom && (
          <button
            className="mt-3 text-xs text-rose-300 underline underline-offset-2"
            onClick={() => onRemovePack(selectedPack.id)}
          >
            Eliminar el pack «{selectedPack.name}»
          </button>
        )}

        {aiEnabled && (
          <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3">
            <span className="label">✨ Crear categoría con IA</span>
            <div className="flex gap-2">
              <input
                className="input"
                value={topic}
                maxLength={80}
                placeholder="Ej: Cosas de la playa"
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && topic.trim().length >= 2 && generate()}
              />
              <button
                className="btn-primary btn-sm shrink-0"
                onClick={generate}
                disabled={loading || topic.trim().length < 2}
              >
                {loading ? "…" : "Crear"}
              </button>
            </div>
            {aiError && <p className="mt-2 text-sm text-rose-300">{aiError}</p>}
          </div>
        )}
      </section>

      <section className="card space-y-4">
        <div>
          <span className="label">Impostores</span>
          <div className="flex items-center gap-3">
            <button
              className="chip !px-5 !py-3 text-lg disabled:opacity-30"
              disabled={settings.surprise || impostors <= 0}
              onClick={() => set({ impostors: impostors - 1 })}
              aria-label="Menos impostores"
            >
              −
            </button>
            <div className="flex-1 text-center text-4xl font-black tabular-nums">
              {settings.surprise ? "?" : impostors}
            </div>
            <button
              className="chip !px-5 !py-3 text-lg disabled:opacity-30"
              disabled={settings.surprise || impostors >= max}
              onClick={() => set({ impostors: impostors + 1 })}
              aria-label="Más impostores"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-center text-sm text-zinc-400">{impostorNote}</p>
          <p className="mt-1 text-center text-xs text-zinc-500">
            Con {n} jugadores, el máximo es {max}.
          </p>
        </div>

        <Toggle
          label="🎲 Modo sorpresa"
          desc="Se sortea entre 0 y el máximo. Puede que esta ronda no tenga impostor."
          on={settings.surprise}
          onToggle={() => set({ surprise: !settings.surprise })}
        />
        <Toggle
          label="💡 Pista para el impostor"
          desc="El impostor ve una pista muy vaga (la categoría) para poder disimular."
          on={settings.hint}
          onToggle={() => set({ hint: !settings.hint })}
        />

        <div>
          <span className="label">⏱️ Temporizador de debate</span>
          <div className="flex flex-wrap gap-2">
            {TIMERS.map((t) => (
              <button
                key={t.value}
                onClick={() => set({ timer: t.value })}
                className={`chip ${settings.timer === t.value ? "chip-on" : ""}`}
                aria-pressed={settings.timer === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <button className="btn-primary text-lg" onClick={onStart}>
        🕵️ Empezar partida
      </button>
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-xs text-zinc-400">{desc}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-violet-500" : "bg-zinc-700"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`}
        />
      </span>
    </button>
  );
}
