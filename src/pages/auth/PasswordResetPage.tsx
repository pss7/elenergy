import { useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import styles from "./Auth.module.css";
import { validatePassword } from "../../utils/validation";
import { useLocation, useNavigate } from "react-router-dom";

export default function PasswordResetPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = location.state;
  const userId = userInfo?.userId;

  const [userPassword, setUserPassword] = useState("");
  const [userPasswordError, setUserPasswordError] = useState("");
  const [userPwConfirm, setUserPwConfirm] = useState("");
  const [userPwConfirmError, setUserPwConfirmError] = useState("");

  //비밀번호 변경 핸들러
  function handleUserPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPassword(value);
    setUserPasswordError(validatePassword(value));
  }

  //비밀번호 재입력 핸들러
  function handleUserPwConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPwConfirm(value);
    if (userPassword !== value) {
      setUserPwConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setUserPwConfirmError("");
    }
  }

  //비밀번호 변경
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. 유효성 검사
    const pwError = validatePassword(userPassword);
    const pwConfirmError =
      userPassword !== userPwConfirm ? "비밀번호가 일치하지 않습니다." : "";

    setUserPasswordError(pwError);
    setUserPwConfirmError(pwConfirmError);

    if (pwError || pwConfirmError) {
      return;
    }

    if (!userId) {
      alert("잘못된 접근입니다. 사용자 정보가 없습니다.");
      return;
    }

    // 2. 기존 유저 목록 가져오기
    const storedUsers = localStorage.getItem("signupData");
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // 3. 해당 userId를 가진 유저 찾기
    const userIndex = users.findIndex((user: any) => user.userId === userId);

    if (userIndex === -1) {
      alert("사용자를 찾을 수 없습니다.");
      return;
    }

    // 4. 비밀번호 변경
    users[userIndex].userPassword = userPassword;

    // 5. 다시 로컬스토리지에 저장
    localStorage.setItem("signupData", JSON.stringify(users));

    // 6. 완료 처리
    alert("비밀번호가 성공적으로 변경되었습니다.");
    navigate("/signin");
  }

  return (
    <>
      <Header
        type="pageLink"
        title="비밀번호 재설정"
        prevLink="/signin"
        className="white-bg"
      />

      <Main id="sub"
        className="white-bg">

        <div className={styles.authBox}>
          <form onSubmit={handleSubmit}>

            <div className={`${styles.inputTextBox} mb-20`}>
              <span className={styles.label}>
                비밀번호
              </span>
              <PasswordInput
                id="password"
                onChange={handleUserPasswordChange}
              />
              <label htmlFor="password" className="blind">비밀번호</label>
              {
                userPassword && <p className="errorMessage">{userPasswordError}</p>
              }
            </div>

            <div className={`${styles.inputTextBox} mb-30`}>
              <span className={styles.label}>
                비밀번호 재입력
              </span>
              <PasswordInput
                id="password02"
                onChange={handleUserPwConfirmChange}
              />
              <label htmlFor="password02" className="blind">비밀번호 재입력</label>
              {
                userPwConfirm && <p className="errorMessage">{userPwConfirmError}</p>
              }
            </div>

            <Button
              type="submit"
              disabled={
                userPasswordError !== "" ||
                userPwConfirmError !== "" ||
                !userPassword ||
                !userPwConfirm
              }
            >
              비밀번호 재설정
            </Button>

          </form>
        </div>

      </Main>
    </>
  )

}