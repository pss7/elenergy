import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";
import { useState } from "react";

export default function ScheduledDeletePage() {
  const navigate = useNavigate();

  // URL 파라미터에서 controller ID 추출 (문자열 → 숫자 변환)
  const { id } = useParams();
  const selectedControllerId = Number(id);

  // 예약 목록 상태, 초기값은 localStorage에서 불러오거나 기본 데이터 사용
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  // 삭제할 예약 ID들의 배열 상태 (선택된 항목들)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 선택된 제어기에 해당하는 예약만 필터링
  const filteredReservations = reservations.filter(
    (r) => r.controllerId === selectedControllerId
  );

  // 전체 선택 체크박스 상태 계산
  const allSelected = filteredReservations.length > 0 && selectedIds.length === filteredReservations.length;

  // 체크박스 선택/해제 시 실행되는 함수
  function toggleSelection(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id) // 이미 선택된 항목이면 해제
        : [...prev, id] // 선택되지 않은 항목이면 추가
    );
  }

  // 전체 선택/해제 토글 함수
  function toggleSelectAll() {
    if (allSelected) {
      // 전체 선택된 상태면 모두 선택 해제
      setSelectedIds([]);
    } else {
      // 전체 선택 해제 상태면 필터링된 예약 ID 모두 선택
      setSelectedIds(filteredReservations.map((item) => item.id));
    }
  }

  // 삭제 버튼 클릭 시 선택된 예약들 삭제 처리
  function handleDelete() {
    // 선택된 ID를 제외한 예약만 남김
    const updated = reservations.filter((res) => !selectedIds.includes(res.id));
    setReservations(updated);

    // 변경된 예약 목록을 localStorage에 저장
    localStorage.setItem("reservations", JSON.stringify(updated));

    // 삭제 완료 후 예약 차단 페이지로 이동
    navigate("/scheduled-block");
  }

  // 취소 버튼 클릭 시 예약 차단 페이지로 이동 (변경 사항 없음)
  function handleCancel() {
    navigate("/scheduled-block");
  }

  function handleItemKeyDown(e: React.KeyboardEvent<HTMLLIElement>, id: number) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();           // 스크롤 방지 (Space)
      toggleSelection(id);
    }
  }

  return (
    <>
      {/* 페이지 헤더 - 이전 페이지로 돌아가는 링크 */}
      <Header type="pageLink" title="예약 차단" prevLink="/scheduled-block" />

      <Main id="sub">
        <div className={styles.scheduledBlockingBox}>
          <div className={styles.scheduledDeleteBox}>
            {/* 제어기 선택 드롭다운 - 선택 변경 시 해당 제어기의 삭제 페이지로 이동 */}
            <CustomSelect
              controllers={controllerData}
              selectedControllerId={selectedControllerId}
              onChange={(newId) => navigate(`/scheduled-delete/${newId}`)}
              disabled={true}
            />

            {/* 상단 선택 및 버튼 영역 */}
            <div className={styles.topBox} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

              {/* 전체 선택 체크박스 */}
              <div className={styles.checkedBox}>
                <input
                  id="allChk"
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="blind"
                />

                <label htmlFor="allChk" >
                  <span className="blind">
                    전체선택
                  </span>
                </label>

                {/* 선택된 예약 개수 표시 */}
                <span className={styles.selectText}>
                  {selectedIds.length}개 선택됨
                </span>
              </div>

              {/* 취소, 삭제 버튼 */}
              <div className={styles.btnBox} style={{ marginLeft: 'auto' }}>
                <button onClick={handleCancel} className={styles.reservationAddBtn}>
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.delBtn}
                  disabled={selectedIds.length === 0} // 선택된 항목 없으면 비활성화
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 예약 목록 */}
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
                      aria-pressed={isSelected}                // 토글 상태 전달
                      onClick={() => toggleSelection(item.id)} // li 전체 클릭으로 토글
                      onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                      className={`${isSelected ? styles.selected : ""} ${styles.listItem}`}
                    >
                      {/* 체크박스는 시각적/보조 용도로 유지 (이벤트 전파 차단) */}
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
