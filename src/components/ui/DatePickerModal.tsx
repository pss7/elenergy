import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DatePickerModal.module.css";

export type PickerTab = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

interface Props {
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
  showMonth?: boolean; // 기본 규칙 덮어쓰기
  showDay?: boolean;   // 기본 규칙 덮어쓰기
  tab: PickerTab;
  /** 이 날짜 이전은 완전히 제거(리스트에서 제외) */
  minDate?: { year: number; month: number; day: number };
  /** true면 오늘 이후는 표시/선택 불가(상한) */
  limitToToday?: boolean;
}

const ITEM_HEIGHT = 70;

/** ===== 유틸 ===== */
function ymd(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}
function dim(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}
function clampDate(raw: Date, min: Date | null, max: Date | null) {
  const t = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate()).getTime();
  const lo = min ? new Date(min.getFullYear(), min.getMonth(), min.getDate()).getTime() : -Infinity;
  const hi = max ? new Date(max.getFullYear(), max.getMonth(), max.getDate()).getTime() : +Infinity;
  if (t < lo) return new Date(lo);
  if (t > hi) return new Date(hi);
  return raw;
}

export default function DatePickerModal({
  initial,
  onCancel,
  onConfirm,
  tab,
  showMonth: forceShowMonth,
  showDay: forceShowDay,
  minDate,
  limitToToday = false,
}: Props) {
  /** ===== 표시 규칙 ===== */
  const showMonth = forceShowMonth ?? tab !== "yearly";
  const showDay = forceShowDay ?? (tab === "weekly" || tab === "hourly");

  /** ===== 하한/상한 계산 ===== */
  const TODAY = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  // 과거 하한(없으면 null) — 예약차단같이 과거 제거가 필요한 페이지에서 사용
  const MIN: Date | null = useMemo(() => {
    return minDate ? ymd(minDate.year, minDate.month, minDate.day) : null;
  }, [minDate]);

  // 미래 상한(오늘) — 이번 요구사항: 올해 이후/오늘 이후 제거
  const MAX: Date | null = useMemo(() => {
    return limitToToday ? TODAY : null;
  }, [limitToToday, TODAY]);

  /** ===== 초기 선택값: 사용자가 준 initial을 기본으로, 범위를 벗어나면 최소/최대로만 보정 ===== */
  const init = useMemo(() => {
    const raw = ymd(initial.year, initial.month, initial.day);
    const base = clampDate(raw, MIN, MAX);
    return {
      y: base.getFullYear(),
      m: base.getMonth() + 1,
      d: base.getDate(),
    };
  }, [initial, MIN, MAX]);

  /** ===== 선택 상태 ===== */
  const [year, setYear] = useState(init.y);
  const [month, setMonth] = useState(init.m);
  const [day, setDay] = useState(init.d);

  /** ===== 리스트 구성: min~max 범위 안에서만 생성 ===== */
  const YEARS_BEFORE_FALLBACK = 120; // 하한 없을 때 과거로 넉넉히
  const YEARS_AFTER_FALLBACK = 120;  // 상한 없을 때 미래로 넉넉히

  const yearMin = MIN ? MIN.getFullYear() : (MAX ? MAX.getFullYear() - YEARS_BEFORE_FALLBACK : init.y - 60);
  const yearMax = MAX ? MAX.getFullYear() : (MIN ? MIN.getFullYear() + YEARS_AFTER_FALLBACK : init.y + 60);

  const years = useMemo(() => {
    const start = Math.min(yearMin, yearMax);
    const end = Math.max(yearMin, yearMax);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [yearMin, yearMax]);

  const months = useMemo(() => {
    // 하한/상한에 맞춰 월 범위를 제한
    let minM = 1;
    let maxM = 12;
    if (MIN && year === MIN.getFullYear()) minM = MIN.getMonth() + 1;
    if (MAX && year === MAX.getFullYear()) maxM = Math.min(maxM, MAX.getMonth() + 1);
    const len = Math.max(0, maxM - minM + 1);
    return Array.from({ length: len }, (_, i) => minM + i);
  }, [year, MIN, MAX]);

  const days = useMemo(() => {
    // 하한/상한에 맞춰 일 범위를 제한
    const maxDim = dim(year, month);
    let minD = 1;
    let maxD = maxDim;
    if (MIN && year === MIN.getFullYear() && month === MIN.getMonth() + 1) minD = MIN.getDate();
    if (MAX && year === MAX.getFullYear() && month === MAX.getMonth() + 1) maxD = Math.min(maxD, MAX.getDate());
    const len = Math.max(0, maxD - minD + 1);
    return Array.from({ length: len }, (_, i) => minD + i);
  }, [year, month, MIN, MAX]);

  /** ===== 스크롤 refs & 스냅 유틸 ===== */
  const yearRef = useRef<HTMLDivElement | null>(null);
  const monthRef = useRef<HTMLDivElement | null>(null);
  const dayRef = useRef<HTMLDivElement | null>(null);

  function snapTo(ref: React.RefObject<HTMLDivElement | null>, index: number) {
    if (!ref.current) return;
    ref.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: "auto" });
  }
  function nearestIndex(scrollTop: number) {
    return Math.round(scrollTop / ITEM_HEIGHT);
  }

  /** ===== 초기 정렬 ===== */
  useEffect(() => {
    // year
    const yi = Math.max(0, years.indexOf(year));
    snapTo(yearRef, yi);

    // month
    if (showMonth) {
      const mi = Math.max(0, months.indexOf(month));
      snapTo(monthRef, mi);
    }

    // day
    if (showDay) {
      const di = Math.max(0, days.indexOf(day));
      snapTo(dayRef, di);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ===== 연도 변경 시 월/일 보정 ===== */
  useEffect(() => {
    // 월 보정
    if (showMonth) {
      let nextMonth = month;
      if (!months.includes(nextMonth)) {
        // 범위 밖이면 가장 가까운 값으로
        nextMonth = months[0] ?? 1;
      }
      if (nextMonth !== month) setMonth(nextMonth);
      const mi = Math.max(0, months.indexOf(nextMonth));
      snapTo(monthRef, mi);
    }

    // 일 보정
    if (showDay) {
      let nextDay = day;
      if (!days.includes(nextDay)) {
        nextDay = days[0] ?? 1;
      }
      if (nextDay !== day) setDay(nextDay);
      const di = Math.max(0, days.indexOf(nextDay));
      snapTo(dayRef, di);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, months.length, days.length]);

  /** ===== 월 변경 시 일 보정 ===== */
  useEffect(() => {
    if (!showDay) return;
    let nextDay = day;
    if (!days.includes(nextDay)) nextDay = days[0] ?? 1;
    if (nextDay !== day) setDay(nextDay);
    const di = Math.max(0, days.indexOf(nextDay));
    snapTo(dayRef, di);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, days.length]);

  /** ===== 스크롤 핸들러 (스냅) ===== */
  function onYearScroll() {
    if (!yearRef.current) return;
    const idx = nearestIndex(yearRef.current.scrollTop);
    const y = years[Math.max(0, Math.min(years.length - 1, idx))];
    if (y !== year) setYear(y);
  }
  function onMonthScroll() {
    if (!monthRef.current) return;
    const idx = nearestIndex(monthRef.current.scrollTop);
    const m = months[Math.max(0, Math.min(months.length - 1, idx))];
    if (m !== month) setMonth(m);
  }
  function onDayScroll() {
    if (!dayRef.current) return;
    const idx = nearestIndex(dayRef.current.scrollTop);
    const d = days[Math.max(0, Math.min(days.length - 1, idx))];
    if (d !== day) setDay(d);
  }

  /** ===== 완료 ===== */
  function handleConfirm() {
    onConfirm({ year, month: showMonth ? month : 1, day: showDay ? day : 1 });
    onCancel();
  }

  /** ===== 렌더 ===== */
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.dateBox}>
            {year}년{showMonth ? ` ${month}월` : ""}{showDay ? ` ${day}일` : ""}
          </div>
        </div>

        <div className={styles.pickerContainer}>
          {/* Year */}
          <div className={styles.pickerColumn} ref={yearRef} onScroll={onYearScroll}>
            <div className={styles.spacer} />
            {years.map((y) => (
              <div
                key={y}
                className={`${styles.pickerItem} ${y === year ? styles.selected : ""}`}
                style={{ height: ITEM_HEIGHT }}
              >
                {y}년
              </div>
            ))}
            <div className={styles.spacer} />
            <div className={styles.centerHighlight} />
          </div>

          {/* Month */}
          {showMonth && (
            <div className={styles.pickerColumn} ref={monthRef} onScroll={onMonthScroll}>
              <div className={styles.spacer} />
              {months.map((m) => (
                <div
                  key={m}
                  className={`${styles.pickerItem} ${m === month ? styles.selected : ""}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  {m}월
                </div>
              ))}
              <div className={styles.spacer} />
              <div className={styles.centerHighlight} />
            </div>
          )}

          {/* Day */}
          {showDay && (
            <div className={styles.pickerColumn} ref={dayRef} onScroll={onDayScroll}>
              <div className={styles.spacer} />
              {days.map((d) => (
                <div
                  key={d}
                  className={`${styles.pickerItem} ${d === day ? styles.selected : ""}`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  {d}일
                </div>
              ))}
              <div className={styles.spacer} />
              <div className={styles.centerHighlight} />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onCancel}>취소</button>
          <button onClick={handleConfirm}>완료</button>
        </div>
      </div>
    </div>
  );
}
