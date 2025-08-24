import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

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

export default function NotificationSettingsPage() {

  const [allOn, setAllOn] = useState(false);
  const [appPush, setAppPush] = useState(false);
  const [sms, setSms] = useState(false);

  // 전체 수신 토글
  function handleAllToggle() {
    const next = !allOn;
    setAllOn(next);
    setAppPush(next);
    setSms(next);
  }

  return (
    <>
      <Header type="pageLink" title="알림설정" prevLink="/my" />

      <Main id="sub">
        <div className={styles.notificationBox}>
          <h2>혜택 알림</h2>
          <p>(주)이엘에너지의 다양한 혜택 정보를 받을 수 있어요.</p>

          <ul className={styles.notificationList}>
            <li>
              <div className={styles.textBox}>
                <h3>이벤트・혜택 정보 수신</h3>
                <Link to="#">내용보기</Link>
              </div>
              <Toggle checked={allOn} onChange={handleAllToggle} />
            </li>
            <li>
              <span>앱푸시</span>
              <Toggle
                checked={appPush}
                onChange={() => {
                  const next = !appPush;
                  setAppPush(next);
                  setAllOn(next && sms); // 둘 다 true면 전체도 true
                }}
              />
            </li>
            <li>
              <span>SMS</span>
              <Toggle
                checked={sms}
                onChange={() => {
                  const next = !sms;
                  setSms(next);
                  setAllOn(next && appPush); // 둘 다 true면 전체도 true
                }}
              />
            </li>
          </ul>
        </div>
      </Main>
    </>
  );
}
