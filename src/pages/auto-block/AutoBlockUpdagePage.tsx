import { useEffect, useMemo, useState } from "react";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageDataByController } from "../../data/AutoBlock";
import {
  defaultPowerDataByController as defaultMap,
  buildDailyLastWeek,
  computeStatsFromChart,
} from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import Button from "../../components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";

export default function AutoBlockUpdagePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 메인에서 넘어온 controllerId → 없으면 마지막 선택값 → 없으면 1
  const controllerIdFromState =
    (location.state?.controllerId as number | undefined) ??
    Number(localStorage.getItem("selectedControllerId") ?? 1);

  const [map, setMap] = useState<PowerUsageDataByController | null>(null);
  const [thresholdInput, setThresholdInput] = useState("");

  // 컨트롤러별 저장 데이터 로드 (없으면 임계값 0으로 시드)
  useEffect(() => {
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        setMap(JSON.parse(saved) as PowerUsageDataByController);
        return;
      } catch { }
    }
    const zeroSeeded: PowerUsageDataByController = Object.fromEntries(
      Object.entries(defaultMap).map(([id, d]) => [
        id,
        { ...d, autoBlockThreshold: 0 },
      ])
    ) as PowerUsageDataByController;
    localStorage.setItem("powerDataByController", JSON.stringify(zeroSeeded));
    setMap(zeroSeeded);
  }, []);

  // 현재 제어기 데이터
  const data = map?.[controllerIdFromState];

  // ✅ 최근 7일 차트/통계
  const lastWeekChart = useMemo(
    () => buildDailyLastWeek(controllerIdFromState, new Date()),
    [controllerIdFromState]
  );
  const statsWeek = useMemo(
    () => computeStatsFromChart(lastWeekChart),
    [lastWeekChart]
  );
  const averageLastWeek = statsWeek.average;

  // 입력 검증
  const isDigits = (s: string) => /^\d+$/.test(s);
  const parsed = isDigits(thresholdInput) ? parseInt(thresholdInput, 10) : NaN;
  const overAvg = !Number.isNaN(parsed) && parsed > averageLastWeek;
  const isSaveEnabled = isDigits(thresholdInput) && !overAvg;

  // 숫자만 허용하는 입력 핸들러들
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // 모든 비숫자 제거
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setThresholdInput(digitsOnly);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Tab",
    ];
    if (allowed.includes(e.key)) return;
    // 단일 숫자 키만 허용
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digitsOnly = text.replace(/\D/g, "");
    setThresholdInput(digitsOnly);
  }

  // 저장
  function handleSave() {
    if (!map || !data) return;

    if (!isDigits(thresholdInput)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    const newVal = parseInt(thresholdInput, 10);

    // 0 허용, 최근 1주 평균 초과만 금지
    if (newVal > averageLastWeek) {
      alert("최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.");
      return;
    }

    const updated: PowerUsageDataByController = {
      ...map,
      [controllerIdFromState]: {
        ...data,
        autoBlockThreshold: newVal, // 해당 제어기만 업데이트
      },
    };
    localStorage.setItem("powerDataByController", JSON.stringify(updated));
    setMap(updated);
    alert("전력 기준이 저장되었습니다.");
    navigate("/auto-block");
  }

  // 취소
  function handleCancel() {
    navigate("/auto-block");
  }

  return (
    <>
      <Main id="sub">
        <div className={styles.autoBlockBox}>
          <div className={styles.autoBlockUpdateBox}>
            {/* 제목 */}
            <div className={styles.topBox}>
              <div className={styles.box}>
                <h2 className={styles.title}>자동 차단할 전력 기준 설정</h2>
              </div>
            </div>

            {/* 전력 기준 입력 */}
            <span className={styles.title02}>전력기준</span>

            <div className={styles.inputBox}>
              <input
                type="text"                // type="number"는 브라우저마다 e,- 입력 허용 → text로 두고 필터링이 안전
                inputMode="numeric"        // 모바일 숫자 키패드
                pattern="[0-9]*"           // 폼 검증 힌트
                placeholder={`${(data?.autoBlockThreshold ?? 0)}`}
                value={thresholdInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                aria-label="전력기준(숫자만)"
              />
              <label htmlFor="" className="blind">전력기준</label>

              {/* 평균 초과일 때만 문구 노출 */}
              {thresholdInput !== "" && overAvg && (
                <p className={styles.infoText} style={{ color: "#C9443F" }}>
                  최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.
                </p>
              )}
            </div>

            {/* 최근 일주일 사용량 */}
            <h2 className={`${styles.title} mb-30`}>최근 일주일 간 전력 사용량</h2>

            <div className={styles.amountUsedBox}>
              <div className={`${styles.averageBox} ${styles.box}`}>
                <span>평균 사용량</span>
                <strong>{statsWeek.average} <em>Wh</em></strong>
              </div>
              <div className={`${styles.minimumBox} ${styles.box}`}>
                <span>최저 사용량</span>
                <strong>{statsWeek.minimum} <em>Wh</em></strong>
              </div>
              <div className={`${styles.currentBox} ${styles.box}`}>
                <span>현재 사용량</span>
                <strong>{statsWeek.current} <em>Wh</em></strong>
              </div>
            </div>

            <PowerBarChart
              data={lastWeekChart}
              unit="Wh"
              showAverageLine
              averageValue={statsWeek.average}
              barColor="#0F7685"
            />

            <div className={styles.infoBox}>
              <h3>안내사항</h3>
              <p>전력 기준 수정 후 10분이 지나야 시스템에 반영됩니다.</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="btnBox">
            <Button styleType="grayType" onClick={handleCancel}>취소</Button>
            <Button onClick={handleSave} disabled={!isSaveEnabled}>저장</Button>
          </div>
        </div>
      </Main>

      <Footer />
    </>
  );
}
