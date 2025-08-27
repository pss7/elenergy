import { useEffect, useRef, useState } from "react";
import styles from './DatePickerModal.module.css';

interface Props {
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
}

export default function DatePickerModal(props: Props) {

  const { initial, onCancel, onConfirm } = props;
  const ITEM_HEIGHT = 70;

  const years = Array.from({ length: 101 }, function (_, i) { return 1980 + i; });
  const monthCycles = 50;
  const months = Array.from({ length: monthCycles * 12 }, function (_, i) { return (i % 12) + 1; });

  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const daysInMonth = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();
  const dayCycles = 50;
  const days = Array.from({ length: dayCycles * daysInMonth }, function (_, i) { return (i % daysInMonth) + 1; });

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    const centerYearIndex = Math.floor(years.length / 2);
    const centerMonthIndex = Math.floor(months.length / 2) - (Math.floor(months.length / 2) % 12) + (initial.month - 1);
    const centerDayIndex = Math.floor(days.length / 2) - (Math.floor(days.length / 2) % daysInMonth) + (initial.day - 1);

    yearRef.current?.scrollTo({ top: centerYearIndex * ITEM_HEIGHT, behavior: 'auto' });
    monthRef.current?.scrollTo({ top: centerMonthIndex * ITEM_HEIGHT, behavior: 'auto' });
    dayRef.current?.scrollTo({ top: centerDayIndex * ITEM_HEIGHT, behavior: 'auto' });

    setSelectedYear(years[centerYearIndex]);
    setSelectedMonthIndex(centerMonthIndex);
    setSelectedDayIndex(centerDayIndex);
  }, []);

  useEffect(function () {
    const newDaysInMonth = new Date(selectedYear, (selectedMonthIndex % 12) + 1, 0).getDate();

    let dayIndex = selectedDayIndex;
    if ((selectedDayIndex % newDaysInMonth) + 1 > newDaysInMonth) {
      dayIndex = Math.floor(days.length / 2) - (Math.floor(days.length / 2) % newDaysInMonth) + (newDaysInMonth - 1);
      setSelectedDayIndex(dayIndex);
    }

    dayRef.current?.scrollTo({ top: dayIndex * ITEM_HEIGHT, behavior: 'auto' });
  }, [selectedYear, selectedMonthIndex]);

  function handleYearScroll() {
    if (!yearRef.current) return;
    const scrollTop = yearRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const year = years[index];
    if (year !== selectedYear) {
      setSelectedYear(year);
    }
  }

  function handleMonthScroll() {
    if (!monthRef.current) return;
    const scrollTop = monthRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    setSelectedMonthIndex(index);
  }

  function handleDayScroll() {
    if (!dayRef.current) return;
    const scrollTop = dayRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    setSelectedDayIndex(index);
  }

  const visibleMonth = (selectedMonthIndex % 12) + 1;
  const visibleDay = (selectedDayIndex % daysInMonth) + 1;

function handleConfirm() {
  onConfirm({ year: selectedYear, month: visibleMonth, day: visibleDay });
  onCancel(); // 모달 닫기
}

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* 헤더 */}
        <div className={styles.header}>
          {selectedYear}년 {visibleMonth}월
        </div>

        {/* 선택기 */}
        <div className={styles.pickerContainer}>
          {/* 년도 */}
          <div
            className={styles.pickerColumn}
            ref={yearRef}
            onScroll={handleYearScroll}
          >
            <div className={styles.spacer}></div>
            {years.map(function (year) {
              const isSelected = year === selectedYear;
              return (
                <div
                  key={year}
                  className={`${styles.pickerItem} ${isSelected ? styles.selected : ""}`}
                >
                  {year}년
                </div>
              );
            })}

            <div className={styles.spacer}></div>
          </div>

          {/* 월 */}
          <div
            className={styles.pickerColumn}
            ref={monthRef}
            onScroll={handleMonthScroll}
          >
            <div className={styles.spacer}></div>
            {months.map(function (month, idx) {
              const isSelected = idx === selectedMonthIndex;
              return (
                <div
                  key={idx}
                  className={`${styles.pickerItem} ${isSelected ? styles.selected : ""}`}
                >
                  {month}월
                </div>
              );
            })}
            <div className={styles.spacer}></div>
          </div>

          {/* 일 */}
          <div
            className={styles.pickerColumn}
            ref={dayRef}
            onScroll={handleDayScroll}
          >
            <div className={styles.spacer}></div>
            {days.map(function (day, idx) {
              const isSelected = idx === selectedDayIndex;
              return (
                <div
                  key={idx}
                  className={`${styles.pickerItem} ${isSelected ? styles.selected : ""}`}
                >
                  {day}일
                </div>
              );
            })}
            <div className={styles.spacer}></div>
          </div>
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
