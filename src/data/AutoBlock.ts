// data/AutoBlock.ts
export type TabType = "hourly" | "daily" | "weekly" | "monthly" | "dailyLastWeek";

export type ChartDataPoint = { label: string; value: number };
export type UsageStats = { average: number; minimum: number; current: number };

export type UsagePeriodData = {
  // 참고용 초기 통계(화면에서는 chart를 기반으로 매번 재계산)
  stats: UsageStats;
  chart: ChartDataPoint[];
};

export type PowerUsageData = {
  autoBlockThreshold: number;
  hourly: UsagePeriodData;
  daily: UsagePeriodData;
  weekly: UsagePeriodData;
  monthly: UsagePeriodData;
  dailyLastWeek: UsagePeriodData;
};

export type PowerUsageDataByController = Record<number, PowerUsageData>;

/** ============ 제어기 1: 완만한 패턴 ============ */
const controller1: PowerUsageData = {
  autoBlockThreshold: 50,
  hourly: {
    stats: { average: 185, minimum: 90, current: 160 },
    chart: [
      { label: "0h", value: 90 },
      { label: "4h", value: 120 },
      { label: "8h", value: 160 },
      { label: "12h", value: 240 },
      { label: "16h", value: 320 },
      { label: "20h", value: 260 },
      { label: "24h", value: 160 },
    ],
  },
  daily: {
    stats: { average: 215, minimum: 160, current: 300 },
    chart: [
      { label: "7월 1일", value: 180 },
      { label: "7월 2일", value: 220 },
      { label: "7월 3일", value: 160 },
      { label: "7월 15일", value: 300 },
    ],
  },
  weekly: {
    stats: { average: 1270, minimum: 1150, current: 1400 },
    chart: [
      { label: "3월 1주", value: 1150 },
      { label: "4월 1주", value: 1200 },
      { label: "5월 1주", value: 1350 },
      { label: "8월 2주", value: 1400 },
    ],
  },
  monthly: {
    stats: { average: 8625, minimum: 7800, current: 9800 },
    chart: [
      { label: "1월", value: 7800 },
      { label: "2월", value: 8200 },
      { label: "8월", value: 8600 },
      { label: "12월", value: 9800 },
    ],
  },
  dailyLastWeek: {
    stats: { average: 205, minimum: 150, current: 230 },
    chart: [
      { label: "d-7", value: 150 },
      { label: "d-6", value: 180 },
      { label: "d-5", value: 210 },
      { label: "d-4", value: 190 },
      { label: "d-3", value: 220 },
      { label: "d-2", value: 230 },
      { label: "d-1", value: 200 },
    ],
  },
};

/** ============ 제어기 2: 야간 치솟는 패턴, 임계값 상향 ============ */
const controller2: PowerUsageData = {
  autoBlockThreshold: 65,
  hourly: {
    stats: { average: 205, minimum: 60, current: 300 },
    chart: [
      { label: "0h", value: 60 },
      { label: "4h", value: 80 },
      { label: "8h", value: 120 },
      { label: "12h", value: 180 },
      { label: "16h", value: 260 },
      { label: "20h", value: 340 },
      { label: "24h", value: 300 },
    ],
  },
  daily: {
    stats: { average: 260, minimum: 150, current: 320 },
    chart: [
      { label: "7월 1일", value: 150 },
      { label: "7월 2일", value: 240 },
      { label: "7월 3일", value: 330 },
      { label: "7월 15일", value: 320 },
    ],
  },
  weekly: {
    stats: { average: 1412, minimum: 1200, current: 1700 },
    chart: [
      { label: "3월 1주", value: 1200 },
      { label: "4월 1주", value: 1350 },
      { label: "5월 1주", value: 1400 },
      { label: "8월 2주", value: 1700 },
    ],
  },
  monthly: {
    stats: { average: 9550, minimum: 8600, current: 11000 },
    chart: [
      { label: "1월", value: 8600 },
      { label: "2월", value: 9200 },
      { label: "8월", value: 10300 },
      { label: "12월", value: 11000 },
    ],
  },
  dailyLastWeek: {
    stats: { average: 214, minimum: 140, current: 260 },
    chart: [
      { label: "d-7", value: 140 },
      { label: "d-6", value: 180 },
      { label: "d-5", value: 200 },
      { label: "d-4", value: 220 },
      { label: "d-3", value: 240 },
      { label: "d-2", value: 260 },
      { label: "d-1", value: 230 },
    ],
  },
};

/** ============ 제어기 3: 아침 피크가 큼, 임계값 낮춤 ============ */
const controller3: PowerUsageData = {
  autoBlockThreshold: 40,
  hourly: {
    stats: { average: 210, minimum: 80, current: 180 },
    chart: [
      { label: "0h", value: 80 },
      { label: "4h", value: 140 },
      { label: "8h", value: 280 },
      { label: "12h", value: 340 },
      { label: "16h", value: 260 },
      { label: "20h", value: 180 },
      { label: "24h", value: 180 },
    ],
  },
  daily: {
    stats: { average: 205, minimum: 120, current: 260 },
    chart: [
      { label: "7월 1일", value: 120 },
      { label: "7월 2일", value: 180 },
      { label: "7월 3일", value: 260 },
      { label: "7월 15일", value: 260 },
    ],
  },
  weekly: {
    stats: { average: 1037, minimum: 900, current: 1150 },
    chart: [
      { label: "3월 1주", value: 900 },
      { label: "4월 1주", value: 1000 },
      { label: "5월 1주", value: 1100 },
      { label: "8월 2주", value: 1150 },
    ],
  },
  monthly: {
    stats: { average: 7850, minimum: 7000, current: 8400 },
    chart: [
      { label: "1월", value: 7000 },
      { label: "2월", value: 7600 },
      { label: "8월", value: 8200 },
      { label: "12월", value: 8400 },
    ],
  },
  dailyLastWeek: {
    stats: { average: 177, minimum: 100, current: 320 },
    chart: [
      { label: "d-7", value: 100 },
      { label: "d-6", value: 120 },
      { label: "d-5", value: 140 },
      { label: "d-4", value: 160 },
      { label: "d-3", value: 180 },
      { label: "d-2", value: 240 },
      { label: "d-1", value: 320 },
    ],
  },
};

/** ============ 제어기 4: 전체적으로 높고 변동 큼 ============ */
const controller4: PowerUsageData = {
  autoBlockThreshold: 80,
  hourly: {
    stats: { average: 240, minimum: 100, current: 140 },
    chart: [
      { label: "0h", value: 100 },
      { label: "4h", value: 120 },
      { label: "8h", value: 200 },
      { label: "12h", value: 360 },
      { label: "16h", value: 380 },
      { label: "20h", value: 260 },
      { label: "24h", value: 140 },
    ],
  },
  daily: {
    stats: { average: 290, minimum: 180, current: 360 },
    chart: [
      { label: "7월 1일", value: 180 },
      { label: "7월 2일", value: 260 },
      { label: "7월 3일", value: 360 },
      { label: "7월 15일", value: 360 },
    ],
  },
  weekly: {
    stats: { average: 1562, minimum: 1300, current: 1800 },
    chart: [
      { label: "3월 1주", value: 1300 },
      { label: "4월 1주", value: 1500 },
      { label: "5월 1주", value: 1650 },
      { label: "8월 2주", value: 1800 },
    ],
  },
  monthly: {
    stats: { average: 10425, minimum: 9200, current: 12000 },
    chart: [
      { label: "1월", value: 9200 },
      { label: "2월", value: 9800 },
      { label: "8월", value: 11000 },
      { label: "12월", value: 12000 },
    ],
  },
  dailyLastWeek: {
    stats: { average: 214, minimum: 150, current: 190 },
    chart: [
      { label: "d-7", value: 220 },
      { label: "d-6", value: 210 },
      { label: "d-5", value: 200 },
      { label: "d-4", value: 190 },
      { label: "d-3", value: 180 },
      { label: "d-2", value: 170 },
      { label: "d-1", value: 190 },
    ],
  },
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
