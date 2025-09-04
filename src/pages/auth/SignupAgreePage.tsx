import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import InputCheckbox from "../../components/ui/InputCheckbox";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupAgreePage() {

  const navigate = useNavigate();

  //전체동의 상태관리
  const [allAgreed, setAllAgreed] = useState(false);

  //체크박스 상태관리
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeInfo, setAgreeInfo] = useState(false);

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
    if (agreeTerms && agreePrivacy && agreeInfo) {
      navigate("/signup");
    }
  }

  return (

    <>

      <Header
        type="pageLink"
        title="회원가입"
        prevLink="/signin"
        className="white-bg"
      />

      <Main id="sub"
        className="white-bg">
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

                  <a href="#" className={styles.view}>
                    전체
                  </a>
                </div>

                <div className={styles.box}>
                  <Textarea />
                </div>
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

                  <a href="#" className={styles.view}>
                    전체
                  </a>
                </div>

                <div className={styles.box}>
                  <Textarea />
                </div>
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

                  <a href="#" className={styles.view}>
                    전체
                  </a>
                </div>

                <div className={styles.box}>
                  <Textarea />
                </div>
              </div>
            </form>
          </div>

          <Button
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>

      </Main>

    </>

  )

}