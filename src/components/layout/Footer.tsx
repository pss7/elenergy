import { NavLink } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <footer id={styles.footer}>
      <ul className={styles.link}>
        <li>
          <NavLink
            to="/scheduled-block"
            className={function ({ isActive }) {
              return isActive ? styles.active : "";
            }}
          >
            <span>예약차단</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/auto-block"
            className={function ({ isActive }) {
              return isActive ? styles.active : "";
            }}
          >
            <span>자동차단</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/"
            end
            className={function ({ isActive }) {
              return isActive ? styles.active : "";
            }}
          >
            <span>메인</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/monitoring"
            className={function ({ isActive }) {
              return isActive ? styles.active : "";
            }}
          >
            <span>모니터링</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to={isLoggedIn ? "/my" : "/signin"}
            className={function ({ isActive }) {
              return isActive ? styles.active : "";
            }}
          >
            <span>프로필</span>
          </NavLink>
        </li>
      </ul>
    </footer>
  );
}
