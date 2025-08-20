
import styles from "./Button.module.css";
import type { ReactNode } from "react";

interface ButtonProps {
  type: "grayType" | "tealType";
  label?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}


export default function Button({ type, children, onClick }: ButtonProps) {
  const buttonType = type === "grayType" ? styles.grayType : styles.tealType;

  return (
    <>
      <button
        className={`${styles.button} ${buttonType}`}
        onClick={onClick}
      >
        {children}
      </button>
    </>
  )

}