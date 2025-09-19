import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      className={`${styles.toggleSwitch} ${checked ? styles.on : ""}`}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    >
      <span className={`${styles.toggleText} ${styles.offText}`}>OFF</span>
      <span className={`${styles.toggleText} ${styles.onText}`}>ON</span>
      <div className={styles.toggleCircle}></div>
    </div>
  );
}

type NotificationSettings = {
  marketing: boolean; // 이벤트·혜택 정보 수신 동의
  appPush: boolean;   // 앱푸시
  sms: boolean;       // SMS
};

const STORAGE_KEY = "notificationSettings";

export default function NotificationSettingsPage() {
  // 로컬스토리지에서 초기값 로드
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // ✅ 기본값: 앱푸시/SMS 활성화
        return { marketing: false, appPush: true, sms: true };
      }
      const parsed = JSON.parse(raw);
      return {
        marketing: !!parsed.marketing,
        appPush: parsed.appPush === undefined ? true : !!parsed.appPush,
        sms: parsed.sms === undefined ? true : !!parsed.sms,
      };
    } catch {
      return { marketing: false, appPush: true, sms: true };
    }
  });

  // 변경사항 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // 각 항목 독립 토글
  const toggleMarketing = () =>
    setSettings((s) => ({ ...s, marketing: !s.marketing }));
  const toggleAppPush = () =>
    setSettings((s) => ({ ...s, appPush: !s.appPush }));
  const toggleSms = () =>
    setSettings((s) => ({ ...s, sms: !s.sms }));

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
                <Link to="/event-notifications">내용보기</Link>
              </div>
              <Toggle checked={settings.marketing} onChange={toggleMarketing} />
            </li>

            <li>
              <span>앱푸시</span>
              <Toggle checked={settings.appPush} onChange={toggleAppPush} />
            </li>

            <li>
              <span>SMS</span>
              <Toggle checked={settings.sms} onChange={toggleSms} />
            </li>
          </ul>
        </div>
      </Main>
    </>
  );
}
