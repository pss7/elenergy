// src/pages/monitoring/MonitoringPage.tsx
import { useEffect, useState, useMemo } from "react";
import {
  addDays, subDays,
  addWeeks, subWeeks,
  addMonths, subMonths,
  addYears, subYears,
  format,
  startOfWeek, endOfWeek,
  isSameDay, isSameWeek, isSameMonth, isSameYear,
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

/** 회사 가입일을 로컬스토리지에서 읽어오기 (없으면 올해 1월 1일로 가정) */
function parseSignup(): Date {
  const raw = localStorage.getItem("companySignupDate"); // "YYYY-MM-DD"
  if (raw) {
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mo, d] = m;
      const dt = new Date(Number(y), Number(mo) - 1, Number(d));
      if (!Number.isNaN(dt.getTime())) return dt;
    }
  }
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

export default function MonitoringPage() {
  // 탭: 일/주/월/연
  const [tab, setTab] = useState<TabType>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedControllerId, setSelectedControllerId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedControllerId");
    return saved ? Number(saved) : 1;
    // 켰을 때 지금 선택된 컨트롤러를 기억
  });
  const [showModal, setShowModal] = useState(false);

  // 컨트롤러 선택 기억
  useEffect(() => {
    localStorage.setItem("selectedControllerId", String(selectedControllerId));
  }, [selectedControllerId]);

  /** ===== 네비게이션 (요구사항 반영) =====
   * - 일별: 하루 단위
   * - 주별: 7일 단위
   * - 월별: 1개월 단위
   * - 연별: 1년 단위
   */
  function handlePrevDate() {
    switch (tab) {
      case "daily": setCurrentDate((p) => subDays(p, 1)); break;
      case "weekly": setCurrentDate((p) => subWeeks(p, 1)); break;
      case "monthly": setCurrentDate((p) => subMonths(p, 1)); break;
      case "yearly": setCurrentDate((p) => subYears(p, 1)); break;
    }
  }

  const today = new Date();

  // 앞으로 이동 가능한지(오늘 이후 금지)
  const atMaxPeriod = useMemo(() => {
    switch (tab) {
      case "daily": return isSameDay(currentDate, today);
      case "weekly": return isSameWeek(currentDate, today, { weekStartsOn: 1 });
      case "monthly": return isSameMonth(currentDate, today);
      case "yearly": return isSameYear(currentDate, today);
      default: return false;
    }
  }, [tab, currentDate, today]);

  function handleNextDate() {
    if (atMaxPeriod) return;
    switch (tab) {
      case "daily": setCurrentDate((p) => addDays(p, 1)); break;
      case "weekly": setCurrentDate((p) => addWeeks(p, 1)); break;
      case "monthly": setCurrentDate((p) => addMonths(p, 1)); break;
      case "yearly": setCurrentDate((p) => addYears(p, 1)); break;
    }
  }

  /** ===== 날짜 라벨 ===== */
  function getFormattedDate() {
    switch (tab) {
      case "daily":
        return format(currentDate, "yyyy년 MM월 dd일", { locale: ko });
      case "weekly": {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
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

  /** ===== DatePicker 설정 ===== */
  const signupDate = useMemo(() => parseSignup(), []);
  const minDate = useMemo(
    () => ({
      year: signupDate.getFullYear(),
      month: signupDate.getMonth() + 1,
      day: signupDate.getDate(),
    }),
    [signupDate]
  );
  const initialForModal = useMemo(
    () => ({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    }),
    [currentDate]
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
            <button
              className={`${styles.btn} ${tab === "yearly" ? styles.active : ""}`}
              onClick={() => setTab("yearly")}
            >
              연도별
            </button>
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
              <strong>
                {entry.powerUsed} <em>Wh</em>
              </strong>
              <span>{entry.usedCost.toLocaleString()}원</span>
            </div>

            <div className={styles.box}>
              <h2>총 절약한 전력량</h2>
              <strong>
                {entry.powerSaved} <em>Wh</em>
              </strong>
              <span>{entry.savedCost.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </Main>

      <Footer />

      {/* 날짜 선택 모달 */}
      {showModal && (
        <DatePickerModal
          initial={initialForModal}
          tab={tab}                 // "daily" | "weekly" | "monthly" | "yearly"
          minDate={minDate}         // 가입일 이전 스크롤/선택 불가
          limitToToday              // 오늘 이후 스크롤/선택 불가
          // 일별은 기본 규칙상 day가 숨김이므로, 강제로 노출
          showDay={tab === "daily" ? true : undefined}
          onCancel={() => setShowModal(false)}
          onConfirm={({ year, month, day }) => {
            // 모달에서 보정된 값(가입일~오늘 범위)으로 세팅
            setCurrentDate(new Date(year, (month ?? 1) - 1, day ?? 1));
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
