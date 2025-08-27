import { useEffect, useRef, useState } from "react";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import { useNavigate } from "react-router-dom";

type Time = {
  ampm: "오전" | "오후";
  hour: number;
  minute: string;
};

type SelectedDate = { year: number; month: number; day: number } | null;

export default function ScheduledAddPage() {

  const navigate = useNavigate();

  function handleCancel() {
    navigate("/scheduled-block");
  }

  const itemHeight = 66;

  function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
    return Array.from({ length: repeat }, () => items).flat();
  }

  const baseAmpmList = ["오전", "오후"];
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const baseMinuteList = Array.from({ length: 59 }, (_, i) => String(i + 1).padStart(2, "0"));

  const ampmList = createInfiniteList(baseAmpmList, 20);
  const hourList = createInfiniteList(baseHourList, 10);
  const minuteList = createInfiniteList(baseMinuteList, 5);

  const [selected, setSelected] = useState<Time>({ ampm: "오전", hour: 6, minute: "00" });

  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  function handleDayClick(day: string) {
    setSelectedDate(null);
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function getCenterScroll<T>(list: T[], baseList: T[]): number {
    const centerIndex = Math.floor(list.length / baseList.length / 2) * baseList.length;
    return (centerIndex + 2) * itemHeight;
  }

  useEffect(function () {
    if (ampmRef.current) ampmRef.current.scrollTop = getCenterScroll(ampmList, baseAmpmList);
    if (hourRef.current) hourRef.current.scrollTop = getCenterScroll(hourList, baseHourList);
    if (minuteRef.current) minuteRef.current.scrollTop = getCenterScroll(minuteList, baseMinuteList);
  }, []);

  function handleScroll<T extends string>(
    ref: React.RefObject<HTMLDivElement>,
    key: keyof Time,
    list: T[],
    baseList: T[]
  ) {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const centerOffset = ref.current.clientHeight / 2 - itemHeight / 2;
    const index = Math.round((scrollTop + centerOffset) / itemHeight) - 2;

    const realIndex = ((index % baseList.length) + baseList.length) % baseList.length;
    const selectedValue = baseList[realIndex];

    setSelected(function (prev) {
      return { ...prev, [key]: selectedValue as never };
    });

    if (scrollTop < itemHeight * 4 || scrollTop > (list.length - 5) * itemHeight) {
      setTimeout(function () {
        if (ref.current) {
          ref.current.scrollTop = getCenterScroll(list, baseList);
        }
      }, 100);
    }
  }

  function renderColumn<T extends string>(
    list: T[],
    baseList: T[],
    key: keyof Time,
    ref: React.RefObject<HTMLDivElement>,
    fontSize: string
  ) {
    const paddedItems = ["", "", ...list, "", ""];

    return (
      <div className={styles.column} ref={ref} onScroll={() => handleScroll(ref, key, list, baseList)}>
        <ul>
          {paddedItems.map(function (item, idx) {
            const realIdx = idx - 2;
            const isSelected = list[realIdx] === selected[key];

            return (
              <li
                key={`${String(item)}-${idx}`}
                style={{
                  color: isSelected ? "#000" : "#aaa",
                  fontWeight: isSelected ? "500" : "normal",
                  fontSize,
                }}
              >
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <Main id="sub">
      <div className={styles.scheduledBlockingBox}>
        <div className={styles.scheduledAddBox}>
          <div className={styles.timeBox}>
            <div className={styles.timeSelector}>
              {renderColumn(ampmList, baseAmpmList, "ampm", ampmRef, "28px")}
              {renderColumn(hourList, baseHourList, "hour", hourRef, "45px")}
              <div className={styles.colon}>:</div>
              {renderColumn(minuteList, baseMinuteList, "minute", minuteRef, "45px")}
              <div className={styles.centerHighlight}></div>
            </div>
          </div>

          <div className={styles.dateBox}>
            <span className={styles.date}>
              {selectedDate
                ? `선택한 날짜: ${selectedDate.year}년 ${selectedDate.month}월 ${selectedDate.day}일`
                : selectedDays.length > 0
                  ? `매주 ${selectedDays.join(", ")}`
                  : "요일을 선택하세요"}
            </span>

            <ul className={styles.dateList}>
              {days.map(function (day, idx) {
                const isSunday = idx === 0;
                const isSaturday = idx === 6;
                const isActive = selectedDays.includes(day);

                return (
                  <li
                    key={day}
                    className={`${isSunday ? styles.sunday : ""} ${isSaturday ? styles.saturday : ""} ${isActive ? styles.active : ""
                      }`}
                  >
                    <button className={styles.btn} onClick={() => handleDayClick(day)}>
                      <span>{day}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button className={styles.calendarBtn} onClick={function () { setIsCalendarOpen(true); }}>
              <span className="blind">달력</span>
            </button>
          </div>

          <div className={styles.infoText}>
            <h2>안내사항</h2>
            <p>
              예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이 정상적으로 진행됩니다.
            </p>
          </div>

          <div className="btnBox">
            <Button
              styleType="grayType"
              onClick={handleCancel}
            >취소
            </Button>
            <Button>저장</Button>
          </div>

          <CalendarModal
            isOpen={isCalendarOpen}
            initial={{ year: 2025, month: 8 }}
            onCancel={function () { setIsCalendarOpen(false); }}
            onConfirm={function (value) {
              console.log("선택된 날짜:", value);
              setSelectedDate(value);
              setSelectedDays([]); // 달력 선택 시 요일 선택 초기화
              setIsCalendarOpen(false);
            }}
          />
        </div>
      </div>
    </Main>
  );
}
