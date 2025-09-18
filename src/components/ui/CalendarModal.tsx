import { useEffect, useState } from "react";
import styles from "./CalendarModal.module.css";
import DatePickerModal, { type PickerTab } from "./DatePickerModal";

// 간단한 날짜 타입
interface YMD { year: number; month: number; day: number; }

// 컴포넌트가 받는 props
interface Props {
  isOpen: boolean;              // 모달 열림 여부
  initial?: YMD | null;         // 처음에 표시/선택할 날짜 (없으면 오늘)
  onCancel: () => void;         // 취소 버튼 클릭
  onConfirm: (value: YMD) => void; // 완료 버튼 클릭(선택한 날짜 전달)
  showMonth?: boolean;          // 년/월 선택기에서 월 표시 여부
  showDay?: boolean;            // 년/월 선택기에서 일 표시 여부
  tab: PickerTab;               // 년/월 선택기의 탭 종류
  minDate?: YMD;                // 이 날짜 이전은 클릭 불가(표시는 됨)
}

// 캘린더 셀의 정보를 담는 타입
type Cell = {
  y: number;        // 연도
  m: number;        // 월(1~12)
  d: number;        // 일(1~31)
  inMonth: boolean; // 현재 화면에 보이는 "해당 월"인지 여부
  isPast: boolean;  // minDate 이전인지 여부(클릭 불가)
};

// === 날짜 관련 유틸 함수 ===

// Y-M-D를 Date로 변환
function ymd(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}

// 두 날짜를 "연-월-일" 기준으로 비교(시간 제거)
function cmp(a: Date, b: Date) {
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return A - B;
}

// 해당 월의 마지막 일 수(1~31) 반환
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// 해당 월 1일의 요일(0=일, 6=토)
function getFirstDow(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// 오늘 날짜를 YMD로 반환
function todayYMD(): YMD {
  const t = new Date();
  return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
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
  // 최소 기준일: 주어지면 그 날짜, 아니면 오늘
  const MIN_DATE_OBJ =
    minDate
      ? ymd(minDate.year, minDate.month, minDate.day)
      : ymd(...Object.values(todayYMD()) as [number, number, number]);

  // 초기 선택값 계산
  function getInitialFixed(): YMD {
    const base = initial ?? todayYMD();
    const raw = ymd(base.year, base.month, base.day || 1);
    const fixed = cmp(raw, MIN_DATE_OBJ) < 0 ? MIN_DATE_OBJ : raw;
    return {
      year: fixed.getFullYear(),
      month: fixed.getMonth() + 1,
      day: fixed.getDate(),
    };
  }

  const [selected, setSelected] = useState<YMD>(getInitialFixed());
  const [viewYear, setViewYear] = useState<number>(getInitialFixed().year);
  const [viewMonth, setViewMonth] = useState<number>(getInitialFixed().month);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 외부 prop 변경 시 갱신
  useEffect(() => {
    const fixed = getInitialFixed();
    setSelected(fixed);
    setViewYear(fixed.year);
    setViewMonth(fixed.month);
  }, [isOpen, initial?.year, initial?.month, initial?.day, minDate?.year, minDate?.month, minDate?.day]);

  if (!isOpen) return null;

  // === 현재 보이는 달의 캘린더 데이터 ===
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
          inMonth: false,
          isPast: cmp(dt, MIN_DATE_OBJ) < 0,
        };
      } else if (curDay <= dimDays) {
        const d = curDay++;
        const dt = ymd(dimYear, dimMonth, d);
        cell = {
          y: dimYear,
          m: dimMonth,
          d,
          inMonth: true,
          isPast: cmp(dt, MIN_DATE_OBJ) < 0,
        };
      } else {
        const d = nextDay++;
        const dt = ymd(nextYear, nextMonth, d);
        cell = {
          y: nextYear,
          m: nextMonth,
          d,
          inMonth: false,
          isPast: cmp(dt, MIN_DATE_OBJ) < 0,
        };
      }

      week.push(cell);
    }
    weeks.push(week);
  }

  // 이전 달로 이동
  function handleMonthBackward() {
    let y = viewYear;
    let m = viewMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }

    const target = ymd(y, m, 1);
    const minMonth = ymd(MIN_DATE_OBJ.getFullYear(), MIN_DATE_OBJ.getMonth() + 1, 1);

    if (cmp(target, minMonth) < 0) {
      return; // minDate 달 이전은 이동 금지
    }

    setViewYear(y);
    setViewMonth(m);
  }

  // 다음 달로 이동
  function handleMonthForward() {
    let y = viewYear;
    let m = viewMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
  }

  // 날짜 클릭
  function handleDayClick(cell: Cell) {
    if (cell.isPast) return;
    setSelected({ year: cell.y, month: cell.m, day: cell.d });
    if (!cell.inMonth) {
      setViewYear(cell.y);
      setViewMonth(cell.m);
    }
  }

  // 완료
  function handleConfirm() {
    onConfirm(selected);
  }

  const t = todayYMD();
  function isToday(y: number, m: number, d: number) {
    return y === t.year && m === t.month && d === t.day;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 상단: 년/월 + 이전/다음 버튼 */}
        <div className={styles.header}>
          {/* 현재 달(minDate 달)보다 이후 달일 때만 이전 버튼 표시 */}
          {!(viewYear === MIN_DATE_OBJ.getFullYear() && viewMonth === MIN_DATE_OBJ.getMonth() + 1) && (
            <button onClick={handleMonthBackward} className={`${styles.prevBtn} ${styles.btn}`}>
              <span className="blind">이전버튼</span>
            </button>
          )}
          <button onClick={() => setIsPickerOpen(true)} className={styles.dateBtn}>
            {viewYear}년 {viewMonth}월
          </button>
          <button onClick={handleMonthForward} className={`${styles.nextBtn} ${styles.btn}`}>
            <span className="blind">다음버튼</span>
          </button>
        </div>

        {/* 달력 본문 */}
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
                          isToday(cell.y, cell.m, cell.d) && cell.inMonth && !isSelected ? styles.active : "",
                          !cell.inMonth ? styles.outMonthDay : "",
                          cell.isPast ? styles.disabledDay : "",
                        ].filter(Boolean).join(" ")}
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

        {/* 하단 버튼 */}
        <div className={styles.footer}>
          <button onClick={onCancel}>취소</button>
          <button onClick={handleConfirm}>완료</button>
        </div>
      </div>

      {/* 년/월/일 선택 모달 */}
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
            year: MIN_DATE_OBJ.getFullYear(),
            month: MIN_DATE_OBJ.getMonth() + 1,
            day: MIN_DATE_OBJ.getDate(),
          }}
        />
      )}
    </div>
  );
}
