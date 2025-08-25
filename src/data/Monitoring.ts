export type TabType = "day" | "week" | "month" | "year";

type MonitoringEntry = {
  powerReductionRate: number;
  powerSaved: number;
  powerUsed: number;
  savedCost: number;
  usedCost: number;
};

const monitoringData: Record<TabType, MonitoringEntry> = {
  day: {
    powerReductionRate: 40,
    powerSaved: 40,
    powerUsed: 200,
    savedCost: 3000000,
    usedCost: 12000000,
  },
  week: {
    powerReductionRate: 35,
    powerSaved: 280,
    powerUsed: 1400,
    savedCost: 21000000,
    usedCost: 84000000,
  },
  month: {
    powerReductionRate: 30,
    powerSaved: 1200,
    powerUsed: 4000,
    savedCost: 90000000,
    usedCost: 300000000,
  },
  year: {
    powerReductionRate: 25,
    powerSaved: 14400,
    powerUsed: 57600,
    savedCost: 1080000000,
    usedCost: 4320000000,
  },
};

export default monitoringData;
