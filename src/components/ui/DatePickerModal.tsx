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
  limitToToday?: boolean;
}

const ITEM_HEIGHT = 70;

// 유틸
function ymd(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}
function dim(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

export default function DatePickerModal({
  initial,
  onCancel,
  onConfirm,
  tab,
  showMonth: forceShowMonth,
  showDay: forceShowDay,
  minDate,
}: Props) {
  // 표시 규칙
  const showMonth = forceShowMonth ?? tab !== "yearly";
  const showDay = forceShowDay ?? (tab === "weekly" || tab === "hourly");

  // 최소 허용 날짜(없으면 오늘)
  const MIN = useMemo(() => {
    if (minDate) return ymd(minDate.year, minDate.month, minDate.day);
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, [minDate]);

  // 초기값이 과거면 MIN으로 끌어올림
  const init = useMemo(() => {
    const raw = ymd(initial.year, initial.month, initial.day);
    const base = raw < MIN ? MIN : raw;
    return {
      y: base.getFullYear(),
      m: base.getMonth() + 1,
      d: base.getDate(),
    };
  }, [initial, MIN]);

  // 선택 상태
  const [year, setYear] = useState(init.y);
  const [month, setMonth] = useState(init.m);
  const [day, setDay] = useState(init.d);

  // ===== 리스트 구성 (과거 제거 + 미래 연도 허용) =====
  const YEARS_SPAN = 120; // 미래로 120년까지 스크롤 가능 (원하면 늘리세요)
  const years = useMemo(
    () => Array.from({ length: YEARS_SPAN }, (_, i) => MIN.getFullYear() + i),
    [MIN]
  );

  const months = useMemo(() => {
    const minMonth = year === MIN.getFullYear() ? MIN.getMonth() + 1 : 1;
    return Array.from({ length: 12 - (minMonth - 1) }, (_, i) => i + minMonth);
  }, [year, MIN]);

  const days = useMemo(() => {
    const max = dim(year, month);
    const minDay =
      year === MIN.getFullYear() && month === MIN.getMonth() + 1
        ? MIN.getDate()
        : 1;
    return Array.from({ length: max - (minDay - 1) }, (_, i) => i + minDay);
  }, [year, month, MIN]);

  // ===== 스크롤 refs & 스냅 유틸 =====
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

  // 초기 정렬
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

  // 연도 변경 시 월/일 보정
  useEffect(() => {
    // 월 보정
    const minM = year === MIN.getFullYear() ? MIN.getMonth() + 1 : 1;
    if (month < minM) {
      setMonth(minM);
      snapTo(monthRef, 0);
    } else {
      const idx = Math.max(0, months.indexOf(month));
      snapTo(monthRef, idx);
    }
    // 일 보정
    const maxD = dim(year, month);
    const minD =
      year === MIN.getFullYear() && month === MIN.getMonth() + 1 ? MIN.getDate() : 1;
    let target = day;
    if (target < minD) target = minD;
    if (target > maxD) target = maxD;
    setDay(target);
    const di = Math.max(0, days.indexOf(target));
    snapTo(dayRef, di);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // 월 변경 시 일 보정
  useEffect(() => {
    const maxD = dim(year, month);
    const minD =
      year === MIN.getFullYear() && month === MIN.getMonth() + 1 ? MIN.getDate() : 1;
    let target = day;
    if (target < minD) target = minD;
    if (target > maxD) target = maxD;
    if (target !== day) setDay(target);
    const di = Math.max(0, days.indexOf(target));
    snapTo(dayRef, di);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, days.length]);

  // ===== 스크롤 핸들러 (스냅) =====
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

  function handleConfirm() {
    onConfirm({ year, month: showMonth ? month : 1, day: showDay ? day : 1 });
    onCancel();
  }

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
