import { useEffect, useRef, useState } from "react";
import styles from './DatePickerModal.module.css';
import type { TabType } from "../../data/AutoBlock";

interface Props {
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
  showMonth?: boolean;
  showDay?: boolean;
  tab: TabType;
  /** ✅ 오늘 이후를 막을지 여부 (기본값 false) */
  limitToToday?: boolean;
}

export default function DatePickerModal(props: Props) {
  const { initial, onCancel, onConfirm, tab, limitToToday = false } = props;
  const ITEM_HEIGHT = 70;

  // ✅ 기본 표시 규칙 변경
  // - yearly: 연도만 (월/일 숨김)
  // - monthly/daily: 연+월 (일 숨김)
  // - weekly: 연+월+일 (주 anchor용)
  const showMonth = props.showMonth ?? tab !== "yearly";
  const showDay   = props.showDay   ?? (tab === "weekly");

  // 오늘 경계
  const TODAY = new Date();
  const TY = TODAY.getFullYear();
  const TM = TODAY.getMonth() + 1;
  const TD = TODAY.getDate();

  // ✅ limitToToday가 true일 때만 미래 클램프
  function clampToToday(y: number, m: number, d: number) {
    if (!limitToToday) return { y, m, d };
    if (y > TY) y = TY;
    if (showMonth && y === TY && m > TM) m = TM;
    if (showDay && y === TY && m === TM && d > TD) d = TD;
    return { y, m, d };
  }

  const years = Array.from({ length: 101 }, (_, i) => 1980 + i);
  const monthCycles = 50;
  const months = Array.from({ length: monthCycles * 12 }, (_, i) => (i % 12) + 1);

  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const daysInMonth = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();
  const dayCycles = 50;
  const days = Array.from({ length: dayCycles * daysInMonth }, (_, i) => (i % daysInMonth) + 1);

  const yearRef  = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef   = useRef<HTMLDivElement>(null);

  const desiredDayRef = useRef(initial.day);

  function centerIndex(totalLen: number, cycleLen: number, valueIndex0: number) {
    const half = Math.floor(totalLen / 2);
    const base = half - (half % cycleLen);
    return base + valueIndex0;
  }
  function snapIndexInSameCycle(currIdx: number, cycleLen: number, value1: number) {
    const cycleStart = Math.floor(currIdx / cycleLen) * cycleLen;
    return cycleStart + (value1 - 1);
  }

  // 초기 정렬 (limitToToday 고려)
  useEffect(() => {
    const init = clampToToday(initial.year, initial.month, initial.day);

    const yearIdx = Math.max(0, Math.min(years.length - 1, years.indexOf(init.y)));
    setSelectedYear(init.y);
    yearRef.current?.scrollTo({ top: yearIdx * ITEM_HEIGHT, behavior: "auto" });

    if (showMonth) {
      const monthIdx = centerIndex(months.length, 12, init.m - 1);
      setSelectedMonthIndex(monthIdx);
      monthRef.current?.scrollTo({ top: monthIdx * ITEM_HEIGHT, behavior: "auto" });
    } else {
      setSelectedMonthIndex(0);
    }

    desiredDayRef.current = init.d;
    if (showDay) {
      const dim = new Date(init.y, init.m, 0).getDate();
      const day0 = Math.min(init.d, dim) - 1;
      const dayIdx = centerIndex(dayCycles * dim, dim, day0);
      setSelectedDayIndex(dayIdx);
      requestAnimationFrame(() => {
        dayRef.current?.scrollTo({ top: dayIdx * ITEM_HEIGHT, behavior: "auto" });
      });
    } else {
      setSelectedDayIndex(0);
    }
  }, [initial.year, initial.month, initial.day, showMonth, showDay, limitToToday]);

  // 연/월 변경 시 일자 재정렬 (limitToToday 고려)
  useEffect(() => {
    if (!showDay || !dayRef.current) return;
    const newDIM = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();

    const maxDayToday =
      limitToToday && selectedYear === TY && ((selectedMonthIndex % 12) + 1) === TM
        ? Math.min(newDIM, TD)
        : newDIM;

    const desired = Math.min(desiredDayRef.current, maxDayToday);
    const idx = centerIndex(dayCycles * newDIM, newDIM, desired - 1);
    setSelectedDayIndex(idx);
    dayRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
  }, [selectedYear, selectedMonthIndex, showDay, limitToToday]);

  // 스크롤 핸들러들: limitToToday일 때만 미래 스냅
  function handleYearScroll() {
    if (!yearRef.current) return;
    let idx = Math.round(yearRef.current.scrollTop / ITEM_HEIGHT);
    let y = years[Math.max(0, Math.min(years.length - 1, idx))];

    if (limitToToday && y > TY) {
      y = TY;
      idx = years.indexOf(TY);
      yearRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
    }
    if (y !== selectedYear) setSelectedYear(y);
  }

  function handleMonthScroll() {
    if (!monthRef.current) return;
    let idx = Math.round(monthRef.current.scrollTop / ITEM_HEIGHT);
    let m1 = (idx % 12) + 1;

    if (limitToToday && selectedYear === TY && m1 > TM) {
      idx = snapIndexInSameCycle(idx, 12, TM);
      monthRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
      m1 = TM;
    }
    if (idx !== selectedMonthIndex) setSelectedMonthIndex(idx);
  }

  function handleDayScroll() {
    if (!dayRef.current) return;
    let idx = Math.round(dayRef.current.scrollTop / ITEM_HEIGHT);
    const dim = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();
    let visible = (idx % dim) + 1;

    if (
      limitToToday &&
      showDay &&
      selectedYear === TY &&
      ((selectedMonthIndex % 12) + 1) === TM &&
      visible > TD
    ) {
      const allowed = Math.min(TD, dim);
      idx = snapIndexInSameCycle(idx, dim, allowed);
      dayRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
      visible = allowed;
    }

    if (idx !== selectedDayIndex) setSelectedDayIndex(idx);
    desiredDayRef.current = visible;
  }

  const visibleMonth = (selectedMonthIndex % 12) + 1;
  const visibleDay = (selectedDayIndex % daysInMonth) + 1;

  function handleConfirm() {
    const c = clampToToday(
      selectedYear,
      showMonth ? visibleMonth : 1,
      showDay ? visibleDay : 1
    );
    onConfirm({ year: c.y, month: c.m, day: c.d });
    onCancel();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.dateBox}>
            {selectedYear}년
            {showMonth && ` ${visibleMonth}월`}
            {showDay && ` ${visibleDay}일`}
          </div>
        </div>

        <div className={styles.pickerContainer}>
          <div className={styles.pickerColumn} ref={yearRef} onScroll={handleYearScroll}>
            <div className={styles.spacer}></div>
            {years.map((y) => (
              <div key={y} className={`${styles.pickerItem} ${y === selectedYear ? styles.selected : ""}`}>
                {y}년
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          {showMonth && (
            <div className={styles.pickerColumn} ref={monthRef} onScroll={handleMonthScroll}>
              <div className={styles.spacer}></div>
              {months.map((m, idx) => (
                <div key={idx} className={`${styles.pickerItem} ${idx === selectedMonthIndex ? styles.selected : ""}`}>
                  {m}월
                </div>
              ))}
              <div className={styles.spacer}></div>
            </div>
          )}

          {showDay && (
            <div className={styles.pickerColumn} ref={dayRef} onScroll={handleDayScroll}>
              <div className={styles.spacer}></div>
              {days.map((d, idx) => (
                <div key={idx} className={`${styles.pickerItem} ${idx === selectedDayIndex ? styles.selected : ""}`}>
                  {d}일
                </div>
              ))}
              <div className={styles.spacer}></div>
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
