import { useState, useEffect } from "react";
import styles from "./CalendarModal.module.css";
import DatePickerModal from "./DatePickerModal";

interface Props {
  isOpen: boolean;
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
  showMonth?: boolean;
  showDay?: boolean;
  tab: "daily" | "hourly" | "weekly" | "monthly";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay(); // 0=일
}
const today = new Date();

type Cell = {
  y: number;
  m: number; // 1..12
  d: number; // 1..
  inMonth: boolean; // 현재 달 여부
  isPast: boolean;
};

export default function CalendarModal({
  isOpen,
  initial,
  onCancel,
  onConfirm,
  showMonth = true,
  showDay = true,
  tab,
}: Props) {
  const [selected, setSelected] = useState<{ year: number; month: number; day: number }>({
    ...initial,
    day: initial.day ?? 1,
  });
  const [showPickerModal, setShowPickerModal] = useState(false);

  useEffect(() => {
    setSelected({ ...initial, day: initial.day ?? 1 });
  }, [initial]);

  if (!isOpen) return null;

  function isPastDate(year: number, month: number, day: number) {
    const date = new Date(year, month - 1, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < t;
  }

  // ----- 달력 데이터(6행 x 7열) 만들기: 앞은 이전달, 뒤는 다음달로 채움 -----
  const dimYear = selected.year;
  const dimMonth = selected.month;
  const dimFirstDow = getFirstDayOfWeek(dimYear, dimMonth); // 0=일
  const dimDays = getDaysInMonth(dimYear, dimMonth);

  const prevMonth = dimMonth === 1 ? 12 : dimMonth - 1;
  const prevYear = dimMonth === 1 ? dimYear - 1 : dimYear;
  const nextMonth = dimMonth === 12 ? 1 : dimMonth + 1;
  const nextYear = dimMonth === 12 ? dimYear + 1 : dimYear;
  const prevDays = getDaysInMonth(prevYear, prevMonth);

  const weeks: Cell[][] = [];
  let curDay = 1;      // 현재 달 일자 카운터
  let nextDay = 1;     // 다음 달 일자 카운터

  for (let row = 0; row < 6; row++) {
    const week: Cell[] = [];
    for (let col = 0; col < 7; col++) {
      const index = row * 7 + col; // 0..41
      let cell: Cell;

      if (index < dimFirstDow) {
        // 앞쪽: 이전 달
        const d = prevDays - (dimFirstDow - 1 - index);
        cell = {
          y: prevYear,
          m: prevMonth,
          d,
          inMonth: false,
          isPast: isPastDate(prevYear, prevMonth, d),
        };
      } else if (curDay <= dimDays) {
        // 현재 달
        const d = curDay++;
        cell = {
          y: dimYear,
          m: dimMonth,
          d,
          inMonth: true,
          isPast: isPastDate(dimYear, dimMonth, d),
        };
      } else {
        // 뒤쪽: 다음 달
        const d = nextDay++;
        cell = {
          y: nextYear,
          m: nextMonth,
          d,
          inMonth: false,
          isPast: isPastDate(nextYear, nextMonth, d),
        };
      }

      week.push(cell);
    }
    weeks.push(week);
  }
  // ------------------------------------------------------------------------

  function handleMonthChange(delta: number) {
    let newMonth = selected.month + delta;
    let newYear = selected.year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    setSelected({ year: newYear, month: newMonth, day: 1 });
  }

  function handleDayClick(cell: Cell) {
    // 현재 달 + 과거 아님만 선택 가능
    if (!cell.inMonth || cell.isPast) return;
    setSelected({ year: cell.y, month: cell.m, day: cell.d });
  }

  function handleConfirm() {
    onConfirm(selected);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button onClick={() => handleMonthChange(-1)}>{"<"}</button>
          <button onClick={() => setShowPickerModal(true)} className={styles.btn}>
            {selected.year}년 {selected.month}월
          </button>
          <button onClick={() => handleMonthChange(1)}>{">"}</button>
        </div>

        <table className={styles.calendar}>
          <thead>
            <tr>
              {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                <th
                  key={i}
                  style={{
                    color: i === 0 ? "#C9443F" : i === 6 ? "#406ECC" : "#000",
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row}>
                {week.map((cell, col) => {
                  const isSelected =
                    cell.inMonth &&
                    cell.y === selected.year &&
                    cell.m === selected.month &&
                    cell.d === selected.day;

                  const isWeekend = col === 0 || col === 6;
                  const dimmed = !cell.inMonth || cell.isPast;

                  const isToday =
                    cell.y === today.getFullYear() &&
                    cell.m === today.getMonth() + 1 &&
                    cell.d === today.getDate();

                  const textColor = dimmed
                    ? "#B6B5BA"
                    : isWeekend
                      ? col === 0
                        ? "#C9443F" // 일요일
                        : "#406ECC" // 토요일
                      : "#000";

                  return (
                    <td
                      key={`${cell.y}-${cell.m}-${cell.d}-${col}`}
                      className={[
                        isSelected ? styles.selectedDay : "",
                        // 오늘 날짜 하이라이트 (선택된 경우는 selected 스타일만)
                        isToday && cell.inMonth && !isSelected ? styles.active : "",
                        !cell.inMonth ? styles.outMonthDay : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        color: textColor,
                        cursor: !dimmed && cell.inMonth ? "pointer" : "default",
                      }}
                      onClick={() => handleDayClick(cell)}
                    >
                      {cell.d}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.footer}>
          <button onClick={onCancel}>취소</button>
          <button onClick={handleConfirm}>완료</button>
        </div>
      </div>

      {showPickerModal && (
        <DatePickerModal
          initial={selected}
          onCancel={() => setShowPickerModal(false)}
          onConfirm={(value) => {
            setSelected(value);
            setShowPickerModal(false);
            onConfirm(value);
            onCancel();
          }}
          showMonth={showMonth}
          showDay={showDay}
          tab={tab}
        />
      )}
    </div>
  );
}
