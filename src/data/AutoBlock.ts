// data/AutoBlock.ts
export type TabType = "daily" | "weekly" | "monthly" | "yearly";

export type ChartDataPoint = { label: string; value: number };
export type UsageStats = { average: number; minimum: number; current: number };

export type UsagePeriodData = {
  // 참고용(화면에서는 chart를 기반으로 매번 재계산)
  stats: UsageStats;
  chart: ChartDataPoint[];
};

export type PowerUsageData = {
  autoBlockThreshold: number;
  daily: UsagePeriodData;
  weekly: UsagePeriodData;
  monthly: UsagePeriodData;
  yearly: UsagePeriodData;
};

export type PowerUsageDataByController = Record<number, PowerUsageData>;

/** ===== 유틸: 간단한 해시/시드 난수 (재현 가능) ===== */
function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededRand01(seed: string) {
  let x = hashStr(seed) || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  const u = (x >>> 0) / 4294967295;
  return u;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** 제어기별 범위/패턴 프로파일 */
const controllerProfiles = {
  1: { daily: [150, 320], weekly: [900, 1500], monthly: [7000, 10000], yearly: [80000, 120000] },
  2: { daily: [150, 360], weekly: [1100, 1700], monthly: [8600, 11000], yearly: [98000, 135000] },
  3: { daily: [120, 280], weekly: [900, 1200], monthly: [7000, 8500], yearly: [78000, 110000] },
  4: { daily: [180, 380], weekly: [1300, 1800], monthly: [9200, 12000], yearly: [105000, 150000] },
} as const;

/** 2월=28, 4/6/9/11=30, 나머지 31 (요구사항 고정 규칙) */
function daysInMonthFixed(_year: number, month1: number) {
  if (month1 === 2) return 28;
  if ([4, 6, 9, 11].includes(month1)) return 30;
  return 31;
}

/** 공통 값 생성기 */
function genValue(
  ctrlId: number,
  band: readonly [number, number], // ← 여기만 readonly로
  index: number,
  anchor: Date,
  tag: string
) {
  const [minV, maxV] = band;
  const base = (Math.sin((index / 3.7) + ctrlId) + 1) / 2;
  const noise = seededRand01(`${ctrlId}|${tag}|${index}|${anchor.toDateString()}`) * 0.25;
  const mix = clamp(base * 0.8 + noise, 0, 1);
  return Math.round(minV + mix * (maxV - minV));
}

/** ===== 차트 빌더(컴포넌트에서 import해서 사용) ===== */
export function buildDaily(ctrlId: number, date: Date): ChartDataPoint[] {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const dim = daysInMonthFixed(y, m);
  return Array.from({ length: dim }, (_, i) => ({
    label: `${m}월 ${i + 1}일`,
    value: genValue(ctrlId, p.daily, i, date, "daily"),
  }));
}

export function buildWeekly(ctrlId: number, date: Date): ChartDataPoint[] {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];
  // 오래전→최근 24주
  return Array.from({ length: 24 }, (_, i) => {
    const idxFromRecent = 23 - i;
    return { label: `W-${idxFromRecent}`, value: genValue(ctrlId, p.weekly, i, date, "weekly") };
  });
}

export function buildMonthly(ctrlId: number, date: Date): ChartDataPoint[] {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];
  // 최근 12개월: (date - 11개월) ~ (date)까지
  return Array.from({ length: 12 }, (_, i) => {
    const dt = new Date(date.getFullYear(), date.getMonth() - (11 - i), 1);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    return {
      label: `${y}년 ${m}월`,
      value: genValue(ctrlId, p.monthly, i, dt, "monthly"),
    };
  });
}

export function buildYearly(ctrlId: number, date: Date): ChartDataPoint[] {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];
  // 과거 9년 + 기준연도(총 10개)
  const endY = date.getFullYear();
  const startY = endY - 9;
  return Array.from({ length: 10 }, (_, i) => {
    const y = startY + i;
    return {
      label: `${y}년`,
      value: genValue(ctrlId, p.yearly, i, new Date(y, 0, 1), "yearly"),
    };
  });
}

// 파일 상단 내용은 그대로…

/** 최근 7일(d-7 ~ d-1) 일별 데이터 */
export function buildDailyLastWeek(ctrlId: number, endDate: Date): ChartDataPoint[] {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];

  // 오래전 → 최근 순서로 d-7 … d-1 생성 (오늘은 제외)
  return Array.from({ length: 7 }, (_, idx) => {
    const k = 7 - idx; // 7..1
    const d = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - k);
    return {
      label: `d-${k}`,
      // daily 밴드를 사용해 날짜를 앵커로 시드 → 같은 입력이면 같은 출력
      value: genValue(ctrlId, p.daily, idx, d, "dailyLastWeek"),
    };
  });
}

/** 통계 계산(화면에서 사용) */
export function computeStatsFromChart(chart: { value: number }[]) {
  if (!chart || chart.length === 0) return { average: 0, minimum: 0, current: 0 };
  const values = chart.map((d) => d.value);
  const sum = values.reduce((s, v) => s + v, 0);
  return {
    average: Math.round((sum / values.length) * 10) / 10,
    minimum: Math.min(...values),
    current: values[values.length - 1],
  };
}

/** ====== 초기값(임계값 기본치 및 예시 차트) ====== */
/** 화면에선 위 빌더로 매번 생성하므로 stats/chart는 참고용입니다. */
const controller1: PowerUsageData = {
  autoBlockThreshold: 50,
  daily: { stats: { average: 215, minimum: 160, current: 300 }, chart: [] },
  weekly: { stats: { average: 1270, minimum: 1150, current: 1400 }, chart: [] },
  monthly: { stats: { average: 8625, minimum: 7800, current: 9800 }, chart: [] },
  yearly: { stats: { average: 98000, minimum: 80000, current: 115000 }, chart: [] },
};

const controller2: PowerUsageData = {
  autoBlockThreshold: 65,
  daily: { stats: { average: 260, minimum: 150, current: 320 }, chart: [] },
  weekly: { stats: { average: 1412, minimum: 1200, current: 1700 }, chart: [] },
  monthly: { stats: { average: 9550, minimum: 8600, current: 11000 }, chart: [] },
  yearly: { stats: { average: 112000, minimum: 98000, current: 135000 }, chart: [] },
};

const controller3: PowerUsageData = {
  autoBlockThreshold: 40,
  daily: { stats: { average: 205, minimum: 120, current: 260 }, chart: [] },
  weekly: { stats: { average: 1037, minimum: 900, current: 1150 }, chart: [] },
  monthly: { stats: { average: 7850, minimum: 7000, current: 8400 }, chart: [] },
  yearly: { stats: { average: 93000, minimum: 78000, current: 110000 }, chart: [] },
};

const controller4: PowerUsageData = {
  autoBlockThreshold: 80,
  daily: { stats: { average: 290, minimum: 180, current: 360 }, chart: [] },
  weekly: { stats: { average: 1562, minimum: 1300, current: 1800 }, chart: [] },
  monthly: { stats: { average: 10425, minimum: 9200, current: 12000 }, chart: [] },
  yearly: { stats: { average: 125000, minimum: 105000, current: 150000 }, chart: [] },
};

export const defaultPowerDataByController: PowerUsageDataByController = {
  1: controller1,
  2: controller2,
  3: controller3,
  4: controller4,
};

// (호환용) 단일 기본셋
const autoBlockData: PowerUsageData = controller1;
export default autoBlockData;
