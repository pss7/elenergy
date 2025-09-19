import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import InputCheckbox from "../../components/ui/InputCheckbox";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { Link } from "react-router-dom";
import useNavigateTo from "../../hooks/useNavigateTo";

const NOTI_STORAGE_KEY = "notificationSettings";

export default function SignupAgreePage() {
  //경로이동
  const { navigateTo } = useNavigateTo();

  //전체동의 상태관리
  const [allAgreed, setAllAgreed] = useState(false);

  //체크박스 상태관리
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeInfo, setAgreeInfo] = useState(false); // 이벤트/혜택 수신(선택)

  //약관 전체 동의 토글 함수
  function toggleAllAgreements() {
    const next = !allAgreed;
    setAllAgreed(next);
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeInfo(next);
  }

  //네비이동
  function handleConfirm() {
    // 필수 체크 확인 (원하면 가드 추가)
    // if (!agreeTerms || !agreePrivacy) return;

    // ✅ 회원가입 시 알림 설정 초기화/저장
    // - marketing은 이벤트 수신 동의(agreeInfo)에 따라 반영
    // - appPush, sms는 디폴트 활성화
    const nextSettings = {
      marketing: !!agreeInfo,
      appPush: true,
      sms: true,
    };
    try {
      localStorage.setItem(NOTI_STORAGE_KEY, JSON.stringify(nextSettings));
    } catch {
      // 저장 실패는 무시
    }

    navigateTo("/signup");
  }

  return (
    <>
      <Header
        type="pageLink"
        title="회원가입"
        prevLink="/signin"
        className="white-bg"
      />

      <Main id="sub" className="white-bg">
        <div className={styles.authBox}>
          <div className={styles.signupAgreeBox}>
            <form>
              <div className={`${styles.formBox} mb-30`}>
                <InputCheckbox
                  id="chk01"
                  htmlFor="chk01"
                  label="전체동의"
                  checked={allAgreed}
                  onChange={toggleAllAgreements}
                />
                <div className={styles.box}>
                  <p className={styles.infoText}>
                    이벤트・혜택 정보 수신 (선택) 동의를 포함합니다.
                  </p>
                </div>
              </div>

              <div className={`${styles.formBox} mb-30`}>
                <div className={styles.layoutBox}>
                  <InputCheckbox
                    id="chk02"
                    htmlFor="chk02"
                    label="[필수] 이용약관"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                  />
                  <Link to="/terms" className={styles.view}>전체</Link>
                </div>
                <div className={styles.box}><Textarea /></div>
              </div>

              <div className={`${styles.formBox} mb-30`}>
                <div className={styles.layoutBox}>
                  <InputCheckbox
                    id="chk03"
                    htmlFor="chk03"
                    label="[필수] 개인정보처리 방침"
                    checked={agreePrivacy}
                    onChange={() => setAgreePrivacy(!agreePrivacy)}
                  />
                  <Link to="/data-collection" className={styles.view}>전체</Link>
                </div>
                <div className={styles.box}><Textarea /></div>
              </div>

              <div className={`${styles.formBox} mb-30`}>
                <div className={styles.layoutBox}>
                  <InputCheckbox
                    id="chk04"
                    htmlFor="chk04"
                    label="[선택] 이벤트・혜택 정보 수신"
                    checked={agreeInfo}
                    onChange={() => setAgreeInfo(!agreeInfo)}
                  />
                  <Link to="/event-notifications" className={styles.view}>전체</Link>
                </div>
                <div className={styles.box}><Textarea /></div>
              </div>
            </form>
          </div>

          <Button onClick={handleConfirm}>확인</Button>
        </div>
      </Main>
    </>
  );
}
