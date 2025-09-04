import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import InputCheckbox from "../components/ui/InputCheckbox";
import styles from "./AlarmPage.module.css";
import { useState } from "react";
import type { AlarmFilters } from "../data/Alarms";

export default function AlarmFilterPage() {

  const navigate = useNavigate();

  // 상태 선언
  const [selectedControllers, setSelectedControllers] = useState<string[]>([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // 체크박스 변경 처리
  function handleCheckboxChange(
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) {
    setState((prevList) => {
      const newList = prevList.includes(value)
        ? prevList.filter((item) => item !== value) 
        : [...prevList, value];

      return newList;
    });
  }

  // 필터 적용
  function handleApply() {
    const filters: AlarmFilters = {
      controllers: selectedControllers,
      admins: selectedAdminIds,
      types: selectedTypes,
      sortOrder: sortOrder,
    };

    localStorage.setItem("alarmFilters", JSON.stringify(filters));
    navigate("/alarm");
  }

  function handleCancel() {
    navigate("/alarm");
  }

  return (
    <>
      <Header type="pageLink" title="필터" prevLink="/alarm" />

      <Main id="sub">
        <div className={styles.alarmBox}>
          {/* 정렬 */}
          <div className={styles.filterBox}>
            <h2>정렬</h2>
            <div className={styles.inputRadioBox}>
              <div className={styles.box}>
                <input
                  id="radio01"
                  type="radio"
                  name="sort"
                  className="blind"
                  checked={sortOrder === "latest"}
                  onChange={() => setSortOrder("latest")}
                />
                <label htmlFor="radio01">최신순</label>
              </div>
              <div className={styles.box}>
                <input
                  id="radio02"
                  type="radio"
                  name="sort"
                  className="blind"
                  checked={sortOrder === "oldest"}
                  onChange={() => setSortOrder("oldest")}
                />
                <label htmlFor="radio02">과거순</label>
              </div>
            </div>
          </div>

          {/* 제어기 */}
          <div className={styles.filterBox}>
            <h2>제어기</h2>
            <div className={styles.layoutBox}>
              {["제어기1", "제어기2", "제어기3", "제어기4"].map((ctrl, idx) => (
                <InputCheckbox
                  key={ctrl}
                  id={`chk${idx + 1}`}
                  htmlFor={`chk${idx + 1}`}
                  label={ctrl}
                  checked={selectedControllers.includes(ctrl)}
                  onChange={() => handleCheckboxChange(setSelectedControllers, ctrl)}
                />
              ))}
            </div>
          </div>

          {/* 관리자 ID */}
          <div className={styles.filterBox}>
            <h2>관리자ID</h2>
            <div className={styles.layoutBox}>
              {["D1", "ID2", "ID3", "ID4"].map((admin, idx) => (
                <InputCheckbox
                  key={admin}
                  id={`chk_admin${idx + 1}`}
                  htmlFor={`chk_admin${idx + 1}`}
                  label={admin}
                  checked={selectedAdminIds.includes(admin)}
                  onChange={() => handleCheckboxChange(setSelectedAdminIds, admin)}
                />
              ))}
            </div>
          </div>

          {/* 제어방식 */}
          <div className={styles.filterBox}>
            <h2>제어방식</h2>
            <div className={styles.layoutBox}>
              {["수동제어", "자동제어", "예약제어"].map((type, idx) => (
                <InputCheckbox
                  key={type}
                  id={`chk_type${idx + 1}`}
                  htmlFor={`chk_type${idx + 1}`}
                  label={type}
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleCheckboxChange(setSelectedTypes, type)}
                />
              ))}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="btnBox">
            <Button styleType="grayType" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleApply}>적용</Button>
          </div>
        </div>
      </Main>
    </>
  );
}
