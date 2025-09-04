import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import Button from "../../components/ui/Button";
import useNavigateTo from "../../hooks/useNavigateTo";

export default function SignupCompletePage() {

  //링크 이동
  const { navigateTo } = useNavigateTo();

  function handleSignin() {
    navigateTo("/signin");
  };

  return (

    <>

      <Header
        type="pageLink"
        title="회원가입"
        className="white-bg"
      />

      <Main id="sub"
        className="white-bg">
        <div className={styles.authBox}>
          <div className={styles.signupCompleteBox}>
            <p>
              회원가입이 완료되었습니다. <br />
              관리자가 가입 승인하면 정상적으로 사용 가능합니다.
            </p>
            <Button
              className="mt-40"
              onClick={handleSignin}
            >
              로그인
            </Button>
          </div>
        </div>
      </Main>

    </>

  )

}