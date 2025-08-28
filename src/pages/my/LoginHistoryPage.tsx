import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function LoginHistoryPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="개인정보 보호"
        prevLink="/privacy"
      />

      <Main id="sub">

        <div className={styles.loginHistoryBox}>
          <h2 className={`${styles.tit} mb-10`}>
            로그인 이력 조회
          </h2>
          <p className={styles.infoText}>
            최근 90일간 로그인했던 환경을 확인할 수 있습니다. 직접 로그인하지 않은 기록이 있다면, 개인정보 보호를 위해 비밀번호를 변경해주세요.
          </p>

          <h3>
            모바일 접속 시 표시되는 IP 및 위치 정보 안내
          </h3>

          <ul className={styles.loginHistoryList}>
            <li>
              <div className={styles.box}>
                <span>일시</span>
                <em>2025-10-15 12:55:21</em>
              </div>
              <div className={styles.box}>
                <span>기기/OS</span>
                <em>SM-S123N / Android</em>
              </div>
              <div className={styles.box}>
                <span>IP주소</span>
                <em>175.000.000.000</em>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <span>일시</span>
                <em>2025-10-15 12:55:21</em>
              </div>
              <div className={styles.box}>
                <span>기기/OS</span>
                <em>SM-S123N / Android</em>
              </div>
              <div className={styles.box}>
                <span>IP주소</span>
                <em>175.000.000.000</em>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <span>일시</span>
                <em>2025-10-15 12:55:21</em>
              </div>
              <div className={styles.box}>
                <span>기기/OS</span>
                <em>SM-S123N / Android</em>
              </div>
              <div className={styles.box}>
                <span>IP주소</span>
                <em>175.000.000.000</em>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <span>일시</span>
                <em>2025-10-15 12:55:21</em>
              </div>
              <div className={styles.box}>
                <span>기기/OS</span>
                <em>SM-S123N / Android</em>
              </div>
              <div className={styles.box}>
                <span>IP주소</span>
                <em>175.000.000.000</em>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <span>일시</span>
                <em>2025-10-15 12:55:21</em>
              </div>
              <div className={styles.box}>
                <span>기기/OS</span>
                <em>SM-S123N / Android</em>
              </div>
              <div className={styles.box}>
                <span>IP주소</span>
                <em>175.000.000.000</em>
              </div>
            </li>
          </ul>

          <div className={styles.viewBtnBox}>
            <button className={styles.viewBtn}>
              <span>
                더보기
              </span>
            </button>
          </div>

        </div>

      </Main>

    </>
  )
}