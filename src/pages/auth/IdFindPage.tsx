import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import styles from "./Auth.module.css";
import { validateName, validatePhone, validateVerificationCode } from "../../utils/validation";

export default function IdFindPage() {

  //입력값 상태 관리
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoneError, setUserPhoneError] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userNumberError, setUserNumberError] = useState("");
  const [users, setUsers] = useState<{ userId: string; userName: string; userPhone: string }[]>([]);
  const [userIdFindError, setUserIdFindError] = useState("");

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

  function handleIdFind(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const matchedUser = users.find(function (user) {
      return user.userName === userName && user.userPhone === userPhone;
    });

    if (!matchedUser) {
      setUserIdFindError("일치하는 회원정보가 없습니다. 회원가입을 해주세요.");
    } else {
      setUserIdFindError("");
      alert(`회원님의 아이디는 ${matchedUser.userId} 입니다.`);
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

      <Main id="sub"
        className="white-bg"
      >
        <form onSubmit={handleIdFind}>

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
              >
                인증
              </Button>
            </div>
            {
              userPhone && <p className="errorMessage">{userPhoneError}</p>
            }
          </div>

          <div className={`${styles.formBox} mb-30`}>
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
              >
                확인
              </Button>
            </div>
            {
              userNumber && <p className="errorMessage">{userNumberError}</p>
            }
          </div>

          {userIdFindError && <p className="errorMessage mb-30">{userIdFindError}</p>}

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
      </Main>
    </>
  )

}