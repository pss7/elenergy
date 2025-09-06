import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function DataCollectionPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="개인정보 보호"
        prevLink="/privacy"
        className="white-bg"
      />

      <Main id="sub" className="white-bg">

        <div className={styles.privacyBox}>
          <h2 className={`${styles.tit} mb-30`}>
            개인 정보 수집 및 이용(필수)
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