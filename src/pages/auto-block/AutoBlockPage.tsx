// src/pages/auto-block/AutoBlockPage.tsx
import { useMemo, useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";

// UI 탭(요구사항에 맞춰 yearly 없음)
type UITab = "hourly" | "daily" | "weekly" | "monthly";

import type { PowerUsageDataByController } from "../../data/AutoBlock";
import {
  defaultPowerDataByController as defaultMap,
  buildDaily, buildWeekly, buildMonthly, /* buildHourly (있다면 사용) */
  computeStatsFromChart,
} from "../../data/AutoBlock";

import PowerBarChart from "../../components/ui/PowerBarChart";
import {
  addDays, subDays,
  addMonths, subMonths,
  addWeeks, subWeeks,
  addYears, subYears,
  format, subWeeks as dfSubWeeks,
  isSameDay, isSameMonth, isSameYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";
import CustomSelect from "../../components/ui/CustomSelect";
import controllerData from "../../data/Controllers";

export default function AutoBlockPage() {
  // 탭: 시간/일/주/월
  const [tab, setTab] = useState<UITab>("hourly");
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

  /** ===== 날짜 네비게이션 ===== */
  function handlePrevDate() {
    switch (tab) {
      case "hourly":  setCurrentDate((p) => subDays(p, 1));   break; // 하루 전
      case "daily":   setCurrentDate((p) => subMonths(p, 1)); break; // 1개월
      case "weekly":  setCurrentDate((p) => subWeeks(p, 24)); break; // 24주 전
      case "monthly": setCurrentDate((p) => subYears(p, 1));  break; // 1년 전
    }
  }

  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "hourly":  return isSameDay(currentDate, today);   // 같은 날 도달 시 막기
      case "daily":   return isSameMonth(currentDate, today); // 같은 달 도달 시 막기
      case "weekly":  return isSameDay(currentDate, today);   // 창 끝=선택일이 오늘일 때 막기
      case "monthly": return isSameYear(currentDate, today);  // 같은 해 도달 시 막기
      default:        return false;
    }
  }, [tab, currentDate]);

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "hourly":  setCurrentDate((p) => addDays(p, 1));   break; // 하루 후
      case "daily":   setCurrentDate((p) => addMonths(p, 1)); break; // 1개월 후
      case "weekly":  setCurrentDate((p) => addWeeks(p, 24)); break; // 24주 후
      case "monthly": setCurrentDate((p) => addYears(p, 1));  break; // 1년 후
    }
  }

  /** ===== 날짜 라벨 ===== */
  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        // 24주 창: 시작 = 23주 전, 끝 = 선택일
        const start = dfSubWeeks(currentDate, 23);
        const end = currentDate;
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일", { locale: ko })}`;
      }
      case "monthly":
        // 12개월 창의 기준 해만 표기
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  /** ===== 차트 데이터 & 통계 ===== */
  const chartData = useMemo(() => {
    const id = selectedControllerId;
    switch (tab) {
      // ⛳ 데이터 모듈에 buildHourly가 있다면 아래 한 줄로 교체하세요:
      // case "hourly":  return buildHourly(id, currentDate);
      case "hourly":  return buildDaily(id, currentDate);  // 임시: 일단 일별 빌더로 대체
      case "daily":   return buildDaily(id, currentDate);
      case "weekly":  return buildWeekly(id, currentDate);   // 24주 데이터 반환 가정
      case "monthly": return buildMonthly(id, currentDate);  // 12개월 데이터 반환 가정
      default:        return [];
    }
  }, [tab, currentDate, selectedControllerId]);

  const stats = useMemo(() => computeStatsFromChart(chartData), [chartData]);

  // 임계값(0도 유효값 그대로 표시)
  const id = selectedControllerId as 1 | 2 | 3 | 4;
  const rawThreshold = dataByController?.[id]?.autoBlockThreshold;
  const threshold =
    typeof rawThreshold === "number" && Number.isFinite(rawThreshold)
      ? rawThreshold
      : 0;

  /** ===== 날짜 선택 모달 표시 규칙 ===== */
  // 시간별/주별은 일까지 필요, 일별/월별은 일 불필요
  const showMonthForPicker = true;                           // 네 탭 모두 월 표기
  const showDayForPicker   = tab === "hourly" || tab === "weekly";

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
            <button className={`${styles.btn} ${tab === "hourly" ? styles.active : ""}`}  onClick={() => setTab("hourly")}>시간별</button>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`}   onClick={() => setTab("daily")}>일별</button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`}  onClick={() => setTab("weekly")}>주별</button>
            <button className={`${styles.btn} ${tab === "monthly" ? styles.active : ""}`} onClick={() => setTab("monthly")}>월별</button>
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
            barColor="#0F7685" // 필요하면 #FF1E00 로
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
            /** 오늘 이후 금지 */
            limitToToday
          />
        )}
      </Main>

      <Footer />
    </>
  );
}
