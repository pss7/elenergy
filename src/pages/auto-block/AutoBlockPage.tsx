import { useMemo, useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { TabType, PowerUsageDataByController } from "../../data/AutoBlock";
import {
  defaultPowerDataByController as defaultMap,
  buildDaily, buildWeekly, buildMonthly, buildYearly,
  computeStatsFromChart,
} from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import {
  addMonths, addYears,
  subWeeks, subMonths, subYears,
  format, startOfWeek, endOfWeek,
  isSameWeek, isSameMonth, isSameYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";
import CustomSelect from "../../components/ui/CustomSelect";
import controllerData from "../../data/Controllers";

export default function AutoBlockPage() {
  // 탭: 일/주/월/연
  const [tab, setTab] = useState<TabType>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedControllerId, setSelectedControllerId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedControllerId");
    return saved ? Number(saved) : 1;
  });
  useEffect(() => {
    localStorage.setItem("selectedControllerId", String(selectedControllerId));
  }, [selectedControllerId]);

  const [dataByController, setDataByController] = useState<PowerUsageDataByController | null>(null);

  // 최초 로드: 저장된 맵 없으면 임계값 0으로 시드
  useEffect(() => {
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        setDataByController(JSON.parse(saved) as PowerUsageDataByController);
        return;
      } catch { /* ignore */ }
    }
    const zeroSeeded: PowerUsageDataByController = Object.fromEntries(
      Object.entries(defaultMap).map(([id, d]) => [
        id,
        { ...d, autoBlockThreshold: 0 },
      ])
    ) as PowerUsageDataByController;
    localStorage.setItem("powerDataByController", JSON.stringify(zeroSeeded));
    setDataByController(zeroSeeded);
  }, []);

  // 네비게이션
  function handlePrevDate() {
    switch (tab) {
      case "daily":   setCurrentDate((p) => subMonths(p, 1)); break;  // 1개월
      case "weekly":  setCurrentDate((p) => subMonths(p, 6)); break;  // 6개월
      case "monthly": setCurrentDate((p) => subMonths(p, 1)); break;  // ✅ 월 단위
      case "yearly":  setCurrentDate((p) => subYears(p, 1));  break;  // ✅ 연 단위
    }
  }
  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "daily":   return isSameMonth(currentDate, today);
      case "weekly":  return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "monthly": return isSameMonth(currentDate, today); // ✅ 월별은 같은 달 도달 시 막기
      case "yearly":  return isSameYear(currentDate, today);  // ✅ 연도별은 같은 해 도달 시 막기
      default:        return false;
    }
  }, [tab, currentDate]);
  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "daily":   setCurrentDate((p) => addMonths(p, 1)); break;
      case "weekly":  setCurrentDate((p) => addMonths(p, 6)); break;
      case "monthly": setCurrentDate((p) => addMonths(p, 1)); break;  // ✅ 월 단위
      case "yearly":  setCurrentDate((p) => addYears(p, 1));  break;  // ✅ 연 단위
    }
  }

  // 라벨
  function getFormattedDate() {
    switch (tab) {
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        const start = startOfWeek(subWeeks(currentDate, 23), { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일", { locale: ko })}`;
      }
      case "monthly": {
        // 최근 12개월 윈도우 라벨
        const endY = currentDate.getFullYear();
        const endM = currentDate.getMonth() + 1;
        const start = new Date(endY, endM - 1 - 11, 1);
        const sy = start.getFullYear();
        const sm = start.getMonth() + 1;
        return `${sy}년 ${sm}월 ~ ${endY}년 ${endM}월`;
      }
      case "yearly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  // 차트 & 통계 (→ 데이터는 data/AutoBlock.ts의 빌더에서 import)
  const chartData = useMemo(() => {
    const id = selectedControllerId;
    switch (tab) {
      case "daily":   return buildDaily(id, currentDate);
      case "weekly":  return buildWeekly(id, currentDate);
      case "monthly": return buildMonthly(id, currentDate);
      case "yearly":  return buildYearly(id, currentDate);
      default:        return [];
    }
  }, [tab, currentDate, selectedControllerId]);

  const stats = useMemo(() => computeStatsFromChart(chartData), [chartData]);

  // 임계값(0도 유효값으로 그대로 보여줌)
  const id = selectedControllerId as 1 | 2 | 3 | 4;
  const rawThreshold = dataByController?.[id]?.autoBlockThreshold;
  const threshold =
    typeof rawThreshold === "number" && Number.isFinite(rawThreshold)
      ? rawThreshold
      : 0;

  // 날짜 선택 모달 표시 규칙
  const showMonthForPicker = tab === "daily" || tab === "weekly" || tab === "monthly"; // 월별 포함
  const showDayForPicker   = tab === "weekly"; // 주별만 일 선택

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
          <div className={styles.topBox}>
            <div className={styles.box}>
              <h2 className={styles.title}>자동 차단할 전력 기준</h2>
              <Link
                to="/auto-block-update"
                state={{ controllerId: selectedControllerId, tab }}
                className={styles.btn}
              >
                수정하기
              </Link>
            </div>
            <strong>{threshold}Wh</strong>
          </div>

          <div className={styles.dateTabBox}>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`} onClick={() => setTab("daily")}>일별</button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`} onClick={() => setTab("weekly")}>주별</button>
            <button className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`} onClick={() => setTab("monthly")}>월별</button>
            <button className={`${styles.btn} ${tab === "yearly" ? styles.active : ""}`} onClick={() => setTab("yearly")}>연도별</button>
          </div>

          <div className={styles.dateBox}>
            <button className={styles.prev} onClick={handlePrevDate}>
              <span className="blind">이전버튼</span>
            </button>

            <button className={styles.dateBtn} onClick={() => setShowDatePicker(true)}>
              {getFormattedDate()}
            </button>

            {!atMaxPeriod && (
              <button className={styles.next} onClick={handleNextDate}>
                <span className="blind">다음버튼</span>
              </button>
            )}
          </div>

          <div className={styles.amountUsedBox}>
            <div className={`${styles.averageBox} ${styles.box}`}>
              <span>평균 사용량</span>
              <strong>{stats.average} <em>Wh</em></strong>
            </div>
            <div className={`${styles.minimumBox} ${styles.box}`}>
              <span>최저 사용량</span>
              <strong>{stats.minimum} <em>Wh</em></strong>
            </div>
            <div className={`${styles.currentBox} ${styles.box}`}>
              <span>현재 사용량</span>
              <strong>{stats.current} <em>Wh</em></strong>
            </div>
          </div>

          <PowerBarChart
            data={chartData}
            unit="Wh"
            showAverageLine
            averageValue={stats.average}
            barColor="#0F7685"
          />

          {chartData.length === 0 && (
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
            onCancel={() => setShowDatePicker(false)}
            onConfirm={({ year, month, day }: { year: number; month: number; day: number }) => {
              setCurrentDate(new Date(year, (month ?? 1) - 1, day ?? 1));
              setShowDatePicker(false);
            }}
            tab={tab}
            showMonth={showMonthForPicker}
            showDay={showDayForPicker}
            /** 이 페이지에서만 오늘 이후 금지 */
            limitToToday
          />
        )}

      </Main>

      <Footer />
    </>
  );
}
