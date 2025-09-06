import { useEffect, useMemo, useState } from "react";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageDataByController } from "../../data/AutoBlock";
import { defaultPowerDataByController as defaultMap } from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import Button from "../../components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";

/** 통계 계산(차트에서 직접 계산해 일관성 유지) */
function computeStatsFromChart(chart: { value: number }[]) {
  if (!chart || chart.length === 0) return { average: 0, minimum: 0, current: 0 };
  const values = chart.map((d) => d.value);
  const sum = values.reduce((s, v) => s + v, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;
  const min = Math.min(...values);
  const cur = values[values.length - 1];
  return { average: avg, minimum: min, current: cur };
}

export default function AutoBlockUpdagePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 메인에서 넘어온 controllerId → 없으면 마지막 선택값 → 없으면 1
  const controllerIdFromState =
    (location.state?.controllerId as number | undefined) ??
    Number(localStorage.getItem("selectedControllerId") ?? 1);

  const [map, setMap] = useState<PowerUsageDataByController | null>(null);
  const [thresholdInput, setThresholdInput] = useState("");

  // 컨트롤러별 저장 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        setMap(JSON.parse(saved) as PowerUsageDataByController);
        return;
      } catch {
        // fallthrough
      }
    }
    // 저장된 게 없거나 파싱 실패 → 기본 맵 시드
    localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
    setMap(defaultMap);
  }, []);

  // 현재 제어기 데이터
  const data = map?.[controllerIdFromState];

  // 최근 1주 통계(검증 기준 및 표기)
  const statsWeek = useMemo(
    () => computeStatsFromChart(data?.dailyLastWeek?.chart ?? []),
    [data?.dailyLastWeek?.chart]
  );

  const averageLastWeek = statsWeek.average;

  // 입력 검증
  const isDigits = (s: string) => /^\d+$/.test(s);
  const parsed = isDigits(thresholdInput) ? parseInt(thresholdInput, 10) : NaN;
  const overAvg = !Number.isNaN(parsed) && parsed > averageLastWeek;
  const isSaveEnabled = isDigits(thresholdInput) && !overAvg;

  // 저장
  function handleSave() {
    if (!map || !data) return;

    if (!isDigits(thresholdInput)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    const newVal = parseInt(thresholdInput, 10);

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
    navigate("/auto-block"); // 메인으로 복귀
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
                type="text"
                placeholder={`${data?.autoBlockThreshold ?? "-"}Wh`}
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
              />
              <label htmlFor="" className="blind">전력기준</label>

              {/* 평균 초과일 때만 문구 노출 */}
              {thresholdInput !== "" && overAvg && (
                <p className={styles.infoText} style={{ color: "#C9443F" }}>
                  최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.
                </p>
              )}
            </div>

            {/* 최근 일주일 사용량(해당 제어기 데이터로) */}
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
              data={data?.dailyLastWeek?.chart || []}
              yMax={400}
              unit="Wh"
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
