import ArrowLink from "../ui/ArrowLink";
import styles from "./Header.module.css";

interface HeaderProps {

  type?: string;
  title?: string;
  prevLink?: string;
  nextLink?: string;
}

export default function Header({ type, title, prevLink, nextLink }: HeaderProps) {

  return (
    <header id={styles.header}>
      {
        type === "pageLink" && (
          <div className={styles.titleBox}>
            {
              prevLink && (
                <ArrowLink to={prevLink} variant="prev" />
              )
            }

            <h1>
              {title}
            </h1>
            {
              nextLink && (
                <ArrowLink to={nextLink} variant="next" />
              )
            }
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