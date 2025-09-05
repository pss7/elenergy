import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";
import Footer from "../../components/layout/Footer";

export default function ScheduledBlockingPage() {
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);
  const [isDelToggle, setIsDelToggle] = useState(false);
  const delBtnRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  useEffect(() => {
    const today = new Date();

    const updated = reservations.map((item) => {
      const match = item.dateLabel.match(/^(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
      if (match) {
        const [_, year, month, day] = match.map(Number);
        const reservationDate = new Date(year, month - 1, day);
        if (reservationDate < today && item.isOn) {
          return { ...item, isOn: false };
        }
      }
      return item;
    });

    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));
  }, []);

  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isDelToggle &&
        delBtnRef.current &&
        !delBtnRef.current.contains(e.target as Node)
      ) {
        setIsDelToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDelToggle]);

  function handleControllerChange(id: number) {
    setSelectedControllerId(id);
    setIsDelToggle(false);
  }

  const filteredReservations = reservations.filter(
    (r) => r.controllerId === selectedControllerId
  );

  function toggleReservation(id: number) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOn: !item.isOn } : item
      )
    );
  }

  function handleDelToggle() {
    setIsDelToggle(true);
  }

  // "14:30" -> { ampm: "오후", hour: 2, minute: "30" }
  function parseTimeToSelected(timeStr: string) {
    const [hourStr, minuteRaw] = timeStr.split(":");
    let hourNum = Number(hourStr);
    const ampm = hourNum >= 12 ? "오후" : "오전";
    if (hourNum > 12) hourNum -= 12;
    if (hourNum === 0) hourNum = 12;

    const minute = String(Number(minuteRaw)).padStart(2, "0"); // "00" 대응
    return { ampm, hour: hourNum, minute };
  }

  function handleEditReservation(reservation: Reservation) {
    const timeObj = parseTimeToSelected(reservation.time);
    navigate(`/scheduled-edit/${reservation.id}`, {
      state: { reservation: { ...reservation, time: timeObj } },
    });
  }

  return (
    <>
      <Header type="pageLink" title="예약 차단" prevLink="/" />
      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={handleControllerChange}
          />

          <div className={styles.topBox}>
            <h3>예약</h3>
            <div className={styles.btnBox}>
              <Link to="/scheduled-add"
                state={{ controllerId: selectedControllerId }}
                className={styles.reservationAddBtn}>
                <span className="blind">예약추가</span>
              </Link>

              <div className={styles.delBtnBox} ref={delBtnRef}>
                <button
                  className={styles.delToggleBtn}
                  onClick={handleDelToggle}
                >
                  <span className="blind">삭제토글버튼</span>
                </button>

                {isDelToggle && (
                  <Link
                    to={`/scheduled-delete/${selectedControllerId}`}
                    className={styles.delLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    삭제
                  </Link>
                )}
              </div>
            </div>
          </div>

          <ul className={styles.reservationList}>
            {filteredReservations.length === 0 ? (
              <li className={styles.noData}>예약이 없습니다.</li>
            ) : (
              filteredReservations.map((item) => (
                <li key={item.id} onClick={() => handleEditReservation(item)}>
                  <div
                    className={`${styles.timeBox} ${!item.isOn ? styles.off : ""}`}
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
                    className={`${styles.toggleSwitch} ${item.isOn ? styles.on : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReservation(item.id);
                    }}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </Main>

      <Footer />
    </>
  );
}
