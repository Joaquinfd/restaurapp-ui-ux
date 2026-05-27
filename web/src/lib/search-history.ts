export interface SearchSnapshot {
  cuisines: string[];
  prices: string[];
  vibes: string[];
  dietary: string[];
  resultIds: string[];
  timestamp: number;
}

const KEY = "restaurapp_last_search";

export function saveLastSearch(snapshot: SearchSnapshot): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {}
}

export function loadLastSearch(): SearchSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SearchSnapshot) : null;
  } catch {
    return null;
  }
}

export function clearLastSearch(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  if (hr < 24) return `hace ${hr}h`;
  return `hace ${day}d`;
}
