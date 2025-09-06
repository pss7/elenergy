import { useEffect, useMemo, useState } from "react";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageDataByController } from "../../data/AutoBlock";
import { defaultPowerDataByController as defaultMap } from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import Button from "../../components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";

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
  const controllerIdFromState = (location.state?.controllerId as number) ??
    Number(localStorage.getItem("selectedControllerId") ?? 1);

  const [map, setMap] = useState<PowerUsageDataByController | null>(null);
  const [thresholdInput, setThresholdInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("powerDataByController");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PowerUsageDataByController;
        setMap(parsed);
        return;
      } catch {}
    }
    // 기본 시드
    localStorage.setItem("powerDataByController", JSON.stringify(defaultMap));
    setMap(defaultMap);
  }, []);

  const data = map?.[controllerIdFromState];
  const statsWeek = useMemo(
    () => computeStatsFromChart(data?.dailyLastWeek.chart ?? []),
    [data?.dailyLastWeek.chart]
  );

  const averageLastWeek = statsWeek.average;

  const isValidNumber = (s: string) => /^\d+$/.test(s);
  const parsed = isValidNumber(thresholdInput) ? parseInt(thresholdInput, 10) : NaN;
  const overAvg = isNaN(parsed) ? false : parsed > averageLastWeek;

  function handleSave() {
    if (!map || !data) return;

    if (!isValidNumber(thresholdInput)) {
      alert("숫자를 입력해주세요.");
      return;
    }
    const newVal = parseInt(thresholdInput, 10);

    if (newVal > averageLastWeek) {
      alert("최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.");
      return;
    }

    const updated = {
      ...map,
      [controllerIdFromState]: {
        ...data,
        autoBlockThreshold: newVal,
      },
    };
    localStorage.setItem("powerDataByController", JSON.stringify(updated));
    setMap(updated);
    alert("전력 기준이 저장되었습니다.");
    navigate("/auto-block");
  }

  function handleCancel() {
    navigate("/auto-block");
  }

  const isSaveEnabled = isValidNumber(thresholdInput) && !overAvg;

  return (
    <>
      <Main id="sub">
        <div className={styles.autoBlockBox}>
          <div className={styles.autoBlockUpdateBox}>
            <div className={styles.topBox}>
              <div className={styles.box}>
                <h2 className={styles.title}>자동 차단할 전력 기준 설정</h2>
              </div>
            </div>

            <span className={styles.title02}>전력기준</span>

            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder={`${data?.autoBlockThreshold ?? "-"}Wh`}
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
              />
              <label htmlFor="" className="blind">전력기준</label>

              {/* 평균 초과 시에만 경고 문구 노출 */}
              {thresholdInput !== "" && overAvg && (
                <p className={styles.infoText} style={{ color: "#C9443F" }}>
                  최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.
                </p>
              )}
            </div>

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
              data={data?.dailyLastWeek.chart || []}
              yMax={400}
              unit="Wh"
              barColor="#0F7685"
            />

            <div className={styles.infoBox}>
              <h3>안내사항</h3>
              <p>전력 기준 수정 후 10분이 지나야 시스템에 반영됩니다.</p>
            </div>
          </div>

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
