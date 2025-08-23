import styles from "./Input.module.css";

interface InputProps {

  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;

}

export default function Input({ id, value, onChange, type }: InputProps) {

  return (
    <>
      <input
        type={type}
        value={value}
        id={id}
        className={styles.input}
        onChange={onChange}
      />
    </>
  )

}