import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import InputCheckbox from "../components/ui/InputCheckbox";
import styles from "./AlarmPage.module.css";

export default function AlarmFilterPage() {

  //경로이동
  const navigate = useNavigate();

  function handleCencle() {
    navigate("/alarm");
  }

  return (
    <>

      <Header
        type="pageLink"
        title="필터"
        prevLink="/alarm"
      />

      <Main id="sub">
        <div className={styles.alarmBox}>

          <div className={styles.filterBox}>
            <h2>정렬</h2>
            <div className={styles.inputRadioBox}>
              <div className={styles.box}>
                <input id="radio01" type="radio" name="radio" className="blind" />
                <label htmlFor="radio01">최신순</label>
              </div>
              <div className={styles.box}>
                <input id="radio02" type="radio" name="radio" className="blind" />
                <label htmlFor="radio02">과거순</label>
              </div>
            </div>
          </div>

          <div className={styles.filterBox}>
            <h2>제어기</h2>

            <div className={styles.layoutBox}>
              <InputCheckbox
                id="chk1"
                htmlFor="chk1"
                label="제어기1"
              />
              <InputCheckbox
                id="chk2"
                htmlFor="chk2"
                label="제어기2"
              />
              <InputCheckbox
                id="chk3"
                htmlFor="chk3"
                label="제어기3"
              />
              <InputCheckbox
                id="chk4"
                htmlFor="chk4"
                label="제어기4"
              />
            </div>
          </div>

          <div className={styles.filterBox}>
            <h2>관리자ID</h2>

            <div className={styles.layoutBox}>
              <InputCheckbox
                id="chk5"
                htmlFor="chk5"
                label="관리자ID1"
              />
              <InputCheckbox
                id="chk6"
                htmlFor="chk6"
                label="관리자ID2"
              />
              <InputCheckbox
                id="chk7"
                htmlFor="chk7"
                label="관리자ID3"
              />
              <InputCheckbox
                id="chk8"
                htmlFor="chk8"
                label="관리자ID4"
              />
            </div>
          </div>

          <div className={styles.filterBox}>
            <h2>제어방식</h2>

            <div className={styles.layoutBox}>
              <InputCheckbox
                id="chk9"
                htmlFor="chk9"
                label="수동제어"
              />
              <InputCheckbox
                id="chk10"
                htmlFor="chk10"
                label="ON"
              />
              <InputCheckbox
                id="chk11"
                htmlFor="chk11"
                label="자동제어"
              />
              <InputCheckbox
                id="chk12"
                htmlFor="chk12"
                label="OFF"
              />
              <InputCheckbox
                id="chk13"
                htmlFor="chk13"
                label="예약제어"
              />
            </div>
          </div>

          <div className="btnBox">
            <Button
              styleType="grayType"
              onClick={handleCencle}
            >
              취소
            </Button>
            <Button>
              적용
            </Button>
          </div>

        </div>
      </Main>

    </>
  )

}