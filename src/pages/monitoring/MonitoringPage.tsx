import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MonitoringPage.module.css";
import CustomSelect from "../../components/ui/CustomSelect";
import PowerDoughnutChart from "../../components/ui/PowerDoughnutChart";

export default function MonitoringPage() {
  return (

    <>

      <Header
        type="pageLink"
        title="전력모니터링"
        prevLink="/"
      />

      <Main id="sub">
        <div className={styles.monitoringBox}>
          <CustomSelect />

          <div className={styles.dateTabBox}>
            <button className={`${styles.btn} ${styles.active}`}>
              일별
            </button>
            <button className={styles.btn}>
              주별
            </button>
            <button className={styles.btn}>
              월별
            </button>
            <button className={styles.btn}>
              연도별
            </button>
          </div>

          <div className={styles.dateBox}>
            <button className={styles.prev}>
              <span className="blind">이전버튼</span>
            </button>
            <button className={styles.dateBtn}>
              2025년 08월 10일
            </button>
            <button className={styles.next}>
              <span className="blind">다음버튼</span>
            </button>
          </div>

          <div className={styles.chartBox}>
            <PowerDoughnutChart
              powerReductionRate={40}
              textTitle="절약한 대기전력"
              valueText="40Wh"
              size={227}
              lineWidth={35}
              titleFontSize="15px"
              valueFontSize="32px"
            />
          </div>

          <div className={styles.amountUsedBox}>

            <div className={styles.box}>
              <h2>
                총 전력 사용량
              </h2>
              <strong>
                200 <em>Wh</em>
              </strong>
              <span>
                12,000,000원
              </span>
            </div>

            <div className={styles.box}>
              <h2>
                총 절약한 전력량
              </h2>
              <strong>
                40 <em>Wh</em>
              </strong>
              <span>
                3,000,000원
              </span>
            </div>
          </div>
        </div>
      </Main>

    </>

  )

}