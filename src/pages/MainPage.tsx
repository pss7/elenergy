import { Link, useNavigate } from "react-router-dom";

//컴포넌트
import ArrowLink from "../components/ui/ArrowLink";
import Title from "../components/ui/Title";

//스타일
import styles from "./MainPage.module.css";

//데이터
// import controllerData from "../data/Controllers";
import savingsData from "../data/Savings";

//차트
import { useControllerData } from "../contexts/ControllerContext";
import PowerDoughnutChart from "../components/ui/PowerDoughnutChart";

export default function MainPage() {

  const { controllers } = useControllerData();

  //경로이동
  const navigate = useNavigate();
  function handleUpdate(id: number) {

    navigate(`/controller-update/${id}`);

  }

  function handleControl(id: number) {

    navigate(`/manual-control/${id}`);

  }

  return (
    <>

      <section className={styles.titleBox}>
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
          전체제어기
        </Title>

        <ul className={styles.linkList01}>
          {
            controllers.map(function (ctrl) {
              return (
                <li key={ctrl.id}>
                  <div className={styles.box} onClick={() => handleControl(ctrl.id)}>
                    <h2>
                      {ctrl.title}
                    </h2>
                    <span className={styles.location}>
                      {ctrl.location}
                    </span>
                    <button type="button" className={styles.view} onClick={() => handleUpdate(ctrl.id)}>
                      <em className="blind">제어기, 공장위치 수정페이지 이동</em>
                    </button>
                  </div>
                </li>
              )
            })
          }
        </ul>

        <Link to="/alarm" className={styles.alarmLink}>
          <img src="/assets/images/common/alarm_icon.svg" alt="알림" />
        </Link>

      </section>

      <section>
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon02}`}>
          다른 차단 방식이 필요하신가요?
        </Title>

        <ul className={styles.linkList02}>
          <li>
            <Link to="/scheduled-block">
              <Title level={2}>
                예약 차단 설정
              </Title>
              <span>
                원하는 시간에 전력 OFF 가능
              </span>
            </Link>
          </li>
          <li>
            <Link to="/auto-block">
              <Title level={2}>
                자동 차단 설정
              </Title>
              <span>
                원하는 기준 이하로 전력이 감소하면 자동 OFF 가능
              </span>
            </Link>
          </li>
        </ul>
      </section>

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
  )

}