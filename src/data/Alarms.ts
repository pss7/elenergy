export interface Alarm {
  id: number;
  type: "수동제어" | "자동제어" | "예약제어"; 
  controller: string;
  adminId: string;
  status: "ON" | "OFF";
  date: string;
  icon: string;
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
    date: "2025.08.14 오후 10:12",
    icon: "/assets/images/common/control_icon02.svg",
  },
  {
    id: 3,
    type: "예약제어",
    controller: "제어기1",
    adminId: "관리자ID3",
    status: "ON",
    date: "2025.08.14 오후 10:14",
    icon: "/assets/images/common/control_icon03.svg",
  },
  {
    id: 4,
    type: "수동제어",
    controller: "제어기3",
    adminId: "관리자ID4",
    status: "OFF",
    date: "2025.08.14 오후 10:16",
    icon: "/assets/images/common/control_icon01.svg",
  },
  {
    id: 5,
    type: "자동제어",
    controller: "제어기4",
    adminId: "관리자ID5",
    status: "ON",
    date: "2025.08.14 오후 10:18",
    icon: "/assets/images/common/control_icon02.svg",
  },
  {
    id: 6,
    type: "예약제어",
    controller: "제어기2",
    adminId: "관리자ID6",
    status: "OFF",
    date: "2025.08.14 오후 10:20",
    icon: "/assets/images/common/control_icon03.svg",
  },
  {
    id: 7,
    type: "수동제어",
    controller: "제어기1",
    adminId: "관리자ID7",
    status: "ON",
    date: "2025.08.14 오후 10:22",
    icon: "/assets/images/common/control_icon01.svg",
  },
  {
    id: 8,
    type: "자동제어",
    controller: "제어기3",
    adminId: "관리자ID8",
    status: "OFF",
    date: "2025.08.14 오후 10:24",
    icon: "/assets/images/common/control_icon02.svg",
  },
  {
    id: 9,
    type: "예약제어",
    controller: "제어기4",
    adminId: "관리자ID9",
    status: "ON",
    date: "2025.08.14 오후 10:26",
    icon: "/assets/images/common/control_icon03.svg",
  },
  {
    id: 10,
    type: "수동제어",
    controller: "제어기2",
    adminId: "관리자ID10",
    status: "OFF",
    date: "2025.08.14 오후 10:28",
    icon: "/assets/images/common/control_icon01.svg",
  },
];


export default alarmData;
