import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function MyAccountPage() {

  return (
    <>

      <Header
        type="pageLink"
        title="내계정"
        prevLink="/my"
      />

      <Main id="sub">

        <div className={styles.myAccountBox}>

          <div className={styles.infoBox}>
            <div className={styles.box}>
              <span>아이디</span>
              <em>
                iddididi123
              </em>
            </div>
            <div className={styles.box}>
              <span>이름</span>
              <em>
                홍길동
              </em>
            </div>
            <div className={styles.box}>
              <span>이메일</span>
              <em>
                official@elenergy.kr
              </em>
            </div>
            <div className={styles.box}>
              <span>전화번호</span>
              <em>
                010-1234-5678
              </em>
            </div>
            <div className={styles.box}>
              <span>직급</span>
              <em>
                팀장
              </em>
            </div>
            <div className={styles.box}>
              <span>회사명</span>
              <em>
                (주)공장전력
              </em>
            </div>
            <div className={styles.box}>
              <span>가입일</span>
              <em>
                2025.10.13
              </em>
            </div>
            <div className={styles.box}>
              <span>권한</span>
              <em>
                관리자
              </em>
            </div>
          </div>

          <Link to="/edit-profile" className="linkBtn">
            회원정보 수정
          </Link>

          <div className={styles.cancelAccountBox}>
            <Link
              to="/withdraw-agree"
              className={styles.cancelAccount}
            >
              회원탈퇴
            </Link>
          </div>

        </div>

      </Main>

    </>
  )
}