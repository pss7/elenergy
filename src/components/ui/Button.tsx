
import styles from "./Button.module.css";
import type { ReactNode } from "react";

interface ButtonProps {
  type: "grayType" | "tealType";
  label?: string;
  children?: ReactNode;
}

export default function Button({ type, children }: ButtonProps) {
  const buttonType = type === "grayType" ? styles.grayType : styles.tealType;

  return (
    <>
      <button className={`${styles.button} ${buttonType}`}>
        {children}
      </button>
    </>
  )

}