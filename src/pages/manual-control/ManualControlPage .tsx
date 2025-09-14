// src/pages/manual-control/ManualControlPage.tsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Footer from "../../components/layout/Footer";

import styles from "./ManualControlPage.module.css";
import PowerBarChart from "../../components/ui/PowerBarChart";
import Title from "../../components/ui/Title";

import { useControllerData } from "../../contexts/ControllerContext";
import { buildDailyLastWeek, computeStatsFromChart } from "../../data/AutoBlock";
import { logAlarm } from "../../utils/logAlarm";
import { getControllerPower, setControllerPower } from "../../utils/powerState";

export default function ManualControlPage() {
  const { id } = useParams();
  const controllerId = Number(id);
  const { controllers } = useControllerData();
  const target = controllers.find((c) => c.id === controllerId);

  // 최근 7일 차트/통계
  const lastWeekChart = useMemo(
    () => buildDailyLastWeek(controllerId || 1, new Date()),
    [controllerId]
  );
  const statsWeek = useMemo(() => computeStatsFromChart(lastWeekChart), [lastWeekChart]);

  // 토글 및 모달 상태
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ 팝업 표시 조건: 평균 < 현재
  const shouldWarn = statsWeek.average < statsWeek.current;

  // 저장된 전원 상태로 토글 초기화
  useEffect(() => {
    if (target) setIsToggleOn(getControllerPower(target.id) === "ON");
  }, [target]);

  function Toggle({
    checked,
    onChange,
    bgColor,
  }: {
    checked: boolean;
    onChange: () => void;
    bgColor?: string;
  }) {
    return (
      <div
        className={`${styles.toggleSwitch} ${checked ? styles.on : ""}`}
        onClick={onChange}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <span className={`${styles.toggleText} ${styles.offText}`}>OFF</span>
        <span className={`${styles.toggleText} ${styles.onText}`}>ON</span>
        <div className={styles.toggleCircle}></div>
      </div>
    );
  }

  // 토글 변경 핸들러
  function handleToggle() {
    const nextState = !isToggleOn;
    setIsToggleOn(nextState);

    if (target) {
      setControllerPower(target.id, nextState ? "ON" : "OFF");
      logAlarm({
        type: "수동제어",
        controller: target.title,
        status: nextState ? "ON" : "OFF",
      });
    }

    if (nextState) {
      if (shouldWarn) setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }

  function handleCancle() {
    setIsModalOpen(false);
  }

  function handleOffClick() {
    setIsModalOpen(false);
    setIsToggleOn(true);

    if (target) {
      setControllerPower(target.id, "OFF");
      logAlarm({
        type: "수동제어",
        controller: target.title,
        status: "OFF",
      });
    }
  }

  if (!target) {
    return (
      <Main id="sub">
        <p>제어기 정보를 찾을 수 없습니다.</p>
      </Main>
    );
  }

  return (
    <>
      <Header type="pageLink" title="수동제어" prevLink="/" />

      <Main id="sub">
        <div className={styles.manualControlBox}>
          <h2 className={styles.title}>{target.title}</h2>

          {/* 토글 및 안내 메시지 */}
          <div className={styles.toggleBox}>
            <Toggle
              checked={isToggleOn}
              onChange={handleToggle}
              bgColor={isToggleOn && shouldWarn ? "#4F4E52" : undefined}
            />
            {isToggleOn && shouldWarn && (
              <p className={`${styles.toggleInfoText} ${styles.bounce}`}>
                강제 OFF를 원할 경우 <br />
                ON을 5초간 눌러주세요.
              </p>
            )}
          </div>

          {isToggleOn && (
            <p className={styles.infoText}>
              "
              <span className={styles.color02}>평균 전력 사용량</span> &lt;{" "}
              <span className={styles.color01}>현재 전력 사용량</span>
              " 인 경우에 OFF 가능
            </p>
          )}

          {/* 사용량 통계 박스 */}
          <h3 className={`${styles.title02} mb-30`}>최근 일주일 간 전력 사용량</h3>
          <div className={styles.amountUsedBox}>
            <div className={`${styles.averageBox} ${styles.box}`}>
              <span>평균 사용량</span>
              <strong>
                {statsWeek.average} <em>Wh</em>
              </strong>
            </div>
            <div className={`${styles.minimumBox} ${styles.box}`}>
              <span>최저 사용량</span>
              <strong>
                {statsWeek.minimum} <em>Wh</em>
              </strong>
            </div>
            <div className={`${styles.currentBox} ${styles.box}`}>
              <span>현재 사용량</span>
              <strong>
                {statsWeek.current} <em>Wh</em>
              </strong>
            </div>
          </div>

          {/* 막대 차트 + ✅ 평균선 표시 */}
          <PowerBarChart
            data={lastWeekChart}
            yMax={400}
            unit="Wh"
            barColor="#0F7685"
            showAverageLine
            averageValue={statsWeek.average}
          />

          {/* 추가 차단 설정 안내 */}
          <section className="mt-50">
            <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon02}`}>
              다른 차단 방식이 필요하신가요?
            </Title>

            <ul className={styles.linkList02}>
              <li>
                <Link to="/scheduled-block">
                  <Title level={2}>예약 차단 설정</Title>
                  <span>원하는 시간에 전력 OFF 가능</span>
                </Link>
              </li>
              <li>
                <Link to="/auto-block">
                  <Title level={2}>자동 차단 설정</Title>
                  <span>기준 이하로 전력이 감소하면 자동 OFF 기능</span>
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* 전력차단 모달 */}
        {isModalOpen && (
          <div className={`${styles.modalWrap} ${styles.active}`}>
            <div className={styles.modalBox}>
              <h3>주의사항</h3>
              <p>
                원격 전력 차단 시 공장 비가동 여부를 <br />
                반드시 확인한 후 OFF 해주시기 바랍니다. <br />
                공장 가동 중 전력 차단할 경우 안전상의 문제와 <br />
                경제적인 문제가 발생할 수 있습니다.
              </p>
              <div className={styles.btnBox}>
                <button className={styles.btn} onClick={handleCancle}>
                  취소
                </button>
                <button className={styles.btn} onClick={handleOffClick}>
                  전력차단
                </button>
              </div>
            </div>
          </div>
        )}
      </Main>

      <Footer />
    </>
  );
}
