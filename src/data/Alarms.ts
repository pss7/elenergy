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

/** 시드 데이터(변하지 않음) */
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

/* -------------------- 읽음/미확인 관리 -------------------- */

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

/** 최초 진입 시에만: 최신 unreadCount개만 미확인으로 남겨둠 */
export function ensureDemoUnreadIfNone(company: string, unreadCount = 3) {
  const key = getReadKey(company);
  if (localStorage.getItem(key) != null) return;

  const byNewest = alarmData
    .slice()
    .sort((a, b) => parseKoreanDate(b.date) - parseKoreanDate(a.date));

  const readIds = new Set<number>(byNewest.slice(unreadCount).map((a) => a.id));
  saveReadIds(company, readIds);
}

export function markAllAsRead(company: string) {
  const all = new Set(alarmData.map((a) => a.id));
  saveReadIds(company, all);
}
export function clearAllRead(company: string) {
  localStorage.removeItem(getReadKey(company));
}

/* -------------------- 동적 알림(목데이터 추가) -------------------- */

const EXTRA_KEY_PREFIX = "alarms:extra:"; // 회사 코드별 별도 저장
function getExtraKey(company: string) {
  return `${EXTRA_KEY_PREFIX}${company}`;
}

function loadExtraAlarms(company: string): Alarm[] {
  try {
    const raw = localStorage.getItem(getExtraKey(company));
    return raw ? (JSON.parse(raw) as Alarm[]) : [];
  } catch {
    return [];
  }
}

function saveExtraAlarms(company: string, list: Alarm[]) {
  localStorage.setItem(getExtraKey(company), JSON.stringify(list));
}

/** 시드 + 동적 알림을 합쳐 반환 */
export function getAllAlarms(company: string): Alarm[] {
  return [...alarmData, ...loadExtraAlarms(company)];
}

/** 날짜 문자열 생성: "YYYY.MM.DD 오전/오후 hh:mm" */
function formatKoreanNow(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const ampm = now.getHours() < 12 ? "오전" : "오후";
  let hh = now.getHours() % 12;
  if (hh === 0) hh = 12;
  const hhStr = String(hh).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${ampm} ${hhStr}:${mm}`;
}

/** 동적 알림 추가(목데이터). 이벤트 'alarm:changed'를 디스패치해 페이지들이 즉시 반영됩니다. */
export function appendAlarm(
  company: string,
  payload: Omit<Alarm, "id" | "date">
): Alarm {
  const extra = loadExtraAlarms(company);
  const all = [...alarmData, ...extra];
  const nextId = all.length > 0 ? Math.max(...all.map((a) => a.id)) + 1 : 1;

  const alarm: Alarm = {
    id: nextId,
    date: formatKoreanNow(),
    ...payload,
  };

  const updated = [...extra, alarm];
  saveExtraAlarms(company, updated);

  try {
    window.dispatchEvent(new Event("alarm:changed"));
  } catch {
    // SSR 환경 대응
  }

  return alarm;
}
