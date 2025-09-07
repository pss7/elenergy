import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function TermsOfUsePage() {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>

      <Header
        type="pageLink"
        title="개인정보 보호"
        prevLink={isLoggedIn ? "/privacy" : "/signup-agree"}
        className="white-bg"
      />

      <Main id="sub" className="white-bg">

        <div className={styles.privacyBox}>
          <h2 className={`${styles.tit} mb-30`}>
            이용약관(필수)
          </h2>

          <div className={styles.contentBox}>
            <h3>
              제1장 총칙
            </h3>
            <h3>
              제1조 목적
            </h3>
            <p>
              본 이용약관은
            </p>
          </div>

        </div>

      </Main>

    </>
  )
}