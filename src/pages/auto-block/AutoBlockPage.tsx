import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageData, TabType } from "../../data/AutoBlock";
import autoBlockData from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";

export default function AutoBlockPage() {
  const [tab, setTab] = useState<TabType>("hourly");
  const [powerData, setPowerData] = useState<PowerUsageData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  //데이터 받아오기
  useEffect(() => {
    const savedData = localStorage.getItem("powerData");

    if (savedData) {
      setPowerData(JSON.parse(savedData));
    } else {
      setPowerData(autoBlockData); // 처음엔 목데이터
    }

  }, []);

  const selectedData = powerData?.[tab];

  function handlePrevDate() {
    switch (tab) {
      case "hourly":
        setCurrentDate((prev) => subDays(prev, 1));
        break;
      case "daily":
        setCurrentDate((prev) => subWeeks(prev, 1));
        break;
      case "weekly":
        setCurrentDate((prev) => subMonths(prev, 1));
        break;
      case "monthly":
        setCurrentDate((prev) => subYears(prev, 1));
        break;
      default:
        break;
    }
  }

  function handleNextDate() {
    switch (tab) {
      case "hourly":
        setCurrentDate((prev) => addDays(prev, 1));
        break;
      case "daily":
        setCurrentDate((prev) => addWeeks(prev, 1));
        break;
      case "weekly":
        setCurrentDate((prev) => addMonths(prev, 1));
        break;
      case "monthly":
        setCurrentDate((prev) => addYears(prev, 1));
        break;
      default:
        break;
    }
  }

  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "daily": {
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      }
      case "weekly":
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "dd일", { locale: ko })}`;
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  //모달 상태 관리
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 날짜 버튼 클릭 → 모달 열기
  function openDatePicker() {
    setShowDatePicker(true);
  }

  // 모달 닫기
  function closeDatePicker() {
    setShowDatePicker(false);
  }

  //날짜 선택 후 currentDate 갱신 함수
  function handleDateConfirm({ year, month, day }: { year: number; month: number; day: number }) {
    // 월은 0부터 시작하므로 -1
    const newDate = new Date(year, month - 1, day ?? 1);
    setCurrentDate(newDate);
    closeDatePicker();
  }

  return (
    <>
      <Header type="pageLink" title="자동차단" prevLink="/" />

      <Main id="sub">
        <div className={styles.autoBlockBox}>
          {/* 자동차단 기준 */}
          <div className={styles.topBox}>
            <div className={styles.box}>
              <h2 className={styles.title}>자동 차단할 전력 기준</h2>
              <Link
                to="/auto-block-update"
                className={styles.btn}
              >수정하기
              </Link>
            </div>
            <strong>{powerData?.autoBlockThreshold}Wh</strong>
          </div>

          {/* 탭 선택 */}
          <div className={styles.dateTabBox}>
            <button className={`${styles.btn} ${tab === "hourly" ? styles.active : ""}`} onClick={() => setTab("hourly")}>
              시간별
            </button>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`} onClick={() => setTab("daily")}>
              일별
            </button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`} onClick={() => setTab("weekly")}>
              주별
            </button>
            <button className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`} onClick={() => setTab("monthly")}>
              월별
            </button>
          </div>

          {/* 날짜 이동 */}
          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>
            <button className={styles.dateBtn} onClick={openDatePicker}>
              {getFormattedDate()}
            </button>
            <button className={styles.next} onClick={handleNextDate}>
              <span className="blind">다음버튼</span>
            </button>
          </div>

          {/* 사용량 데이터 박스 */}
          <div className={styles.amountUsedBox}>
            <div className={`${styles.averageBox} ${styles.box}`}>
              <span>평균 사용량</span>
              <strong>{selectedData?.stats.average ?? "-"} <em>Wh</em></strong>
            </div>
            <div className={`${styles.minimumBox} ${styles.box}`}>
              <span>최저 사용량</span>
              <strong>{selectedData?.stats.minimum ?? "-"} <em>Wh</em></strong>
            </div>
            <div className={`${styles.currentBox} ${styles.box}`}>
              <span>현재 사용량</span>
              <strong>{selectedData?.stats.current ?? "-"} <em>Wh</em></strong>
            </div>
          </div>

          {/* 차트 */}
          <PowerBarChart
            data={selectedData?.chart || []}
            yMax={400}
            unit="Wh"
            barColor="#0F7685"
          />

          {/* 데이터 없음 안내 */}
          {selectedData?.chart.length === 0 && (
            <div className={styles.infoBox}>
              <h3>안내사항</h3>
              <p>선택한 기간에는 데이터가 없습니다.</p>
            </div>
          )}
        </div>

        {showDatePicker && (
          <DatePickerModal
            initial={{
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate(),
            }}
            onCancel={closeDatePicker}
            onConfirm={handleDateConfirm}
            tab={tab} // 탭 정보를 넘겨줍니다
          />
        )}

      </Main>

      <Footer />
    </>
  );
}
