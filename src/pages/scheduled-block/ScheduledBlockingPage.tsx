import { useState, useEffect, useRef } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import { Link } from "react-router-dom";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";

export default function ScheduledBlockingPage() {

  // 현재 선택된 제어기 ID 상태 (기본값: 1번 제어기)
  const [selectedControllerId, setSelectedControllerId] = useState<number>(1);

  // 삭제 버튼 토글 여부 상태
  const [isDelToggle, setIsDelToggle] = useState(false);

  // 삭제 버튼 영역을 감지하기 위한 ref
  const delBtnRef = useRef<HTMLDivElement>(null);

  // 예약 목록 상태 (localStorage에 저장된 데이터 또는 기본 데이터로 초기화)
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  // 컴포넌트 마운트 시: 지난 날짜의 예약은 자동 OFF 처리
  useEffect(() => {
    const today = new Date();

    const updated = reservations.map((item) => {
      // "YYYY년 M월 D일" 형식의 날짜 문자열을 파싱
      const match = item.dateLabel.match(/^(\d{4})년 (\d{1,2})월 (\d{1,2})일/);

      if (match) {
        const [_, year, month, day] = match.map(Number); // 문자열 → 숫자 변환
        const reservationDate = new Date(year, month - 1, day); // 월은 0-based

        // 오늘 이전 날짜라면 예약을 OFF 처리
        if (reservationDate < today && item.isOn) {
          return { ...item, isOn: false };
        }
      }

      return item; // 변경 없음
    });

    // 업데이트된 예약 목록 저장
    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));
  }, []);

  // 예약 목록 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  //외부 클릭 시 삭제 링크 닫기
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDelToggle]);

  //제어기 변경 시 삭제 버튼 초기화
  function handleControllerChange(id: number) {
    setSelectedControllerId(id);
    setIsDelToggle(false);
  }

  // 현재 선택된 제어기에 해당하는 예약만 필터링
  const filteredReservations = reservations.filter(
    (r) => r.controllerId === selectedControllerId
  );

  // 예약 ON/OFF 토글 함수
  function toggleReservation(id: number) {
    setReservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isOn: !item.isOn } : item
      )
    );
  }

  // 삭제 버튼을 누르면 삭제 링크를 보여줌
  function handleDelToggle() {
    setIsDelToggle(true);
  }

  return (
    <>
      {/* 페이지 상단 헤더 (뒤로 가기 링크 포함) */}
      <Header type="pageLink" title="예약 차단" prevLink="/" />

      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          {/* 제어기 선택 드롭다운 */}
          <CustomSelect
            controllers={controllerData}
            selectedControllerId={selectedControllerId}
            onChange={handleControllerChange} // ✅ 변경
          />

          {/* 상단 영역 - 예약 제목 및 버튼들 */}
          <div className={styles.topBox}>
            <h3>예약</h3>

            <div className={styles.btnBox}>
              {/* 예약 추가 페이지로 이동 */}
              <Link to="/scheduled-add" className={styles.reservationAddBtn}>
                <span className="blind">예약추가</span>
              </Link>

              {/* 🗑️ 삭제 토글 버튼 및 삭제 링크 */}
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
                    onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                  >
                    삭제
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 예약 리스트 렌더링 */}
          <ul className={styles.reservationList}>
            {/* 예약이 없을 때 */}
            {filteredReservations.length === 0 ? (
              <li className={styles.noData}>예약이 없습니다.</li>
            ) : (
              // 예약이 있을 때 목록 출력
              filteredReservations.map((item) => (
                <li key={item.id}>
                  {/* 시간 표시 영역 (ON/OFF에 따라 스타일 변경) */}
                  <div
                    className={`${styles.timeBox} ${!item.isOn ? styles.off : ""}`}
                  >
                    <span>{+item.time.split(":")[0] >= 12 ? "오후" : "오전"}</span>
                    <strong>{item.time}</strong>
                  </div>

                  {/* 날짜 표시 */}
                  <div className={styles.dateBox}>
                    <span>{item.dateLabel}</span>
                  </div>

                  {/* 토글 스위치 (ON/OFF 상태 전환) */}
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
