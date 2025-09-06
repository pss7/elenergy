// src/pages/my/WithdrawConfirmPage.tsx
import { useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useNavigate } from "react-router-dom";

type StoredUser = {
  userId: string;
  userPassword: string;
  userEmail: string;
  userName: string;
  userCompanyCode: string;
  userRank: string;
  userPhone: string;
};

/** signupData에서 배열 형태로 안전하게 읽기 */
function readSignupUsers(): StoredUser[] {
  const raw = localStorage.getItem("signupData") || "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

/** signupData에 배열로 저장 */
function writeSignupUsers(list: StoredUser[]) {
  localStorage.setItem("signupData", JSON.stringify(list));
}

export default function WithdrawConfirmPage() {
  const navigate = useNavigate();

  // 현재 로그인 식별자 (로그인 시 저장해둔 값 사용 가정)
  const currentKey =
    localStorage.getItem("currentUserId") ||
    localStorage.getItem("currentEmail") ||
    "";

  // 현재 사용자
  const users = readSignupUsers();
  const current = useMemo<StoredUser | null>(() => {
    if (!users.length) return null;
    if (currentKey) {
      const found = users.find(
        (u) => u.userId === currentKey || u.userEmail === currentKey
      );
      if (found) return found;
    }
    // 한 명만 있으면 그 사용자로 폴백
    return users.length === 1 ? users[0] : null;
  }, [users, currentKey]);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleWithdraw() {
    setError(""); // 클릭 시 에러 초기화

    // 기본 검증
    if (!current) {
      setError("현재 계정을 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }
    const inputPw = password.trim();
    if (!inputPw) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    const storedPw = (current.userPassword ?? "").trim();
    if (inputPw !== storedPw) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 현재 사용자만 제거
    const updated = users.filter(
      (u) => !(u.userId === current.userId || u.userEmail === current.userEmail)
    );
    writeSignupUsers(updated);

    // 세션/로그인 상태 정리
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentEmail");
    localStorage.setItem("isLoggedIn", "false");

    alert("회원탈퇴가 완료되었습니다.");
    navigate("/signin", { replace: true });
  }

  return (
    <>
      <Header type="pageLink" title="회원탈퇴" prevLink="/withdraw-agree" />

      <Main id="sub">
        <div className={styles.withdrawBox}>
          <p className={styles.infoText01}>
            정말 탈퇴하시겠어요? <br />
            탈퇴에 대한 다음 안내사항을 확인해주세요.
          </p>

          <div className={styles.inputBox}>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
            />
            <label htmlFor="password" className="blind">
              비밀번호
            </label>

            {error && (
              <p className="errorMessage" style={{ marginTop: 8 }}>
                {error}
              </p>
            )}
          </div>

          <Button className="mt-30" onClick={handleWithdraw} disabled={!password}>
            탈퇴하기
          </Button>
        </div>
      </Main>
    </>
  );
}
