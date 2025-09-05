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
  // 선택된 제어기 ID 상태 (기본 1번 제어기)
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);

  // 삭제 토글 버튼 활성화 상태 (삭제 링크 노출 여부)
  const [isDelToggle, setIsDelToggle] = useState(false);

  // 예약 목록 상태, 초기값은 localStorage에서 가져오거나 기본 데이터 사용
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  // 예약 목록이 변경될 때마다 localStorage에 저장하여 데이터 유지
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // 현재 선택된 제어기에 해당하는 예약만 필터링
  const filteredReservations = reservations.filter(
    (r) => r.controllerId === selectedControllerId
  );

  // 예약의 ON/OFF 상태 토글 함수
  function toggleReservation(id: number) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOn: !item.isOn } : item
      )
    );
  }

  // 삭제 토글 버튼 클릭 시 삭제 링크 보이도록 상태 변경
  function handleDelToggle() {
    setIsDelToggle(true);
  }

  return (
    <>
      {/* 페이지 헤더 - 이전 페이지로 이동 가능한 링크 포함 */}
      <Header type="pageLink" title="예약 차단" prevLink="/" />

      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          {/* 제어기 선택 드롭다운 - 선택 변경 시 상태 업데이트 */}
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={setSelectedControllerId}
          />

          {/* 상단 영역 - 예약 타이틀과 버튼들 */}
          <div className={styles.topBox}>
            <h3>예약</h3>

            {/* 버튼 영역 */}
            <div className={styles.btnBox}>
              {/* 예약 추가 페이지로 이동하는 링크 */}
              <Link to="/scheduled-add" className={styles.reservationAddBtn}>
                <span className="blind">예약추가</span>
              </Link>

              {/* 삭제 토글 버튼 및 삭제 페이지 링크 */}
              <div className={styles.delBtnBox}>
                <button
                  className={styles.delToggleBtn}
                  onClick={handleDelToggle}
                >
                  <span className="blind">삭제토글버튼</span>
                </button>

                {/* 삭제 토글 활성화 시 삭제 페이지 링크 노출 */}
                {isDelToggle && (
                  <Link
                    to={`/scheduled-delete/${selectedControllerId}`}
                    className={styles.delLink}
                    onClick={(e) => e.stopPropagation()} // 클릭 이벤트 버블링 방지
                  >
                    삭제
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 예약 목록 */}
          <ul className={styles.reservationList}>
            {/* 예약이 없으면 안내 메시지 출력 */}
            {filteredReservations.length === 0 ? (
              <li className={styles.noData}>예약이 없습니다.</li>
            ) : (
              filteredReservations.map((item) => (
                <li key={item.id}>
                  {/* 예약 시간 및 상태 표시 (ON/OFF에 따라 스타일 다름) */}
                  <div
                    className={`${styles.timeBox} ${!item.isOn ? styles.off : ""}`}
                  >
                    {/* 12시 기준 오전/오후 표시 */}
                    <span>{+item.time.split(":")[0] >= 12 ? "오후" : "오전"}</span>
                    <strong>{item.time}</strong>
                  </div>

                  {/* 예약 날짜 레이블 표시 */}
                  <div className={styles.dateBox}>
                    <span>{item.dateLabel}</span>
                  </div>

                  {/* ON/OFF 토글 스위치 - 클릭 시 상태 변경 */}
                  <div
                    className={`${styles.toggleSwitch} ${item.isOn ? styles.on : ""}`}
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
