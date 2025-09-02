import { useState } from "react";

export default function useCodeInput(length: number = 6) {
  const [value, setValue] = useState("");

  const isValid = value.length >= length;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  return {
    value,
    onChange,
    isValid,
    reset: () => setValue(""),
  };
}
