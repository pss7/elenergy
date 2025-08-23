import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import Button from "../../components/ui/Button";

export default function SignupCompletePage() {

  return (

    <>

      <Header
        type="pageLink"
        title="회원가입"
      />

      <Main id="sub">
        <div className={styles.signupCompleteBox}>
          <p>
            회원가입이 완료되었습니다. <br />
            관리자가 가입 승인하면 정상적으로 사용 가능합니다.
          </p>
          <Button
            className="mt-40"
          >
            로그인
          </Button>
        </div>
      </Main>

    </>

  )

}