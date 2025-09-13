// src/components/ui/CustomSelect.tsx
import { useState } from "react";
import styles from "./CustomSelect.module.css";
import type { Controller } from "../../data/Controllers";
import { useControllerData } from "../../contexts/ControllerContext";

interface CustomSelectProps {
  /** 더 이상 필요 없음: 컨텍스트 사용. (남겨두지만 무시) */
  controllers?: Controller[];
  selectedControllerId: number;
  onChange: (id: number) => void;
  /** 삭제 페이지 등에서 드롭다운 비활성화 */
  disabled?: boolean;
}

export default function CustomSelect({
  // controllers,  // ⛔ 컨텍스트로 대체
  selectedControllerId,
  onChange,
  disabled = false,
}: CustomSelectProps) {
  const [selectToggle, setSelectToggle] = useState(false);

  // 컨텍스트의 최신 controllers 사용 (메인에서 수정 → 전 화면 반영)
  const { controllers } = useControllerData();

  const selectedController = controllers.find((c) => c.id === selectedControllerId);

  return (
    <div
      className={`${styles.selectBox} ${selectToggle ? styles.active : ""} ${
        disabled ? styles.disabled : ""
      }`}
    >
      <button
        className={`${styles.btn} ${disabled ? styles.btnDisabled : ""}`}
        onClick={() => {
          if (disabled) return;
          setSelectToggle((prev) => !prev);
        }}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {selectedController?.title} - <em>{selectedController?.location}</em>
      </button>

      {!disabled && selectToggle && (
        <div className={styles.selectListBox}>
          <ul className={styles.selectList}>
            {controllers.map((controller) => (
              <li key={controller.id}>
                <button
                  className={styles.selectListBtn}
                  onClick={() => {
                    onChange(controller.id);
                    setSelectToggle(false);
                  }}
                >
                  {controller.title} - <em>{controller.location}</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
