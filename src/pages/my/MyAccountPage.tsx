import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import { useEffect, useState } from "react";

type RawAny = Record<string, any>;

type Account = {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  phone?: string;
  position?: string;
  company?: string;
  role?: string;
  createdAt?: string;
};

function formatPhone(phone?: string) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  // 10~11자리만 하이픈 포맷
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // 그 외는 원문
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function mapRawToAccount(raw: RawAny): Account {
  return {
    id: raw.userId ?? raw.id ?? raw.username ?? raw.email ?? "unknown",
    username: raw.userId ?? raw.username,
    email: raw.userEmail ?? raw.email,
    name: raw.userName ?? raw.name,
    phone: raw.userPhone ?? raw.phone,
    position: raw.userRank ?? raw.position,
    // 회사명이 없고 코드만 있는 스키마면 코드값을 보여줌
    company: raw.company ?? raw.userCompanyCode,
    role: raw.role ?? "일반",
    createdAt: raw.createdAt,
  };
}

function readAccountsFromLocalStorage(): Account[] {
  // 1) 최신 구조: accounts (배열)
  const accountsStr = localStorage.getItem("accounts");
  if (accountsStr) {
    try {
      const arr = JSON.parse(accountsStr) as RawAny[];
      if (Array.isArray(arr)) {
        return arr.map(mapRawToAccount);
      }
    } catch {}
  }

  // 2) 구/임시 구조: signupData (배열 or 객체)
  const signupStr = localStorage.getItem("signupData");
  if (signupStr) {
    try {
      const parsed = JSON.parse(signupStr);
      if (Array.isArray(parsed)) {
        return parsed.map(mapRawToAccount);
      }
      if (parsed && typeof parsed === "object") {
        return [mapRawToAccount(parsed)];
      }
    } catch {}
  }

  return [];
}

export default function MyAccountPage() {
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    const accounts = readAccountsFromLocalStorage();

    // 현재 로그인 식별자 우선
    const currentKey =
      localStorage.getItem("currentUserId") ||
      localStorage.getItem("currentUsername") ||
      localStorage.getItem("currentEmail") ||
      "";

    let found: Account | undefined;
    if (currentKey) {
      found = accounts.find(
        (a) =>
          a.id === currentKey ||
          a.username === currentKey ||
          a.email === currentKey
      );
    }
    if (!found && accounts.length > 0) {
      found = accounts[0];
    }

    setUser(found ?? null);
  }, []);

  return (
    <>
      <Header type="pageLink" title="내계정" prevLink="/my" />

      <Main id="sub">
        <div className={styles.myAccountBox}>
          <div className={styles.infoBox}>
            <div className={styles.box}>
              <span>아이디</span>
              <em>{user?.username || user?.id || "-"}</em>
            </div>
            <div className={styles.box}>
              <span>이름</span>
              <em>{user?.name || "-"}</em>
            </div>
            <div className={styles.box}>
              <span>이메일</span>
              <em>{user?.email || "-"}</em>
            </div>
            <div className={styles.box}>
              <span>전화번호</span>
              <em>{formatPhone(user?.phone)}</em>
            </div>
            <div className={styles.box}>
              <span>직급</span>
              <em>{user?.position || "-"}</em>
            </div>
            <div className={styles.box}>
              <span>회사명</span>
              <em>{user?.company || "-"}</em>
            </div>
            <div className={styles.box}>
              <span>가입일</span>
              <em>{formatDate(user?.createdAt)}</em>
            </div>
            <div className={styles.box}>
              <span>권한</span>
              <em>{user?.role || "일반"}</em>
            </div>
          </div>

          <Link to="/edit-profile" className="linkBtn">
            회원정보 수정
          </Link>

          <div className={styles.cancelAccountBox}>
            <Link to="/withdraw-agree" className={styles.cancelAccount}>
              회원탈퇴
            </Link>
          </div>
        </div>
      </Main>
    </>
  );
}
