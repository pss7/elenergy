import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function PrivacyPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="개인정보 보호"
        prevLink="/my"
      />

      <Main id="sub">

        <div className={styles.privacyBox}>

          <div className={styles.box}>
            <h2>
              이용약관 및 정책
            </h2>
            <ul className={styles.linkList}>
              <li>
                <Link to="/terms">이용약관(필수)</Link>
              </li>
            </ul>
          </div>

          <div className={styles.box}>
            <h2>
              개인 정보 수집 및 이용(필수)
            </h2>
            <ul className={styles.linkList}>
              <li>
                <Link to="/data-collection">개인 정보 수집 및 이용(필수)</Link>
              </li>
              <li>
                <Link to="/event-notifications">이벤트・혜택 정보 수신(선택)</Link>
              </li>
            </ul>
          </div>

          <div className={styles.box}>
            <h2>
              보안 및 이력 관리
            </h2>
            <ul className={styles.linkList}>
              <li>
                <Link to="/login-history">로그인 이력 조회</Link>
              </li>
            </ul>
          </div>
        </div>

      </Main>

    </>
  )
}