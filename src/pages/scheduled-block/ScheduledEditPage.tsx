import { useRef, useState, useMemo, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import type { Reservation as ReservationRaw } from "../../data/ScheduledBlockings";
import Footer from "../../components/layout/Footer";

/** ===== Types ===== */
type Time = {
  ampm: "오전" | "오후";
  hour: number;   // 1~12
  minute: string; // "00"~"59"
};
type ReservationState = Omit<ReservationRaw, "time"> & { time: Time };
type SelectedDate = { year: number; month: number; day: number } | null;

export default function ScheduledEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = location.state?.reservation as ReservationState | undefined;

  // 현재 페이지가 어떤 제어기에서 열렸는지 결정
  const controllerId =
    reservation?.controllerId ??
    (location.state as any)?.controllerId ??
    (location.state as any)?.initialControllerId ??
    1;

  /** ===== Exit ===== */
  function goList() {
    // 돌아갈 때 현재 제어기를 기억하고 state로도 넘김
    localStorage.setItem("lastControllerId", String(controllerId));
    navigate("/scheduled-block", { state: { initialControllerId: controllerId } });
  }

  /** ===== Picker constants ===== */
  const itemHeight = 66;

  const baseAmpmList = ["오전", "오후"];
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());       // "1"~"12"
  const baseMinuteList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")); // "00"~"59"

  // AM/PM은 1세트, 시/분은 무한 리스트
  const ampmList = baseAmpmList;
  const hourList = createInfiniteList(baseHourList, 16);     // 길이 ↑ 재배치 빈도↓
  const minuteList = createInfiniteList(baseMinuteList, 20); // 분은 더 길게

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

  // 프로그램적 스크롤 중 onScroll 무시
  const suppressScrollRef = useRef(true);

  // RAF 러프틀링
  const hourRafRef = useRef<number | null>(null);
  const minuteRafRef = useRef<number | null>(null);

  // AM/PM 스냅 디바운스
  const ampmDebounceRef = useRef<number | null>(null);

  // 마지막 반영 인덱스(불필요한 setState 방지)
  const lastIdxRef = useRef<{ ampm: number; hour: number; minute: number }>({
    ampm: initialSelected.ampm === "오전" ? 0 : 1,
    hour: Math.max(0, baseHourList.findIndex((h) => Number(h) === initialSelected.hour)),
    minute: Math.max(0, baseMinuteList.findIndex((m) => m === initialSelected.minute)),
  });

  // 시/분 setState 스로틀용 타임스탬프 (최대 ~20fps로 제한)
  const hourCommitMsRef = useRef(0);
  const minuteCommitMsRef = useRef(0);

  /** ===== Date state ===== */
  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;

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

  /** ===== Utils ===== */
  function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
    return Array.from({ length: repeat }, () => items).flat();
  }

  function setScrollTopInstant(ref: React.RefObject<HTMLDivElement>, top: number) {
    if (!ref.current) return;
    const el = ref.current;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = top;
    requestAnimationFrame(() => {
      if (el) el.style.scrollBehavior = prev || "smooth";
    });
  }

  // 중앙 사이클 시작 위치(시/분용) - 상단 2칸 패딩 고려
  function getCenterScroll<T>(list: T[], baseList: T[]): number {
    const cycles = Math.floor(list.length / baseList.length / 2);
    const centerCycleStart = cycles * baseList.length;
    return (centerCycleStart + 1) * itemHeight;
  }

  /** ===== Reservation change → reset (외부 변경에만 반응) ===== */
  useLayoutEffect(() => {
    // 외부에서 들어온 초기값/복제값에 맞춰 '한 번만' 정렬
    if (!ampmRef.current || !hourRef.current || !minuteRef.current) return;

    suppressScrollRef.current = true;

    // AM/PM
    const ampmIndex = initialSelected.ampm === "오전" ? 0 : 1;
    setScrollTopInstant(ampmRef, ampmIndex * itemHeight);
    lastIdxRef.current.ampm = ampmIndex;

    // HOUR
    const hourIndex = baseHourList.findIndex((h) => Number(h) === initialSelected.hour);
    if (hourIndex !== -1) {
      setScrollTopInstant(
        hourRef,
        getCenterScroll(hourList, baseHourList) + hourIndex * itemHeight
      );
      lastIdxRef.current.hour = hourIndex;
    }

    // MINUTE
    const minuteIndex = baseMinuteList.findIndex((m) => m === initialSelected.minute);
    if (minuteIndex !== -1) {
      setScrollTopInstant(
        minuteRef,
        getCenterScroll(minuteList, baseMinuteList) + minuteIndex * itemHeight
      );
      lastIdxRef.current.minute = minuteIndex;
    }

    const t = window.setTimeout(() => {
      suppressScrollRef.current = false;
    }, 80);
    return () => window.clearTimeout(t);
    // 외부 초기값이 바뀔 때만
  }, [initialSelected.ampm, initialSelected.hour, initialSelected.minute]);

  /** ===== Day select ===== */
  function handleDayClick(day: string) {
    setSelectedDate(null);
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  /** ===== Scroll handler (AM/PM, HOUR, MINUTE) ===== */
  function handleScroll<T extends string>(
    ref: React.RefObject<HTMLDivElement>,
    key: "ampm" | "hour" | "minute",
    list: T[],
    baseList: T[]
  ) {
    if (!ref.current || suppressScrollRef.current) return;

    // --- AM/PM: 디바운스 후 스냅 ---
    if (key === "ampm") {
      const top = ref.current.scrollTop;
      const clamped = Math.max(0, Math.min(itemHeight, top)); // 0~itemHeight

      if (ampmDebounceRef.current) window.clearTimeout(ampmDebounceRef.current);
      ampmDebounceRef.current = window.setTimeout(() => {
        const snapped = clamped < itemHeight / 2 ? 0 : itemHeight;
        const newIdx = snapped === 0 ? 0 : 1;

        suppressScrollRef.current = true;
        setScrollTopInstant(ref, snapped); // 즉시 스냅
        suppressScrollRef.current = false;

        if (newIdx !== lastIdxRef.current.ampm) {
          lastIdxRef.current.ampm = newIdx;
          const value = newIdx === 0 ? "오전" : "오후";
          setSelected((prev) => (prev.ampm === value ? prev : { ...prev, ampm: value }));
        }
      }, 80);
      return;
    }

    // --- HOUR / MINUTE: RAF + 끝 근처 리센터 ---
    const rafRef = key === "hour" ? hourRafRef : minuteRafRef;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const work = () => {
      if (!ref.current) return;
      const container = ref.current;

      const centerOffset = container.clientHeight / 2 - itemHeight / 2; // == itemHeight
      const index = Math.round((container.scrollTop + centerOffset) / itemHeight) - 2; // 상단 2칸 패딩 보정
      const realIndex = ((index % baseList.length) + baseList.length) % baseList.length;

      // 경계 근처면 중앙 사이클로 재배치(즉시) — 임계값 살짝 완화
      const low = itemHeight * 3;
      const high = (list.length - 4) * itemHeight;
      if (container.scrollTop < low || container.scrollTop > high) {
        suppressScrollRef.current = true;
        const selIndex =
          key === "hour"
            ? baseHourList.findIndex((h) => Number(h) === selected.hour)
            : baseMinuteList.findIndex((m) => m === selected.minute);
        setScrollTopInstant(
          ref,
          getCenterScroll(list, baseList) + (selIndex >= 0 ? selIndex : 0) * itemHeight
        );
        suppressScrollRef.current = false;
      }

      const now = performance.now();

      if (key === "hour") {
        // 시도 스로틀 적용 (최대 ~20fps)
        if (lastIdxRef.current.hour !== realIndex && now - hourCommitMsRef.current >= 50) {
          lastIdxRef.current.hour = realIndex;
          hourCommitMsRef.current = now;
          const val = baseList[realIndex];
          setSelected((prev) => ({ ...prev, hour: Number(val) }));
        }
      } else {
        // minute: setState 빈도 제한 (최대 ~20fps)
        if (lastIdxRef.current.minute !== realIndex && now - minuteCommitMsRef.current >= 50) {
          lastIdxRef.current.minute = realIndex;
          minuteCommitMsRef.current = now;
          const val = baseList[realIndex];
          setSelected((prev) => ({ ...prev, minute: val as string }));
        }
      }
    };

    rafRef.current = requestAnimationFrame(work);
  }

  /** ===== Render helper ===== */
  function renderColumn<T extends string>(
    list: T[],
    baseList: T[],
    key: "ampm" | "hour" | "minute",
    ref: React.RefObject<HTMLDivElement>,
    fontSize: string
  ) {
    // AM/PM: ["", 오전, 오후, ""]
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
            const selStr = key === "hour" ? String(selected.hour) : (selected[key] as string);
            const isSelected =
              key === "ampm" ? baseList[realIdx] === selStr : list[realIdx] === selStr;

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

  /** ===== Save (Edit) ===== */
  function to24h(ampm: "오전" | "오후", hour12: number, minute: string): string {
    let h = hour12 % 12;
    if (ampm === "오후") h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
  }

  function buildDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = days[dateObj.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length > 0) return `매주 ${selectedDays.join(", ")}`;
    return reservation?.dateLabel ?? "";
  }

  function handleSave() {
    if (!reservation) {
      // 예약 데이터 없으면 그냥 리스트로 복귀
      return goList();
    }

    const newTime = to24h(selected.ampm, selected.hour, selected.minute);
    const newDateLabel = buildDateLabel();

    const saved = localStorage.getItem("reservations");
    const list: ReservationRaw[] = saved ? JSON.parse(saved) : [];

    const updated = list.map((item) =>
      item.id === reservation.id
        ? { ...item, time: newTime, dateLabel: newDateLabel }
        : item
    );

    localStorage.setItem("reservations", JSON.stringify(updated));

    // 돌아갈 때 현재 제어기 유지
    goList();
  }

  /** ===== Render ===== */
  return (
    <>
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
              <p>
                예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이
                정상적으로 진행됩니다.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="btnBox">
              <Button styleType="grayType" onClick={goList}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
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

      <Footer />
    </>
  );
}
