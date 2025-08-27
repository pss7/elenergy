export type Reservation = {
  id: number;
  time: string;
  dateLabel: string;
  isOn: boolean;
};

const scheduledBlockingsData: Reservation[] = [
  { id: 1, time: "09:20", dateLabel: "2025년 8월 14일 (목)", isOn: true },
  { id: 2, time: "08:30", dateLabel: "2025년 8월 14일 (목)", isOn: false },
  { id: 3, time: "06:20", dateLabel: "매주 화, 목", isOn: true },
  { id: 4, time: "10:00", dateLabel: "매주 월, 화, 수, 목, 금", isOn: false },
];

export default scheduledBlockingsData;
