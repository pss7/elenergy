// src/pages/scheduled-block/ScheduledDeletePage.tsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";
import { useState } from "react";
import { useControllerData } from "../../contexts/ControllerContext";
import { logAlarm } from "../../utils/logAlarm";

export default function ScheduledDeletePage() {
  const navigate = useNavigate();
  const { controllers } = useControllerData();

  const { id } = useParams();
  const selectedControllerId = Number(id);

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filteredReservations = reservations.filter((r) => r.controllerId === selectedControllerId);
  const allSelected = filteredReservations.length > 0 && selectedIds.length === filteredReservations.length;

  function toggleSelection(itemId: number) {
    setSelectedIds((prev) => (prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]));
  }

  function toggleSelectAll() {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredReservations.map((item) => item.id));
  }

  function handleDelete() {
    const updated = reservations.filter((res) => !selectedIds.includes(res.id));
    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));

    const targetCtrl = controllers.find((c) => c.id === selectedControllerId);
    if (targetCtrl) {
      logAlarm({
        type: "예약제어",
        controller: targetCtrl.title,
        status: "OFF",
      });
    }

    navigate("/scheduled-block", { state: { initialControllerId: selectedControllerId } });
  }

  function handleCancel() {
    navigate("/scheduled-block", { state: { initialControllerId: selectedControllerId } });
  }

  function handleItemKeyDown(e: React.KeyboardEvent<HTMLLIElement>, id: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSelection(id);
    }
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
              onChange={(newId) => navigate(`/scheduled-delete/${newId}`)}
              disabled={true}
            />

            <div className={styles.topBox} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className={styles.checkedBox}>
                <input id="allChk" type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="blind" />
                <label htmlFor="allChk">
                  <span className="blind">전체선택</span>
                </label>
                <span className={styles.selectText}>{selectedIds.length}개 선택됨</span>
              </div>

              <div className={styles.btnBox} style={{ marginLeft: "auto" }}>
                <button onClick={handleCancel} className={styles.reservationAddBtn}>취소</button>
                <button onClick={handleDelete} className={styles.delBtn} disabled={selectedIds.length === 0}>삭제</button>
              </div>
            </div>

            <ul className={styles.reservationList}>
              {filteredReservations.length === 0 ? (
                <li className={styles.noData}>예약이 없습니다.</li>
              ) : (
                filteredReservations.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <li
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => toggleSelection(item.id)}
                      onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                      className={`${isSelected ? styles.selected : ""} ${styles.listItem}`}
                    >
                      <div className={styles.inputChkBox} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="blind"
                          id={`chk-${item.id}`}
                          checked={isSelected}
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
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </Main>
    </>
  );
}
