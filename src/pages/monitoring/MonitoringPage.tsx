import { useState } from "react";
import {
  format,
  addHours,
  subHours,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MonitoringPage.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import PowerDoughnutChart from "../../components/ui/PowerDoughnutChart";

// 데이터
import controllerData from "../../data/Controllers";
import monitoringData, { type TabType } from "../../data/Monitoring";

// 모달
import DatePickerModal from "../../components/ui/DatePickerModal"; // 경로 맞게 조정
import Footer from "../../components/layout/Footer";

export default function MonitoringPage() {
  const [tab, setTab] = useState<TabType>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);

  const data = monitoringData[tab];

  function handlePrevDate() {
    switch (tab) {
      case "hourly":
        setCurrentDate(prev => subHours(prev, 1));
        break;
      case "daily":
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case "weekly":
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case "monthly":
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  }

  function handleNextDate() {
    switch (tab) {
      case "hourly":
        setCurrentDate(prev => addHours(prev, 1));
        break;
      case "daily":
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case "weekly":
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case "monthly":
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }

  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko }); // 00시 제거됨
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const start = currentDate;
        const end = addDays(currentDate, 6);
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "MM월 dd일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  return (
    <>
      <Header type="pageLink" title="전력모니터링" prevLink="/" />

      <Main id="sub">
        <div className={styles.monitoringBox}>
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={setSelectedControllerId}
          />

          <div className={styles.dateTabBox}>
            <button
              className={`${styles.btn} ${tab === "hourly" ? styles.active : ""}`}
              onClick={() => setTab("hourly")}
            >
              시간별
            </button>
            <button
              className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`}
              onClick={() => setTab("daily")}
            >
              일별
            </button>
            <button
              className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`}
              onClick={() => setTab("weekly")}
            >
              주별
            </button>
            <button
              className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`}
              onClick={() => setTab("monthly")}
            >
              월별
            </button>
          </div>

          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>

            <button className={styles.dateBtn} onClick={() => setShowModal(true)}>
              {getFormattedDate()}
            </button>

            <button className={styles.next} onClick={handleNextDate}>
              <span className="blind">다음버튼</span>
            </button>
          </div>

          <div className={styles.chartBox}>
            <PowerDoughnutChart
              powerReductionRate={data.powerReductionRate}
              textTitle="절약한 대기전력"
              valueText={`${data.powerSaved}Wh`}
              size={227}
              lineWidth={35}
              titleFontSize="15px"
              valueFontSize="32px"
            />
          </div>

          <div className={styles.amountUsedBox}>
            <div className={styles.box}>
              <h2>총 전력 사용량</h2>
              <strong>
                {data.powerUsed} <em>Wh</em>
              </strong>
              <span>{data.usedCost.toLocaleString()}원</span>
            </div>

            <div className={styles.box}>
              <h2>총 절약한 전력량</h2>
              <strong>
                {data.powerSaved} <em>Wh</em>
              </strong>
              <span>{data.savedCost.toLocaleString()}원</span>
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
            setCurrentDate(new Date(year, month - 1, day));
          }}
        />
      )}
    </>
  );
}
