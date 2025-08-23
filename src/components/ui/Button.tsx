
import styles from "./Button.module.css";
import type { ReactNode } from "react";

interface ButtonProps {
  styleType?: "grayType" | "tealType";
  label?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?:boolean;
  type?: "button" | "submit" | "reset"

}

export default function Button({ type, styleType, children, onClick, className,disabled }: ButtonProps) {
  const buttonType = styleType === "grayType" ? styles.grayType : styles.tealType;

  return (
    <>
      <button
        className={`${styles.button} ${buttonType} ${className}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    </>
  )

}