import { useMemo, useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageData, TabType } from "../../data/AutoBlock";
import {
  defaultPowerDataByController as defaultMap,
  type PowerUsageDataByController,
} from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import {
  addDays, addWeeks, addMonths, addYears,
  subDays, subWeeks, subMonths, subYears,
  format, startOfWeek, endOfWeek,
  isSameDay, isSameWeek, isSameMonth, isSameYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";
import CustomSelect from "../../components/ui/CustomSelect";
import controllerData from "../../data/Controllers";

function deepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function looksUniform(map: PowerUsageDataByController) {
  const ids = Object.keys(map);
  if (ids.length <= 1) return true;
  const first = map[Number(ids[0])];
  return ids.every((id) => deepEqual(map[Number(id)], first));
}
function computeStatsFromChart(chart: { value: number }[]) {
  if (!chart || chart.length === 0) return { average: 0, minimum: 0, current: 0 };
  const values = chart.map((d) => d.value);
  const sum = values.reduce((s, v) => s + v, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;
  const min = Math.min(...values);
  const cur = values[values.length - 1];
  return { average: avg, minimum: min, current: cur };
}

export default function AutoBlockPage() {
  const [tab, setTab] = useState<TabType>("hourly");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedControllerId, setSelectedControllerId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedControllerId");
    return saved ? Number(saved) : 1;
  });
  useEffect(() => {
    localStorage.setItem("selectedControllerId", String(selectedControllerId));
  }, [selectedControllerId]);

  const [dataByController, setDataByController] = useState<PowerUsageDataByController | null>(null);

  useEffect(() => {
    // 1) 새 구조가 있으면 로드
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PowerUsageDataByController;
        // 모든 제어기가 동일하게 저장되어 있으면 기본값으로 재시드
        if (!parsed || Object.keys(parsed).length === 0 || looksUniform(parsed)) {
          localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
          setDataByController(defaultMap);
        } else {
          setDataByController(parsed);
        }
        return;
      } catch {
        /* 파싱 실패 시 계속 진행 */
      }
    }
    // 2) (구버전) 단일 데이터가 있으면 1번으로 이관
    const legacy = localStorage.getItem("powerData");
    if (legacy) {
      try {
        const one = JSON.parse(legacy) as PowerUsageData;
        const migrated: PowerUsageDataByController = { ...defaultMap, 1: one };
        localStorage.setItem("powerDataByController", JSON.stringify(migrated));
        setDataByController(migrated);
        return;
      } catch {
        /* 무시 */
      }
    }
    // 3) 기본값으로 시드
    localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
    setDataByController(defaultMap);
  }, []);

  const powerData = dataByController?.[selectedControllerId];
  const period = powerData?.[tab];
  const stats = useMemo(
    () => computeStatsFromChart(period?.chart ?? []),
    [period?.chart]
  );

  function handlePrevDate() {
    switch (tab) {
      case "hourly":  setCurrentDate((p) => subDays(p, 1));  break;
      case "daily":   setCurrentDate((p) => subWeeks(p, 1)); break;
      case "weekly":  setCurrentDate((p) => subMonths(p, 1)); break;
      case "monthly": setCurrentDate((p) => subYears(p, 1));  break;
    }
  }

  const today = new Date();
  const atMaxPeriod = (() => {
    switch (tab) {
      case "hourly":  return isSameDay(currentDate, today);
      case "daily":   return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "weekly":  return isSameMonth(currentDate, today);
      case "monthly": return isSameYear(currentDate, today);
      default:        return false;
    }
  })();

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "hourly":  setCurrentDate((p) => addDays(p, 1));   break;
      case "daily":   setCurrentDate((p) => addWeeks(p, 1));  break;
      case "weekly":  setCurrentDate((p) => addMonths(p, 1)); break;
      case "monthly": setCurrentDate((p) => addYears(p, 1));  break;
    }
  }

  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "dd일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  const [showDatePicker, setShowDatePicker] = useState(false);
  function openDatePicker() { setShowDatePicker(true); }
  function closeDatePicker() { setShowDatePicker(false); }
  function handleDateConfirm({ year, month, day }: { year: number; month: number; day: number }) {
    setCurrentDate(new Date(year, month - 1, day ?? 1));
    closeDatePicker();
  }

  return (
    <>
      <Header type="pageLink" title="자동 차단" prevLink="/" />
      <Main id="sub">
        <div className="mb-20">
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={setSelectedControllerId}
          />
        </div>

        <div className={styles.autoBlockBox}>
          {/* 자동차단 기준 */}
          <div className={styles.topBox}>
            <div className={styles.box}>
              <h2 className={styles.title}>자동 차단할 전력 기준</h2>
              <Link
                to="/auto-block-update"
                state={{ controllerId: selectedControllerId }}
                className={styles.btn}
              >
                수정하기
              </Link>
            </div>
            <strong>{powerData?.autoBlockThreshold ?? "-"}Wh</strong>
          </div>

          {/* 탭 */}
          <div className={styles.dateTabBox}>
            <button className={`${styles.btn} ${tab === "hourly" ? styles.active : ""}`}  onClick={() => setTab("hourly")}>시간별</button>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`}   onClick={() => setTab("daily")}>일별</button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`}  onClick={() => setTab("weekly")}>주별</button>
            <button className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`} onClick={() => setTab("monthly")}>월별</button>
          </div>

          {/* 날짜 이동 */}
          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>

            <button className={styles.dateBtn} onClick={openDatePicker}>
              {getFormattedDate()}
            </button>

            {!atMaxPeriod && (
              <button className={styles.next} onClick={handleNextDate}>
                <span className="blind">다음버튼</span>
              </button>
            )}
          </div>

          {/* 사용량 박스 (차트 기반 재계산 결과 표시) */}
          <div className={styles.amountUsedBox}>
            <div className={`${styles.averageBox} ${styles.box}`}>
              <span>평균 사용량</span>
              <strong>{period ? stats.average : "-"} <em>Wh</em></strong>
            </div>
            <div className={`${styles.minimumBox} ${styles.box}`}>
              <span>최저 사용량</span>
              <strong>{period ? stats.minimum : "-"} <em>Wh</em></strong>
            </div>
            <div className={`${styles.currentBox} ${styles.box}`}>
              <span>현재 사용량</span>
              <strong>{period ? stats.current : "-"} <em>Wh</em></strong>
            </div>
          </div>

          {/* 차트 */}
          <PowerBarChart
            data={period?.chart || []}
            yMax={400}
            unit="Wh"
            barColor="#0F7685"
          />

          {/* 데이터 없음 안내 */}
          {(!period?.chart || period.chart.length === 0) && (
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
            tab={tab}
          />
        )}
      </Main>
      <Footer />
    </>
  );
}
