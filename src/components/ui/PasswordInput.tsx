import { useState } from "react";
import styles from "./Input.module.css";

interface InputProps {

  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;

}

export default function PasswordInput({ id, value, onChange, error }: InputProps) {

  //비밀번호 토글 상태 관리
  const [showPassword, setShowPassword] = useState(false);

  //비밀번호 토글 함수
  function togglePasswordVisibility() {
    if (showPassword === true) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }

  return (
    <>
      <div className={styles.inputPasswordBox}>
        <input
          value={value}
          id={id}
          type={showPassword ? "text" : "password"}
          className={styles.input}
          onChange={onChange}
        />
        <button
          className={styles.pwToggleBtn}
          onClick={togglePasswordVisibility}
          type="button"
        >
          <img src={showPassword ? "/assets/images/sub/toggle_icon02.svg" : "/assets/images/sub/toggle_icon.svg"} alt={showPassword ? "비밀번호숨기기" : "비밀번호 보기"} />
        </button>
      </div>
      {value && error && <p className="errorMessage">{error}</p>}
    </>
  )

}