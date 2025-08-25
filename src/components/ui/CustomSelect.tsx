// src/components/ui/CustomSelect.tsx

import { useState } from "react";
import styles from "./CustomSelect.module.css";
import type { Controller } from "../../data/Controllers";

interface CustomSelectProps {
  controllers: Controller[];
  selectedControllerId: number;
  onChange: (id: number) => void;
}

export default function CustomSelect({
  controllers,
  selectedControllerId,
  onChange,
}: CustomSelectProps) {
  const [selectToggle, setSelectToggle] = useState(false);

  const selectedController = controllers.find(c => c.id === selectedControllerId);

  return (
    <div className={`${styles.selectBox} ${selectToggle ? styles.active : ""}`}>
      <button className={styles.btn} onClick={() => setSelectToggle(prev => !prev)}>
        {selectedController?.title} - <em>{selectedController?.location}</em>
      </button>

      {selectToggle && (
        <div className={styles.selectListBox}>
          <ul className={styles.selectList}>
            {controllers.map(controller => (
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
