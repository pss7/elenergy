import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";
import type { Alarm, AlarmFilters } from "../data/Alarms";
import alarmData from "../data/Alarms";

function parseKoreanDate(s: string): number {
  // 예: "2025.08.14 오후 10:10"
  // 공백 기준: [ "2025.08.14", "오전|오후", "hh:mm" ]
  const [datePart, ampm, timePart] = s.split(" ");
  const [y, m, d] = datePart.split(".").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);

  let hours = hh % 12;
  if (ampm === "오후") hours += 12;

  return new Date(y, m - 1, d, hours, mm).getTime();
}

export default function AlarmPage() {
  // 필터링된 알람 목록 상태
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);

  // 현재 화면에 보여줄 알람 개수
  const [visibleCount, setVisibleCount] = useState(10);

  // 필터 조건을 상태로 저장 (로컬스토리지와 연동됨)
  const [filters, setFilters] = useState<AlarmFilters | null>(null);

  // 컴포넌트 마운트 시 로컬스토리지에서 필터 가져오기
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

  // 필터가 변경될 때마다 알람 데이터 필터링
  useEffect(() => {
    // 원본 훼손 방지용 복사
    let filtered = alarmData.slice();

    if (filters) {
      const {
        controllers = [],
        admins = [],
        types = [],
        statuses = [],
        sortOrder = "latest",
      } = filters;

      // 필터 - 제어기
      if (controllers.length > 0) {
        filtered = filtered.filter((alarm) => controllers.includes(alarm.controller));
      }

      // 필터 - 관리자 ID
      if (admins.length > 0) {
        filtered = filtered.filter((alarm) => admins.includes(alarm.adminId));
      }

      // 필터 - 제어 방식
      if (types.length > 0) {
        filtered = filtered.filter((alarm) => types.includes(alarm.type));
      }

      // 필터 - 상태(ON/OFF)
      if (statuses.length > 0) {
        filtered = filtered.filter((alarm) => statuses.includes(alarm.status));
      }

      // 정렬 - 한국어 날짜 파싱 후 정렬
      filtered.sort((a, b) => {
        const ta = parseKoreanDate(a.date);
        const tb = parseKoreanDate(b.date);
        return sortOrder === "latest" ? tb - ta : ta - tb;
      });
    }

    // 필터링된 결과 저장
    setFilteredAlarms(filtered);

    // 화면에 다시 10개부터 보여주기 (더보기 초기화)
    setVisibleCount(10);
  }, [filters]);

  // 더보기 버튼 클릭 시 보여줄 알람 개수 증가
  function handleLoadMore() {
    setVisibleCount((prev) => prev + 10);
  }

  // 필터 삭제 (localStorage 초기화 + filters 상태 초기화)
  function handleFilterDel() {
    localStorage.removeItem("alarmFilters");
    setFilters(null); // filters 상태 초기화 → useEffect 재실행됨
  }

  // 현재 보여줄 알람만 잘라내기
  const visibleAlarms = filteredAlarms.slice(0, visibleCount);

  return (
    <>
      <Header type="pageLink" title="알림" prevLink="/" />

      <Main id="sub">
        <div className={styles.alarmBox}>
          {/* 필터 또는 필터삭제 버튼 표시 */}
          <div className={styles.filterLinkBox}>
            {filters ? (
              // 필터가 적용된 상태 → "필터삭제" 버튼
              <button
                className={`${styles.filterLink} ${styles.filterDel}`}
                onClick={handleFilterDel}
              >
                필터삭제
              </button>
            ) : (
              // 필터가 없는 상태 → "필터" 버튼
              <Link to="/alarm-filter" className={styles.filterLink}>
                필터
              </Link>
            )}
          </div>

          {/* 알람 목록 표시 */}
          <div className={styles.alarmList}>
            {visibleAlarms.map((alarm) => (
              <div key={alarm.id} className={styles.box}>
                <div className={styles.imgBox}>
                  <img src={alarm.icon} alt={`${alarm.type} 아이콘`} />
                </div>
                <div className={styles.textBox}>
                  <h2>{`${alarm.type} - ${alarm.adminId}`}</h2>
                  <span>{`${alarm.controller} - # 공장 위치 ${alarm.status}`}</span>
                  <em className={styles.date}>{alarm.date}</em>
                </div>
              </div>
            ))}

            {/* 필터 결과가 없을 경우 메시지 표시 */}
            {filteredAlarms.length === 0 && (
              <p className={styles.noResult}>조건에 맞는 알림이 없습니다.</p>
            )}
          </div>

          {/* 더보기 버튼 (남은 알람이 있을 때만 표시) */}
          {visibleCount < filteredAlarms.length && (
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
