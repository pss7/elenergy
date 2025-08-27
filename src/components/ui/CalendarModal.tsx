import { useState, useEffect } from "react";
import styles from './CalendarModal.module.css';
import DatePickerModal from "./DatePickerModal";

interface Props {
  isOpen: boolean;
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
  showMonth?: boolean;
  showDay?: boolean;
  tab: "daily" | "hourly" | "weekly" | "monthly";  // 필수 prop으로 추가
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

const today = new Date();

export default function CalendarModal({
  isOpen,
  initial,
  onCancel,
  onConfirm,
  showMonth = true,
  showDay = true,
  tab,
}: Props) {
  const [selected, setSelected] = useState<{ year: number; month: number; day: number }>({ ...initial, day: 1 });

  const [showPickerModal, setShowPickerModal] = useState(false);

  useEffect(function () {
    setSelected({ ...initial, day: 1 });
  }, [initial]);

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(selected.year, selected.month);
  const firstDayOfWeek = getFirstDayOfWeek(selected.year, selected.month);

  const weeks: (number | null)[][] = [];
  let dayCounter = 1 - firstDayOfWeek;

  for (let i = 0; i < 6; i++) {
    const week: (number | null)[] = [];
    for (let j = 0; j < 7; j++) {
      if (dayCounter < 1 || dayCounter > daysInMonth) {
        week.push(null);
      } else {
        week.push(dayCounter);
      }
      dayCounter++;
    }
    weeks.push(week);
  }

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

  function isPastDate(year: number, month: number, day: number) {
    const date = new Date(year, month - 1, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function handleDayClick(day: number | null) {
    if (!day) return;
    setSelected(function (s) {
      return { ...s, day };
    });
  }

  function handleConfirm() {
    onConfirm(selected);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button onClick={function () { handleMonthChange(-1); }}>{"<"}</button>
          <button onClick={() => setShowPickerModal(true)}>
            {selected.year}년 {selected.month}월
          </button>
          <button onClick={function () { handleMonthChange(1); }}>{">"}</button>
        </div>

        <table className={styles.calendar}>
          <thead>
            <tr>
              {["일", "월", "화", "수", "목", "금", "토"].map(function (day, i) {
                return (
                  <th
                    key={i}
                    style={{
                      color: i === 0 ? "#C9443F" : i === 6 ? "#406ECC" : "#000",
                    }}
                  >
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {weeks.map(function (week, i) {
              return (
                <tr key={i}>
                  {week.map(function (day, idx) {
                    const isSelected = day === selected.day;
                    const isEmpty = day === null;
                    const isPast = day && isPastDate(selected.year, selected.month, day);

                    return (
                      <td
                        key={idx}
                        className={`
                          ${isSelected ? styles.selectedDay : ""}
                          ${isEmpty ? styles.emptyDay : ""}
                        `}
                        style={{
                          color: isEmpty || isPast ? "#B6B5BA" : "#000",
                          cursor: isEmpty ? "default" : "pointer",
                        }}
                        onClick={function () {
                          handleDayClick(day);
                        }}
                      >
                        {day ?? ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
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
          tab={tab}  // CalendarModal의 tab prop 전달
        />
      )}

    </div>


  );
}
