// src/pages/scheduled-block/ScheduledBlockingPage.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import CustomSelect from "../../components/ui/CustomSelect";
import styles from "./ScheduledBlockingPage.module.css";
import controllerData from "../../data/Controllers";
import scheduledBlockingsData from "../../data/ScheduledBlockings";
import type { Reservation } from "../../data/ScheduledBlockings";
import Footer from "../../components/layout/Footer";
import { useControllerData } from "../../contexts/ControllerContext";
import { logAlarm } from "../../utils/logAlarm";

// 초기 컨트롤러 ID를 결정
function getInitialControllerId(locationState: any): number {
  const fromState = locationState?.initialControllerId;
  const fromStorage = Number(localStorage.getItem("lastControllerId")) || undefined;
  return fromState ?? fromStorage ?? 1;
}

// "YYYY년 M월 D일"/"M월 D일" 라벨 → {year,month,day}
function parseDateLabelToYmd(label: string) {
  let m = label.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    const [, y, mo, d] = m.map(Number);
    return { year: y, month: mo, day: d };
  }
  m = label.match(/^(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    const [, mo, d] = m.map(Number);
    const now = new Date();
    return { year: now.getFullYear(), month: mo, day: d };
  }
  return null;
}

// 예약 → Date(날짜+시간). 반복("매일 ...")은 null 반환
function buildDateTimeFromReservation(res: Reservation): Date | null {
  if (res.dateLabel.startsWith("매일")) return null;
  const ymd = parseDateLabelToYmd(res.dateLabel);
  if (!ymd) return null;
  const [hh, mm] = res.time.split(":").map(Number);
  return new Date(ymd.year, ymd.month - 1, ymd.day, hh, mm, 0, 0);
}

// "HH:MM" → {오전/오후, hour:1~12, minute:"00"~"59"}
function parseTimeToSelected(timeStr: string) {
  const [hourStr, minuteRaw] = timeStr.split(":");
  let hourNum = Number(hourStr);
  const ampm: "오전" | "오후" = hourNum >= 12 ? "오후" : "오전";
  if (hourNum > 12) hourNum -= 12;
  if (hourNum === 0) hourNum = 12;
  const minute = String(Number(minuteRaw)).padStart(2, "0");
  return { ampm, hour: hourNum, minute };
}

export default function ScheduledBlockingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { controllers } = useControllerData();

  // 현재 선택된 컨트롤러 ID
  const [selectedControllerId, setSelectedControllerId] = useState<number>(() =>
    getInitialControllerId(location.state)
  );

  // 삭제 드롭다운 토글
  const [isDelToggle, setIsDelToggle] = useState(false);
  const delBtnRef = useRef<HTMLDivElement>(null);

  // 예약 목록 (로컬스토리지와 동기화)
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem("reservations");
    return saved ? JSON.parse(saved) : scheduledBlockingsData;
  });

  // 마운트 시 과거 예약 자동 OFF(날짜+시간 기준, 반복 예약 제외)
  useEffect(() => {
    const now = new Date();
    const updated = reservations.map((item) => {
      const dt = buildDateTimeFromReservation(item);
      if (dt && dt < now && item.isOn) return { ...item, isOn: false };
      return item;
    });
    setReservations(updated);
    localStorage.setItem("reservations", JSON.stringify(updated));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 예약 변경 시 저장
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);

  // 바깥 클릭 시 삭제 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isDelToggle && delBtnRef.current && !delBtnRef.current.contains(e.target as Node)) {
        setIsDelToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDelToggle]);

  // 컨트롤러 변경
  function handleControllerChange(id: number) {
    setSelectedControllerId(id);
    setIsDelToggle(false);
    localStorage.setItem("lastControllerId", String(id));
  }

  // 항목 토글 (상태+알림 로그)
  function toggleReservation(id: number) {
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isOn: !item.isOn } : item))
    );

    const r = reservations.find((r) => r.id === id);
    const nextIsOn = r ? !r.isOn : true;
    const targetCtrl = controllers.find((c) => c.id === selectedControllerId);
    if (targetCtrl) {
      logAlarm({
        type: "예약제어",
        controller: targetCtrl.title,
        status: nextIsOn ? "ON" : "OFF",
      });
    }
  }

  // 리스트에서 항목 탭하면 수정 페이지로 이동
  function handleEditReservation(reservation: Reservation) {
    const timeObj = parseTimeToSelected(reservation.time);
    navigate(`/scheduled-edit/${reservation.id}`, {
      state: {
        reservation: { ...reservation, time: timeObj },
        controllerId: selectedControllerId,
        initialControllerId: selectedControllerId,
      },
    });
  }

  const filteredReservations = reservations.filter((r) => r.controllerId === selectedControllerId);

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
              <Link
                to="/scheduled-add"
                state={{ controllerId: selectedControllerId, initialControllerId: selectedControllerId }}
                className={styles.reservationAddBtn}
              >
                <span className="blind">예약추가</span>
              </Link>

              <div className={styles.delBtnBox} ref={delBtnRef}>
                <button className={styles.delToggleBtn} onClick={() => setIsDelToggle(true)}>
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
              <li className={styles.noData}>예약된 시간이 없습니다.</li>
            ) : (
              filteredReservations.map((item) => (
                <li key={item.id} onClick={() => handleEditReservation(item)}>
                  <div className={`${styles.timeBox} ${!item.isOn ? styles.off : ""}`}>
                    <span>{+item.time.split(":")[0] >= 12 ? "오후" : "오전"}</span>
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
