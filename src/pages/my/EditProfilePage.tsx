import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import useCodeInput from "../../hooks/useCodeInput";

export default function EditProfilePage() {

  const phoneInput = useCodeInput(6);     // 전화번호
  const verifyCodeInput = useCodeInput(6); // 인증번호

  return (
    <>

      <Header
        type="pageLink"
        title="회원정보 수정"
        prevLink="/my-account"
      />

      <Main id="sub">
        <div className={styles.editProfileBox}>

          <form>

            <div className="formBox mb-30">
              <span className="label">
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

            <div className="formBox mb-30">
              <span className="label">
                이름
              </span>
              <Input
                type="text"
                id="name"
              />
              <label htmlFor="name" className="blind">
                이름입력
              </label>
            </div>

            <div className="formBox mb-30">
              <span className="label">
                회사코드
              </span>
              <Input
                type="text"
                id="code"
              />
              <label htmlFor="code" className="blind">
                회사코드입력
              </label>
            </div>

            <div className="formBox mb-30">
              <span className="label">
                직급
              </span>
              <Input
                type="text"
                id="rank"
              />
              <label htmlFor="rank" className="blind">
                직급입력
              </label>
            </div>

            <div className="formBox mb-30">
              <span className="label">
                이메일
              </span>
              <Input
                type="text"
                id="email"
              />
              <label htmlFor="email" className="blind">
                이메일입력
              </label>
            </div>

            <div className="formBox mb-30">
              <span className="label">
                전화번호
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

            <div className="formBox mb-30">
              <span className="label">
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

            <div className={`${styles.inputTextBox} mb-20`}>
              <span className="label">
                비밀번호
              </span>
              <PasswordInput
                id="password"
              />
              <label htmlFor="password" className="blind">비밀번호</label>
            </div>

            <div className={`${styles.inputTextBox} mb-20`}>
              <span className="label">
                비밀번호 재입력
              </span>
              <PasswordInput
                id="password02"
              />
              <label htmlFor="password02" className="blind">비밀번호 재입력</label>
            </div>

            <div className="btnBox">
              <Button
                styleType="grayType">
                취소
              </Button>
              <Button>
                수정
              </Button>
            </div>

          </form>

        </div>
      </Main>

    </>
  )
}