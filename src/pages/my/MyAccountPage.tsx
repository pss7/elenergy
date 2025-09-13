// src/pages/my/MyAccountPage.tsx
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import { useEffect, useState } from "react";

/** ---------- Types ---------- */
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
  roleLevel?: number;
  isAdmin?: boolean;
  createdAt?: string;   // 가입일
  approvedAt?: string;  // 승인일
  approver?: string;
};

/** ---------- Utils ---------- */
function formatPhone(phone?: string) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
}

function formatDate(dateInput?: string | number) {
  if (dateInput == null || dateInput === "") return "-";
  const d = new Date(
    typeof dateInput === "number"
      ? dateInput
      : isNaN(Number(dateInput))
      ? dateInput
      : Number(dateInput)
  );
  if (isNaN(d.getTime())) return String(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 주어진 객체에서 날짜 필드 후보들을 우선순위대로 찾아 반환 */
function pickDate(obj: any, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

/** 다양한 저장 스키마를 한 계정 타입으로 매핑 (넓은 커버리지) */
function mapRawToAccount(raw: RawAny): Account {
  // 1) 1차 후보: 평평한 키
  const created1 = pickDate(raw, [
    "createdAt", "signupAt", "signupDate", "joinedAt",
    "created_at", "created", "registeredAt", "joinDate",
  ]);
  const approved1 = pickDate(raw, [
    "approvedAt", "approvalAt", "approvalDate", "authorizedAt", "approved_at",
  ]);
  const approver1 = pickDate(raw, ["approver", "approvedBy", "approverName", "approvalBy"]);

  // 2) 2차 후보: 중첩된 common containers
  const container = raw.meta ?? raw.metadata ?? raw.profile ?? raw.timestamps ?? {};
  const created2 = pickDate(container, [
    "createdAt", "signupAt", "signupDate", "joinedAt", "created_at", "created",
  ]);
  const approved2 = pickDate(container, [
    "approvedAt", "approvalAt", "approvalDate", "authorizedAt", "approved_at",
  ]);
  const approver2 = pickDate(container, [
    "approver", "approvedBy", "approverName", "approvalBy",
  ]);

  return {
    id: raw.userId ?? raw.id ?? raw.username ?? raw.email ?? "unknown",
    username: raw.userId ?? raw.username,
    email: raw.userEmail ?? raw.email,
    name: raw.userName ?? raw.name,
    phone: raw.userPhone ?? raw.phone,
    position: raw.userRank ?? raw.position,
    company: raw.company ?? raw.userCompanyCode,
    role: raw.role,
    roleLevel: raw.roleLevel,
    isAdmin: raw.isAdmin,
    createdAt: (created1 ?? created2) as string | undefined,
    approvedAt: (approved1 ?? approved2) as string | undefined,
    approver: (approver1 ?? approver2) as string | undefined,
  };
}

function readAccountsFromLocalStorage(): Account[] {
  // 최신 구조: accounts (배열 또는 객체)
  const accountsStr = localStorage.getItem("accounts");
  if (accountsStr) {
    try {
      const parsed = JSON.parse(accountsStr);
      if (Array.isArray(parsed)) return parsed.map(mapRawToAccount);
      if (parsed && typeof parsed === "object") return [mapRawToAccount(parsed)];
    } catch {}
  }
  // 구/임시 구조: signupData (배열 or 객체)
  const signupStr = localStorage.getItem("signupData");
  if (signupStr) {
    try {
      const parsed = JSON.parse(signupStr);
      if (Array.isArray(parsed)) return parsed.map(mapRawToAccount);
      if (parsed && typeof parsed === "object") return [mapRawToAccount(parsed)];
    } catch {}
  }
  return [];
}

/** 현재 로그인 사용자 검색 */
function getCurrentAccount(accounts: Account[]) {
  const currentKey =
    localStorage.getItem("currentUserId") ||
    localStorage.getItem("currentUsername") ||
    localStorage.getItem("currentEmail") ||
    "";
  if (currentKey) {
    const found = accounts.find(
      (a) =>
        a.id === currentKey ||
        a.username === currentKey ||
        a.email === currentKey
    );
    if (found) return found;
  }
  return accounts[0]; // 없으면 첫 번째
}

/** 관리자 판별 — null/undefined 안전 처리 */
function isAdmin(acc: Account | null | undefined) {
  if (!acc) return false;
  if (acc.isAdmin === true) return true;
  if (typeof acc.roleLevel === "number" && acc.roleLevel >= 70) return true;
  const v = (acc.role || "").toLowerCase();
  return (
    v === "관리자" ||
    v.includes("admin") ||
    v.includes("manager") ||
    v.includes("owner") ||
    v.includes("super")
  );
}

/** 승인자 라벨 — null/undefined 안전 처리 */
function getApproverLabel(acc: Account | null | undefined) {
  if (!acc) return "관리자";
  if (acc.approver) return acc.approver;
  // 요구사항: "관리자의 경우 (주)이엘에너지에서 승인해준 날짜"
  return isAdmin(acc) ? "(주)이엘에너지" : "관리자";
}

/** ---------- Page ---------- */
export default function MyAccountPage() {
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    const accounts = readAccountsFromLocalStorage();
    const me = getCurrentAccount(accounts) ?? null;
    setUser(me);
    if (me?.role) localStorage.setItem("currentUserRole", me.role);
  }, []);

  const joined = user?.createdAt ? formatDate(user.createdAt) : "-";
  const approverLabel = getApproverLabel(user); // <- null 허용으로 에러 해결
  const approved =
    user?.approvedAt ? `${formatDate(user.approvedAt)} (${approverLabel} 승인)` : "-";

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

            {/* 가입일 */}
            <div className={styles.box}>
              <span>가입일</span>
              <em>{joined}</em>
            </div>

            {/* 승인일(가입일 바로 아래) */}
            <div className={styles.box}>
              <span>승인일</span>
              <em>{approved}</em>
            </div>

            <div className={styles.box}>
              <span>권한</span>
              <em>{user?.role || "일반"}</em>
            </div>
          </div>

          <Link to="/edit-profile" className="linkBtn">회원정보 수정</Link>

          <div className={styles.cancelAccountBox}>
            <Link to="/withdraw-agree" className={styles.cancelAccount}>회원탈퇴</Link>
          </div>
        </div>
      </Main>
    </>
  );
}
