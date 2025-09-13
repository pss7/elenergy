import { useRef, useState, useMemo, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import type { Reservation as ReservationRaw } from "../../data/ScheduledBlockings";
import Footer from "../../components/layout/Footer";

type Time = { ampm: "오전" | "오후"; hour: number; minute: string; };
type ReservationState = Omit<ReservationRaw, "time"> & { time: Time };
type SelectedDate = { year: number; month: number; day: number } | null;

export default function ScheduledAddPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [flash, setFlash] = useState<string>("");

  function handleDayClick(day: string) {
    setSelectedDate(null); // ← 이 줄이 핵심
    setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  }

  const reservation = location.state?.reservation as ReservationState | undefined;

  const controllerIdFromState: number =
    (location.state as any)?.controllerId ?? reservation?.controllerId ?? 1;

  function goList() {
    localStorage.setItem("lastControllerId", String(controllerIdFromState));
    navigate("/scheduled-block", { state: { initialControllerId: controllerIdFromState } });
  }

  const itemHeight = 66;
  const baseAmpmList = ["오전", "오후"];
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const baseMinuteList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const ampmList = baseAmpmList;
  const hourList = createInfiniteList(baseHourList, 16);
  const minuteList = createInfiniteList(baseMinuteList, 20);

  const initialSelected: Time = useMemo(
    () => reservation?.time ?? { ampm: "오전", hour: 6, minute: "00" },
    [reservation]
  );
  const [selected, setSelected] = useState<Time>(initialSelected);

  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  const suppressScrollRef = useRef(true);
  const hourRafRef = useRef<number | null>(null);
  const minuteRafRef = useRef<number | null>(null);
  const ampmDebounceRef = useRef<number | null>(null);
  const lastIdxRef = useRef<{ ampm: number; hour: number; minute: number }>({
    ampm: initialSelected.ampm === "오전" ? 0 : 1,
    hour: Math.max(0, baseHourList.findIndex((h) => Number(h) === initialSelected.hour)),
    minute: Math.max(0, baseMinuteList.findIndex((m) => m === initialSelected.minute)),
  });
  const hourCommitMsRef = useRef(0);
  const minuteCommitMsRef = useRef(0);

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
  function getCenterScroll<T>(list: T[], baseList: T[]): number {
    const cycles = Math.floor(list.length / baseList.length / 2);
    const centerCycleStart = cycles * baseList.length;
    return (centerCycleStart + 1) * itemHeight;
  }

  useLayoutEffect(() => {
    if (!ampmRef.current || !hourRef.current || !minuteRef.current) return;
    suppressScrollRef.current = true;

    const ampmIndex = initialSelected.ampm === "오전" ? 0 : 1;
    setScrollTopInstant(ampmRef, ampmIndex * itemHeight);
    lastIdxRef.current.ampm = ampmIndex;

    const hourIndex = baseHourList.findIndex((h) => Number(h) === initialSelected.hour);
    if (hourIndex !== -1) {
      setScrollTopInstant(hourRef, getCenterScroll(hourList, baseHourList) + hourIndex * itemHeight);
      lastIdxRef.current.hour = hourIndex;
    }

    const minuteIndex = baseMinuteList.findIndex((m) => m === initialSelected.minute);
    if (minuteIndex !== -1) {
      setScrollTopInstant(minuteRef, getCenterScroll(minuteList, baseMinuteList) + minuteIndex * itemHeight);
      lastIdxRef.current.minute = minuteIndex;
    }

    const t = window.setTimeout(() => {
      suppressScrollRef.current = false;
    }, 80);
    return () => window.clearTimeout(t);
  }, [initialSelected.ampm, initialSelected.hour, initialSelected.minute]);

  function handleScroll<T extends string>(
    ref: React.RefObject<HTMLDivElement>,
    key: "ampm" | "hour" | "minute",
    list: T[],
    baseList: T[]
  ) {
    if (!ref.current || suppressScrollRef.current) return;

    if (key === "ampm") {
      const top = ref.current.scrollTop;
      const clamped = Math.max(0, Math.min(itemHeight, top));
      if (ampmDebounceRef.current) window.clearTimeout(ampmDebounceRef.current);
      ampmDebounceRef.current = window.setTimeout(() => {
        const snapped = clamped < itemHeight / 2 ? 0 : itemHeight;
        const newIdx = snapped === 0 ? 0 : 1;
        suppressScrollRef.current = true;
        setScrollTopInstant(ref, snapped);
        suppressScrollRef.current = false;
        if (newIdx !== lastIdxRef.current.ampm) {
          lastIdxRef.current.ampm = newIdx;
          const value = newIdx === 0 ? "오전" : "오후";
          setSelected((prev) => (prev.ampm === value ? prev : { ...prev, ampm: value }));
        }
      }, 80);
      return;
    }

    const rafRef = key === "hour" ? hourRafRef : minuteRafRef;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const work = () => {
      if (!ref.current) return;
      const container = ref.current;
      const centerOffset = container.clientHeight / 2 - itemHeight / 2;
      const index = Math.round((container.scrollTop + centerOffset) / itemHeight) - 2;
      const realIndex = ((index % baseList.length) + baseList.length) % baseList.length;

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
        if (now - hourCommitMsRef.current >= 50 && realIndex !== lastIdxRef.current.hour) {
          lastIdxRef.current.hour = realIndex;
          hourCommitMsRef.current = now;
          setSelected((prev) => ({ ...prev, hour: Number(baseList[realIndex]) }));
        }
      } else {
        if (now - minuteCommitMsRef.current >= 50 && realIndex !== lastIdxRef.current.minute) {
          lastIdxRef.current.minute = realIndex;
          minuteCommitMsRef.current = now;
          setSelected((prev) => ({ ...prev, minute: baseList[realIndex] as string }));
        }
      }
    };

    rafRef.current = requestAnimationFrame(work);
  }

  function renderColumn<T extends string>(
    list: T[],
    baseList: T[],
    key: "ampm" | "hour" | "minute",
    ref: React.RefObject<HTMLDivElement>,
    fontSize: string
  ) {
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
            const isSelected = key === "ampm" ? baseList[realIdx] === selStr : list[realIdx] === selStr;
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
      return `${year}년 ${month}월 ${day}일 (${dayName})`; // ← 연도 추가
    }
    if (selectedDays.length > 0) return `매주 ${selectedDays.join(", ")}`;
    return "요일을 선택하세요";
  }

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
    const now = new Date();
    const dayName = days[now.getDay()];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${dayName})`;
  }

  function handleSave() {
    const newTime = to24h(selected.ampm, selected.hour, selected.minute);
    const newDateLabel = buildDateLabel();

    const saved = localStorage.getItem("reservations");
    const list: ReservationRaw[] = saved ? JSON.parse(saved) : [];

    // ★ 중복 검사
    const hasDup = list.some(
      r => r.controllerId === controllerIdFromState && r.time === newTime && r.dateLabel === newDateLabel
    );
    if (hasDup) {
      setFlash("이미 동일한 예약이 있습니다.");     // 안내
      setTimeout(() => setFlash(""), 2000);          // 2초 뒤 자동 제거
      return;
    }

    const nextId = list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1;
    const newReservation: ReservationRaw = {
      id: nextId,
      controllerId: controllerIdFromState,
      time: newTime,
      dateLabel: newDateLabel,
      isOn: true,
    };

    const updated = [...list, newReservation];
    localStorage.setItem("reservations", JSON.stringify(updated));

    localStorage.setItem("lastControllerId", String(controllerIdFromState));
    navigate("/scheduled-block", { state: { initialControllerId: controllerIdFromState } });
  }

  return (
    <>
      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <div className={styles.scheduledAddBox}>
            <div className={styles.timeBox}>
              <div className={styles.timeSelector}>
                {renderColumn(ampmList, baseAmpmList, "ampm", ampmRef, "28px")}
                {renderColumn(hourList, baseHourList, "hour", hourRef, "45px")}
                <div className={styles.colon}>:</div>
                {renderColumn(minuteList, baseMinuteList, "minute", minuteRef, "45px")}
                <div className={styles.centerHighlight}></div>
              </div>
            </div>

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

            <div className={styles.infoText}>
              <h2>안내사항</h2>
              <p>예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이 정상적으로 진행됩니다.</p>
            </div>

            <div className="btnBox">
              <Button styleType="grayType" onClick={goList}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>

            <CalendarModal
              isOpen={isCalendarOpen}
              initial={initialDate!}
              onCancel={() => setIsCalendarOpen(false)}
              onConfirm={(value) => {
                setSelectedDate(value);
                setSelectedDays([]);
                setIsCalendarOpen(false);
              }}
              showDay
              showMonth
              tab="daily"
              minDate={{
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                day: new Date().getDate(),
              }}
            />


          </div>
        </div>

        {flash && <div className={styles.toast}>{flash}</div>}

      </Main>
      <Footer />
    </>
  );
}
