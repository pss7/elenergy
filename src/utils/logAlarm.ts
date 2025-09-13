// src/utils/logAlarm.ts
import { appendAlarm, type Alarm } from "../data/Alarms";

function getCompany() {
  return localStorage.getItem("companyCode") || "DEFAULT_COMPANY";
}
function getAdmin() {
  return localStorage.getItem("adminName") || "관리자A";
}

const ICONS: Record<Alarm["type"], string> = {
  "수동제어": "/assets/images/common/control_icon01.svg",
  "자동제어": "/assets/images/common/control_icon02.svg",
  "예약제어": "/assets/images/common/control_icon03.svg",
};

// 🔧 icon을 필수에서 제외(내부에서 기본값을 채움)
export type LogAlarmInput =
  Omit<Alarm, "id" | "date" | "adminId" | "icon"> & {
    date?: string;
    icon?: string;
  };

/** 각 페이지에서 이 함수만 호출하면 알림이 쌓입니다. */
export function logAlarm(payload: LogAlarmInput) {
  const company = getCompany();
  const adminId = getAdmin();

  const { icon: iconOverride, ...rest } = payload;
  const icon = iconOverride ?? ICONS[rest.type];

  return appendAlarm(company, { ...rest, adminId, icon });
}
