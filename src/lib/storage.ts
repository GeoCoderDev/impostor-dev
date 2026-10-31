import type { Settings } from "./game";
import { DEFAULT_SETTINGS } from "./game";
import type { Pack } from "./words";

const SETTINGS_KEY = "impostor.settings.v1";
const PACKS_KEY = "impostor.packs.v1";
const SEEN_HELP_KEY = "impostor.seenHelp.v1";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: no pasa nada */
  }
}

export function loadSettings(): Settings {
  const s = read<Partial<Settings>>(SETTINGS_KEY);
  if (!s) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    players:
      Array.isArray(s.players) && s.players.length >= 3
        ? s.players.map((p) => String(p).slice(0, 20))
        : DEFAULT_SETTINGS.players,
  };
}

export function saveSettings(s: Settings) {
  write(SETTINGS_KEY, s);
}

export function loadCustomPacks(): Pack[] {
  const p = read<Pack[]>(PACKS_KEY);
  return Array.isArray(p) ? p.filter((x) => x && Array.isArray(x.entries) && x.entries.length > 0) : [];
}

export function saveCustomPacks(packs: Pack[]) {
  write(PACKS_KEY, packs);
}

export function hasSeenHelp(): boolean {
  return read<boolean>(SEEN_HELP_KEY) === true;
}

export function markHelpSeen() {
  write(SEEN_HELP_KEY, true);
}
