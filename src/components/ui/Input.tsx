import styles from "./Input.module.css";

interface InputProps {

  id?: string;

}

export default function Input({ id }: InputProps) {

  return (
    <>
      <input
        id={id}
        className={styles.input}
      />
    </>
  )

}