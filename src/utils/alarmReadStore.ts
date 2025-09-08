export function readKey(company: string) {
  return `alarm:readIds:${company}`;
}

export function loadReadIds(company: string): Set<number> {
  try {
    const raw = localStorage.getItem(readKey(company));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function saveReadIds(company: string, ids: Set<number>) {
  localStorage.setItem(readKey(company), JSON.stringify([...ids]));
}

export function markAsRead(company: string, ids: number[]) {
  const set = loadReadIds(company);
  ids.forEach((id) => set.add(id));
  saveReadIds(company, set);
}

export function clearAllRead(company: string) {
  localStorage.removeItem(readKey(company));
}
