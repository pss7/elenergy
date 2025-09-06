import Main from "../../components/layout/Main";
import Header from "../../components/layout/Header";
import styles from "./MyPage.module.css";
import Input from "../../components/ui/Input";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import {
  validateUserId, validateEmail, validatePassword, validateName,
  validatePhone, validateVerificationCode, validateCompanyCode, validatePosition
} from "../../utils/validation";
import { useNavigate } from "react-router-dom";

type RawAny = Record<string, any>;
type StoredUser = {
  userId: string;
  userPassword: string;
  userEmail: string;
  userName: string;
  userCompanyCode: string;
  userRank: string;
  userPhone: string;
};

function readUsers(): { list: StoredUser[]; source: "accounts" | "signupData" | null } {
  const fromAccounts = localStorage.getItem("accounts");
  if (fromAccounts) {
    try {
      const arr = JSON.parse(fromAccounts) as RawAny[];
      if (Array.isArray(arr)) {
        // accounts를 signupData 스키마로 맵핑 시도
        const mapped = arr.map((u) => ({
          userId: u.userId ?? u.id ?? u.username ?? "",
          userPassword: u.userPassword ?? u.password ?? "",
          userEmail: u.userEmail ?? u.email ?? "",
          userName: u.userName ?? u.name ?? "",
          userCompanyCode: u.userCompanyCode ?? u.company ?? "",
          userRank: u.userRank ?? u.position ?? "",
          userPhone: u.userPhone ?? u.phone ?? "",
        })) as StoredUser[];
        return { list: mapped, source: "accounts" };
      }
    } catch { }
  }

  const fromSignup = localStorage.getItem("signupData");
  if (fromSignup) {
    try {
      const parsed = JSON.parse(fromSignup);
      const arr: StoredUser[] = Array.isArray(parsed) ? parsed : [parsed];
      return { list: arr, source: "signupData" };
    } catch { }
  }

  return { list: [], source: null };
}

function writeUsers(source: "accounts" | "signupData", list: StoredUser[]) {
  if (source === "accounts") {
    // accounts 형태로 다시 저장 (가능한 키 유지)
    const back = list.map((u) => ({
      userId: u.userId,
      userPassword: u.userPassword,
      userEmail: u.userEmail,
      userName: u.userName,
      userCompanyCode: u.userCompanyCode,
      userRank: u.userRank,
      userPhone: u.userPhone,
    }));
    localStorage.setItem("accounts", JSON.stringify(back));
    // 호환을 위해 signupData도 함께 갱신(선택)
    localStorage.setItem("signupData", JSON.stringify(back));
  } else {
    localStorage.setItem("signupData", JSON.stringify(list));
  }
}

export default function EditProfilePage() {
  const navigate = useNavigate();

  // 1) 기존 사용자 불러오기
  const [{ list: users, source }, setUsersState] = useState(() => readUsers());
  const currentKey =
    localStorage.getItem("currentUserId") ||
    localStorage.getItem("currentUsername") ||
    localStorage.getItem("currentEmail") ||
    "";

  const current = useMemo(() => {
    if (!users.length) return null;
    if (currentKey) {
      const found = users.find(
        (u) => u.userId === currentKey || u.userEmail === currentKey
      );
      if (found) return found;
    }
    return users[0];
  }, [users, currentKey]);

  // 2) 폼 상태
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

  // 3) 현재 사용자 -> 폼 초기화
  useEffect(() => {
    if (!current) return;
    setUserId(current.userId ?? "");
    setUserPassword(current.userPassword ?? "");
    setUserPwConfirm(current.userPassword ?? "");
    setUserEmail(current.userEmail ?? "");
    setUserName(current.userName ?? "");
    setUserCompanyCode(current.userCompanyCode ?? "");
    setUserRank(current.userRank ?? "");
    setUserPhone(current.userPhone ?? "");
    // 에러 초기화
    setUserIdError("");
    setUserPasswordError("");
    setUserPwConfirmError("");
    setUserEmailError("");
    setUserNameError("");
    setUserCodeError("");
    setUserRankError("");
    setUserPhoneError("");
    setUserNumber("");
    setUserNumberError("");
  }, [current]);

  // 핸들러들
  function handleUserPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserPassword(value);
    setUserPasswordError(validatePassword(value));
    setUserPwConfirmError(value !== userPwConfirm ? "비밀번호가 일치하지 않습니다." : "");
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
    setUserPhone(value);
    setUserPhoneError(validatePhone(value));
  }
  function handleUserNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserNumber(value);
    setUserNumberError(validateVerificationCode(value));
  }

  function handleUserRankChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserRank(value);
    setUserRankError(validatePosition(value));
  }

  // 제출
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current || !source) return;

    // 재검증
    const idError = validateUserId(userId);
    const pwError = validatePassword(userPassword);
    const pwConfirmError = userPassword !== userPwConfirm ? "비밀번호가 일치하지 않습니다." : "";
    const nameError = validateName(userName);
    const emailError = validateEmail(userEmail);
    const companyCodeError = validateCompanyCode(userCompanyCode);
    const rankError = validatePosition(userRank);
    // (선택) 전화/인증번호도 포함하려면 아래 두 줄 추가
    // const phoneError = validatePhone(userPhone);
    // const numberError = validateVerificationCode(userNumber);

    setUserIdError(idError);
    setUserPasswordError(pwError);
    setUserPwConfirmError(pwConfirmError);
    setUserEmailError(emailError);
    setUserNameError(nameError);
    setUserCodeError(companyCodeError); // ✅ 버그 수정: setUserCompanyCode 아님!
    setUserRankError(rankError);

    if (idError || pwError || pwConfirmError || emailError || nameError || companyCodeError || rankError) {
      return;
    }

    // 리스트에서 해당 사용자 교체
    const updatedOne: StoredUser = {
      userId,
      userPassword,
      userEmail,
      userName,
      userCompanyCode,
      userRank,
      userPhone,
    };

    const updatedList = users.map((u) =>
      (u.userId === current.userId || u.userEmail === current.userEmail) ? updatedOne : u
    );

    writeUsers(source, updatedList);
    setUsersState({ list: updatedList, source });

    // 현재 로그인 식별자 갱신
    localStorage.setItem("currentUserId", userId);

    alert("회원정보가 수정되었습니다.");
    navigate("/my-account", { replace: true });
  }

  const isFormValid =
    userId && !userIdError &&
    userPassword && !userPasswordError &&
    userPwConfirm && !userPwConfirmError &&
    userEmail && !userEmailError &&
    userName && !userNameError &&
    userCompanyCode && !userCodeError &&
    userRank && !userRankError;

  return (
    <>
      <Header
        type="pageLink"
        title="회원정보 수정"
        prevLink="/my-account"
      />

      <Main id="sub">
        <div className={styles.editBox}>
          <form onSubmit={handleSubmit}>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>이름</span>
              <Input type="text" id="name" value={userName} onChange={handleUserNameChange} />
              <label htmlFor="name" className="blind">이름입력</label>
              {userName && <p className="errorMessage">{userNameError}</p>}
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>이메일</span>
              <Input type="text" id="email" value={userEmail} onChange={handleUserEmailChange} />
              <label htmlFor="email" className="blind">이메일입력</label>
              {userEmail && <p className="errorMessage">{userEmailError}</p>}
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>전화번호</span>
              <div className="inputButtonBox">
                <Input type="text" id="phone" value={userPhone} onChange={handleUserPhoneChange} />
                <label htmlFor="phone" className="blind">전화번호입력</label>
                <Button type="button" className="button" disabled={userPhoneError !== "" || userPhone === ""}>
                  인증
                </Button>
              </div>
              {userPhone && <p className="errorMessage">{userPhoneError}</p>}
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>인증번호</span>
              <div className="inputButtonBox">
                <Input type="text" id="number" value={userNumber} onChange={handleUserNumberChange} />
                <label htmlFor="number" className="blind">인증번호입력</label>
                <Button type="button" className="button" disabled={userNumber.length !== 6}>
                  확인
                </Button>
              </div>
              {userNumber && <p className="errorMessage">{userNumberError}</p>}
            </div>

            <div className={`${styles.formBox} mb-30`}>
              <span className={styles.label}>직급</span>
              <Input type="text" id="rank" value={userRank} onChange={handleUserRankChange} />
              <label htmlFor="rank" className="blind">직급입력</label>
              {userRank && <p className="errorMessage">{userRankError}</p>}
            </div>

            <div className={`${styles.inputTextBox} mb-20`}>
              <span className={styles.label}>비밀번호</span>
              <PasswordInput id="password" value={userPassword} onChange={handleUserPasswordChange} />
              <label htmlFor="password" className="blind">비밀번호</label>
              {userPassword && <p className="errorMessage">{userPasswordError}</p>}
            </div>

            <div className={`${styles.inputTextBox} mb-20`}>
              <span className={styles.label}>비밀번호 재입력</span>
              <PasswordInput id="password02" value={userPwConfirm} onChange={handleUserPwConfirmChange} />
              <label htmlFor="password02" className="blind">비밀번호 재입력</label>
              {userPwConfirm && <p className="errorMessage">{userPwConfirmError}</p>}
            </div>

            <Button disabled={!isFormValid} className="mt-40">
              수정하기
            </Button>
          </form>
        </div>
      </Main>
    </>
  );
}
