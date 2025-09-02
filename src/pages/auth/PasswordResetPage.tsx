import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useCodeInput from "../../hooks/useCodeInput";
import styles from "./Auth.module.css";

export default function PasswordResetPage() {

  const phoneInput = useCodeInput(6);
  const verifyCodeInput = useCodeInput(6);

  return (
    <>
      <Header
        type="pageLink"
        title="비밀번호 재설정"
        prevLink="/signin"
      />

      <Main id="sub">
        <form>

          <div className={`${styles.formBox} mb-30`}>
            <span className={styles.label}>
              아이디
            </span>
            <Input
              type="text"
              id="id"
            />
            <label htmlFor="id" className="blind">
              아이디입력
            </label>
          </div>

          <div className={`${styles.formBox} mb-30`}>
            <div className={styles.inputTextBox}>
              <span className={styles.label}>이름</span>
              <Input
                type="text"
                id="name"
              />
              <label htmlFor="name" className="blind">
                이름입력
              </label>
            </div>
          </div>

          <div className={`${styles.formBox} mb-30`}>
            <span className={styles.label}>
              휴대전화번호
            </span>

            <div className="inputButtonBox">
              <Input
                type="text"
                id="phone"
                value={phoneInput.value}
                onChange={phoneInput.onChange}
              />
              <label htmlFor="phone" className="blind">
                전화번호입력
              </label>
              <Button
                type="button"
                className="button"
                disabled={!phoneInput.isValid}
              >
                인증
              </Button>
            </div>
          </div>

          <div className={`${styles.formBox} mb-30`}>
            <span className={styles.label}>
              인증번호
            </span>
            <div className="inputButtonBox">
              <Input
                type="text"
                id="number"
                value={verifyCodeInput.value}
                onChange={verifyCodeInput.onChange}
              />
              <label htmlFor="number" className="blind">
                인증번호입력
              </label>
              <Button
                type="button"
                className="button"
                disabled={!verifyCodeInput.isValid}
              >
                확인
              </Button>
            </div>
          </div>

          <Button
            disabled
          >
            비밀번호 재설정
          </Button>

        </form>
      </Main>
    </>
  )

}