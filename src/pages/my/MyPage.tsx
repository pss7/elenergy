// src/pages/my/MyPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

type StoredUser = {
  userId: string;
  userPassword: string;
  userEmail: string;
  userName: string;
  userCompanyCode: string; // 회사코드(회사명이 별도 없으면 이 값 표시)
  userRank: string;
  userPhone: string;
  // 선택: 만약 회사명이 따로 저장되는 경우를 대비
  userCompanyName?: string;
};

function readSignupUsers(): StoredUser[] {
  const raw = localStorage.getItem("signupData") || "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export default function MyPage() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState<string>("");
  const [companyDisplay, setCompanyDisplay] = useState<string>("");

  // 현재 로그인 식별자
  const currentKey =
    localStorage.getItem("currentUserId") ||
    localStorage.getItem("currentEmail") ||
    "";

  const users = useMemo(() => readSignupUsers(), []);
  const currentUser = useMemo<StoredUser | null>(() => {
    if (!users.length) return null;
    if (currentKey) {
      const found = users.find(
        (u) => u.userId === currentKey || u.userEmail === currentKey
      );
      if (found) return found;
    }
    // 사용자 한 명만 있으면 그 사용자로 폴백
    return users.length === 1 ? users[0] : null;
  }, [users, currentKey]);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.userName || "");
      // 회사명 우선, 없으면 회사코드 사용
      setCompanyDisplay(
        currentUser.userCompanyName || currentUser.userCompanyCode || ""
      );
    } else {
      setDisplayName("");
      setCompanyDisplay("");
    }
  }, [currentUser]);

  function handleLogout() {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentEmail");
    navigate("/signin");
  }

  return (
    <>
      <Header type="pageLink" title="프로필" prevLink="/" />

      <Main id="sub">
        <div className={styles.mypageBox}>
          <div className={styles.mypageInfoBox}>
            <div className={styles.textBox}>
              <h2>{displayName || "이름 없음"}</h2>
              <span>{companyDisplay || "회사 정보 없음"}</span>
              <ul className={styles.memberList}>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
              </ul>
            </div>
            <div className={styles.imgBox}>
              <img src="/assets/images/sub/profile_img.svg" alt="" />
            </div>
          </div>

          <h3 className={styles.h3}>내설정</h3>

          <ul className={styles.link}>
            <li>
              <Link to="/my-account">내계정</Link>
            </li>
            <li>
              <Link to="/member-management">구성원관리</Link>
            </li>
            <li>
              <Link to="/notifications-settings">알림설정</Link>
            </li>
            <li>
              <Link to="/privacy">개인정보보호</Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogout}>
                로그아웃
              </Link>
            </li>
          </ul>

          <div className={styles.versionBox}>
            <span>앱 버전 정보</span>
            <em>현재버전 1.0.0</em>
          </div>
        </div>
      </Main>
    </>
  );
}
