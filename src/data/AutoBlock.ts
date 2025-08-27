export type TabType = "hourly" | "daily" | "weekly" | "monthly" | "dailyLastWeek";

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type UsageStats = {
  average: number;
  minimum: number;
  current: number;
};

export type UsagePeriodData = {
  stats: UsageStats;
  chart: ChartDataPoint[];
};

export type PowerUsageData = {
  autoBlockThreshold: number;
  hourly: UsagePeriodData;
  daily: UsagePeriodData;
  weekly: UsagePeriodData;
  monthly: UsagePeriodData;
  dailyLastWeek: UsagePeriodData;  // 추가
};

const autoBlockData: PowerUsageData = {
  autoBlockThreshold: 50,
  hourly: {
    stats: { average: 120, minimum: 90, current: 110 },
    chart: [
      { label: '0h', value: 120 },
      { label: '4h', value: 90 },
      { label: '8h', value: 60 },
      { label: '12h', value: 180 },
      { label: '16h', value: 300 },
      { label: '20h', value: 220 },
      { label: '24h', value: 220 },
    ],
  },
  daily: {
    stats: { average: 120, minimum: 90, current: 110 },
    chart: [
      { label: '7월 1일', value: 240 },
      { label: '7월 2일', value: 180 },
      { label: '7월 3일', value: 160 },
      { label: '7월 15일', value: 300 },
    ],
  },
  weekly: {
    stats: { average: 120, minimum: 90, current: 110 },
    chart: [
      { label: '3월 1주', value: 1250 },
      { label: '4월 1주', value: 1400 },
      { label: '5월 1주', value: 1350 },
      { label: '8월 2주', value: 1480 },
    ],
  },
  monthly: {
    stats: { average: 120, minimum: 90, current: 110 },
    chart: [
      { label: '1월', value: 8000 },
      { label: '2월', value: 7500 },
      { label: '8월', value: 9000 },
      { label: '12월', value: 10000 },
    ],
  },
  dailyLastWeek: {
    stats: { average: 120, minimum: 90, current: 110 },
    chart: [
      { label: 'd-7', value: 150 },
      { label: 'd-6', value: 200 },
      { label: 'd-5', value: 175 },
      { label: 'd-4', value: 160 },
      { label: 'd-3', value: 210 },
      { label: 'd-2', value: 220 },
      { label: 'd-1', value: 210 },
    ],
  },
};

export default autoBlockData;
