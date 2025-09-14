import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ArrowLink from "../components/ui/ArrowLink";
import Title from "../components/ui/Title";
import PowerDoughnutChart from "../components/ui/PowerDoughnutChart";
import styles from "./MainPage.module.css";
import savingsData from "../data/Savings";
import { useControllerData } from "../contexts/ControllerContext";
import useNavigateTo from "../hooks/useNavigateTo";

import {
  ensureDemoUnreadIfNone,
  loadReadIds,
  getAllAlarms,
} from "../data/Alarms";

// ⛔ 타입 전용 import (ts 1484 경고 방지)
import type { PowerState } from "../utils/powerState";
// ✅ 실제 함수 import
import { getControllerPower } from "../utils/powerState";

function useCompanyCode() {
  return localStorage.getItem("companyCode") || "DEFAULT_COMPANY";
}

export default function MainPage() {
  const { controllers } = useControllerData();
  const listRef = useRef<HTMLUListElement>(null);
  const [activeToggleId, setActiveToggleId] = useState<number | null>(null);
  const { navigateTo } = useNavigateTo();
  const company = useCompanyCode();

  // ===== 전원 상태 맵 (컨트롤러 id -> ON/OFF) =====
  const [powerMap, setPowerMap] = useState<Record<number, PowerState>>({});

  // 초기 로드 & 이벤트 구독
  useEffect(() => {
    const refresh = () => {
      const m: Record<number, PowerState> = {};
      controllers.forEach((c) => {
        m[c.id] = getControllerPower(c.id);
      });
      setPowerMap(m);
    };

    refresh();

    const onChanged = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "controllerPowerState" || e.key === null) refresh();
    };

    window.addEventListener("controller:power:changed", onChanged as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("controller:power:changed", onChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [controllers]);

  function handleToggle(id: number) {
    setActiveToggleId((prev) => (prev === id ? null : id));
  }
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setActiveToggleId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleControl(id: number) {
    navigateTo(`/manual-control/${id}`);
  }

  /* 🔴 빨간 점 상태 */
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    ensureDemoUnreadIfNone(company, 3);

    const recompute = () => {
      const read = loadReadIds(company);
      const all = getAllAlarms(company);
      setHasUnread(all.some((a) => !read.has(a.id)));
    };

    recompute();

    const onStorage = () => recompute();
    const onFocus = () => recompute();
    const onVisibility = () =>
      document.visibilityState === "visible" && recompute();
    const onChanged = () => recompute();
    const onReadChanged = () => recompute();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("alarm:changed", onChanged);
    window.addEventListener("alarm:readIds:changed", onReadChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("alarm:changed", onChanged);
      window.removeEventListener("alarm:readIds:changed", onReadChanged);
    };
  }, [company]);

  return (
    <>
      <section className={styles.titleBox}>
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
          전체제어기
        </Title>

        <ul className={styles.linkList01} ref={listRef}>
          {controllers.map((ctrl) => {
            const isOn = (powerMap[ctrl.id] ?? "OFF") === "ON";
            return (
              <li key={ctrl.id} onClick={() => handleControl(ctrl.id)}>
                <div
                  className={[
                    styles.box,
                    isOn ? styles.powerOn : styles.powerOff, // ✅ CSS Module 클래스 사용
                  ].join(" ")}
                >
                  <div className={styles.textBox}>
                    <h2>{ctrl.title}</h2>
                    <span className={styles.location}>{ctrl.location}</span>
                  </div>

                  <div className={styles.linkBox}>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(ctrl.id);
                      }}
                    >
                      <em className="blind">정보변경 이동 버튼</em>
                    </button>

                    <Link
                      to={`/controller-update/${ctrl.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`${styles.changeLink} ${
                        activeToggleId === ctrl.id ? styles.active : ""
                      }`}
                    >
                      정보변경
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 🔔 알림 아이콘 */}
        <Link
          to="/alarm"
          className={`${styles.alarmLink} ${hasUnread ? styles.hasUnread : ""}`}
          aria-label="알림"
        >
          <img src="/assets/images/common/alarm_icon.svg" alt="알림" />
          {hasUnread && <i className={styles.redDot} aria-hidden="true" />}
        </Link>
      </section>

      <section>
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon02}`}>
          다른 차단 방식이 필요하신가요?
        </Title>
        <ul className={styles.linkList02}>
          <li>
            <Link to="/scheduled-block">
              <Title level={2}>예약 차단 설정</Title>
              <span>원하는 시간에 전력 OFF 가능</span>
            </Link>
          </li>
          <li>
            <Link to="/auto-block">
              <Title level={2}>자동 차단 설정</Title>
              <span>기준 이하로 전력 감소 시 자동 OFF 가능</span>
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <div className={`${styles.layoutBox} mb-20`}>
          <Title level={1} className={`${styles.h1} ${styles.mainIcon03}`}>
            이번 달 절약한 전력 요금
          </Title>
          <ArrowLink to="/monitoring" variant="next">
            <span className="blind">전력 모니터링 이동</span>
          </ArrowLink>
        </div>

        <div className={styles.chartBox}>
          <PowerDoughnutChart
            powerReductionRate={25}
            textTitle="절감한 전력량"
            valueText="25%"
            lineWidth={35}
            titleFontSize="10px"
            valueFontSize="20px"
          />
          <div className={styles.chartInfoBox}>
            <h3>절감한 전력 요금</h3>
            <span>{savingsData.moneySaved.toLocaleString()}원</span>
          </div>
        </div>
      </section>
    </>
  );
}
