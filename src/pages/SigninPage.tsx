import { Link } from "react-router-dom";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import styles from "./Auth.module.css";
import Header from "../components/layout/Header";
import { useState } from "react";
import PasswordInput from "../components/ui/PasswordInput";
import { validateUserId, validatePassword } from "../utils/validation";

export default function SigninPage() {

  //아이디, 비밀번호 입력값 상태 관리
  const [userId, setUserId] = useState('');
  const [userIdError, setUserError] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  //아이디 변경 핸들러
  function handleUseridChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserId(value);
    setUserError(validateUserId(value));
  }

  //비밀번호 변경 핸들러
  function handleUserPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPassword(value);
    setUserPasswordError(validatePassword(value));
  }

  return (

    <>

      <Header
        type="logo"
      />

      <Main id="sub">
        <div className={styles.signinBox}>
          <div className={`${styles.inputTextBox} mb-20`}>
            <span className={styles.label}>
              아이디
            </span>
            <Input
              type="text"
              onChange={handleUseridChange}
            />
            {
              userId && <p className="errorMessage">{userIdError}</p>
            }
          </div>

          <div className={`${styles.inputTextBox} mb-20`}>
            <span className={styles.label}>
              비밀번호
            </span>
            <PasswordInput
              id="password"
              value={userPassword}
              onChange={handleUserPasswordChange}
              error={userPasswordError}
            />
            <label htmlFor="password" className="blind">비밀번호</label>
          </div>

          <Button
            className="mt-40"
            disabled={
              !userId ||
              !userPassword ||
              !!userIdError ||
              !!userPasswordError
            }
          >
            로그인
          </Button>

          <ul className={styles.link}>
            <li>
              <Link to="/id-find">아이디 찾기</Link>
            </li>
            <li>
              <Link to="/pw-find">비밀번호 재설정</Link>
            </li>
            <li>
              <Link to="/signup">회원가입</Link>
            </li>
          </ul>
        </div>
      </Main>

    </>

  )

}