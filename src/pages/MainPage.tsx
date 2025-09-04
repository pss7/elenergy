import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// 컴포넌트
import ArrowLink from "../components/ui/ArrowLink";
import Title from "../components/ui/Title";
import PowerDoughnutChart from "../components/ui/PowerDoughnutChart";

// 스타일
import styles from "./MainPage.module.css";

// 데이터
import savingsData from "../data/Savings";

// 컨텍스트에서 제어기 데이터 가져오기
import { useControllerData } from "../contexts/ControllerContext";

// 페이지 이동 훅
import useNavigateTo from "../hooks/useNavigateTo";

export default function MainPage() {
  // 제어기 리스트 가져오기 (전역 컨텍스트)
  const { controllers } = useControllerData();

  // 외부 클릭 감지를 위한 ref
  const listRef = useRef<HTMLUListElement>(null);

  // 현재 "정보변경" 링크가 열려 있는 제어기 ID
  const [activeToggleId, setActiveToggleId] = useState<number | null>(null);

  // 정보변경 버튼 클릭 핸들러: 같은 ID면 닫고, 다르면 열기
  function handleToggle(id: number) {
    setActiveToggleId((prev) => (prev === id ? null : id));
  }

  // 바깥 클릭 시 "정보변경" 링크 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setActiveToggleId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 수동 제어 페이지로 이동
  const { navigateTo } = useNavigateTo();

  function handleControl(id: number) {
    navigateTo(`/manual-control/${id}`);
  }

  return (
    <>
      {/* 전체 제어기 리스트 */}
      <section className={styles.titleBox}>
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
          전체제어기
        </Title>

        <ul className={styles.linkList01} ref={listRef}>
          {controllers.map((ctrl) => (
            <li
              key={ctrl.id}
              onClick={() => handleControl(ctrl.id)}
            >
              <div className={styles.box}>
                <div className={styles.textBox}>
                  <h2>{ctrl.title}</h2>
                  <span className={styles.location}>{ctrl.location}</span>
                </div>

                <div className={styles.linkBox}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(ctrl.id);
                    }}
                  >
                    <em className="blind">정보변경 이동 버튼</em>
                  </button>

                  <Link
                    to={`/controller-update/${ctrl.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`${styles.changeLink} ${activeToggleId === ctrl.id ? styles.active : ""
                      }`}
                  >
                    정보변경
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* 알림 페이지 이동 링크 */}
        <Link to="/alarm" className={styles.alarmLink}>
          <img src="/assets/images/common/alarm_icon.svg" alt="알림" />
        </Link>
      </section>

      {/* 다른 차단 방식 섹션 */}
      <section>
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
              <span>기준 이하로 전력 감소 시 자동 OFF 가능</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* 전력 절감 차트 섹션 */}
      <section>
        <div className={`${styles.layoutBox} mb-20`}>
          <Title level={1} className={`${styles.h1} ${styles.mainIcon03}`}>
            이번 달 절약한 전력 요금
          </Title>
          <ArrowLink to="/monitoring" variant="next">
            <span className="blind">전력 모니터링 이동</span>
          </ArrowLink>
        </div>

        <div className={styles.chartBox}>
          <PowerDoughnutChart
            powerReductionRate={25}
            textTitle="절감한 전력량"
            valueText="25%"
            lineWidth={35}
            titleFontSize="10px"
            valueFontSize="20px"
          />

          <div className={styles.chartInfoBox}>
            <h3>절감한 전력 요금</h3>
            <span>{savingsData.moneySaved.toLocaleString()}원</span>
          </div>
        </div>
      </section>
    </>
  );
}
