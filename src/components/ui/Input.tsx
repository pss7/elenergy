// src/components/ui/Input.tsx
import React from "react";
import styles from "./Input.module.css";

// 네이티브 <input>의 모든 속성 허용 (maxLength, aria-*, inputMode 등)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  ...rest
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[styles.input, className].filter(Boolean).join(" ")}
      {...rest}  // maxLength, aria-*, pattern 등 추가 전달
    />
  );
}
