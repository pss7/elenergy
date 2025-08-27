import { useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";
import { useNavigate } from "react-router-dom";

export default function ScheduledDeletePage() {

  const navigate = useNavigate();

  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggleSelection(id: number) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }

  function handleDelete() {
    const updated = reservations.filter(res => !selectedIds.includes(res.id));
    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));
    navigate("/scheduled-block");
  }

  function handleCancel() {
    navigate("/scheduled-block");
  }

  return (
    <>
      <Header type="pageLink" title="예약 차단" prevLink="/scheduled-block" />

      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <div className={styles.scheduledDeleteBox}>
            <CustomSelect
              controllers={controllerData}
              selectedControllerId={selectedControllerId}
              onChange={setSelectedControllerId}
            />

            <div className={styles.topBox}>
              <span className={styles.selectText}>{selectedIds.length}개 선택됨</span>
              <div className={styles.btnBox}>
                <button onClick={handleCancel} className={styles.reservationAddBtn}>
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.delBtn}
                  disabled={selectedIds.length === 0}
                >
                  삭제
                </button>
              </div>
            </div>

            <ul className={styles.reservationList}>
              {reservations.map(item => (
                <li key={item.id} className={selectedIds.includes(item.id) ? styles.selected : ""}>
                  <div className={styles.inputChkBox}>
                    <input
                      type="checkbox"
                      className="blind"
                      id={`chk-${item.id}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                    />
                    <label htmlFor={`chk-${item.id}`} className={styles.customCheckbox}></label>
                  </div>

                  <div className={`${styles.timeBox} ${!item.isOn ? styles.off : ""}`}>
                    <span>{+item.time.split(":")[0] >= 12 ? "오후" : "오전"}</span>
                    <strong>{item.time}</strong>
                  </div>

                  <div className={styles.dateBox}>
                    <span>{item.dateLabel}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Main>
    </>
  );
}
