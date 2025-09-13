// src/pages/auth/SignupPage.tsx
import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import Input from "../../components/ui/Input";
import { useState } from "react";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import {
  validateUserId,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateCompanyCode,
  validatePosition,
  validateVerificationCode,
} from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import {
  formatPhoneNumber,
  formatVerificationCode,
} from "../../utils/formatters";

export default function SignupPage() {
  const navigate = useNavigate();

  // 입력값 상태
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPasswordError, setUserPasswordError] = useState("");
  const [userPwConfirm, setUserPwConfirm] = useState("");
  const [userPwConfirmError, setUserPwConfirmError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userEmailError, setUserEmailError] = useState("");
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [userCompanyCode, setUserCompanyCode] = useState("");
  const [userCodeError, setUserCodeError] = useState("");
  const [userRank, setUserRank] = useState("");
  const [userRankError, setUserRankError] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPhoneError, setUserPhoneError] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userNumberError, setUserNumberError] = useState("");

  // 핸들러들
  function handleUseridChange(e: React.ChangeEvent<HTMLInputElement>) {
    // 입력은 소문자/숫자만 허용(allowedPattern으로 이미 차단됨) + 검증
    const value = e.target.value;
    setUserId(value);
    setUserIdError(validateUserId(value));
  }

  function handleUserPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPassword(value);
    setUserPasswordError(validatePassword(value));
  }

  function handleUserPwConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPwConfirm(value);
    setUserPwConfirmError(userPassword !== value ? "비밀번호가 일치하지 않습니다." : "");
  }

  function handleUserEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserEmail(value);
    setUserEmailError(validateEmail(value));
  }

  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserName(value);
    setUserNameError(validateName(value));
  }

  function handleUserPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value); // 숫자만 추출 → 하이픈 포맷
    setUserPhone(formatted);
    const onlyDigits = formatted.replace(/\D/g, "");
    setUserPhoneError(validatePhone(onlyDigits));
  }

  function handleUserNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const formatted = formatVerificationCode(value);
    setUserNumber(formatted);
    setUserNumberError(validateVerificationCode(formatted));
  }

  function handleCompanyCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserCompanyCode(value);
    setUserCodeError(validateCompanyCode(value));
  }

  function handleUserRankChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserRank(value);
    setUserRankError(validatePosition(value));
  }

  // 제출
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1) 최종 유효성 체크
    const idError = validateUserId(userId);
    const pwError = validatePassword(userPassword);
    const pwConfirmError =
      userPassword !== userPwConfirm ? "비밀번호가 일치하지 않습니다." : "";
    const nameError = validateName(userName);
    const emailError = validateEmail(userEmail);
    const companyCodeError = validateCompanyCode(userCompanyCode);
    const rankError = validatePosition(userRank);

    // 2) 에러 상태 반영
    setUserIdError(idError);
    setUserPasswordError(pwError);
    setUserPwConfirmError(pwConfirmError);
    setUserEmailError(emailError);
    setUserNameError(nameError);
    setUserCodeError(companyCodeError);
    setUserRankError(rankError);

    if (
      idError ||
      pwError ||
      pwConfirmError ||
      emailError ||
      nameError ||
      companyCodeError ||
      rankError
    ) {
      return;
    }

    // 3) 저장 데이터 구성 (가입일 저장)
    const nowIso = new Date().toISOString();
    const newUser = {
      userId,
      userPassword,
      userEmail,
      userName,
      userCompanyCode,
      userRank,
      userPhone,
      createdAt: nowIso, // 가입일
      role: "일반",
    };

    // 4) signupData 배열에 저장/추가
    try {
      const prev = localStorage.getItem("signupData");
      const list = prev ? JSON.parse(prev) : [];
      const next = Array.isArray(list) ? [...list, newUser] : [newUser];
      localStorage.setItem("signupData", JSON.stringify(next));
    } catch {
      localStorage.setItem("signupData", JSON.stringify([newUser]));
    }

    // 5) accounts에도 함께 적재(선택)
    try {
      const prevAcc = localStorage.getItem("accounts");
      let accArr: any[] = [];
      if (prevAcc) {
        const parsed = JSON.parse(prevAcc);
        accArr = Array.isArray(parsed) ? parsed : [parsed];
      }
      accArr.push(newUser);
      localStorage.setItem("accounts", JSON.stringify(accArr));
    } catch {}

    // 6) 현재 로그인 사용자로 지정
    localStorage.setItem("currentUserId", userId);

    // 7) 완료 페이지 이동
    navigate("/signup-complete");
  }

  const isFormValid =
    userId &&
    !userIdError &&
    userPassword &&
    !userPasswordError &&
    userPwConfirm &&
    !userPwConfirmError &&
    userEmail &&
    !userEmailError &&
    userName &&
    !userNameError &&
    userCompanyCode &&
    !userCodeError &&
    userRank &&
    !userRankError;

  return (
    <>
      <Header
        type="pageLink"
        title="회원가입"
        prevLink="/signup-agree"
        className="white-bg"
      />

      <Main id="sub" className="white-bg">
        <div className={styles.authBox}>
          <div className={styles.signupBox}>
            <form onSubmit={handleSubmit}>
              {/* 아이디: 소문자+숫자, 최대 12자 */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>아이디</span>
                <Input
                  type="text"
                  id="id"
                  maxLength={12}
                  allowedPattern={/^[a-z0-9]*$/}
                  onChange={handleUseridChange}
                />
                <label htmlFor="id" className="blind">아이디입력</label>
                {userId && <p className="errorMessage">{userIdError}</p>}
              </div>

              {/* 비밀번호 */}
              <div className={`${styles.inputTextBox} mb-20`}>
                <span className={styles.label}>비밀번호</span>
                <PasswordInput id="password" onChange={handleUserPasswordChange} />
                <label htmlFor="password" className="blind">비밀번호</label>
                {userPassword && <p className="errorMessage">{userPasswordError}</p>}
              </div>

              {/* 비밀번호 재입력 */}
              <div className={`${styles.inputTextBox} mb-20`}>
                <span className={styles.label}>비밀번호 재입력</span>
                <PasswordInput id="password02" onChange={handleUserPwConfirmChange} />
                <label htmlFor="password02" className="blind">비밀번호 재입력</label>
                {userPwConfirm && <p className="errorMessage">{userPwConfirmError}</p>}
              </div>

              {/* 이름: 한글만, 최대 5자 */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>이름</span>
                <Input
                  type="text"
                  id="name"
                  maxLength={5}
                  allowedChars="hangul"
                  onChange={handleUserNameChange}
                />
                <label htmlFor="name" className="blind">이름입력</label>
                {userName && <p className="errorMessage">{userNameError}</p>}
              </div>

              {/* 이메일: 기본 허용문자만 (검증은 validateEmail로) */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>이메일</span>
                <Input
                  type="text"
                  id="email"
                  maxLength={254}
                  allowedPattern={/^[A-Za-z0-9@._%+\-]*$/}
                  onChange={handleUserEmailChange}
                />
                <label htmlFor="email" className="blind">이메일입력</label>
                {userEmail && <p className="errorMessage">{userEmailError}</p>}
              </div>

              {/* 전화번호: 숫자/하이픈만 표시(내부 포맷), 최대 13자 (010-1234-5678) */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>전화번호</span>
                <div className="inputButtonBox">
                  <Input
                    type="text"
                    id="phone"
                    inputMode="numeric"
                    maxLength={13}
                    allowedPattern={/^[0-9-]*$/}
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

              {/* 인증번호: 숫자 6자리 */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>인증번호</span>
                <div className="inputButtonBox">
                  <Input
                    type="text"
                    id="number"
                    inputMode="numeric"
                    maxLength={6}
                    allowedChars="digits"
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

              {/* 회사코드: 숫자 6자리 */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>회사코드</span>
                <Input
                  type="text"
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  allowedChars="digits"
                  onChange={handleCompanyCodeChange}
                />
                <label htmlFor="code" className="blind">회사코드입력</label>
                {userCompanyCode && <p className="errorMessage">{userCodeError}</p>}
              </div>

              {/* 직급: 한글만 */}
              <div className={`${styles.formBox} mb-30`}>
                <span className={styles.label}>직급</span>
                <Input
                  type="text"
                  id="rank"
                  allowedChars="hangul"
                  onChange={handleUserRankChange}
                />
                <label htmlFor="rank" className="blind">직급입력</label>
                {userRank && <p className="errorMessage">{userRankError}</p>}
              </div>

              <Button disabled={!isFormValid} className="mt-40">
                가입하기
              </Button>
            </form>
          </div>
        </div>
      </Main>
    </>
  );
}
