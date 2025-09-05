import { useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import useNavigateTo from "../../hooks/useNavigateTo";

type Time = {
  ampm: "오전" | "오후";
  hour: number;
  minute: string; // "00" ~ "59"
};

type SelectedDate = { year: number; month: number; day: number } | null;

export default function ScheduledEditPage() {
  const { navigateTo } = useNavigateTo();
  const location = useLocation();
  const reservation = location.state?.reservation as
    | { time?: Time; dateLabel?: string }
    | undefined;

  function handleCancel() {
    navigateTo("/scheduled-block");
  }

  const itemHeight = 66;

  const baseAmpmList = ["오전", "오후"];                            // 각 1개만
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); // "1"~"12"
  const baseMinuteList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")); // "00"~"59"

  // AM/PM은 단일 목록(패딩만), 시/분은 무한 목록
  const ampmList = baseAmpmList; // 렌더에서 패딩 추가
  const hourList = createInfiniteList(baseHourList, 10);
  const minuteList = createInfiniteList(baseMinuteList, 5);

  // 초기 선택값(리스트에서 전달)
  const initialSelected: Time = useMemo(
    () =>
      reservation?.time ?? {
        ampm: "오전",
        hour: 6,
        minute: "00",
      },
    [reservation]
  );
  const [selected, setSelected] = useState<Time>(initialSelected);

  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  // 프로그램적 스크롤 동안 onScroll 무시
  const suppressScrollRef = useRef(true);

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;

  // 날짜 초기화 (YYYY년 M월 D일 / M월 D일)
  const initialDate: SelectedDate = useMemo(() => {
    const label = reservation?.dateLabel;
    if (!label) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    }
    let m = label.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (m) {
      const [, y, mo, d] = m.map(Number);
      return { year: y, month: mo, day: d };
    }
    m = label.match(/^(\d{1,2})월\s*(\d{1,2})일/);
    if (m) {
      const [, mo, d] = m.map(Number);
      const now = new Date();
      return { year: now.getFullYear(), month: mo, day: d };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }, [reservation]);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(initialDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 예약 바뀌면 선택/날짜 재설정 + 스크롤 초기화 준비
  useEffect(() => {
    if (reservation?.time) setSelected(reservation.time);
    setSelectedDate(initialDate);
    suppressScrollRef.current = true;
  }, [reservation, initialDate]);

  // 무한 스크롤 중앙 사이클 시작 위치(시/분용)
  function getCenterScroll<T>(list: T[], baseList: T[]): number {
    const cycles = Math.floor(list.length / baseList.length / 2);
    const centerCycleStart = cycles * baseList.length;
    return (centerCycleStart + 1) * itemHeight; // 상단 2칸 패딩 고려(렌더에서 추가)
  }

  // 초기/선택 변경 시 스크롤을 정확히 가운데 라인에 배치
  useEffect(() => {
    if (!ampmRef.current || !hourRef.current || !minuteRef.current) return;

    suppressScrollRef.current = true;

    // ✅ AM/PM: (빈칸, 오전, 오후, 빈칸) 기준
    // - 오전 중앙: scrollTop = 0
    // - 오후 중앙: scrollTop = 1 * itemHeight
    const ampmIndex = baseAmpmList.findIndex((v) => v === selected.ampm); // 0: 오전, 1: 오후
    if (ampmIndex !== -1) {
      ampmRef.current.scrollTop = ampmIndex * itemHeight;
    }

    // HOUR
    const hourIndex = baseHourList.findIndex((h) => Number(h) === selected.hour);
    if (hourIndex !== -1) {
      hourRef.current.scrollTop =
        getCenterScroll(hourList, baseHourList) + hourIndex * itemHeight;
    }

    // MINUTE
    const minuteIndex = baseMinuteList.findIndex((m) => m === selected.minute);
    if (minuteIndex !== -1) {
      minuteRef.current.scrollTop =
        getCenterScroll(minuteList, baseMinuteList) + minuteIndex * itemHeight;
    }

    const t = setTimeout(() => {
      suppressScrollRef.current = false;
    }, 150);
    return () => clearTimeout(t);
  }, [selected]);

  function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
    return Array.from({ length: repeat }, () => items).flat();
  }

  function handleDayClick(day: string) {
    setSelectedDate(null);
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // 공통 스크롤 핸들러
  function handleScroll<T extends string>(
    ref: React.RefObject<HTMLDivElement>,
    key: keyof Time,
    list: T[],
    baseList: T[]
  ) {
    if (!ref.current || suppressScrollRef.current) return;

    // ✅ AM/PM(단일 목록) 처리: 0 또는 itemHeight 두 위치로 스냅
    if (key === "ampm") {
      const top = ref.current.scrollTop;
      const snapped = top < itemHeight / 2 ? 0 : itemHeight;
      if (Math.abs(top - snapped) > 1) {
        suppressScrollRef.current = true;
        ref.current.scrollTop = snapped;
        setTimeout(() => (suppressScrollRef.current = false), 0);
      }
      const value = snapped === 0 ? "오전" : "오후";
      setSelected((prev) => (prev.ampm === value ? prev : { ...prev, ampm: value }));
      return;
    }

    // ✅ 시/분(무한 목록) 처리
    const centerOffset = ref.current.clientHeight / 2 - itemHeight / 2; // == itemHeight
    const index = Math.round((ref.current.scrollTop + centerOffset) / itemHeight) - 2; // 상단 2칸 패딩 보정
    const realIndex =
      ((index % baseList.length) + baseList.length) % baseList.length;

    // 양끝 근처 → 중앙 사이클로 재정렬
    if (
      ref.current.scrollTop < itemHeight * 4 ||
      ref.current.scrollTop > (list.length - 5) * itemHeight
    ) {
      suppressScrollRef.current = true;
      setTimeout(() => {
        if (ref.current) {
          const selIndex =
            key === "hour"
              ? baseHourList.findIndex((h) => Number(h) === selected.hour)
              : baseMinuteList.findIndex((m) => m === selected.minute);
          if (selIndex >= 0) {
            ref.current.scrollTop =
              getCenterScroll(list, baseList) + selIndex * itemHeight;
          } else {
            ref.current.scrollTop = getCenterScroll(list, baseList);
          }
        }
        suppressScrollRef.current = false;
      }, 60);
    }

    const selectedValue = baseList[realIndex];
    setSelected((prev) => ({ ...prev, [key]: selectedValue as never }));
  }

  // 렌더러
  function renderColumn<T extends string>(
    list: T[],
    baseList: T[],
    key: keyof Time,
    ref: React.RefObject<HTMLDivElement>,
    fontSize: string
  ) {
    // AM/PM: ["", "오전", "오후", ""]
    // HOUR/MINUTE: ["", "", ...list, "", ""]
    const paddedItems =
      key === "ampm" ? (["", ...baseList, ""] as unknown as T[]) : (["", "", ...list, "", ""] as unknown as T[]);

    return (
      <div
        className={`${styles.column} ${key === "ampm" ? styles.ampmColumn : ""}`}
        ref={ref}
        onScroll={() => handleScroll(ref, key, list, baseList)}
        style={{ scrollBehavior: "smooth" }}
      >
        <ul>
          {paddedItems.map((item, idx) => {
            const realIdx = key === "ampm" ? idx - 1 : idx - 2;
            const selStr =
              key === "hour" ? String(selected.hour) : (selected[key] as string);
            const isSelected =
              key === "ampm"
                ? baseList[realIdx] === selStr // realIdx: 0(오전),1(오후)
                : list[realIdx] === selStr;

            return (
              <li
                key={`${String(item)}-${idx}`}
                style={{
                  color: isSelected ? "#000" : "#aaa",
                  fontWeight: isSelected ? "500" : "normal",
                  fontSize,
                  textAlign: "center",
                  height: itemHeight,
                  lineHeight: `${itemHeight}px`,
                  userSelect: "none",
                }}
              >
                {item === "" ? "\u00A0" : String(item)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  function getSelectedDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = days[dateObj.getDay()];
      return `${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length > 0) return `매주 ${selectedDays.join(", ")}`;
    return "요일을 선택하세요";
  }

  return (
    <Main id="sub">
      <div className={styles.scheduledBlockingBox}>
        <div className={styles.scheduledAddBox}>
          {/* 시간 선택 */}
          <div className={styles.timeBox}>
            <div className={styles.timeSelector}>
              {renderColumn(ampmList, baseAmpmList, "ampm", ampmRef, "28px")}
              {renderColumn(hourList, baseHourList, "hour", hourRef, "45px")}
              <div className={styles.colon}>:</div>
              {renderColumn(minuteList, baseMinuteList, "minute", minuteRef, "45px")}
              <div className={styles.centerHighlight}></div>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className={styles.dateBox}>
            <span className={styles.date}>{getSelectedDateLabel()}</span>
            <ul className={styles.dateList}>
              {days.map((day, idx) => {
                const isSunday = idx === 0;
                const isSaturday = idx === 6;
                const isActive = selectedDays.includes(day);
                return (
                  <li
                    key={day}
                    className={`${isSunday ? styles.sunday : ""} ${isSaturday ? styles.saturday : ""} ${isActive ? styles.active : ""}`}
                  >
                    <button className={styles.btn} onClick={() => handleDayClick(day)}>
                      <span>{day}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button className={styles.calendarBtn} onClick={() => setIsCalendarOpen(true)}>
              <span className="blind">달력</span>
            </button>
          </div>

          {/* 안내문 */}
          <div className={styles.infoText}>
            <h2>안내사항</h2>
            <p>예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이 정상적으로 진행됩니다.</p>
          </div>

          {/* 버튼 영역 */}
          <div className="btnBox">
            <Button styleType="grayType" onClick={handleCancel}>취소</Button>
            <Button>저장</Button>
          </div>

          {/* 달력 모달 */}
          <CalendarModal
            isOpen={isCalendarOpen}
            initial={initialDate!}
            onCancel={() => setIsCalendarOpen(false)}
            onConfirm={(value) => {
              setSelectedDate(value);
              setSelectedDays([]);
              setIsCalendarOpen(false);
            }}
            showDay={true}
            showMonth={true}
            tab="daily"
          />
        </div>
      </div>
    </Main>
  );
}
