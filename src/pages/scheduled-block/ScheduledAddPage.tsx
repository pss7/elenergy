// src/pages/scheduled-block/ScheduledAddPage.tsx
import React, { useRef, useState, useLayoutEffect } from "react";
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

// 리스트 반복 유틸
function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
  return Array.from({ length: repeat }, () => items).flat();
}

// 상수(재렌더마다 새로 안 만들도록 모듈 레벨에 둠)
const ITEM_HEIGHT = 66;
const BASE_HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const HOUR_LIST = createInfiniteList(BASE_HOURS, 16);
const MINUTE_LIST = createInfiniteList(BASE_MINUTES, 20);
const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

// 라벨 → 초기 날짜
function parseInitialDate(label?: string): SelectedDate {
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
}

// 즉시 스크롤 위치 설정
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

// 가운데 보정 기준값
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

// 시간 선택 UI를 메모ized 컴포넌트로 분리(요일 클릭 시 재렌더 방지)
const TimePicker = React.memo(function TimePicker(props: {
  selected: Time;
  onChange: (next: Time) => void;
}) {
  const { selected, onChange } = props;
  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  const suppressScrollRef = useRef(true);
  const hourRafRef = useRef<number | null>(null);
  const minuteRafRef = useRef<number | null>(null);
  const ampmDebounceRef = useRef<number | null>(null);
  const lastIdxRef = useRef<{ ampm: number; hour: number; minute: number }>({
    ampm: selected.ampm === "오전" ? 0 : 1,
    hour: Math.max(0, BASE_HOURS.findIndex((h) => Number(h) === selected.hour)),
    minute: Math.max(0, BASE_MINUTES.findIndex((m) => m === selected.minute)),
  });
  const hourCommitMsRef = useRef(0);
  const minuteCommitMsRef = useRef(0);

  useLayoutEffect(() => {
    if (!ampmRef.current || !hourRef.current || !minuteRef.current) return;
    suppressScrollRef.current = true;

    const ampmIndex = selected.ampm === "오전" ? 0 : 1;
    setScrollTopInstant(ampmRef, ampmIndex * ITEM_HEIGHT);
    lastIdxRef.current.ampm = ampmIndex;

    const hourIndex = BASE_HOURS.findIndex((h) => Number(h) === selected.hour);
    if (hourIndex !== -1) {
      setScrollTopInstant(hourRef, getCenterScroll(HOUR_LIST, BASE_HOURS, ITEM_HEIGHT) + hourIndex * ITEM_HEIGHT);
      lastIdxRef.current.hour = hourIndex;
    }

    const minuteIndex = BASE_MINUTES.findIndex((m) => m === selected.minute);
    if (minuteIndex !== -1) {
      setScrollTopInstant(minuteRef, getCenterScroll(MINUTE_LIST, BASE_MINUTES, ITEM_HEIGHT) + minuteIndex * ITEM_HEIGHT);
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
      const clamped = Math.max(0, Math.min(ITEM_HEIGHT, top));
      if (ampmDebounceRef.current) window.clearTimeout(ampmDebounceRef.current);
      ampmDebounceRef.current = window.setTimeout(() => {
        const snapped = clamped < ITEM_HEIGHT / 2 ? 0 : ITEM_HEIGHT;
        const newIdx = snapped === 0 ? 0 : 1;
        suppressScrollRef.current = true;
        setScrollTopInstant(ref, snapped);
        suppressScrollRef.current = false;
        if (newIdx !== lastIdxRef.current.ampm) {
          lastIdxRef.current.ampm = newIdx;
          const value = newIdx === 0 ? "오전" : "오후";
          onChange({ ...selected, ampm: value });
        }
      }, 80);
      return;
    }

    const rafRef = key === "hour" ? hourRafRef : minuteRafRef;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const work = () => {
      if (!ref.current) return;
      const container = ref.current;
      const centerOffset = container.clientHeight / 2 - ITEM_HEIGHT / 2;
      const index = Math.round((container.scrollTop + centerOffset) / ITEM_HEIGHT) - 2;
      const realIndex = ((index % baseList.length) + baseList.length) % baseList.length;

      const low = ITEM_HEIGHT * 3;
      const high = (list.length - 4) * ITEM_HEIGHT;
      if (container.scrollTop < low || container.scrollTop > high) {
        suppressScrollRef.current = true;
        const selIndex =
          key === "hour"
            ? BASE_HOURS.findIndex((h) => Number(h) === selected.hour)
            : BASE_MINUTES.findIndex((m) => m === selected.minute);
        setScrollTopInstant(
          ref,
          getCenterScroll(list, baseList, ITEM_HEIGHT) + (selIndex >= 0 ? selIndex : 0) * ITEM_HEIGHT
        );
        suppressScrollRef.current = false;
      }

      const now = performance.now();
      if (key === "hour") {
        if (now - hourCommitMsRef.current >= 50 && realIndex !== lastIdxRef.current.hour) {
          lastIdxRef.current.hour = realIndex;
          hourCommitMsRef.current = now;
          onChange({ ...selected, hour: Number(baseList[realIndex]) });
        }
      } else {
        if (now - minuteCommitMsRef.current >= 50 && realIndex !== lastIdxRef.current.minute) {
          lastIdxRef.current.minute = realIndex;
          minuteCommitMsRef.current = now;
          onChange({ ...selected, minute: baseList[realIndex] as string });
        }
      }
    };

    rafRef.current = requestAnimationFrame(work);
  }

  return (
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
                    height: ITEM_HEIGHT,
                    lineHeight: `${ITEM_HEIGHT}px`,
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
          onScroll={() => handleScroll(hourRef, "hour", HOUR_LIST, BASE_HOURS)}
          style={{ scrollBehavior: "smooth" }}
        >
          <ul>
            {["", "", ...HOUR_LIST, "", ""].map((item, idx) => {
              const realIdx = idx - 2;
              const isSelected = HOUR_LIST[realIdx] === String(selected.hour);
              return (
                <li
                  key={`hour-${idx}`}
                  style={{
                    color: isSelected ? "#000" : "#aaa",
                    fontWeight: isSelected ? "500" : "normal",
                    fontSize: "45px",
                    textAlign: "center",
                    height: ITEM_HEIGHT,
                    lineHeight: `${ITEM_HEIGHT}px`,
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
          onScroll={() => handleScroll(minuteRef, "minute", MINUTE_LIST, BASE_MINUTES)}
          style={{ scrollBehavior: "smooth" }}
        >
          <ul>
            {["", "", ...MINUTE_LIST, "", ""].map((item, idx) => {
              const realIdx = idx - 2;
              const isSelected = MINUTE_LIST[realIdx] === selected.minute;
              return (
                <li
                  key={`minute-${idx}`}
                  style={{
                    color: isSelected ? "#000" : "#aaa",
                    fontWeight: isSelected ? "500" : "normal",
                    fontSize: "45px",
                    textAlign: "center",
                    height: ITEM_HEIGHT,
                    lineHeight: `${ITEM_HEIGHT}px`,
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
  );
}, (prev, next) => (
  prev.selected.ampm === next.selected.ampm &&
  prev.selected.hour === next.selected.hour &&
  prev.selected.minute === next.selected.minute
));

export default function ScheduledAddPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { controllers } = useControllerData();

  const reservation = location.state?.reservation as ReservationState | undefined;
  const controllerIdFromState: number =
    (location.state as any)?.controllerId ?? reservation?.controllerId ?? 1;

  const targetCtrl = controllers.find((c) => c.id === controllerIdFromState);

  const [selected, setSelected] = useState<Time>(() => reservation?.time ?? { ampm: "오전", hour: 6, minute: "00" });
  const days = DAYS;
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(() => parseInitialDate(reservation?.dateLabel));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [flash, setFlash] = useState("");

  function buildDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = days[dateObj.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length > 0) return `매일 ${selectedDays.join(", ")}`;
    const now = new Date();
    const dayName = days[now.getDay()];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${dayName})`;
  }

  function getSelectedDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = days[dateObj.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayName})`;
    }
    if (selectedDays.length > 0) return `매일 ${selectedDays.join(", ")}`;
    return "요일을 선택하세요";
  }

  function handleDayClick(day: string) {
    setSelectedDate(null);
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function goList() {
    localStorage.setItem("lastControllerId", String(controllerIdFromState));
    navigate("/scheduled-block", { state: { initialControllerId: controllerIdFromState } });
  }

  function handleSave() {
    const newTime = to24h(selected.ampm, selected.hour, selected.minute);
    const newDateLabel = buildDateLabel();

    const saved = localStorage.getItem("reservations");
    const list: ReservationRaw[] = saved ? JSON.parse(saved) : [];

    const hasDup = list.some(
      (r) => r.controllerId === controllerIdFromState && r.time === newTime && r.dateLabel === newDateLabel
    );
    if (hasDup) {
      setFlash("동일한 예약이 있습니다.");
      setTimeout(() => setFlash(""), 2000);
      return;
    }

    const nextId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
    const newReservation: ReservationRaw = {
      id: nextId,
      controllerId: controllerIdFromState,
      time: newTime,
      dateLabel: newDateLabel,
      isOn: true,
    };

    const updated = [...list, newReservation];
    localStorage.setItem("reservations", JSON.stringify(updated));

    if (targetCtrl) {
      logAlarm({
        type: "예약제어",
        controller: targetCtrl.title,
        status: "ON",
      });
    }

    localStorage.setItem("lastControllerId", String(controllerIdFromState));
    navigate("/scheduled-block", { state: { initialControllerId: controllerIdFromState } });
  }

  return (
    <>
      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <div className={styles.scheduledAddBox}>
            {/* 시간 선택: 메모ized 컴포넌트로 렌더 비용 최소화 */}
            <TimePicker selected={selected} onChange={setSelected} />

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
              initial={selectedDate!}
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

        {flash && <div className={styles.toast}>
          <span>{flash}</span>
        </div>}
      </Main>
      <Footer />
    </>
  );
}
