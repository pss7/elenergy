import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function WithdrawConfirmPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="회원탈퇴"
        prevLink="/withdraw-agree"
      />

      <Main id="sub">
        <div className={styles.withdrawBox}>
          <p className={styles.infoText01}>
            정말 탈퇴하시겠어요? <br />
            탈퇴에 대한 다음 안내사항을 확인해주세요.
          </p>

          <div className={styles.inputBox}>
            <Input
              id="password"
              placeholder="비밀번호"
            />
            <label htmlFor="password" className="blind">
              비밀번호
            </label>
          </div>

          <Button
            className="mt-30"
          >
            탈퇴하기
          </Button>

        </div>
      </Main>

    </>
  )
}