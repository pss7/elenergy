// src/pages/monitoring/MonitoringPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  addMonths, addYears,
  subMonths, subYears,
  format, startOfWeek, endOfWeek, subWeeks as dfSubWeeks,
  isSameWeek, isSameMonth, isSameYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MonitoringPage.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import PowerDoughnutChart from "../../components/ui/PowerDoughnutChart";

import controllerData from "../../data/Controllers";
import { type TabType, getMonitoringEntry } from "../../data/Monitoring";

import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";

export default function MonitoringPage() {
  // 탭: 일/주/월/연
  const [tab, setTab] = useState<TabType>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedControllerId, setSelectedControllerId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedControllerId");
    return saved ? Number(saved) : 1;
  });
  const [showModal, setShowModal] = useState(false);

  // 컨트롤러 선택 기억
  useEffect(() => {
    localStorage.setItem("selectedControllerId", String(selectedControllerId));
  }, [selectedControllerId]);

  /** ===== 네비게이션 ===== */
  function handlePrevDate() {
    switch (tab) {
      case "daily":   setCurrentDate((p) => subMonths(p, 1)); break; // 1개월
      case "weekly":  setCurrentDate((p) => subMonths(p, 6)); break; // 6개월(=24주)
      case "monthly": setCurrentDate((p) => subMonths(p, 1)); break; // 1개월
      case "yearly":  setCurrentDate((p) => subYears(p, 1));  break; // 1년
    }
  }
  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "daily":   return isSameMonth(currentDate, today);
      case "weekly":  return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "monthly": return isSameMonth(currentDate, today);
      case "yearly":  return isSameYear(currentDate, today);
      default:        return false;
    }
  }, [tab, currentDate]);

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "daily":   setCurrentDate((p) => addMonths(p, 1)); break;
      case "weekly":  setCurrentDate((p) => addMonths(p, 6)); break;
      case "monthly": setCurrentDate((p) => addMonths(p, 1)); break;
      case "yearly":  setCurrentDate((p) => addYears(p, 1));  break;
    }
  }

  /** ===== 날짜 라벨 ===== */
  function getFormattedDate() {
    switch (tab) {
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        const start = startOfWeek(dfSubWeeks(currentDate, 23), { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "yearly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  /** ===== 표시용 데이터 (import한 계산기 사용) ===== */
  const entry = useMemo(
    () => getMonitoringEntry(tab, currentDate, selectedControllerId),
    [tab, currentDate, selectedControllerId]
  );

  return (
    <>
      <Header type="pageLink" title="전력 모니터링" prevLink="/" />

      <Main id="sub">
        <div className={styles.monitoringBox}>
          {/* 컨트롤러 셀렉트 */}
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={setSelectedControllerId}
          />

          {/* 탭 */}
          <div className={styles.dateTabBox}>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`}   onClick={() => setTab("daily")}>일별</button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`}  onClick={() => setTab("weekly")}>주별</button>
            <button className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`} onClick={() => setTab("monthly")}>월별</button>
            <button className={`${styles.btn} ${tab === "yearly" ? styles.active : ""}`}  onClick={() => setTab("yearly")}>연도별</button>
          </div>

          {/* 날짜 이동 */}
          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>

            <button className={styles.dateBtn} onClick={() => setShowModal(true)}>
              {getFormattedDate()}
            </button>

            {!atMaxPeriod && (
              <button className={styles.next} onClick={handleNextDate}>
                <span className="blind">다음버튼</span>
              </button>
            )}
          </div>

          {/* 도넛 차트 */}
          <div className={styles.chartBox}>
            <PowerDoughnutChart
              powerReductionRate={entry.powerReductionRate}
              textTitle="절약한 대기전력"
              valueText={`${entry.powerSaved}Wh`}
              size={227}
              lineWidth={35}
              titleFontSize="15px"
              valueFontSize="32px"
            />
          </div>

          {/* 사용량 박스 */}
          <div className={styles.amountUsedBox}>
            <div className={styles.box}>
              <h2>총 전력 사용량</h2>
              <strong>{entry.powerUsed} <em>Wh</em></strong>
              <span>{entry.usedCost.toLocaleString()}원</span>
            </div>

            <div className={styles.box}>
              <h2>총 절약한 전력량</h2>
              <strong>{entry.powerSaved} <em>Wh</em></strong>
              <span>{entry.savedCost.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </Main>

      <Footer />

      {/* 날짜 선택 모달 */}
      {showModal && (
        <DatePickerModal
          initial={{
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate(),
          }}
          tab={tab}
          onCancel={() => setShowModal(false)}
          onConfirm={({ year, month, day }) => {
            // 연도별은 month/day 무시해도 되지만 공통 처리 유지
            setCurrentDate(new Date(year, (month ?? 1) - 1, day ?? 1));
            setShowModal(false);
          }}
          /** 오늘 이후 금지(컴포넌트가 지원한다면) */
          limitToToday
        />
      )}
    </>
  );
}
