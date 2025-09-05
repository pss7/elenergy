export type Reservation = {
  id: number;
  controllerId: number; // ✔️ 제어기 ID 필수
  time: string;
  dateLabel: string;
  isOn: boolean;
};

const scheduledBlockingsData: Reservation[] = [
  { id: 1, controllerId: 1, time: "09:20", dateLabel: "2025년 8월 14일 (목)", isOn: true },
  { id: 2, controllerId: 1, time: "08:30", dateLabel: "2025년 8월 14일 (목)", isOn: false },
  { id: 3, controllerId: 2, time: "06:20", dateLabel: "매주 화, 목", isOn: true },
  { id: 4, controllerId: 2, time: "10:00", dateLabel: "매주 월, 화, 수, 목, 금", isOn: false },
  { id: 5, controllerId: 3, time: "07:00", dateLabel: "2025년 9월 10일 (수)", isOn: true },
];

export default scheduledBlockingsData;
