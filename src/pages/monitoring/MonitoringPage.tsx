import { useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MonitoringPage.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import PowerDoughnutChart from "../../components/ui/PowerDoughnutChart";
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from "date-fns";

//데이터
import controllerData from "../../data/Controllers";
import monitoringData, { type TabType } from "../../data/Monitoring";

export default function MonitoringPage() {

  const [tab, setTab] = useState<TabType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);
  const data = monitoringData[tab];

  function handlePrevDate() {
    switch (tab) {
      case "day":
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case "week":
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case "month":
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case "year":
        setCurrentDate(prev => subYears(prev, 1));
        break;
      default:
        break;
    }
  };

  function handleNextDate() {
    switch (tab) {
      case "day":
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case "week":
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case "month":
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case "year":
        setCurrentDate(prev => addYears(prev, 1));
        break;
      default:
        break;
    }
  };

  function getFormattedDate() {
    switch (tab) {
      case "day":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "week": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "dd일", { locale: ko })}`;
      }
      case "month":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "year":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  };

  return (

    <>

      <Header
        type="pageLink"
        title="전력모니터링"
        prevLink="/"
      />

      <Main id="sub">
        <div className={styles.monitoringBox}>

          <CustomSelect
            controllers={controllerData}             // Controller[] 타입의 배열
            selectedControllerId={selectedControllerId}  // number 타입 (선택된 제어기 ID)
            onChange={setSelectedControllerId}       // (id: number) => void 함수
          />

          <div className={styles.dateTabBox}>
            <button
              className={`${styles.btn} ${tab === "day" ? styles.active : ""}`}
              onClick={() => setTab("day")}
            >
              일별
            </button>
            <button
              className={`${styles.btn} ${tab === "week" ? styles.active : ""}`}
              onClick={() => setTab("week")}
            >
              주별
            </button>
            <button
              className={`${styles.btn} ${tab === "month" ? styles.active : ""}`}
              onClick={() => setTab("month")}
            >
              월별
            </button>
            <button
              className={`${styles.btn} ${tab === "year" ? styles.active : ""}`}
              onClick={() => setTab("year")}
            >
              연도별
            </button>
          </div>

          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>
            <button className={styles.dateBtn}>{/* onClick={() => setShowModal(true)} */}
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

    </>

  )

}