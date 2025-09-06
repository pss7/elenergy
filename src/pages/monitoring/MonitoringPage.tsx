// src/pages/monitoring/MonitoringPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  addDays, addMonths, addYears,
  subDays, subMonths, subYears,
  format, startOfWeek, endOfWeek, subWeeks as dfSubWeeks,
  isSameDay, isSameWeek, isSameMonth, isSameYear,
} from "date-fns";
import { ko } from "date-fns/locale";
import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MonitoringPage.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import PowerDoughnutChart from "../../components/ui/PowerDoughnutChart";

import controllerData from "../../data/Controllers";
import monitoringData, { type TabType } from "../../data/Monitoring";

import DatePickerModal from "../../components/ui/DatePickerModal";
import Footer from "../../components/layout/Footer";

/** ========= 시드 유틸(날짜/제어기/탭별로 값이 '같은 입력 → 같은 출력') ========= */
function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seeded01(seed: string) {
  // xorshift
  let x = hashStr(seed) || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 4294967295;
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function yyyymmdd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

/** 날짜/제어기/탭별로 "표시 엔트리" 계산 (기본값에 결정론적 스케일 적용) */
function getEntryFor(
  tab: TabType,
  date: Date,
  controllerId: number
) {
  const base = monitoringData[tab];
  // 탭별 날짜 키: 주/월은 기간 대표키 사용
  let key = "";
  switch (tab) {
    case "hourly":
    case "daily":
      key = yyyymmdd(date);
      break;
    case "weekly": {
      const wStart = startOfWeek(date, { weekStartsOn: 1 });
      key = `W${yyyymmdd(wStart)}`;
      break;
    }
    case "monthly":
      key = `M${yyyymm(date)}`;
      break;
  }
  const seed = `${controllerId}|${tab}|${key}`;
  const r = seeded01(seed);

  // 스케일(±15%) — 너무 튀지 않게
  const factor = 0.85 + r * 0.30; // 0.85 ~ 1.15
  const rateDelta = Math.round((r - 0.5) * 10); // -5 ~ +5
  const powerReductionRate = clamp(base.powerReductionRate + rateDelta, 1, 99);

  const powerSaved  = Math.round(base.powerSaved  * factor);
  const powerUsed   = Math.round(base.powerUsed   * factor);
  const savedCost   = Math.round(base.savedCost   * factor);
  const usedCost    = Math.round(base.usedCost    * factor);

  return {
    powerReductionRate,
    powerSaved,
    powerUsed,
    savedCost,
    usedCost,
  };
}

export default function MonitoringPage() {
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

  /** ===== 네비게이션 (자동 차단과 동일 규칙) ===== */
  function handlePrevDate() {
    switch (tab) {
      case "hourly":  setCurrentDate((p) => subDays(p, 1));   break; // 1일
      case "daily":   setCurrentDate((p) => subMonths(p, 1)); break; // 1개월
      case "weekly":  setCurrentDate((p) => subMonths(p, 6)); break; // 6개월(=24주)
      case "monthly": setCurrentDate((p) => subYears(p, 1));  break; // 1년
    }
  }
  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "hourly":  return isSameDay(currentDate, today);
      case "daily":   return isSameMonth(currentDate, today);
      case "weekly":  return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "monthly": return isSameYear(currentDate, today);
      default:        return false;
    }
  }, [tab, currentDate]);

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "hourly":  setCurrentDate((p) => addDays(p, 1));   break; // 1일
      case "daily":   setCurrentDate((p) => addMonths(p, 1)); break; // 1개월
      case "weekly":  setCurrentDate((p) => addMonths(p, 6)); break; // 6개월
      case "monthly": setCurrentDate((p) => addYears(p, 1));  break; // 1년
    }
  }

  /** ===== 날짜 라벨 (자동 차단과 동일) ===== */
  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        const start = startOfWeek(dfSubWeeks(currentDate, 23), { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  /** ===== 표시용 데이터: 날짜/제어기/탭에 따라 변화 ===== */
  const entry = useMemo(
    () => getEntryFor(tab, currentDate, selectedControllerId),
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

      {/* 날짜 선택 모달 (자동 차단과 동일) */}
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
            setCurrentDate(new Date(year, month - 1, day ?? 1));
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
