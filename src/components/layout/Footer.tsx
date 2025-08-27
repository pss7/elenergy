import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      <footer id={styles.footer}>
        <ul className={styles.link}>
          <li>
            <Link to="/scheduled-block">
              <span>
                예약차단
              </span>
            </Link>
          </li>
          <li>
            <Link to="/auto-block">
              <span>
                자동차단
              </span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <span>
                메인
              </span>
            </Link>
          </li>
          <li>
            <Link to="/monitoring">
              <span>
                모니터링
              </span>
            </Link>
          </li>
          <li>
            <Link to={isLoggedIn ? "/my" : "/signin"}>
              <span>
                MY
              </span>
            </Link>
          </li>
        </ul>
      </footer>
    </>
  )

}