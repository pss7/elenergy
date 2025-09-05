import { useEffect, useRef, useState } from "react";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./ScheduledBlockingPage.module.css";
import CalendarModal from "../../components/ui/CalendarModal";
import useNavigateTo from "../../hooks/useNavigateTo";

type Time = {
  ampm: "오전" | "오후";
  hour: number;
  minute: string;
};

type SelectedDate = { year: number; month: number; day: number } | null;

export default function ScheduledAddPage() {
  const { navigateTo } = useNavigateTo();

  function handleCancel() {
    navigateTo("/scheduled-block");
  }

  const itemHeight = 66;

  const baseAmpmList = ["오전", "오후"];
  const baseHourList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const baseMinuteList = Array.from({ length: 59 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // 오전/오후는 빈 블록 포함한 4개 아이템, 시간과 분은 무한 스크롤 리스트 생성
  const ampmList = ["", "오전", "오후", ""]; // 빈 블록 포함
  const hourList = createInfiniteList(baseHourList, 10);
  const minuteList = createInfiniteList(baseMinuteList, 5);

  const [selected, setSelected] = useState<Time>({
    ampm: "오전",
    hour: 6,
    minute: "00",
  });

  const ampmRef = useRef<HTMLDivElement>(null!);
  const hourRef = useRef<HTMLDivElement>(null!);
  const minuteRef = useRef<HTMLDivElement>(null!);

  const days = ["일", "월", "화", "수", "목", "금", "토"] as const;
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(getTodayDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  function createInfiniteList<T extends string>(items: T[], repeat: number): T[] {
    return Array.from({ length: repeat }, () => items).flat();
  }

  function getTodayDate(): SelectedDate {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

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

  // 초기 스크롤 위치 세팅
  useEffect(() => {
    if (ampmRef.current) ampmRef.current.scrollTop = itemHeight; // 오전 위치
    if (hourRef.current) hourRef.current.scrollTop = getCenterScroll(hourList, baseHourList);
    if (minuteRef.current)
      minuteRef.current.scrollTop = getCenterScroll(minuteList, baseMinuteList);
  }, []);

  function handleScroll<T extends string>(
    ref: React.RefObject<HTMLDivElement>,
    key: keyof Time,
    list: T[],
    baseList: T[]
  ) {
    if (!ref.current) return;

    let scrollTop = ref.current.scrollTop;

    if (key === "ampm") {
      // 오전/오후 무한 스크롤 느낌 구현
      if (scrollTop < itemHeight) {
        ref.current.scrollTop = itemHeight;
        scrollTop = itemHeight;
      } else if (scrollTop > itemHeight * 2) {
        ref.current.scrollTop = itemHeight * 2;
        scrollTop = itemHeight * 2;
      }

      let selectedValue: T = "오전" as T;
      if (scrollTop === itemHeight) selectedValue = "오전" as T;
      else if (scrollTop === itemHeight * 2) selectedValue = "오후" as T;

      setSelected((prev) => ({ ...prev, [key]: selectedValue as never }));
      return;
    }

    // 시간과 분 무한 스크롤 처리
    const centerOffset = ref.current.clientHeight / 2 - itemHeight / 2;
    const index = Math.round((scrollTop + centerOffset) / itemHeight) - 2;
    const realIndex = ((index % baseList.length) + baseList.length) % baseList.length;

    if (scrollTop < itemHeight * 4 || scrollTop > (list.length - 5) * itemHeight) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollTop = getCenterScroll(list, baseList);
        }
      }, 100);
    }

    const selectedValue = baseList[realIndex];
    setSelected((prev) => ({ ...prev, [key]: selectedValue as never }));
  }

  function renderColumn<T extends string>(
    list: T[],
    baseList: T[],
    key: keyof Time,
    ref: React.RefObject<HTMLDivElement>,
    fontSize: string
  ) {
    const paddedItems = key === "ampm" ? list : ["", "", ...list, "", ""];

    return (
      <div
        className={`${styles.column} ${key === "ampm" ? styles.ampmColumn : ""}`}
        ref={ref}
        onScroll={() => handleScroll(ref, key, list, baseList)}
        style={{ scrollBehavior: "smooth" }}
      >
        <ul>
          {paddedItems.map((item, idx) => {
            const realIdx = key === "ampm" ? idx : idx - 2;
            const isSelected = list[realIdx] === selected[key];

            return (
              <li
                key={`${String(item)}-${idx}`}
                style={{
                  color: isSelected ? "#000" : "#aaa",
                  fontWeight: isSelected ? "500" : "normal",
                  fontSize,
                  textAlign: "center",
                  height: itemHeight,
                  lineHeight: `${itemHeight}px`,
                  userSelect: "none",
                }}
              >
                {item === "" ? "\u00A0" : item}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  function getSelectedDateLabel(): string {
    if (selectedDate) {
      const { year, month, day } = selectedDate;
      const dateObj = new Date(year, month - 1, day);
      const dayName = days[dateObj.getDay()];
      return `${month}월 ${day}일 (${dayName})`;
    }

    if (selectedDays.length > 0) {
      return `매주 ${selectedDays.join(", ")}`;
    }

    return "요일을 선택하세요";
  }

  return (
    <Main id="sub">
      <div className={styles.scheduledBlockingBox}>
        <div className={styles.scheduledAddBox}>
          {/* 시간 선택 */}
          <div className={styles.timeBox}>
            <div className={styles.timeSelector}>
              {renderColumn(ampmList, baseAmpmList, "ampm", ampmRef, "28px")}
              {renderColumn(hourList, baseHourList, "hour", hourRef, "45px")}
              <div className={styles.colon}>:</div>
              {renderColumn(minuteList, baseMinuteList, "minute", minuteRef, "45px")}
              <div className={styles.centerHighlight}></div>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className={styles.dateBox}>
            <span className={styles.date}>{getSelectedDateLabel()}</span>

            <ul className={styles.dateList}>
              {days.map((day, idx) => {
                const isSunday = idx === 0;
                const isSaturday = idx === 6;
                const isActive = selectedDays.includes(day);

                return (
                  <li
                    key={day}
                    className={`${isSunday ? styles.sunday : ""} ${
                      isSaturday ? styles.saturday : ""
                    } ${isActive ? styles.active : ""}`}
                  >
                    <button className={styles.btn} onClick={() => handleDayClick(day)}>
                      <span>{day}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button className={styles.calendarBtn} onClick={() => setIsCalendarOpen(true)}>
              <span className="blind">달력</span>
            </button>
          </div>

          {/* 안내문 */}
          <div className={styles.infoText}>
            <h2>안내사항</h2>
            <p>
              예약 일시 기준 실시간 전력 사용량이 최근 일주일 간 평균 전력 사용량 이하일 경우 차단이
              정상적으로 진행됩니다.
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="btnBox">
            <Button styleType="grayType" onClick={handleCancel}>
              취소
            </Button>
            <Button>저장</Button>
          </div>

          {/* 달력 모달 */}
          <CalendarModal
            isOpen={isCalendarOpen}
            initial={getTodayDate()!}
            onCancel={() => setIsCalendarOpen(false)}
            onConfirm={(value) => {
              setSelectedDate(value);
              setSelectedDays([]);
              setIsCalendarOpen(false);
            }}
            showDay={true}
            showMonth={true}
            tab="daily"
          />
        </div>
      </div>
    </Main>
  );
}
