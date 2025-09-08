// src/pages/AlarmPage.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";
import type { Alarm, AlarmFilters } from "../data/Alarms";
import alarmData, {
  ensureDemoUnreadIfNone,
  loadReadIds,
  markAsRead,
  parseKoreanDate,
} from "../data/Alarms";

function useCompanyCode() {
  return localStorage.getItem("companyCode") || "DEFAULT_COMPANY";
}

export default function AlarmPage() {
  const company = useCompanyCode();

  // 최초 진입 시: 최신 3건만 미확인 상태로 시드(이미 있으면 유지)
  useEffect(() => {
    ensureDemoUnreadIfNone(company, 3);
  }, [company]);

  // 읽음 집합
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    setReadIds(loadReadIds(company));
  }, [company]);

  // 필터 상태 (로컬스토리지와 연동)
  const [filters, setFilters] = useState<AlarmFilters | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("alarmFilters");
    if (stored) {
      try { setFilters(JSON.parse(stored)); }
      catch { setFilters(null); }
    }
  }, []);

  // 최신순 정렬
  const sortedAll = useMemo(() => {
    const arr = alarmData.slice();
    arr.sort((a, b) => parseKoreanDate(b.date) - parseKoreanDate(a.date));
    return arr;
  }, []);

  // 필터 적용
  const [filtered, setFiltered] = useState<Alarm[]>([]);
  useEffect(() => {
    let list = sortedAll.slice();
    if (filters) {
      const {
        controllers = [],
        admins = [],
        types = [],
        statuses = [],
        sortOrder = "latest",
      } = filters;

      if (controllers.length) list = list.filter(a => controllers.includes(a.controller));
      if (admins.length)     list = list.filter(a => admins.includes(a.adminId));
      if (types.length)      list = list.filter(a => types.includes(a.type));
      if (statuses.length)   list = list.filter(a => statuses.includes(a.status));

      list.sort((a, b) => {
        const ta = parseKoreanDate(a.date);
        const tb = parseKoreanDate(b.date);
        return sortOrder === "latest" ? tb - ta : ta - tb;
      });
    }
    setFiltered(list);
    setVisibleCount(10);
  }, [filters, sortedAll]);

  // 미확인 판정
  const isFresh = (id: number) => !readIds.has(id);

  // 페이징
  const [visibleCount, setVisibleCount] = useState(10);
  const visible = filtered.slice(0, visibleCount);
  const handleMore = () => setVisibleCount((p) => p + 10);

  // ✅ 페이지 떠날 때: 현재 필터 결과(=화면에서 확인했다고 간주)를 읽음 처리
  useEffect(() => {
    return () => {
      const freshIds = filtered.filter(a => isFresh(a.id)).map(a => a.id);
      if (freshIds.length > 0) {
        markAsRead(company, freshIds);
      }
    };
  }, [company, filtered, readIds]);

  // 보조: 필터 사용 여부
  const isFilterOn = !!filters && (
    (filters.controllers?.length ?? 0) > 0 ||
    (filters.admins?.length ?? 0) > 0 ||
    (filters.types?.length ?? 0) > 0 ||
    (filters.statuses?.length ?? 0) > 0 ||
    (filters.sortOrder ?? "latest") !== "latest"
  );

  return (
    <>
      <Header type="pageLink" title="알림" prevLink="/" />

      <Main id="sub">
        <div className={styles.alarmBox}>
          {/* 필터 / 필터삭제 */}
          <div className={styles.filterLinkBox}>
            {filters ? (
              <button
                className={`${styles.filterLink} ${styles.filterDel}`}
                onClick={() => {
                  localStorage.removeItem("alarmFilters");
                  setFilters(null);
                }}
              >
                필터삭제
              </button>
            ) : (
              <Link to="/alarm-filter" className={styles.filterLink}>
                필터
              </Link>
            )}
          </div>

          {/* 알림 리스트 */}
          <div className={styles.alarmList}>
            {alarmData.length === 0 && !isFilterOn && (
              <p className={styles.noResult}>알림 내역이 비어있습니다.</p>
            )}
            {alarmData.length > 0 && filtered.length === 0 && (
              <p className={styles.noResult}>조건에 맞는 알림이 없습니다.</p>
            )}

            {visible.map((alarm) => {
              const fresh = isFresh(alarm.id);
              return (
                <div
                  key={alarm.id}
                  className={`${styles.box} ${fresh ? styles.new : ""}`}
                  data-fresh={fresh ? "1" : "0"}
                >
                  {/* (선택) NEW 배지 표시 원하면 사용 */}
                  {/* {fresh && <span className={styles.newBadge}>NEW</span>} */}

                  <div className={styles.imgBox}>
                    <img src={alarm.icon} alt={`${alarm.type} 아이콘`} />
                  </div>
                  <div className={styles.textBox}>
                    <h2>{`${alarm.type} - ${alarm.adminId}`}</h2>
                    <span>{`${alarm.controller} - # 공장 위치 ${alarm.status}`}</span>
                    <em className={styles.date}>{alarm.date}</em>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 더보기 */}
          {visibleCount < filtered.length && (
            <div className={styles.viewBtnBox}>
              <button className={styles.viewBtn} onClick={handleMore}>
                <span>더보기</span>
              </button>
            </div>
          )}
        </div>
      </Main>
    </>
  );
}
