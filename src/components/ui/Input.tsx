import styles from "./Input.module.css";

interface InputProps {

  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
}

export default function Input({ id, value, onChange }: InputProps) {

  return (
    <>
      <input
        value={value}
        id={id}
        className={styles.input}
        onChange={onChange}
      />
    </>
  )

}