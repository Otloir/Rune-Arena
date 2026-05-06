import { useState } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  name,
  min,
  max,
  ...rest
}: InputProps) {
  const [internalValue, setInternalValue] = useState<string | number>("");
  const isNumber = type === "number";
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = e.target.value;

    if (isNumber) {
      const num = parseInt(newValue, 10);
      if (!isNaN(num)) {
        newValue = Math.max(Number(min) || 0, Math.min(num, Number(max) || 99));
      }
    }

    if (value === undefined) setInternalValue(newValue);
    onChange?.(e);
  };

  return (
    <div className={styles.inputContainer}>
      {label && <label htmlFor={name || "input"}>{label}</label>}
      <input
        id={name || "input"}
        name={name}
        type={type}
        value={currentValue}
        onChange={handleChange}
        min={isNumber ? min : undefined}
        max={isNumber ? max : undefined}
        className={isNumber ? styles.number : undefined}
        {...rest}
      />
    </div>
  );
}
