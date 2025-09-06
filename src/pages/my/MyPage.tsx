import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import styles from "./MyPage.module.css";

export default function MyPage() {

  // interface UserInfo {
  //   authNumber: string;
  //   companyCode: string;
  //   userEmail: string;
  //   userId: string;
  //   userName: string;
  //   userPassword: string;
  //   userPhone: string;
  //   userRank: string;
  // }

  // const [user, setUser] = useState<UserInfo | null>(null);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("signupData"); // 로컬스토리지 키
  //   if (storedUser) {
  //     try {
  //       setUser(JSON.parse(storedUser));
  //     } catch (e) {
  //       console.error("로컬스토리지 파싱 오류:", e);
  //     }
  //   }
  // }, []);

  const navigate = useNavigate();

  function handleLogout() {

    localStorage.setItem("isLoggedIn", "false");
    navigate("/signin");

  }

  return (
    <>

      <Header
        type="pageLink"
        title="프로필"
        prevLink="/"
      />

      <Main id="sub">

        <div className={styles.mypageBox}>

          <div className={styles.mypageInfoBox}>
            <div className={styles.textBox}>
              <h2>홍길동</h2>
              <span>(주)공장에너지</span>
              <ul className={styles.memberList}>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
                <li>
                  <img src="/assets/images/sub/member_icon.svg" alt="" />
                </li>
              </ul>
            </div>
            <div className={styles.imgBox}>
              <img src="/assets/images/sub/profile_img.svg" alt="" />
            </div>
          </div>

          <h3 className={styles.h3}>
            내설정
          </h3>

          <ul className={styles.link}>
            <li>
              <Link to="/my-account">
                내계정
              </Link>
            </li>
            <li>
              <Link to="/member-management">
                구성원관리
              </Link>
            </li>
            <li>
              <Link to="/notifications-settings">
                알림설정
              </Link>
            </li>
            <li>
              <Link to="/privacy">
                개인정보보호
              </Link>
            </li>
            <li>
              <Link to="/"
                onClick={handleLogout}
              >
                로그아웃
              </Link>
            </li>
          </ul>
          <div className={styles.versionBox}>
            <span>앱 버전 정보</span>
            <em>
              현재버전 1.0.0
            </em>
          </div>
        </div>

      </Main>

    </>
  )
}