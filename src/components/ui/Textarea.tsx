import styles from "./Textarea.module.css";

interface TextareaProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Textarea({
  id,
  name,
  value,
  placeholder,
  onChange,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={styles.textarea}
    />
  );
}
