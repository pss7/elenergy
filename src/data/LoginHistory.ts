// src/data/LoginHistory.ts
export type LoginHistory = {
  at: string;     // "YYYY-MM-DD HH:mm:ss"
  device: string; // e.g., "SM-S123N"
  os: string;     // e.g., "Android"
  ip: string;     // e.g., "175.123.45.67"
};

const STORAGE_KEY = "loginHistory";

/** ===== 내부 유틸 ===== */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatTS(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function parseTS(s: string) {
  // "YYYY-MM-DD HH:mm:ss" → Date
  const [datePart, timePart] = s.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss);
}

/** ===== 시드 데이터 (처음 비어있을 때만 생성) ===== */
function seedDemo(): LoginHistory[] {
  const models = ["SM-S123N", "iPhone15,2", "Pixel 8", "SM-G998N", "iPhone14,7", "SM-A546S"];
  const osList = ["Android", "iOS", "Android", "Android", "iOS", "Android"];
  const ips = ["175.120.34.11", "61.77.201.9", "211.33.155.200", "222.99.45.17", "118.235.10.7", "59.10.88.3"];

  const out: LoginHistory[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (i * 2 + (i % 3))); // 대략 과거로 퍼뜨림
    out.push({
      at: formatTS(d),
      device: models[i % models.length],
      os: osList[i % osList.length],
      ip: ips[i % ips.length],
    });
  }
  return out;
}

/** 로컬스토리지에서 로드 (없으면 시드 생성 후 저장) */
export function loadLoginHistory(): LoginHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as LoginHistory[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  const demo = seedDemo();
  saveLoginHistory(demo);
  return demo;
}

/** 저장 */
export function saveLoginHistory(list: LoginHistory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** 최근 N일(기본 90일)만 필터 + 최신순 정렬하여 반환 */
export function getRecentLoginHistory(days = 90): LoginHistory[] {
  const all = loadLoginHistory();
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  return all
    .filter((h) => parseTS(h.at) >= cutoff)
    .sort((a, b) => +parseTS(b.at) - +parseTS(a.at));
}

/** 새 이력 추가 (at 없으면 지금 시각) */
export function addLoginHistory(entry: Omit<LoginHistory, "at"> & { at?: string }) {
  const all = loadLoginHistory();
  const withAt: LoginHistory = {
    at: entry.at ?? formatTS(new Date()),
    device: entry.device,
    os: entry.os,
    ip: entry.ip,
  };
  const updated = [...all, withAt];
  saveLoginHistory(updated);
  return withAt;
}

/** (선택) 전체 삭제 */
export function clearLoginHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
