export interface Alarm {
  id: number;
  type: "수동제어" | "자동제어" | "예약제어"; 
  controller: string;
  adminId: string;
  status: "ON" | "OFF";
  date: string;
  icon: string;
  isRead?: boolean;
}

export interface AlarmFilters {
  controllers: string[];
  admins: string[];
  types: string[];
  sortOrder: "latest" | "oldest";
}

const alarmData: Alarm[] = [
  {
    id: 1,
    type: "수동제어",
    controller: "제어기1",
    adminId: "관리자ID1",
    status: "OFF",
    date: "2025.08.14 오후 10:10",
    icon: "/assets/images/common/control_icon01.svg",
  },
  {
    id: 2,
    type: "자동제어",
    controller: "제어기2",
    adminId: "관리자ID2",
    status: "OFF",
    date: "2025.08.14 오후 10:10",
    icon: "/assets/images/common/control_icon02.svg",
  },
  {
    id: 3,
    type: "예약제어",
    controller: "제어기1",
    adminId: "관리자ID3",
    status: "ON",
    date: "2025.08.14 오후 10:10",
    icon: "/assets/images/common/control_icon03.svg",
  },
];

export default alarmData;
