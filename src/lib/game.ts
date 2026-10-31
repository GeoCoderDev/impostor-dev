import { hintFor, type Pack } from "./words";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

export type Settings = {
  players: string[];
  impostors: number; // 0..maxImpostors
  surprise: boolean; // si true, la cantidad real se sortea entre 0 y el máximo
  packId: string;
  timer: number; // segundos, 0 = sin temporizador
  hint: boolean; // el impostor recibe una pista vaga
};

export const DEFAULT_SETTINGS: Settings = {
  players: ["", "", ""],
  impostors: 1,
  surprise: false,
  packId: "comida",
  timer: 180,
  hint: false,
};

export type Round = {
  word: string;
  hint: string;
  packName: string;
  impostors: number[]; // índices en la lista de jugadores
  names: string[];
  order: number[]; // orden en el que se reparten las cartas
  starter: number; // quién empieza a dar pistas
  alive: boolean[];
  surprise: boolean;
};

/** Máximo de impostores razonable: siempre debe haber mayoría de inocentes. */
export function maxImpostors(playerCount: number): number {
  return Math.max(0, Math.floor((playerCount - 1) / 2));
}

export function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cleanNames(players: string[]): string[] {
  return players.map((p, i) => p.trim() || `Jugador ${i + 1}`);
}

export function createRound(settings: Settings, pack: Pack): Round {
  const names = cleanNames(settings.players);
  const max = maxImpostors(names.length);
  const count = settings.surprise
    ? randInt(max + 1)
    : Math.min(settings.impostors, max);

  const entry = pack.entries[randInt(pack.entries.length)];
  const idx = names.map((_, i) => i);
  const impostors = shuffle(idx).slice(0, count);

  return {
    word: entry.word,
    hint: hintFor(entry, pack),
    packName: pack.name,
    impostors,
    names,
    order: shuffle(idx),
    starter: randInt(names.length),
    alive: names.map(() => true),
    surprise: settings.surprise,
  };
}

export type VoteOutcome =
  | { kind: "continue"; expelled: number; wasImpostor: boolean; alive: boolean[] }
  | { kind: "end"; winner: "group" | "impostors"; reason: string; expelled?: number; alive: boolean[] };

/** `target` = índice del jugador expulsado, o null si el grupo cree que no hay impostor. */
export function resolveVote(round: Round, target: number | null): VoteOutcome {
  const total = round.impostors.length;

  if (target === null) {
    return total === 0
      ? { kind: "end", winner: "group", reason: "Acertaron: no había ningún impostor.", alive: round.alive }
      : {
          kind: "end",
          winner: "impostors",
          reason: `Se equivocaron: ${total === 1 ? "había un impostor" : `había ${total} impostores`} entre ustedes.`,
          alive: round.alive,
        };
  }

  const alive = round.alive.map((a, i) => (i === target ? false : a));
  const wasImpostor = round.impostors.includes(target);

  if (total === 0) {
    return {
      kind: "end",
      winner: "impostors",
      reason: `No había impostor… y expulsaron a ${round.names[target]} por nada. ¡La paranoia ganó!`,
      expelled: target,
      alive,
    };
  }

  const impostorsLeft = round.impostors.filter((i) => alive[i]).length;
  const crewLeft = alive.filter((a, i) => a && !round.impostors.includes(i)).length;

  if (impostorsLeft === 0) {
    return {
      kind: "end",
      winner: "group",
      reason: total === 1 ? "Descubrieron al impostor." : "Descubrieron a todos los impostores.",
      expelled: target,
      alive,
    };
  }

  if (impostorsLeft >= crewLeft) {
    return {
      kind: "end",
      winner: "impostors",
      reason: wasImpostor
        ? "Cayó un impostor, pero los que quedan ya son mayoría."
        : `Expulsaron a un inocente (${round.names[target]}) y los impostores ya son mayoría.`,
      expelled: target,
      alive,
    };
  }

  return { kind: "continue", expelled: target, wasImpostor, alive };
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
