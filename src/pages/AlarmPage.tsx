import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";
import type { Alarm, AlarmFilters } from "../data/Alarms";
import alarmData from "../data/Alarms";

export default function AlarmPage() {

  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [filters, setFilters] = useState<AlarmFilters | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("alarmFilters");
    if (stored) {
      setFilters(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    let filtered = alarmData;

    if (filters) {
      const { controllers, admins, types, sortOrder } = filters;

      if (controllers.length > 0) {
        filtered = filtered.filter((alarm) => controllers.includes(alarm.controller));
      }

      if (admins.length > 0) {
        filtered = filtered.filter((alarm) => admins.includes(alarm.adminId));
      }

      if (types.length > 0) {
        filtered = filtered.filter((alarm) => types.includes(alarm.type));
      }

      if (sortOrder === "latest") {
        filtered = filtered.slice().reverse();
      }
    }

    setFilteredAlarms(filtered);
    setVisibleCount(10); // 필터 바뀌면 항상 10개부터 보여주기
  }, [filters]);

  //더보기 클릭 함수
  function handleLoadMore() {
    setVisibleCount((prev) => prev + 10);
  };

  //slice로 현재 보여줄 개수만 필터링
  const visibleAlarms = filteredAlarms.slice(0, visibleCount);

  //필터 삭제 함수
  function handleFilterDel() {
    localStorage.removeItem("alarmFilters");
    setFilters(null); // 상태를 갱신해야 useEffect가 다시 동작함
  }

  return (
    <>
      <Header type="pageLink" title="알림" prevLink="/" />

      <Main id="sub">
        <div className={styles.alarmBox}>
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

            {filteredAlarms.length === 0 && (
              <p className={styles.noResult}>조건에 맞는 알림이 없습니다.</p>
            )}
          </div>

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
