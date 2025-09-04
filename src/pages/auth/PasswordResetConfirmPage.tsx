import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { validateName, validatePhone, validateUserIdForReset, validateVerificationCode } from "../../utils/validation";
import styles from "./Auth.module.css";
import type { User } from "../../types/user";


export default function PasswordResetConfirmPage() {

  //경로이동
  const navigate = useNavigate();

  //로컬스토리지 데이터 불러오기
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem("signupData");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch {
        setUsers([]);
      }
    }

  }, [])

  //입력한 데이터 찾기
  const [userPwResetError, setUserPwResetError] = useState("");

  function handlePwReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const matchedUser = users.find(function (user) {
      return user.userId === userId && user.userName === userName && user.userPhone === userPhone;
    });

    if (!matchedUser) {
      setUserPwResetError("일치하는 회원정보가 없습니다. 회원가입을 해주세요.");
    } else {
      setUserPwResetError("");
      navigate("/password-reset", {
        state: {
          userId: matchedUser.userId,
        },
      });
    }
  }

  //입력값 상태 관리
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoneError, setUserPhoneError] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userNumberError, setUserNumberError] = useState("");

  //아이디 변경 핸들러
  function handleUseridChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserId(value);
    setUserIdError(validateUserIdForReset(value, users));
  }

  // 이름 변경 핸들러
  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserName(value);
    setUserNameError(validateName(value))
  }

  //전화번호 변경 핸들러
  function handleUserPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPhone(value);
    setUserPhoneError(validatePhone(value));
  }

  //인증번호 변경 핸들러
  function handleUserNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserNumber(value);
    setUserNumberError(validateVerificationCode(value));
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
          <form onSubmit={handlePwReset}>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                아이디
              </span>
              <Input
                type="text"
                id="id"
                onChange={handleUseridChange}
              />
              <label htmlFor="id" className="blind">
                아이디입력
              </label>
              {
                userId && <p className="errorMessage">{userIdError}</p>
              }
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <div className={styles.inputTextBox}>
                <span className={styles.label}>이름</span>
                <Input
                  type="text"
                  id="name"
                  onChange={handleUserNameChange}
                />
                <label htmlFor="name" className="blind">
                  이름입력
                </label>
                {
                  userName && <p className="errorMessage">{userNameError}</p>
                }
              </div>
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                전화번호
              </span>

              <div className="inputButtonBox">
                <Input
                  type="text"
                  id="phone"
                  onChange={handleUserPhoneChange}
                />
                <label htmlFor="phone" className="blind">
                  전화번호입력
                </label>
                <Button
                  type="button"
                  className="button"
                  disabled={userPhoneError !== "" || userPhone === ""}
                >
                  인증
                </Button>
              </div>
              {
                userPhone && <p className="errorMessage">{userPhoneError}</p>
              }
            </div>

            <div className={`${styles.formBox} mb-20`}>
              <span className={styles.label}>
                인증번호
              </span>
              <div className="inputButtonBox">
                <Input
                  type="text"
                  id="number"
                  onChange={handleUserNumberChange}
                />
                <label htmlFor="number" className="blind">
                  인증번호입력
                </label>
                <Button
                  type="button"
                  className="button"
                  disabled={userNumber.length !== 6}
                >
                  확인
                </Button>
              </div>
              {
                userNumber && <p className="errorMessage">{userNumberError}</p>
              }
            </div>

            {userPwResetError && <p className="errorMessage mb-30">{userPwResetError}</p>}

            <Button
              disabled={
                userIdError !== "" ||
                userNameError !== "" ||
                userPhoneError !== "" ||
                userNumberError !== "" ||
                !userId ||
                !userName ||
                !userPhone ||
                !userNumber
              }
              type="submit"
            >
              비밀번호 재설정
            </Button>

          </form>
        </div>

      </Main>
    </>
  )

}