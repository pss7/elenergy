import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";
import Button from "../../components/ui/Button";
import InputCheckbox from "../../components/ui/InputCheckbox";
import { useNavigate } from "react-router-dom";

export default function WithdrawAgreePage() {

  const navigate = useNavigate();
  
  return (
    <>

      <Header
        type="pageLink"
        title="회원탈퇴"
        prevLink="/my-account"
      />

      <Main id="sub">
        <div className={styles.withdrawBox}>
          <p className={styles.infoText01}>
            정말 탈퇴하시겠어요? <br />
            탈퇴에 대한 다음 안내사항을 확인해주세요.
          </p>

          <p className={styles.infoTitle}>
            1.이엘에너지 회원 탈퇴 처리
          </p>

          <p className={styles.infoText02}>
            회원 탈퇴 즉시, 회원님의 모든 정보는 <br />
            파기되며, 모든 서비스를 이용하실 수 없게 <br />
            됩니다. 탈퇴 후에는 다시 가입하실 수 <br />
            있습니다.
          </p>

          <InputCheckbox
            id="agreeCheck"
            htmlFor="agreeCheck"
            label="위 내용을 모두 확인하고, 탈퇴에 동의합니다."
          />

          <Button
            className="mt-40"
            onClick={() => navigate("/withdraw-confirm")}
          >
            다음
          </Button>

        </div>
      </Main>

    </>
  )
}