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
}

export default function DatePickerModal(props: Props) {
  const { initial, onCancel, onConfirm, tab } = props;
  const ITEM_HEIGHT = 70;

  // 탭 기준 기본 표시
  const showMonth = props.showMonth ?? tab !== "monthly";
  const showDay   = props.showDay   ?? (tab === "hourly" || tab === "weekly");

  // 연도 목록(순차), 월/일은 무한 리스트
  const years = Array.from({ length: 101 }, (_, i) => 1980 + i);
  const monthCycles = 50;
  const months = Array.from({ length: monthCycles * 12 }, (_, i) => (i % 12) + 1);

  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // months 배열 인덱스
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);     // days 배열 인덱스

  // 현재 선택된 연/월 기준 일수와 days 배열
  const daysInMonth = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();
  const dayCycles = 50;
  const days = Array.from({ length: dayCycles * daysInMonth }, (_, i) => (i % daysInMonth) + 1);

  const yearRef  = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef   = useRef<HTMLDivElement>(null);

  // 사용자가 의도한 "논리적 날짜"를 유지하기 위한 ref (월 바뀔 때 사용)
  const desiredDayRef = useRef(initial.day);

  // 유틸: 무한 리스트 중앙 사이클의 특정 값 인덱스
  function centerIndex(totalLen: number, cycleLen: number, valueIndex0: number) {
    const half = Math.floor(totalLen / 2);
    const base = half - (half % cycleLen);
    return base + valueIndex0; // 0-based
  }

  // ▶ 모달 열릴 때나 initial이 바뀔 때마다 '초기 정렬'을 exact하게 수행
  useEffect(() => {
    // 1) 연도: initial.year 위치로
    const yearIdx = Math.max(0, Math.min(years.length - 1, years.indexOf(initial.year)));
    setSelectedYear(initial.year);
    yearRef.current?.scrollTo({ top: yearIdx * ITEM_HEIGHT, behavior: "auto" });

    // 2) 월: 중앙 사이클 + initial.month
    if (showMonth) {
      const monthIdx = centerIndex(months.length, 12, initial.month - 1);
      setSelectedMonthIndex(monthIdx);
      monthRef.current?.scrollTo({ top: monthIdx * ITEM_HEIGHT, behavior: "auto" });
    } else {
      // 월 숨김이면 1월로 고정된 상태와 동일하게 취급
      setSelectedMonthIndex(0);
    }

    // 3) 일: 현재 연/월 기준 일수 계산 후 중앙 사이클 + initial.day
    desiredDayRef.current = initial.day; // 논리적 날짜 기억
    if (showDay) {
      const dim = new Date(initial.year, initial.month, 0).getDate(); // initial의 월 일수
      const day0 = Math.min(initial.day, dim) - 1;
      const dayIdx = centerIndex(dayCycles * dim, dim, day0);
      setSelectedDayIndex(dayIdx);
      // dayRef는 days 배열이 selectedMonthIndex/selectedYear에 의존하므로 다음 프레임에 스크롤
      requestAnimationFrame(() => {
        dayRef.current?.scrollTo({ top: dayIdx * ITEM_HEIGHT, behavior: "auto" });
      });
    } else {
      setSelectedDayIndex(0);
    }
  }, [initial.year, initial.month, initial.day, showMonth, showDay]);

  // ▶ 연/월 변경 시 “일”을 논리적 날짜 유지(clamp)하며 중앙으로 재정렬
  useEffect(() => {
    if (!showDay || !dayRef.current) return;
    const newDIM = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();
    const desired = Math.min(desiredDayRef.current, newDIM); // 말일 클램프
    const idx = centerIndex(dayCycles * newDIM, newDIM, desired - 1);
    setSelectedDayIndex(idx);
    dayRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
  }, [selectedYear, selectedMonthIndex, showDay]);

  // 스크롤 핸들러
  function handleYearScroll() {
    if (!yearRef.current) return;
    const idx = Math.round(yearRef.current.scrollTop / ITEM_HEIGHT);
    const y = years[Math.max(0, Math.min(years.length - 1, idx))];
    if (y !== selectedYear) setSelectedYear(y);
  }
  function handleMonthScroll() {
    if (!monthRef.current) return;
    const idx = Math.round(monthRef.current.scrollTop / ITEM_HEIGHT);
    if (idx !== selectedMonthIndex) setSelectedMonthIndex(idx);
  }
  function handleDayScroll() {
    if (!dayRef.current) return;
    const idx = Math.round(dayRef.current.scrollTop / ITEM_HEIGHT);
    if (idx !== selectedDayIndex) {
      setSelectedDayIndex(idx);
      // 현재 월 기준 가시 일자 기록(논리적 날짜 업데이트)
      const visible = (idx % daysInMonth) + 1;
      desiredDayRef.current = visible;
    }
  }

  const visibleMonth = (selectedMonthIndex % 12) + 1;
  const visibleDay = (selectedDayIndex % daysInMonth) + 1;

  function handleConfirm() {
    onConfirm({
      year: selectedYear,
      month: showMonth ? visibleMonth : 1,
      day: showDay ? visibleDay : 1,
    });
    onCancel();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 헤더(현재 선택값 표시) */}
        <div className={styles.header}>
          <div className={styles.dateBox}>
            {selectedYear}년
            {showMonth && ` ${visibleMonth}월`}
            {showDay && ` ${visibleDay}일`}
          </div>
        </div>

        {/* 선택기 */}
        <div className={styles.pickerContainer}>
          {/* 년 */}
          <div className={styles.pickerColumn} ref={yearRef} onScroll={handleYearScroll}>
            <div className={styles.spacer}></div>
            {years.map((y) => (
              <div
                key={y}
                className={`${styles.pickerItem} ${y === selectedYear ? styles.selected : ""}`}
              >
                {y}년
              </div>
            ))}
            <div className={styles.spacer}></div>
          </div>

          {/* 월 */}
          {showMonth && (
            <div className={styles.pickerColumn} ref={monthRef} onScroll={handleMonthScroll}>
              <div className={styles.spacer}></div>
              {months.map((m, idx) => (
                <div
                  key={idx}
                  className={`${styles.pickerItem} ${idx === selectedMonthIndex ? styles.selected : ""}`}
                >
                  {m}월
                </div>
              ))}
              <div className={styles.spacer}></div>
            </div>
          )}

          {/* 일 */}
          {showDay && (
            <div className={styles.pickerColumn} ref={dayRef} onScroll={handleDayScroll}>
              <div className={styles.spacer}></div>
              {days.map((d, idx) => (
                <div
                  key={idx}
                  className={`${styles.pickerItem} ${idx === selectedDayIndex ? styles.selected : ""}`}
                >
                  {d}일
                </div>
              ))}
              <div className={styles.spacer}></div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className={styles.footer}>
          <button onClick={onCancel}>취소</button>
          <button onClick={handleConfirm}>완료</button>
        </div>
      </div>
    </div>
  );
}
