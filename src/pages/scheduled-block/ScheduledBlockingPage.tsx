import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import { Link } from "react-router-dom";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";

export default function ScheduledBlockingPage() {
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);

  // 로컬스토리지에서 초기값 가져오기
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  // 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // 선택된 제어기의 예약만 필터링
  const filteredReservations = reservations.filter(
    (r) => r.controllerId === selectedControllerId
  );

  // ON/OFF 토글
  function toggleReservation(id: number) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOn: !item.isOn } : item
      )
    );
  }

  return (
    <>
      <Header type="pageLink" title="예약 차단" prevLink="/" />

      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          {/* 제어기 선택 드롭다운 */}
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={setSelectedControllerId}
          />

          <div className={styles.topBox}>
            <h3>예약</h3>
            <div className={styles.btnBox}>
              <Link to="/scheduled-add" className={styles.reservationAddBtn}>
                <span className="blind">예약추가</span>
              </Link>
              <Link to="/scheduled-delete" className={styles.delBtn}>
                <span className="blind">예약삭제</span>
              </Link>
            </div>
          </div>

          {/* 선택된 제어기의 예약 목록만 출력 */}
          <ul className={styles.reservationList}>
            {filteredReservations.length === 0 ? (
              <li className={styles.noData}>예약이 없습니다.</li>
            ) : (
              filteredReservations.map((item) => (
                <li key={item.id}>
                  <div
                    className={`${styles.timeBox} ${!item.isOn ? styles.off : ""
                      }`}
                  >
                    <span>
                      {+item.time.split(":")[0] >= 12 ? "오후" : "오전"}
                    </span>
                    <strong>{item.time}</strong>
                  </div>
                  <div className={styles.dateBox}>
                    <span>{item.dateLabel}</span>
                  </div>
                  <div
                    className={`${styles.toggleSwitch} ${item.isOn ? styles.on : ""
                      }`}
                    onClick={() => toggleReservation(item.id)}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </Main>
    </>
  );
}
