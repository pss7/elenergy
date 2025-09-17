// components/ui/Input.tsx
import styles from "./Input.module.css";
import type { ChangeEvent, FocusEvent } from "react";

interface InputProps {
  id?: string;
  name?: string;
  type?: "text" | "password" | "email" | "tel" | "number" | "search" | "url";
  value?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  inputMode?:
  | "text"
  | "numeric"
  | "decimal"
  | "tel"
  | "email"
  | "search"
  | "url"
  | "none";
  autoComplete?: string;

  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

export default function Input({
  id,
  name,
  type = "text",
  value,
  placeholder,
  className,
  disabled,
  maxLength,
  inputMode,
  autoComplete,
  onChange,
  onFocus,
  onBlur,
}: InputProps) {
  const inputClass = [styles.input, className].filter(Boolean).join(" ");

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      className={inputClass}
      disabled={disabled}
      maxLength={maxLength}
      inputMode={inputMode}
      autoComplete={autoComplete}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
