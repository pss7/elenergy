import ArrowLink from "../ui/ArrowLink";
import styles from "./Header.module.css";

interface HeaderProps {

  type?: string;
  title?: string;

}

export default function Header({ type, title }: HeaderProps) {

  return (
    <header id={styles.header}>
      {
        type === "pageLink" && (
          <div className={styles.titleBox}>
            <ArrowLink to="" variant="prev" />
            <h1>
              {title}
            </h1>
            <ArrowLink to="" variant="next" />
          </div>
        )
      }
      {
        type === "logo" && (
          <div className={styles.logoBox}>
            <h1>
              <a href="/">
                <img src="/assets/images/common/logo.svg" alt="EL 이엘에너지 로고" />
              </a>
            </h1>
          </div>
        )
      }
    </header>
  )

}