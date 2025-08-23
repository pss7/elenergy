import styles from "./Input.module.css";

interface InputCheckboxProps {

  value?: string;
  id?: string;
  htmlFor?: string;
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputCheckbox({ id, value, htmlFor, label, checked, onChange }: InputCheckboxProps) {

  return (
    <>
      <div className={styles.inputCheckBox}>
        <input
          type="checkbox"
          value={value}
          id={id}
          className="blind"
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={htmlFor}>
          {label}
        </label>
      </div>
    </>

  )

}