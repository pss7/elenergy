import { useEffect, useMemo, useState } from "react";
import styles from "./CalendarModal.module.css";
import DatePickerModal, { type PickerTab } from "./DatePickerModal";

/** ===== Types ===== */
interface Props {
  isOpen: boolean;
  initial: { year: number; month: number; day: number };
  onCancel: () => void;
  onConfirm: (value: { year: number; month: number; day: number }) => void;
  showMonth?: boolean;
  showDay?: boolean;
  tab: PickerTab;
  /** 이 날짜 이전은 선택 불가(표시는 하되, 클릭 안됨) */
  minDate?: { year: number; month: number; day: number };
}

type Cell = {
  y: number;     // 4자리 연
  m: number;     // 1..12
  d: number;     // 1..
  inMonth: boolean; // 현재 "보이는 달" 여부
  isPast: boolean;  // minDate 이전 여부
};

/** ===== Utils ===== */
function ymd(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}
function cmp(a: Date, b: Date) {
  // 시분초 제거하고 비교 (YYYY-MM-DD 기준)
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return A - B;
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDow(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay(); // 0=Sun
}

export default function CalendarModal({
  isOpen,
  initial,
  onCancel,
  onConfirm,
  showMonth = true,
  showDay = true,
  tab,
  minDate,
}: Props) {
  // 최소 허용 날짜(없으면 오늘)
  const MIN = useMemo(() => {
    if (minDate) return ymd(minDate.year, minDate.month, minDate.day);
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, [minDate]);

  // 초기 선택값: 과거면 MIN으로 끌어올림
  const initialFixed = useMemo(() => {
    const raw = ymd(initial.year, initial.month, initial.day ?? 1);
    const base = cmp(raw, MIN) < 0 ? MIN : raw;
    return {
      year: base.getFullYear(),
      month: base.getMonth() + 1,
      day: base.getDate(),
    };
  }, [initial, MIN]);

  // ✅ 선택된 날짜(고정)
  const [selected, setSelected] = useState(initialFixed);
  // ✅ 화면에 "보이는 달"
  const [viewYear, setViewYear] = useState(initialFixed.year);
  const [viewMonth, setViewMonth] = useState(initialFixed.month);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 외부 initial 변경 시 반영
  useEffect(() => {
    setSelected(initialFixed);
    setViewYear(initialFixed.year);
    setViewMonth(initialFixed.month);
  }, [initialFixed]);

  if (!isOpen) return null;

  /** ===== 캘린더(보이는 달 기준) ===== */
  const dimYear = viewYear;
  const dimMonth = viewMonth;
  const dimFirstDow = getFirstDow(dimYear, dimMonth);
  const dimDays = getDaysInMonth(dimYear, dimMonth);

  const prevMonth = dimMonth === 1 ? 12 : dimMonth - 1;
  const prevYear = dimMonth === 1 ? dimYear - 1 : dimYear;
  const nextMonth = dimMonth === 12 ? 1 : dimMonth + 1;
  const nextYear = dimMonth === 12 ? dimYear + 1 : dimYear;
  const prevDays = getDaysInMonth(prevYear, prevMonth);

  const weeks: Cell[][] = [];
  let curDay = 1;
  let nextDay = 1;

  for (let row = 0; row < 6; row++) {
    const week: Cell[] = [];
    for (let col = 0; col < 7; col++) {
      const index = row * 7 + col;
      let cell: Cell;

      if (index < dimFirstDow) {
        const d = prevDays - (dimFirstDow - 1 - index);
        const dt = ymd(prevYear, prevMonth, d);
        cell = {
          y: prevYear,
          m: prevMonth,
          d,
          inMonth: false, // 보이는 달 아님
          isPast: cmp(dt, MIN) < 0,
        };
      } else if (curDay <= dimDays) {
        const d = curDay++;
        const dt = ymd(dimYear, dimMonth, d);
        cell = {
          y: dimYear,
          m: dimMonth,
          d,
          inMonth: true,  // 보이는 달
          isPast: cmp(dt, MIN) < 0,
        };
      } else {
        const d = nextDay++;
        const dt = ymd(nextYear, nextMonth, d);
        cell = {
          y: nextYear,
          m: nextMonth,
          d,
          inMonth: false, // 보이는 달 아님
          isPast: cmp(dt, MIN) < 0,
        };
      }

      week.push(cell);
    }
    weeks.push(week);
  }

  /** ===== 월 이동(보기만 바꿈) ===== */
  function handleMonthForward() {
    let y = viewYear;
    let m = viewMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1; // ✅ 다음 해로
    }
    // 선택일자(selected)는 건드리지 않음!
    setViewYear(y);
    setViewMonth(m);
  }

  /** ===== 날짜 클릭(선택 변경) ===== */
  function handleDayClick(cell: Cell) {
    if (cell.isPast) return; // 과거 클릭 불가
    setSelected({ year: cell.y, month: cell.m, day: cell.d });
    // 다른 달 셀을 클릭했으면, 그 달로 화면 이동
    if (!cell.inMonth) {
      setViewYear(cell.y);
      setViewMonth(cell.m);
    }
  }

  /** ===== 확인 ===== */
  function handleConfirm() {
    onConfirm(selected);
  }

  /** ===== Helpers ===== */
  const today = new Date();
  const isToday = (y: number, m: number, d: number) =>
    y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate();

  /** ===== Render ===== */
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 헤더: 타이틀(보이는 달), 오른쪽 '>' */}
        <div className={styles.header}>
          <button onClick={() => setIsPickerOpen(true)} className={styles.btn}>
            {viewYear}년 {viewMonth}월
          </button>
          <button onClick={handleMonthForward} className={styles.nextBtn}>
            {">"}
          </button>
        </div>

        <div className={styles.calendarWrap}>
          <table className={styles.calendar}>
            <thead>
              <tr>
                {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                  <th
                    key={i}
                    style={{ color: i === 0 ? "#C9443F" : i === 6 ? "#406ECC" : "#000" }}
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
                    // ✅ 선택 하이라이트: cell이 선택된 날짜와 정확히 같을 때만
                    const isSelected =
                      cell.y === selected.year &&
                      cell.m === selected.month &&
                      cell.d === selected.day;

                    const isWeekend = col === 0 || col === 6;
                    const textColor = cell.isPast
                      ? "#B6B5BA"
                      : isWeekend
                        ? col === 0
                          ? "#C9443F"
                          : "#406ECC"
                        : "#000";

                    return (
                      <td
                        key={`${row}-${col}`}
                        className={[
                          isSelected ? styles.selectedDay : "",
                          isToday(cell.y, cell.m, cell.d) && cell.inMonth && !isSelected
                            ? styles.active
                            : "",
                          !cell.inMonth ? styles.outMonthDay : "",
                          cell.isPast ? styles.disabledDay : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{
                          color: textColor,
                          cursor: cell.isPast ? "default" : "pointer",
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
        </div>

        <div className={styles.footer}>
          <button onClick={onCancel}>취소</button>
          <button onClick={handleConfirm}>완료</button>
        </div>
      </div>

      {isPickerOpen && (
        <DatePickerModal
          initial={selected}
          onCancel={() => setIsPickerOpen(false)}
          onConfirm={(value) => {
            setSelected(value);
            setViewYear(value.year);
            setViewMonth(value.month);
            setIsPickerOpen(false);
            onConfirm(value);
            onCancel();
          }}
          showMonth={showMonth}
          showDay={showDay}
          tab={tab}
          minDate={{
            year: MIN.getFullYear(),
            month: MIN.getMonth() + 1,
            day: MIN.getDate(),
          }}
        />
      )}
    </div>
  );
}
