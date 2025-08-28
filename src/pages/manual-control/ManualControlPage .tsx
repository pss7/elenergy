import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import { useControllerData } from "../../contexts/ControllerContext";
import styles from "./ManualControlPage.module.css";
import PowerBarChart from "../../components/ui/PowerBarChart";
import { useEffect, useState } from "react";
import type { PowerUsageData } from "../../data/AutoBlock";
import autoBlockData from "../../data/AutoBlock";
import Title from "../../components/ui/Title";

export default function ManualControlPage() {

  const navigate = useNavigate();

  const { id } = useParams();
  const { controllers } = useControllerData();
  const target = controllers.find(c => c.id === Number(id));

  //데이터 상태 관리
  const [powerData, setPowerData] = useState<PowerUsageData | null>(null);

  //데이터 받아오기
  useEffect(() => {

    setPowerData(autoBlockData);

  }, []);

  const [allOn, setAllOn] = useState(false);
  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
      <div
        className={`${styles.toggleSwitch} ${checked ? styles.on : ""}`}
        onClick={onChange}
      >
        <span className={`${styles.toggleText} ${styles.offText}`}>OFF</span>
        <span className={`${styles.toggleText} ${styles.onText}`}>ON</span>
        <div className={styles.toggleCircle}></div>
      </div>
    );
  }

  // 전체 수신 토글
  function handleToggle() {
    if (allOn) {
      setAllOn(false);
    } else {
      setAllOn(true);
    }
  }

  if (!target) {
    return (
      <Main id="sub">
        <p>제어기 정보를 찾을 수 없습니다.</p>
      </Main>
    );
  }

  function handleCancle() {
    setAllOn(false);
  }

  return (

    <>

      <Header
        type="pageLink"
        title="수동제어"
        prevLink="/"
      />

      <Main id="sub">
        <div className={styles.manualControlBox}>

          <h2 className={styles.title}>
            {target.title}
          </h2>


          <div className={styles.toggleBox}>
            <Toggle checked={allOn} onChange={handleToggle} />
            <p className={styles.toggleInfoText}>
              강제 OFF를 원할 경우 <br />
              ON을 5초간 눌러주세요.
            </p>
          </div>

          {
            allOn && (
              <p className={styles.infoText}>
                <span className={styles.color01}>현재 전력 사용량</span>이 최근 7일간 <span className={styles.color02}>평균 전력 사용량</span> 이하일 때만 OFF 가능합니다.
              </p>

            )
          }

          <h3 className={`${styles.title02} mb-30`}>최근 일주일 간 전력 사용량</h3>

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

          <section className="mt-50">
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
        </div>

        {
          allOn && (
            <div className={`${styles.modalWrap} ${styles.active}`}>
              <div className={styles.modalBox}>
                <h3>
                  주의사항
                </h3>
                <p>
                  원격 전력 차단 시 공장 비가동 여부를 <br />
                  반드 시 확인한 후 OFF 해주시기 바랍니다. <br />
                  공장 가동 중 전력 차단할 경우 안전상의 문제와 <br />
                  경제적인 문제가 발생할 수 있습니다.
                </p>
                <div className={styles.btnBox}>
                  <button
                    className={styles.btn}
                    onClick={handleCancle}
                  >
                    취소
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => navigate("/scheduled-block")}
                  >
                    전력차단
                  </button>
                </div>
              </div>
            </div>
          )
        }

      </Main>

    </>

  )

}