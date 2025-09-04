import { Link, useNavigate } from "react-router-dom";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./Auth.module.css";
import Header from "../../components/layout/Header";
import { useState } from "react";
import PasswordInput from "../../components/ui/PasswordInput";

export default function SigninPage() {

  //경로이동
  const navigate = useNavigate();

  //입력 상태관리
  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");

  //오류메시지 상태관리
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [userPasswordError, setUserPasswordError] = useState("");
  const [userIdError, setUserIdError] = useState("");

  //아이디 유효성 검사
  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserId(value);

    if (value === "") {
      setUserIdError("아이디를 입력해주세요.");
      setLoginErrorMessage("");
    } else {
      setUserIdError(""); // 정상 입력 시 에러 제거
    }
  }

  //비밀번호 유효성 검사
  function handlePwChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPassword(value);

    if (value === "") {
      setUserPasswordError("비밀번호를 입력해주세요.");
      setLoginErrorMessage("");
    } else {
      setUserPasswordError("");
    }
  }

  //폼 제출
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!userId || !userPassword) {
      setLoginErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    // 회원가입 시 저장된 유저 정보 가져오기
    const storedData = localStorage.getItem("signupData");
    if (!storedData) {
      setLoginErrorMessage("등록된 회원 정보가 없습니다.");
      return;
    }

    const users = JSON.parse(storedData);

    const matchedUser = users.find(
      (user: any) =>
        user.userId === userId.trim() &&
        user.userPassword === userPassword.trim()
    );

    if (!matchedUser) {
      setLoginErrorMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 로그인 성공 처리
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
  }

  return (
    <>
      <Header type="logo" className="white-bg" />

      <Main id="sub" className="white-bg">

        <div className={styles.authBox}>
          <div className={styles.signinBox}>

            <form onSubmit={handleLogin}>
              <div className={`${styles.inputTextBox} mb-20`}>
                <span className={styles.label}>아이디</span>
                <Input
                  value={userId}
                  type="text"
                  onChange={handleIdChange}
                />
                <p className="errorMessage">
                  {userIdError}
                </p>
              </div>

              <div className={`${styles.inputTextBox} mb-20`}>
                <span className={styles.label}>비밀번호</span>
                <PasswordInput
                  id="password"
                  value={userPassword}
                  onChange={handlePwChange}
                />
                <p className="errorMessage">
                  {userPasswordError}
                </p>
              </div>
              {
                loginErrorMessage && (
                  <p className="errorMessage">
                    {loginErrorMessage}
                  </p>
                )
              }

              <Button
                className="mt-40"
                type="submit"
                disabled={!userId || !userPassword}
              >
                로그인
              </Button>
            </form>

            <ul className={styles.link}>
              <li><Link to="/id-find">아이디 찾기</Link></li>
              <li><Link to="/password-reset-confirm">비밀번호 재설정</Link></li>
              <li><Link to="/signup-agree">회원가입</Link></li>
            </ul>
          </div>
        </div>

      </Main>
    </>
  );
}
