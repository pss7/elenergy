import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./Auth.module.css";

export default function IdFindPage() {

  return (
    <>
      <Header
        type="pageLink"
        title="아아디 찾기"
        prevLink="/signin"
      />

      <Main id="sub">
        <form>

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
              />
              <label htmlFor="phone" className="blind">
                휴대전화번호입력
              </label>
              <Button
                type="button"
                className="button"
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
              />
              <label htmlFor="number" className="blind">
                인증번호입력
              </label>
              <Button
                type="button"
                className="button"
              >
                확인
              </Button>
            </div>
          </div>

          <Button
            disabled
          >
            아이디 찾기
          </Button>

        </form>
      </Main>
    </>
  )

}