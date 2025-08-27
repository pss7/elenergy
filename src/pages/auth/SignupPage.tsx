import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./Auth.module.css";
import Input from "../../components/ui/Input";
import { useState } from "react";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import { validateUserId, validateEmail, validatePassword } from "../../utils/validation";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {

  //경로이동
  const navigate = useNavigate();

  // 아이디, 비밀번호, 이메일 입력값 상태 관리
  const [userId, setUserId] = useState('');
  const [userIdError, setUserError] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPasswordError, setUserPasswordError] = useState('');
  const [userPwConfirm, setUserPwConfirm] = useState('');
  const [userPwConfirmError, setUserPwConfirmError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userEmailError, setUserEmailError] = useState('');
  const [userName, setUserName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [userRank, setUserRank] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [authNumber, setAuthNumber] = useState('');

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

  //비밀번호 재입력 핸들러
  function handleUserPwConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPwConfirm(value);
    if (userPassword !== value) {
      setUserPwConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setUserPwConfirmError('');
    }
  }

  //이메일 변경 핸들러
  function handleUserEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserEmail(value);
    setUserEmailError(validateEmail(value));
  }

  // 이름 변경 핸들러
  function handleUserNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserName(e.target.value);
  }

  // 회사코드 변경 핸들러
  function handleCompanyCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCompanyCode(e.target.value);
  }

  // 직급 변경 핸들러
  function handleUserRankChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserRank(e.target.value);
  }

  // 전화번호 변경 핸들러
  function handleUserPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserPhone(e.target.value);
  }

  // 인증번호 변경 핸들러
  function handleAuthNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAuthNumber(e.target.value);
  }

  // 제출 핸들러
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. 모든 필드 유효성 검사 다시 실행
    const idError = validateUserId(userId);
    const pwError = validatePassword(userPassword);
    const emailError = validateEmail(userEmail);
    const pwConfirmError = userPassword !== userPwConfirm ? "비밀번호가 일치하지 않습니다." : "";

    // 2. 에러 상태 업데이트
    setUserError(idError);
    setUserPasswordError(pwError);
    setUserEmailError(emailError);
    setUserPwConfirmError(pwConfirmError);

    // 3. 에러가 하나라도 있으면 제출 중단
    if (idError || pwError || emailError || pwConfirmError) {
      return; // 에러가 있으니 제출 취소
    }

    // 4. 유효성 통과 시 로컬스토리지에 저장 (예시)
    const userData = {
      userId,
      userPassword,
      userEmail,
      userName,
      companyCode,
      userRank,
      userPhone,
      authNumber,
    };
    localStorage.setItem("signupData", JSON.stringify(userData));

    // 5. 회원가입 완료 페이지로 이동
    navigate("/signup-complete"); // 완료 페이지 경로에 맞게 수정
  }

  // 제출 버튼 활성화 조건
  const isFormValid =
    userId &&
    !userIdError &&
    userPassword &&
    !userPasswordError &&
    userPwConfirm &&
    !userPwConfirmError &&
    userEmail &&
    !userEmailError;

  return (

    <>

      <Header
        type="pageLink"
        title="회원가입"
        prevLink="/signup-agree"
      />

      <Main id="sub">
        <div className={styles.signupBox}>

          <form onSubmit={handleSubmit}>

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
              <span className={styles.label}>
                이름
              </span>
              <Input
                type="text"
                id="name"
                onChange={handleUserNameChange}
              />
              <label htmlFor="name" className="blind">
                이름입력
              </label>
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                회사코드
              </span>
              <Input
                type="text"
                id="code"
                onChange={handleCompanyCodeChange}
              />
              <label htmlFor="code" className="blind">
                회사코드입력
              </label>
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                직급
              </span>
              <Input
                type="text"
                id="rank"
                onChange={handleUserRankChange}
              />
              <label htmlFor="rank" className="blind">
                직급입력
              </label>
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                이메일
              </span>
              <Input
                type="text"
                id="email"
                onChange={handleUserEmailChange}
              />
              <label htmlFor="email" className="blind">
                이메일입력
              </label>
              {
                userEmail && <p className="errorMessage">{userEmailError}</p>
              }
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

            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>
                인증번호
              </span>
              <div className="inputButtonBox">
                <Input
                  type="text"
                  id="number"
                  onChange={handleAuthNumberChange}
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

            <div className={`${styles.inputTextBox} mb-20`}>
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
              disabled={!isFormValid}
              className="mt-40"
            >
              가입하기
            </Button>

          </form>

        </div>
      </Main>

    </>

  )

}