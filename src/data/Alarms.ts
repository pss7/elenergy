// src/data/Alarms.ts
export interface Alarm {
  id: number;
  type: "수동제어" | "자동제어" | "예약제어";
  controller: string;
  adminId: string;
  status: "ON" | "OFF";
  date: string; // "YYYY.MM.DD 오전/오후 hh:mm"
  icon: string;
}

export interface AlarmFilters {
  controllers: string[];
  admins: string[];
  types: Alarm["type"][];
  statuses: Alarm["status"][];
  sortOrder: "latest" | "oldest";
}

const alarmData: Alarm[] = [
  { id: 1,  type: "수동제어", controller: "제어기1", adminId: "ID1", status: "OFF", date: "2025.08.14 오후 10:10", icon: "/assets/images/common/control_icon01.svg" },
  { id: 2,  type: "자동제어", controller: "제어기2", adminId: "ID2", status: "OFF", date: "2025.08.14 오후 10:12", icon: "/assets/images/common/control_icon02.svg" },
  { id: 3,  type: "예약제어", controller: "제어기1", adminId: "ID3", status: "ON",  date: "2025.08.14 오후 10:14", icon: "/assets/images/common/control_icon03.svg" },
  { id: 4,  type: "수동제어", controller: "제어기3", adminId: "ID4", status: "OFF", date: "2025.08.14 오후 10:16", icon: "/assets/images/common/control_icon01.svg" },
  { id: 5,  type: "자동제어", controller: "제어기4", adminId: "ID1", status: "ON",  date: "2025.08.14 오후 10:18", icon: "/assets/images/common/control_icon02.svg" },
  { id: 6,  type: "예약제어", controller: "제어기2", adminId: "ID2", status: "OFF", date: "2025.08.14 오후 10:20", icon: "/assets/images/common/control_icon03.svg" },
  { id: 7,  type: "수동제어", controller: "제어기1", adminId: "ID3", status: "ON",  date: "2025.08.14 오후 10:22", icon: "/assets/images/common/control_icon01.svg" },
  { id: 8,  type: "자동제어", controller: "제어기3", adminId: "ID4", status: "OFF", date: "2025.08.14 오후 10:24", icon: "/assets/images/common/control_icon02.svg" },
  { id: 9,  type: "예약제어", controller: "제어기4", adminId: "ID1", status: "ON",  date: "2025.08.14 오후 10:26", icon: "/assets/images/common/control_icon03.svg" },
  { id:10,  type: "수동제어", controller: "제어기2", adminId: "ID2", status: "OFF", date: "2025.08.14 오후 10:28", icon: "/assets/images/common/control_icon01.svg" },
  { id:11,  type: "자동제어", controller: "제어기1", adminId: "ID3", status: "ON",  date: "2025.08.14 오후 10:30", icon: "/assets/images/common/control_icon02.svg" },
  { id:12,  type: "예약제어", controller: "제어기4", adminId: "ID4", status: "OFF", date: "2025.08.14 오후 10:32", icon: "/assets/images/common/control_icon03.svg" },
  { id:13,  type: "수동제어", controller: "제어기2", adminId: "ID1", status: "ON",  date: "2025.08.14 오후 10:34", icon: "/assets/images/common/control_icon01.svg" },
  { id:14,  type: "자동제어", controller: "제어기3", adminId: "ID2", status: "OFF", date: "2025.08.14 오후 10:36", icon: "/assets/images/common/control_icon02.svg" },
  { id:15,  type: "예약제어", controller: "제어기1", adminId: "ID3", status: "ON",  date: "2025.08.14 오후 10:38", icon: "/assets/images/common/control_icon03.svg" },
  { id:16,  type: "수동제어", controller: "제어기4", adminId: "ID4", status: "OFF", date: "2025.08.14 오후 10:40", icon: "/assets/images/common/control_icon01.svg" },
  { id:17,  type: "자동제어", controller: "제어기2", adminId: "ID1", status: "ON",  date: "2025.08.14 오후 10:42", icon: "/assets/images/common/control_icon02.svg" },
  { id:18,  type: "예약제어", controller: "제어기3", adminId: "ID2", status: "OFF", date: "2025.08.14 오후 10:44", icon: "/assets/images/common/control_icon03.svg" },
  { id:19,  type: "수동제어", controller: "제어기1", adminId: "ID3", status: "ON",  date: "2025.08.14 오후 10:46", icon: "/assets/images/common/control_icon01.svg" },
  { id:20,  type: "자동제어", controller: "제어기4", adminId: "ID4", status: "OFF", date: "2025.08.14 오후 10:48", icon: "/assets/images/common/control_icon02.svg" },
];

export default alarmData;

/* -------- 읽음/미확인 관리 유틸 -------- */

export const READ_KEY_PREFIX = "alarm:readIds:";

export function getReadKey(company: string) {
  return `${READ_KEY_PREFIX}${company}`;
}

export function parseKoreanDate(s: string): number {
  const [datePart, ampm, timePart] = s.split(" ");
  const [y, m, d] = datePart.split(".").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  let hours = hh % 12;
  if (ampm === "오후") hours += 12;
  return new Date(y, m - 1, d, hours, mm).getTime();
}

export function loadReadIds(company: string): Set<number> {
  try {
    const raw = localStorage.getItem(getReadKey(company));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

export function saveReadIds(company: string, ids: Set<number>) {
  localStorage.setItem(getReadKey(company), JSON.stringify([...ids]));
}

export function markAsRead(company: string, ids: number[]) {
  const set = loadReadIds(company);
  ids.forEach((id) => set.add(id));
  saveReadIds(company, set);
}

/** 최초 진입 시에만: 최신 unreadCount개만 미확인(=읽음목록에 안 넣음)으로 남겨둠 */
export function ensureDemoUnreadIfNone(company: string, unreadCount = 3) {
  const key = getReadKey(company);
  if (localStorage.getItem(key) != null) return; // 이미 세팅돼 있으면 유지

  const byNewest = alarmData
    .slice()
    .sort((a, b) => parseKoreanDate(b.date) - parseKoreanDate(a.date));

  // 최신 unreadCount개 제외하고 나머지는 읽음으로 저장
  const readIds = new Set<number>(byNewest.slice(unreadCount).map((a) => a.id));
  saveReadIds(company, readIds);
}

/* 선택용 헬퍼 */
export function markAllAsRead(company: string) {
  const all = new Set(alarmData.map((a) => a.id));
  saveReadIds(company, all);
}
export function clearAllRead(company: string) {
  localStorage.removeItem(getReadKey(company));
}
