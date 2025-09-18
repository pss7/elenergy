// src/pages/scheduled-block/ScheduledEditPage.tsx
import { useRef, useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import type { Reservation as ReservationRaw } from "../../data/ScheduledBlockings";
import Footer from "../../components/layout/Footer";
import { useControllerData } from "../../contexts/ControllerContext";
import { logAlarm } from "../../utils/logAlarm";

type Time = { ampm: "오전" | "오후"; hour: number; minute: string };
type ReservationState = Omit<ReservationRaw, "time"> & { time: Time };
type SelectedDate = { year: number; month: number; day: number } | null;

// 라벨 → 초기 날짜(null = 반복 선택 의미)
function parseInitialDate(label?: string): SelectedDate {
  if (!label) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  const trimmed = label.trim();
  if (/^매일/.test(trimmed) || /^매주/.test(trimmed)) {
    return null;
  }
  let m = trimmed.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    const [, y, mo, d] = m.map(Number);
    return { year: y, month: mo, day: d };
  }
  m = trimmed.match(/^(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    const [, mo, d] = m.map(Number);
    const now = new Date();
    return { year: now.getFullYear(), month: mo, day: d };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// 리스트 반복 생성을 위한 유틸
function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
  return Array.from({ length: repeat }, () => items).flat();
}

// 스크롤 위치 즉시 설정
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

// 가운데로 보정하기 위한 기준 계산
function getCenterScroll<T>(list: T[], baseList: T[], itemHeight: number): number {
  const cycles = Math.floor(list.length / baseList.length / 2);
  const centerCycleStart = cycles * baseList.length;
  return (centerCycleStart + 1) * itemHeight;
}

// 12시간 → "HH:MM"
function to24h(ampm: "오전" | "오후", hour12: number, minute: string): string {
  let h = hour12 % 12;
  if (ampm === "오후") h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

export default function ScheduledEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reservation = location.state?.reservation as ReservationState | undefined;

  const { controllers } = useControllerData();

  const controllerId: number =
    reservation?.controllerId ??
    (location.state as any)?.controllerId ??
    (location.state as any)?.initialControllerId ??
    1;

  const targetCtrl = controllers.find((c) => c.id === controllerId);

  const itemHeight = 66;
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const baseMinuteList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const hourList = createInfiniteList(baseHourList, 16);
  const minuteList = createInfiniteList(baseMinuteList, 20);

  const [selected, setSelected] = useState<Time>(() => reservation?.time ?? { ampm: "오전", hour: 6, minute: "00" });
  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  const suppressScrollRef = useRef(true);
  const hourRafRef = useRef<number | null>(null);
  const minuteRafRef = useRef<number | null>(null);
  const ampmDebounceRef = useRef<number | null>(null);
  const lastIdxRef = useRef<{ ampm: number; hour: number; minute: number }>({
    ampm: selected.ampm === "오전" ? 0 : 1,
    hour: Math.max(0, baseHourList.findIndex((h) => Number(h) === selected.hour)),
    minute: Math.max(0, baseMinuteList.findIndex((m) => m === selected.minute)),
  });
  const hourCommitMsRef = useRef(0);
  const minuteCommitMsRef = useRef(0);

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;

  // 🔽 라벨에서 반복 요일 초기화 (inline)
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const l = reservation?.dateLabel?.trim() ?? "";
    if (l.startsWith("매일")) {
      const m = l.match(/^매일\s+([일월화수목금토](?:\s*,\s*[일월화수목금토])*)/);
      return m ? m[1].split(",").map(s => s.trim()) : ["일","월","화","수","목","금","토"];
    }
    if (l.startsWith("매주")) {
      const m = l.match(/^매주\s+([일월화수목금토](?:\s*,\s*[일월화수목금토])*)/);
      return m ? m[1].split(",").map(s => s.trim()) : [];
    }
    return [];
  });

  // 🔽 라벨 → 날짜 (매일/매주면 null)
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(() => parseInitialDate(reservation?.dateLabel));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useLayoutEffect(() => {
    if (!ampmRef.current || !hourRef.current || !minuteRef.current) return;
    suppressScrollRef.current = true;

    const ampmIndex = selected.ampm === "오전" ? 0 : 1;
    setScrollTopInstant(ampmRef, ampmIndex * itemHeight);
    lastIdxRef.current.ampm = ampmIndex;

    const hourIndex = baseHourList.findIndex((h) => Number(h) === selected.hour);
    if (hourIndex !== -1) {
      setScrollTopInstant(hourRef, getCenterScroll(hourList, baseHourList, itemHeight) + hourIndex * itemHeight);
      lastIdxRef.current.hour = hourIndex;
    }

    const minuteIndex = baseMinuteList.findIndex((m) => m === selected.minute);
    if (minuteIndex !== -1) {
      setScrollTopInstant(minuteRef, getCenterScroll(minuteList, baseMinuteList, itemHeight) + minuteIndex * itemHeight);
      lastIdxRef.current.minute = minuteIndex;
    }

    const t = window.setTimeout(() => {
      suppressScrollRef.current = false;
    }, 80);
    return () => window.clearTimeout(t);
  }, [selected.ampm, selected.hour, selected.minute]);

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
          getCenterScroll(list, baseList, itemHeight) + (selIndex >= 0 ? selIndex : 0) * itemHeight
        );
        suppressScrollRef.current = false;
      }

      const now = performance.now();
      if (key === "hour") {
        if (lastIdxRef.current.hour !== realIndex && now - hourCommitMsRef.current >= 50) {
          lastIdxRef.current.hour = realIndex;
          hourCommitMsRef.current = now;
          const val = baseList[realIndex];
          setSelected((prev) => ({ ...prev, hour: Number(val) }));
        }
      } else {
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

  function buildDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length === 7) return "매일"; // ✅ 7개 모두
    if (selectedDays.length > 0) return `매일 ${selectedDays.join(", ")}`;
    return reservation?.dateLabel ?? "";
  }

  function getSelectedDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = ["일", "월", "화", "수", "목", "금", "토"][dateObj.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length === 7) return "매일"; // ✅
    if (selectedDays.length > 0) return `매일 ${selectedDays.join(", ")}`;
    return "요일을 선택하세요";
  }

  function goList() {
    localStorage.setItem("lastControllerId", String(controllerId));
    navigate("/scheduled-block", { state: { initialControllerId: controllerId } });
  }

  function handleSave() {
    if (!reservation) return goList();

    const newTime = to24h(selected.ampm, selected.hour, selected.minute);
    const newDateLabel = buildDateLabel();

    const saved = localStorage.getItem("reservations");
    const list: ReservationRaw[] = saved ? JSON.parse(saved) : [];

    const updated = list.map((item) =>
      item.id === reservation.id ? { ...item, time: newTime, dateLabel: newDateLabel } : item
    );

    localStorage.setItem("reservations", JSON.stringify(updated));

    if (targetCtrl) {
      logAlarm({
        type: "예약제어",
        controller: targetCtrl.title,
        status: "ON",
      });
    }

    goList();
  }

  return (
    <>
      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <div className={styles.scheduledAddBox}>
            <div className={styles.timeBox}>
              <div className={styles.timeSelector}>
                <div
                  className={`${styles.column} ${styles.ampmColumn}`}
                  ref={ampmRef}
                  onScroll={() => handleScroll(ampmRef, "ampm", ["오전", "오후"], ["오전", "오후"])}
                  style={{ scrollBehavior: "smooth" }}
                >
                  <ul>
                    {["", "오전", "오후", ""].map((item, idx) => {
                      const realIdx = idx - 1;
                      const isSelected = ["오전", "오후"][realIdx] === selected.ampm;
                      return (
                        <li
                          key={`ampm-${idx}`}
                          style={{
                            color: isSelected ? "#000" : "#aaa",
                            fontWeight: isSelected ? "500" : "normal",
                            fontSize: "28px",
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

                <div
                  className={styles.column}
                  ref={hourRef}
                  onScroll={() => handleScroll(hourRef, "hour", hourList, baseHourList)}
                  style={{ scrollBehavior: "smooth" }}
                >
                  <ul>
                    {["", "", ...hourList, "", ""].map((item, idx) => {
                      const realIdx = idx - 2;
                      const isSelected = hourList[realIdx] === String(selected.hour);
                      return (
                        <li
                          key={`hour-${idx}`}
                          style={{
                            color: isSelected ? "#000" : "#aaa",
                            fontWeight: isSelected ? "500" : "normal",
                            fontSize: "45px",
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

                <div className={styles.colon}>:</div>

                <div
                  className={styles.column}
                  ref={minuteRef}
                  onScroll={() => handleScroll(minuteRef, "minute", minuteList, baseMinuteList)}
                  style={{ scrollBehavior: "smooth" }}
                >
                  <ul>
                    {["", "", ...minuteList, "", ""].map((item, idx) => {
                      const realIdx = idx - 2;
                      const isSelected = minuteList[realIdx] === selected.minute;
                      return (
                        <li
                          key={`minute-${idx}`}
                          style={{
                            color: isSelected ? "#000" : "#aaa",
                            fontWeight: isSelected ? "500" : "normal",
                            fontSize: "45px",
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
                      <button
                        className={styles.btn}
                        onClick={() => {
                          setSelectedDate(null);
                          setSelectedDays((prev) =>
                            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                          );
                        }}
                      >
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
              <p>
                예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이
                정상적으로 진행됩니다.
              </p>
            </div>

            <div className="btnBox">
              <Button styleType="grayType" onClick={goList}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>

            <CalendarModal
              isOpen={isCalendarOpen}

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
      </Main>

      <Footer />
    </>
  );
}
