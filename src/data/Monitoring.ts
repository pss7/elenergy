// src/data/Monitoring.ts
import { startOfWeek } from "date-fns";

export type TabType = "daily" | "weekly" | "monthly" | "yearly";

export type MonitoringEntry = {
  powerReductionRate: number; // %
  powerSaved: number;         // Wh
  powerUsed: number;          // Wh
  savedCost: number;          // KRW
  usedCost: number;           // KRW
};

/**
 * 탭별 "기준값"
 * 실제 화면 값은 getMonitoringEntry가 날짜/제어기 기준으로
 * ±15% 가감 및 절감률 ±5pt 변동을 적용한 결과를 반환합니다.
 */
export const baseMonitoringData: Record<TabType, MonitoringEntry> = {
  daily: {
    powerReductionRate: 35,
    powerSaved: 280,       // 하루 절약 Wh (예시)
    powerUsed: 1400,       // 하루 사용 Wh (예시)
    savedCost: 21_000,     // 원 (예시)
    usedCost: 84_000,
  },
  weekly: {
    powerReductionRate: 30,
    powerSaved: 1_200,
    powerUsed: 4_000,
    savedCost: 90_000,
    usedCost: 300_000,
  },
  monthly: {
    powerReductionRate: 25,
    powerSaved: 14_400,
    powerUsed: 57_600,
    savedCost: 1_080_000,
    usedCost: 4_320_000,
  },
  yearly: {
    powerReductionRate: 22,
    powerSaved: 172_800,    // monthly * 12 정도
    powerUsed: 691_200,
    savedCost: 12_960_000,
    usedCost: 51_840_000,
  },
};

/** ========= 유틸(결정론적 랜덤) ========= */
function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seeded01(seed: string) {
  // xorshift
  let x = hashStr(seed) || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 4294967295;
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function yyyymmdd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}
function yyyy(d: Date) {
  return String(d.getFullYear());
}

/**
 * 날짜/제어기/탭별로 표시 엔트리를 계산해 반환
 */
export function getMonitoringEntry(
  tab: TabType,
  date: Date,
  controllerId: number
): MonitoringEntry {
  const base = baseMonitoringData[tab];

  // 탭별 날짜 키(주→해당 주 시작일, 월→해당 월, 연→해당 연)
  let key = "";
  switch (tab) {
    case "daily": {
      key = yyyymmdd(date);
      break;
    }
    case "weekly": {
      const wStart = startOfWeek(date, { weekStartsOn: 1 });
      key = `W${yyyymmdd(wStart)}`;
      break;
    }
    case "monthly": {
      key = `M${yyyymm(date)}`;
      break;
    }
    case "yearly": {
      key = `Y${yyyy(date)}`;
      break;
    }
  }

  const seed = `${controllerId}|${tab}|${key}`;
  const r = seeded01(seed);

  // 스케일(±15%) — 너무 튀지 않게
  const factor = 0.85 + r * 0.30; // 0.85 ~ 1.15
  const rateDelta = Math.round((r - 0.5) * 10); // -5 ~ +5
  const powerReductionRate = clamp(base.powerReductionRate + rateDelta, 1, 99);

  return {
    powerReductionRate,
    powerSaved: Math.round(base.powerSaved * factor),
    powerUsed: Math.round(base.powerUsed * factor),
    savedCost: Math.round(base.savedCost * factor),
    usedCost: Math.round(base.usedCost * factor),
  };
}

export default baseMonitoringData;
