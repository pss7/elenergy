
import { useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import useNavigateTo from "../../hooks/useNavigateTo";
import styles from "./Auth.module.css";

export default function IdFindResultPage() {

  const location = useLocation();
  const { userId } = location.state || {}; // 안전하게 state에서 userId 추출

  //경로이동
  const { navigateTo } = useNavigateTo();

  function handleSignin() {
    navigateTo("/signin");
  }

  function handlePwReset() {
    navigateTo("/password-reset");
  }

  return (
    <>
      <Header
        type="pageLink"
        title="아이디 찾기"
        className="white-bg"
      />

      <Main id="sub"
        className="white-bg"
      >

        <div className={styles.authBox}>
          <div className={styles.idFindResultBox}>
            <p>
              입력하신 정보와 일치하는 아이디입니다.
            </p>

            <strong>{userId}</strong>

            <div className="btnBox">
              <Button
                onClick={handleSignin}
              >
                로그인
              </Button>
              <Button
                styleType="grayType"
                onClick={handlePwReset}
              >비밀번호찾기
              </Button>
            </div>
          </div>
        </div>

      </Main>
    </>
  )

}