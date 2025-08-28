import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";

export default function AlarmFilterPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="필터"
        prevLink="/alarm"
      />

      <Main id="sub">
        <div className={styles.alarmBox}>




        </div>
      </Main>

    </>
  )

}