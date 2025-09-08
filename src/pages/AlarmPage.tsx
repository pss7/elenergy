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

/** 회사 코드(공유 키) */
function useCompanyCode() {
  return localStorage.getItem("companyCode") || "DEFAULT_COMPANY";
}

export default function AlarmPage() {
  const company = useCompanyCode();

  /** 최초 진입 시: 최신 3건만 미확인으로 시드(이미 저장돼 있으면 건드리지 않음) */
  useEffect(() => {
    ensureDemoUnreadIfNone(company, 3);
  }, [company]);

  /** 읽음 ID 집합 */
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    setReadIds(loadReadIds(company));
  }, [company]);

  /** 필터 상태 (localStorage 연동) */
  const [filters, setFilters] = useState<AlarmFilters | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("alarmFilters");
    if (stored) {
      try {
        setFilters(JSON.parse(stored));
      } catch {
        setFilters(null);
      }
    }
  }, []);

  /** 최신순 정렬된 전체 목록 (고정) */
  const sortedAll = useMemo<Alarm[]>(() => {
    const arr = alarmData.slice();
    arr.sort((a, b) => parseKoreanDate(b.date) - parseKoreanDate(a.date));
    return arr;
  }, []);

  /** 필터 적용 결과 */
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

      if (controllers.length) list = list.filter((a) => controllers.includes(a.controller));
      if (admins.length) list = list.filter((a) => admins.includes(a.adminId));
      if (types.length) list = list.filter((a) => types.includes(a.type));
      if (statuses.length) list = list.filter((a) => statuses.includes(a.status));

      list.sort((a, b) => {
        const ta = parseKoreanDate(a.date);
        const tb = parseKoreanDate(b.date);
        return sortOrder === "latest" ? tb - ta : ta - tb;
      });
    }

    setFiltered(list);
    setVisibleCount(10); // 더보기 초기화
  }, [filters, sortedAll]);

  /** 미확인 판정 */
  const isFresh = (id: number) => !readIds.has(id);

  /** 페이지 떠날 때(뒤로가기/라우팅 등) → 현재 필터 결과(화면에서 확인했다고 간주) 읽음 처리 */
  useEffect(() => {
    return () => {
      const freshIds = filtered.filter((a) => isFresh(a.id)).map((a) => a.id);
      if (freshIds.length > 0) {
        markAsRead(company, freshIds);
        // 같은 탭에서도 바로 뱃지/상태 갱신되도록 커스텀 이벤트 발행
        window.dispatchEvent(new Event("alarm:readIds:changed"));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, filtered, readIds]);

  /** 더보기 */
  const [visibleCount, setVisibleCount] = useState(10);
  const visible = filtered.slice(0, visibleCount);
  function handleLoadMore() {
    setVisibleCount((prev) => prev + 10);
  }

  /** 필터 삭제 */
  function handleFilterDel() {
    localStorage.removeItem("alarmFilters");
    setFilters(null);
  }

  /** 필터 사용 여부(메시지 표시에 활용) */
  const isFilterOn =
    !!filters &&
    (filters.controllers?.length ||
      filters.admins?.length ||
      filters.types?.length ||
      filters.statuses?.length ||
      (filters.sortOrder ?? "latest") !== "latest");

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
                onClick={handleFilterDel}
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
            {/* 전체에 아예 데이터가 없을 때 (초기 상태 가능) */}
            {alarmData.length === 0 && !isFilterOn && (
              <p className={styles.noResult}>알림 내역이 비어있습니다.</p>
            )}

            {/* 데이터는 있지만 현재 필터 결과가 없을 때 */}
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
