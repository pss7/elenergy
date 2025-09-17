// src/pages/auth/IdFindPage.tsx
import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./Auth.module.css";
import {
  validateName,
  validatePhone,
  validateVerificationCode,
} from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types/user";
import {
  formatPhoneNumber,
  formatVerificationCode,
} from "../../utils/formatters";

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export default function IdFindPage() {
  const navigate = useNavigate();

  // 입력값 상태
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoneError, setUserPhoneError] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userNumberError, setUserNumberError] = useState("");

  // 저장된 유저들
  const [users, setUsers] = useState<User[]>([]);
  const [userIdFindError, setUserIdFindError] = useState("");

  // 이름 변경
  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserName(value);
    setUserNameError(validateName(value));
  }

  // 전화번호 변경 (표시는 하이픈, 검증은 숫자만)
  function handleUserPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneNumber(e.target.value);
    setUserPhone(formatted);
    setUserPhoneError(validatePhone(onlyDigits(formatted)));
  }

  // 인증번호 변경 (숫자 6자리)
  function handleUserNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatVerificationCode(e.target.value);
    setUserNumber(formatted);
    setUserNumberError(validateVerificationCode(formatted));
  }

  // 저장된 회원 불러오기
  useEffect(() => {
    const storedUsers = localStorage.getItem("signupData");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch {
        setUsers([]);
      }
    }
  }, []);

  // 제출
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const myName = userName;
    const myPhoneDigits = onlyDigits(userPhone);

    const matchedUser = users.find((u) => {
      const storedDigits = onlyDigits(u.userPhone as unknown as string);
      return u.userName === myName && storedDigits === myPhoneDigits;
    });

    if (!matchedUser) {
      setUserIdFindError("일치하는 회원정보가 없습니다. 회원가입을 해주세요.");
    } else {
      setUserIdFindError("");
      navigate("/id-find-result", {
        state: { userId: matchedUser.userId },
      });
    }
  }

  return (
    <>
      <Header
        type="pageLink"
        title="아이디 찾기"
        prevLink="/signin"
        className="white-bg"
      />

      <Main id="sub" className="white-bg">
        <div className={styles.authBox}>
          <form onSubmit={handleSubmit}>
            {/* 이름 */}
            <div className={`${styles.formBox} mb-30`}>
              <div className={styles.inputTextBox}>
                <span className={styles.label}>이름</span>
                <Input
                  type="text"
                  id="name"
                  maxLength={5}
                  value={userName}
                  onChange={handleUserNameChange}
                />
                <label htmlFor="name" className="blind">이름입력</label>
                {userName && <p className="errorMessage">{userNameError}</p>}
              </div>
            </div>

            {/* 전화번호 */}
            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>전화번호</span>
              <div className="inputButtonBox">
                <Input
                  type="text"
                  id="phone"
                  inputMode="numeric"
                  maxLength={13}
                  value={userPhone}
                  onChange={handleUserPhoneChange}
                />
                <label htmlFor="phone" className="blind">전화번호입력</label>
                <Button
                  type="button"
                  className="button"
                  disabled={userPhoneError !== "" || userPhone === ""}
                >
                  인증
                </Button>
              </div>
              {userPhone && <p className="errorMessage">{userPhoneError}</p>}
            </div>

            {/* 인증번호 */}
            <div className={`${styles.formBox} mb-20`}>
              <span className={styles.label}>인증번호</span>
              <div className="inputButtonBox">
                <Input
                  type="text"
                  id="number"
                  inputMode="numeric"
                  maxLength={6}
                  value={userNumber}
                  onChange={handleUserNumberChange}
                />
                <label htmlFor="number" className="blind">인증번호입력</label>
                <Button
                  type="button"
                  className="button"
                  disabled={userNumber.length !== 6}
                >
                  확인
                </Button>
              </div>
              {userNumber && <p className="errorMessage">{userNumberError}</p>}
            </div>

            {userIdFindError && (
              <p className="errorMessage mb-30">{userIdFindError}</p>
            )}

            <Button
              disabled={
                userNameError !== "" ||
                userPhoneError !== "" ||
                userNumberError !== "" ||
                !userName ||
                !userPhone ||
                !userNumber
              }
              type="submit"
            >
              아이디 찾기
            </Button>
          </form>
        </div>
      </Main>
    </>
  );
}
