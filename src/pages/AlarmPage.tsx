import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import styles from "./AlarmPage.module.css";
import type { Alarm, AlarmFilters } from "../data/Alarms";
import alarmData from "../data/Alarms";

// 데이터와 타입 가져오기
export default function AlarmPage() {

  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("alarmFilters");
    let filters: AlarmFilters | null = null;

    if (stored) {
      filters = JSON.parse(stored);
    }

    let filtered = alarmData;

    if (filters) {
      const { controllers, admins, types, sortOrder } = filters;

      // 필터 조건 적용
      if (controllers.length > 0) {
        filtered = filtered.filter((alarm) => controllers.includes(alarm.controller));
      }

      if (admins.length > 0) {
        filtered = filtered.filter((alarm) => admins.includes(alarm.adminId));
      }

      if (types.length > 0) {
        filtered = filtered.filter((alarm) => types.includes(alarm.type));
      }

      // 정렬 적용
      if (sortOrder === "latest") {
        filtered = filtered.slice().reverse();
      }
    }

    setFilteredAlarms(filtered);
  }, []);

  return (
    <>
      <Header type="pageLink" title="알림" prevLink="/" />

      <Main id="sub">
        <div className={styles.alarmBox}>
          <div className={styles.filterLinkBox}>
            <Link to="/alarm-filter" className={styles.filterLink}>
              필터
            </Link>
          </div>

          <div className={styles.alarmList}>
            {filteredAlarms.slice(0, 5).map((alarm) => (
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

          <div className={styles.viewBtnBox}>
            <button className={styles.viewBtn}>
              <span>더보기</span>
            </button>
          </div>
        </div>
      </Main>
    </>
  );
}
