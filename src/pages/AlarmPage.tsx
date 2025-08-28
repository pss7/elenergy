import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";

export default function AlarmPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="알림"
        prevLink="/"
      />

      <Main id="sub">
        <div className={styles.alarmBox}>

          <div className={styles.filterLinkBox}>
            <Link to="/alarm-filter" className={styles.filterLink}>
              필터
            </Link>
          </div>

          <ul className={styles.alarmList}>
            <li>
              <div className={styles.imgBox}>
                <img src="/public/assets/images/common/control_icon01.svg" alt="수동제어아이콘" />
              </div>
              <div className={styles.textBox}>
                <h2>
                  수동 제어 - ID 1
                </h2>
                <span>
                  제어기 1 - # 공장 위치 OFF
                </span>
                <em className={styles.date}>
                  2025.08.14 오후 10:10
                </em>
              </div>
            </li>
            <li>
              <div className={styles.imgBox}>
                <img src="/public/assets/images/common/control_icon02.svg" alt="자동제어아이콘" />
              </div>
              <div className={styles.textBox}>
                <h2>
                  자동 제어 - ID 2
                </h2>
                <span>
                  제어기 2 - # 공장 위치 OFF
                </span>
                <em className={styles.date}>
                  2025.08.14 오후 10:10
                </em>
              </div>
            </li>
            <li>
              <div className={styles.imgBox}>
                <img src="/public/assets/images/common/control_icon03.svg" alt="예약제어아이콘" />
              </div>
              <div className={styles.textBox}>
                <h2>
                  예약 제어 - ID 1
                </h2>
                <span>
                  제어기 1 - # 공장 위치 OFF
                </span>
                <em className={styles.date}>
                  2025.08.14 오후 10:10
                </em>
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