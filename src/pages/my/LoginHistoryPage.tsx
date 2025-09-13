// src/pages/my/LoginHistoryPage.tsx
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import { getRecentLoginHistory, type LoginHistory } from "../../data/LoginHistory";

export default function LoginHistoryPage() {
  // 한 번에 보여줄 개수
  const PAGE = 5;

  // 전체 목록(최근 90일, 최신순)
  const [all, setAll] = useState<LoginHistory[]>([]);
  // 현재 표시 개수
  const [visibleCount, setVisibleCount] = useState(PAGE);

  useEffect(() => {
    const list = getRecentLoginHistory(90);
    setAll(list);
    setVisibleCount(PAGE);
  }, []);

  const visible = useMemo(() => all.slice(0, visibleCount), [all, visibleCount]);
  const hasMore = visibleCount < all.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE, all.length));
  };

  return (
    <>
      <Header type="pageLink" title="개인정보 보호" prevLink="/privacy" />
      <Main id="sub">
        <div className={styles.loginHistoryBox}>
          <h2 className={`${styles.tit} mb-10`}>로그인 이력 조회</h2>
          <p className={styles.infoText}>
            최근 90일간 로그인했던 환경을 확인할 수 있습니다. 직접 로그인하지 않은 기록이 있다면,
            개인정보 보호를 위해 비밀번호를 변경해주세요.
          </p>

          <h3>모바일 접속 시 표시되는 IP 및 위치 정보 안내</h3>

          <ul className={styles.loginHistoryList}>
            {visible.length === 0 ? (
              <li className={styles.noData}>최근 90일 로그인 기록이 없습니다.</li>
            ) : (
              visible.map((item, idx) => (
                <li key={`${item.at}-${idx}`}>
                  <div className={styles.box}>
                    <span>일시</span>
                    <em>{item.at}</em>
                  </div>
                  <div className={styles.box}>
                    <span>기기/OS</span>
                    <em>
                      {item.device} / {item.os}
                    </em>
                  </div>
                  <div className={styles.box}>
                    <span>IP주소</span>
                    <em>{item.ip}</em>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* 더보기: 남은 데이터 없으면 버튼 숨김 */}
          {hasMore && (
            <div className={styles.viewBtnBox}>
              <button className={styles.viewBtn} onClick={handleLoadMore}>
                <span>더보기</span>
              </button>
            </div>
          )}
        </div>
      </Main>
    </>
  );
}
