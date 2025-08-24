import styles from "./Input.module.css";

interface InputProps {

  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;

}

export default function Input({ id, value, onChange, type, placeholder }: InputProps) {

  return (
    <>
      <input
        type={type}
        value={value}
        id={id}
        className={styles.input}
        onChange={onChange}
        placeholder={placeholder}
      />
    </>
  )

}