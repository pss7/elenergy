import { useMemo, useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";

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
  addMonths,
  addWeeks, subWeeks,
  addYears,
  differenceInCalendarDays,
  format,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";
import CustomSelect from "../../components/ui/CustomSelect";
import controllerData from "../../data/Controllers";

/** 시간별(24개 막대) 임시 빌더: 실제 hourly 데이터가 있으면 교체 */
function buildHourlyForChart(controllerId: number, date: Date) {
  // 컨트롤러별 다르게 보이도록 약간의 시드 사용
  const seed = (controllerId % 7) + 1;
  return Array.from({ length: 24 }, (_, h) => {
    const base = Math.sin((h + seed) * 0.7) * 120 + 260;
    const jitter = ((h * seed) % 17) * 3;
    const value = Math.max(0, Math.round(base + jitter));
    return {
      hour: h + 1, // 1~24 (xDomain [-0.5, 24.5]에서 24시 눈금 포함)
      value,
      label: `${date.getMonth() + 1}월 ${date.getDate()}일 ${String(h).padStart(2, "0")}시`,
    };
  });
}

export default function AutoBlockPage() {
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

  /** 날짜 네비게이션 */
  function handlePrevDate() {
    switch (tab) {
      case "hourly":  setCurrentDate((p) => subDays(p, 1));   break;
      case "daily":   setCurrentDate((p) => addMonths(p, -1)); break;
      case "weekly":  setCurrentDate((p) => subWeeks(p, 24)); break;
      case "monthly": setCurrentDate((p) => addYears(p, -1));  break;
    }
  }

  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "hourly":  return format(currentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "daily":   return format(currentDate, "yyyy-MM") === format(today, "yyyy-MM");
      case "weekly":  return format(currentDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "monthly": return format(currentDate, "yyyy") === format(today, "yyyy");
      default:        return false;
    }
  }, [tab, currentDate]);

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "hourly":  setCurrentDate((p) => addDays(p, 1));   break;
      case "daily":   setCurrentDate((p) => addMonths(p, 1)); break;
      case "weekly":  setCurrentDate((p) => addWeeks(p, 24)); break;
      case "monthly": setCurrentDate((p) => addYears(p, 1));  break;
    }
  }

  /** 주별 24주 창: 종료일(end) 기준, 시작일(start)=end - 24주 + 1일 */
  const weeklyWindow = useMemo(() => {
    const end = currentDate;
    const start = addDays(subWeeks(end, 24), 1); // 예시: 2025-08-14 → 2025-02-28
    const days = differenceInCalendarDays(end, start) + 1;   // 참고용(표시는 안 함)
    return { start, end, days };
  }, [currentDate]);

  /** 상단 날짜 라벨 (주별: 168일 텍스트 제거 상태) */
  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 M월 d일", { locale: ko });
      case "daily":
        return format(currentDate, "yyyy년 M월", { locale: ko });
      case "weekly": {
        const { start, end } = weeklyWindow;
        return `${format(start, "yyyy년 M월 d일", { locale: ko })} ~ ${format(end, "yyyy년 M월 d일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  /** 차트 원본 데이터 */
  const chartData = useMemo(() => {
    const id = selectedControllerId;
    switch (tab) {
      // ⛳ buildHourly가 있다면 교체: return buildHourly(id, currentDate);
      case "hourly":  return buildHourlyForChart(id, currentDate); // 24개 막대
      case "daily":   return buildDaily(id, currentDate);
      case "weekly":  return buildWeekly(id, currentDate);   // 24주 데이터 가정
      case "monthly": return buildMonthly(id, currentDate);  // 12개월 데이터 가정
      default:        return [];
    }
  }, [tab, currentDate, selectedControllerId]);

  /** 숫자형 X축을 위한 idx 부여 (일/주/월) */
  const chartDataWithIdx = useMemo(() => {
    return chartData.map((d, i) => ({ ...d, idx: i }));
  }, [chartData]);

  const stats = useMemo(() => computeStatsFromChart(chartData), [chartData]);

  // 임계값(0도 유효값)
  const id = selectedControllerId as 1 | 2 | 3 | 4;
  const rawThreshold = dataByController?.[id]?.autoBlockThreshold;
  const threshold =
    typeof rawThreshold === "number" && Number.isFinite(rawThreshold)
      ? rawThreshold
      : 0;

  /** 날짜 선택 모달 표기 규칙 (✅ 월별은 연도만, 주별/시간별만 일 표시) */
  const showMonthForPicker = tab !== "monthly";
  const showDayForPicker   = tab === "hourly" || tab === "weekly";

  /** X축 설정: 숫자형으로 고정 틱 노출 + 경계 패딩으로 축선 침범 방지 */
  const xConf = useMemo(() => {
    if (tab === "hourly") {
      return {
        xType: "number" as const,
        xDataKey: "hour",
        xTicks: [0, 4, 8, 12, 16, 20, 24],
        xTickFormatter: (v: number) => (v === 24 ? "24시" : `${v}h`),
        xDomain: [-0.5, 24.5],
      };
    }

    if (tab === "daily") {
      const lastIdx = Math.max(0, chartDataWithIdx.length - 1);
      const month = currentDate.getMonth() + 1;
      return {
        xType: "number" as const,
        xDataKey: "idx",
        xTicks: [0, 14, lastIdx].filter(n => n <= lastIdx),
        xTickFormatter: (v: number) => {
          if (v === 0) return `${month}월1일`;
          if (v === 14) return `${month}월15일`;
          if (v === lastIdx) return `${month}월${lastIdx + 1}일`;
          return "";
        },
        xDomain: [-0.5, lastIdx + 0.5],
      };
    }

    if (tab === "weekly") {
      const lastIdx = Math.max(0, chartDataWithIdx.length - 1);
      const ticks = [0, 6, 12, 18, lastIdx].filter(n => n <= lastIdx);

      const { start, end } = weeklyWindow;
      const d = (w: number) => addWeeks(start, w);
      const pad = (n: number) => String(n).padStart(2, "0");
      const fmt = (date: Date) => `${pad(date.getMonth() + 1)}월${date.getDate()}일`;

      const tickFormatter = (v: number) => {
        if (v === 0) return fmt(start);
        if (v === 6) return fmt(d(6));
        if (v === 12) return fmt(d(12));
        if (v === 18) return fmt(d(18));
        if (v === lastIdx) return fmt(end);
        return "";
      };

      return {
        xType: "number" as const,
        xDataKey: "idx",
        xTicks: ticks,
        xTickFormatter: tickFormatter,
        xDomain: [-0.5, lastIdx + 0.5],
      };
    }

    // monthly (12개월 가정): 0,3,7,11 인덱스
    const lastIdx = Math.max(0, chartDataWithIdx.length - 1);
    const ticks = [0, 3, 7, 11].filter(n => n <= lastIdx);
    const labelMap: Record<number, string> = { 0: "1월", 3: "4월", 7: "8월", 11: "12월" };

    return {
      xType: "number" as const,
      xDataKey: "idx",
      xTicks: ticks,
      xTickFormatter: (v: number) => labelMap[v] ?? "",
      xDomain: [-0.5, lastIdx + 0.5],
    };
  }, [tab, currentDate, weeklyWindow, chartDataWithIdx]);

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

          {/* 요약 박스 */}
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

          {/* 차트 */}
          <PowerBarChart
            data={tab === "hourly" ? chartData : chartDataWithIdx}
            unit="Wh"
            showAverageLine
            averageValue={stats.average}
            barColor="#0F7685"
            xType={xConf.xType}
            xDataKey={xConf.xDataKey}
            xTicks={xConf.xTicks}
            xTickFormatter={xConf.xTickFormatter}
            xDomain={xConf.xDomain}
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
            showMonth={showMonthForPicker}   // ✅ 월별이면 false → 연도만 표시
            showDay={showDayForPicker}       // ✅ 주별/시간별만 true
            /** 오늘 이후 금지 */
            limitToToday
          />
        )}
      </Main>

      <Footer />
    </>
  );
}
