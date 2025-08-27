import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import styles from "./ArrowLink.module.css";

interface ArrowLinkProps {
  to: string;
  variant: "next" | "prev";
  label?: string;
  children?: ReactNode;
}

export default function ArrowLink({ to, variant, children }: ArrowLinkProps) {
  const variantClass = variant === "next" ? styles.next : styles.prev;

  return (
    <Link to={to} className={`${styles.link} ${variantClass}`}>
      {children}
    </Link>
  );
}
