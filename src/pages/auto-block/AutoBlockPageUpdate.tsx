import { useEffect, useState } from "react";
import Main from "../../components/layout/Main";
import styles from "./AutoBlockPage.module.css";
import type { PowerUsageData } from "../../data/AutoBlock";
import autoBlockData from "../../data/AutoBlock";
import PowerBarChart from "../../components/ui/PowerBarChart";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function AutoBlockUpdagePage() {

  //경로이동
  const navigate = useNavigate();

  //데이터 상태 관리
  const [powerData, setPowerData] = useState<PowerUsageData | null>(null);
  const [thresholdInput, setThresholdInput] = useState("");

  //데이터 받아오기
  useEffect(() => {
    const savedData = localStorage.getItem("powerData");

    if (savedData) {
      setPowerData(JSON.parse(savedData));
    } else {
      setPowerData(autoBlockData); // 처음엔 목데이터
    }

  }, []);

  //변경 데이터 저장 시 함수
  function handleSave() {

    if (!powerData) {
      return;
    }

    const newThreshold = parseInt(thresholdInput, 10);
    if (isNaN(newThreshold)) {
      alert("숫자를 입력해주세요.");
      return;
    }

    const updatedData = {
      ...powerData,
      autoBlockThreshold: newThreshold,
    };

    localStorage.setItem("powerData", JSON.stringify(updatedData));

    alert("전력 기준이 저장되었습니다.");

  }

  //경로이동
  function handleCancel() {
    navigate("/auto-block");
  }

  return (
    <>

      <Main id="sub">
        <div className={styles.autoBlockBox}>

          <div className={styles.autoBlockUpdateBox}>

            {/* 자동차단 기준 */}
            <div className={styles.topBox}>
              <div className={styles.box}>
                <h2 className={styles.title}>자동 차단할 전력 기준 설정</h2>
              </div>
            </div>

            <span className={styles.title02}>
              전력기준
            </span>

            <div className={styles.inputBox}>
              <input
                type="text"
                placeholder={`${powerData?.autoBlockThreshold}Wh`}
                onChange={(e) => setThresholdInput(e.target.value)}
              />
              <label htmlFor="" className="blind">
                전력기준
              </label>
              <p className={styles.infoText}>
                최근 일주일 간 평균 전력 사용량 이하로 입력해 주세요.
              </p>
            </div>

            <h2 className={`${styles.title} mb-30`}>최근 일주일 간 전력 사용량</h2>

            {/* 사용량 데이터 박스 */}
            <div className={styles.amountUsedBox}>
              <div className={`${styles.averageBox} ${styles.box}`}>
                <span>평균 사용량</span>
                <strong>{powerData?.dailyLastWeek.stats.average ?? "-"} <em>Wh</em></strong>
              </div>
              <div className={`${styles.minimumBox} ${styles.box}`}>
                <span>최저 사용량</span>
                <strong>{powerData?.dailyLastWeek.stats.minimum ?? "-"} <em>Wh</em></strong>
              </div>
              <div className={`${styles.currentBox} ${styles.box}`}>
                <span>현재 사용량</span>
                <strong>{powerData?.dailyLastWeek.stats.current ?? "-"} <em>Wh</em></strong>
              </div>
            </div>

            {/* 차트 */}
            <PowerBarChart
              data={powerData?.dailyLastWeek.chart || []}
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
            <Button
              styleType="grayType"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
            >
              저장
            </Button>
          </div>

        </div>

      </Main>
    </>
  );
}
