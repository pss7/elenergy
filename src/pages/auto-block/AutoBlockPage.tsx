import { useMemo, useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { TabType } from "../../data/AutoBlock";
import {
  defaultPowerDataByController as defaultMap,
  type PowerUsageDataByController,
} from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import {
  addDays, addMonths, addYears,
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

/** ===== 유틸: 간단한 해시/시드 난수 (재현 가능) ===== */
function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededRand01(seed: string) {
  let x = hashStr(seed) || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  const u = (x >>> 0) / 4294967295;
  return u;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** ===== 제어기별 범위/패턴 프로파일 (확실히 다르게) ===== */
const controllerProfiles = {
  1: { hourly: [120, 360], daily: [150, 320], weekly: [900, 1500], monthly: [7000, 10000] },
  2: { hourly: [60, 380], daily: [150, 360], weekly: [1100, 1700], monthly: [8600, 11000] },
  3: { hourly: [80, 340], daily: [120, 280], weekly: [900, 1200], monthly: [7000, 8500] },
  4: { hourly: [100, 380], daily: [180, 380], weekly: [1300, 1800], monthly: [9200, 12000] },
} as const;

/** 2월=28, 4/6/9/11=30, 나머지 31 (요구사항 고정 규칙) */
// year는 사용하지 않으므로 언더스코어로 경고 억제
function daysInMonthFixed(_year: number, month1: number) {
  if (month1 === 2) return 28;
  if ([4, 6, 9, 11].includes(month1)) return 30;
  return 31;
}

/** 차트 값 생성 */
function genValue(ctrlId: number, tab: TabType, index: number, anchor: Date) {
  const p = controllerProfiles[ctrlId as 1 | 2 | 3 | 4] ?? controllerProfiles[1];
  const [minV, maxV] =
    tab === "hourly" ? p.hourly :
      tab === "daily" ? p.daily :
        tab === "weekly" ? p.weekly : p.monthly;

  const base = (Math.sin((index / 3.7) + ctrlId) + 1) / 2; // 0~1
  const noise = seededRand01(`${ctrlId}|${tab}|${index}|${anchor.toDateString()}`) * 0.25;
  const mix = clamp(base * 0.8 + noise, 0, 1);
  return Math.round(minV + mix * (maxV - minV));
}

/** 탭별 라벨/데이터 생성 */
function buildHourly(ctrlId: number, date: Date) {
  return Array.from({ length: 24 }, (_, i) => ({
    label: `${i}h`,
    value: genValue(ctrlId, "hourly", i, date),
  }));
}
function buildDaily(ctrlId: number, date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const dim = daysInMonthFixed(y, m);
  return Array.from({ length: dim }, (_, i) => ({
    label: `${m}월 ${i + 1}일`,
    value: genValue(ctrlId, "daily", i, date),
  }));
}
function buildWeekly(ctrlId: number, date: Date) {
  return Array.from({ length: 24 }, (_, i) => {
    const idx = 23 - i; // 오래전→최근
    return { label: `W-${idx}`, value: genValue(ctrlId, "weekly", i, date) };
  });
}
function buildMonthly(ctrlId: number, date: Date) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}월`,
    value: genValue(ctrlId, "monthly", i, date),
  }));
}

function computeStatsFromChart(chart: { value: number }[]) {
  if (!chart || chart.length === 0) return { average: 0, minimum: 0, current: 0 };
  const values = chart.map((d) => d.value);
  const sum = values.reduce((s, v) => s + v, 0);
  return {
    average: Math.round((sum / values.length) * 10) / 10,
    minimum: Math.min(...values),
    current: values[values.length - 1],
  };
}

/** 저장된 맵이 “모두 동일”이면 새로 시드 */
function deepEqual(a: any, b: any) { return JSON.stringify(a) === JSON.stringify(b); }
function looksUniform(map: PowerUsageDataByController) {
  const ids = Object.keys(map);
  if (ids.length <= 1) return true;
  const first = map[Number(ids[0])];
  return ids.every((id) => deepEqual(map[Number(id)], first));
}

export default function AutoBlockPage() {
  const [tab, setTab] = useState<TabType>("hourly");
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ 모달 상태는 컴포넌트 내부에서 선언해야 함
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedControllerId, setSelectedControllerId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedControllerId");
    return saved ? Number(saved) : 1;
  });
  useEffect(() => {
    localStorage.setItem("selectedControllerId", String(selectedControllerId));
  }, [selectedControllerId]);

  const [dataByController, setDataByController] = useState<PowerUsageDataByController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PowerUsageDataByController;
        if (!parsed || Object.keys(parsed).length === 0 || looksUniform(parsed)) {
          localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
          setDataByController(defaultMap);
        } else {
          setDataByController(parsed);
        }
        return;
      } catch { }
    }
    localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
    setDataByController(defaultMap);
  }, []);

  // 네비게이션
  function handlePrevDate() {
    switch (tab) {
      case "hourly": setCurrentDate((p) => subDays(p, 1)); break; // 1일
      case "daily": setCurrentDate((p) => subMonths(p, 1)); break; // 1개월
      case "weekly": setCurrentDate((p) => subMonths(p, 6)); break; // 6개월
      case "monthly": setCurrentDate((p) => subYears(p, 1)); break; // 1년
    }
  }
  const today = new Date();
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "hourly": return isSameDay(currentDate, today);
      case "daily": return isSameMonth(currentDate, today);
      case "weekly": return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "monthly": return isSameYear(currentDate, today);
      default: return false;
    }
  }, [tab, currentDate]);
  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "hourly": setCurrentDate((p) => addDays(p, 1)); break;
      case "daily": setCurrentDate((p) => addMonths(p, 1)); break;
      case "weekly": setCurrentDate((p) => addMonths(p, 6)); break;
      case "monthly": setCurrentDate((p) => addYears(p, 1)); break;
    }
  }

  // 라벨
  function getFormattedDate() {
    switch (tab) {
      case "hourly":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "daily":
        return format(currentDate, "yyyy년 MM월", { locale: ko });
      case "weekly": {
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        const start = startOfWeek(subWeeks(currentDate, 23), { weekStartsOn: 1 });
        return `${format(start, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일", { locale: ko })}`;
      }
      case "monthly":
        return format(currentDate, "yyyy년", { locale: ko });
      default:
        return "";
    }
  }

  // 차트 & 통계
  const chartData = useMemo(() => {
    switch (tab) {
      case "hourly": return buildHourly(selectedControllerId, currentDate);
      case "daily": return buildDaily(selectedControllerId, currentDate);
      case "weekly": return buildWeekly(selectedControllerId, currentDate);
      case "monthly": return buildMonthly(selectedControllerId, currentDate);
      default: return [];
    }
  }, [tab, currentDate, selectedControllerId]);

  const stats = useMemo(() => computeStatsFromChart(chartData), [chartData]);
  const threshold =
    dataByController?.[selectedControllerId]?.autoBlockThreshold ??
    defaultMap[selectedControllerId as 1 | 2 | 3 | 4]?.autoBlockThreshold ??
    "-";

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
            <button className={`${styles.btn} ${tab === "hourly" ? styles.active : ""}`} onClick={() => setTab("hourly")}>시간별</button>
            <button className={`${styles.btn} ${tab === "daily" ? styles.active : ""}`} onClick={() => setTab("daily")}>일별</button>
            <button className={`${styles.btn} ${tab === "weekly" ? styles.active : ""}`} onClick={() => setTab("weekly")}>주별</button>
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

          <PowerBarChart data={chartData} yMax={400} unit="Wh" barColor="#0F7685" />

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
            onConfirm={({ year, month, day }) => {
              setCurrentDate(new Date(year, month - 1, day ?? 1));
              setShowDatePicker(false);
            }}
            tab={tab}
          />
        )}
      </Main>

      <Footer />
    </>
  );
}
