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

  //상태관리
  const [userId, setUserId] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');

  //아이디 유효성 검사
  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserId(value);

    if (value === "") {
      setUserIdError("아이디를 입력해주세요.");
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
    } else {
      setUserPasswordError(""); // 정상 입력 시 에러 제거
    }
  }

  ///폼 제출
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!userId || !userPassword) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    // 회원가입 시 저장된 유저 정보 가져오기
    const storedData = localStorage.getItem("signupData");
    if (!storedData) {
      alert("등록된 회원 정보가 없습니다.");
      return;
    }

    const userData = JSON.parse(storedData);

    // 아이디/비밀번호 비교
    if (userData.userId !== userId || userData.userPassword !== userPassword) {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
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
            <li><Link to="/password-reset">비밀번호 재설정</Link></li>
            <li><Link to="/signup-agree">회원가입</Link></li>
          </ul>
        </div>
      </Main>
    </>
  );
}
