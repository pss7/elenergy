// 전원 상태 로컬스토리지 & 이벤트 유틸

export type PowerState = "ON" | "OFF";

const KEY = "controllerPowerState";

/** 전체 맵 로드 */
function loadMap(): Record<string, PowerState> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** 전체 맵 저장 */
function saveMap(map: Record<string, PowerState>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

/** 특정 컨트롤러 전원 상태 조회 (없으면 OFF) */
export function getControllerPower(id: number): PowerState {
  const map = loadMap();
  return (map[String(id)] as PowerState) ?? "OFF";
}

/** 특정 컨트롤러 전원 상태 저장 + 전역 이벤트 발행 */
export function setControllerPower(id: number, state: PowerState) {
  const map = loadMap();
  map[String(id)] = state;
  saveMap(map);

  // 상태 변경 브로드캐스트
  window.dispatchEvent(
    new CustomEvent("controller:power:changed", {
      detail: { id, state },
    })
  );
}
