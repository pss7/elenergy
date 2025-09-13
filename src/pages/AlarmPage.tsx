// src/pages/AlarmPage.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";

import type { Alarm, AlarmFilters } from "../data/Alarms";
import {
  ensureDemoUnreadIfNone,
  loadReadIds,
  markAsRead,
  parseKoreanDate,
  getAllAlarms,
} from "../data/Alarms";

// 컨트롤러 현재 정보(이름/위치)를 위해 컨텍스트 사용
import { useControllerData } from "../contexts/ControllerContext";

/** 회사 코드(공유 키) */
function useCompanyCode() {
  return localStorage.getItem("companyCode") || "DEFAULT_COMPANY";
}

export default function AlarmPage() {
  const company = useCompanyCode();
  const { controllers } = useControllerData();

  // 현재 컨트롤러 이름 -> 위치 매핑 (이름 바뀌면 위치도 최신값)
  const titleToLocation = useMemo(
    () => new Map(controllers.map((c) => [c.title, c.location])),
    [controllers]
  );

  // 최초 진입: 최신 3건만 미확인 시드(이미 있으면 유지)
  useEffect(() => {
    ensureDemoUnreadIfNone(company, 3);
  }, [company]);

  // 읽음 ID 집합
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  useEffect(() => setReadIds(loadReadIds(company)), [company]);

  // 전체 목록 (시드 + 추가분)
  const [all, setAll] = useState<Alarm[]>([]);
  const reload = () => setAll(getAllAlarms(company));
  useEffect(() => {
    reload();
    const onChange = () => reload();
    const onReadChanged = () => setReadIds(loadReadIds(company));

    window.addEventListener("alarm:changed", onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("alarm:readIds:changed", onReadChanged);
    return () => {
      window.removeEventListener("alarm:changed", onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("alarm:readIds:changed", onReadChanged);
    };
  }, [company]);

  // 리스트 컨테이너 ref – 새 알림이 추가되면 맨 위로 보여주기
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [all]);

  // 필터 상태 (localStorage 연동)
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

  // 최신순 정렬 (tie-breaker: id 내림차순)
  const sortedAll = useMemo<Alarm[]>(() => {
    const arr = all.slice();
    arr.sort((a, b) => {
      const tb = parseKoreanDate(b.date);
      const ta = parseKoreanDate(a.date);
      return tb - ta || (b.id - a.id);
    });
    return arr;
  }, [all]);

  // 필터 적용
  const [filtered, setFiltered] = useState<Alarm[]>([]);
  useEffect(() => {
    let list = sortedAll.slice();
    const sortOrder = filters?.sortOrder ?? "latest";

    if (filters) {
      const {
        controllers = [],
        admins = [],
        types = [],
        statuses = [],
      } = filters;

      if (controllers.length) list = list.filter((a) => controllers.includes(a.controller));
      if (admins.length) list = list.filter((a) => admins.includes(a.adminId));
      if (types.length) list = list.filter((a) => types.includes(a.type));
      if (statuses.length) list = list.filter((a) => statuses.includes(a.status));
    }

    // 정렬 유지 + 동률일 때 id로 타이브레이크
    list.sort((a, b) => {
      const ta = parseKoreanDate(a.date);
      const tb = parseKoreanDate(b.date);
      const diff = sortOrder === "latest" ? tb - ta : ta - tb;
      return diff || (sortOrder === "latest" ? (b.id - a.id) : (a.id - b.id));
    });

    setFiltered(list);
    setVisibleCount(10); // 더보기 초기화
  }, [filters, sortedAll]);

  const isFresh = (id: number) => !readIds.has(id);

  // 화면 떠날 때 현재 목록을 읽음 처리
  useEffect(() => {
    return () => {
      const freshIds = filtered.filter((a) => isFresh(a.id)).map((a) => a.id);
      if (freshIds.length > 0) {
        markAsRead(company, freshIds);
        window.dispatchEvent(new Event("alarm:readIds:changed"));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, filtered]);

  // 더보기
  const [visibleCount, setVisibleCount] = useState(10);
  const visible = filtered.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount((prev) => prev + 10);

  // 필터 사용 여부
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
          <div className={styles.alarmList} ref={listRef}>
            {all.length === 0 && !isFilterOn && (
              <p className={styles.noResult}>알림 내역이 비어있습니다.</p>
            )}
            {all.length > 0 && filtered.length === 0 && (
              <p className={styles.noResult}>조건에 맞는 알림이 없습니다.</p>
            )}

            {visible.map((alarm) => {
              const fresh = isFresh(alarm.id);
              const location = titleToLocation.get(alarm.controller) ?? "";

              return (
                <div
                  key={alarm.id}
                  className={`${styles.box} ${fresh ? styles.new : ""}`}
                  data-fresh={fresh ? "1" : "0"}
                >
                  <div className={styles.imgBox}>
                    <img src={alarm.icon} alt={`${alarm.type} 아이콘`} />
                    {fresh && <span className={styles.newDot} aria-label="새 알림" />}
                  </div>

                  <div className={styles.textBox}>
                    <h2>{`${alarm.type} - ${alarm.adminId}`}</h2>
                    <span>
                      {alarm.controller}
                      {location ? ` - ${location}` : ""}
                      {` ${alarm.status}`}
                    </span>
                    <em className={styles.date}>{alarm.date}</em>
                  </div>
                </div>
              );
            })}
          </div>

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
