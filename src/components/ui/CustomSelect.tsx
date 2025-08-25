import { useState } from "react";
import styles from "./CustomSelect.module.css";

export default function CustomSelect() {

  const [selectToggle, setSelectToggle] = useState(false);

  function handleSelectToggle() {

    if (selectToggle === false) {
      setSelectToggle(true);
    } else {
      setSelectToggle(false);
    }

  }

  return (
    <>
      <div className={`${styles.selectBox} ${selectToggle ? `${styles.active}` : ""}`}>
        <button 
          className={styles.btn}
          onClick={handleSelectToggle}
        >
          제어기 1 - <em>#공장위치</em>
        </button>
        <div className={styles.selectListBox}>
          <span>전체제어기</span>
          <ul className={styles.selectList}>
            <li>
              <button className={styles.selectListBtn}>
                제어기 2 - <em>#공장위치</em>
              </button>
            </li>
            <li>
              <button className={styles.selectListBtn}>
                제어기 3 - <em>#공장위치</em>
              </button>
            </li>
            <li>
              <button className={styles.selectListBtn}>
                제어기 4 - <em>#공장위치</em>
              </button>
            </li>
          </ul>
        </div>
        
      </div>
    </>
  )

}
