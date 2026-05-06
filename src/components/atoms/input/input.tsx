import { useState } from "react";
import styles from './Input.module.css';

interface NumberInputProps {
  label?: string;
  type?: "number" | "text";
  min?: number;
  max?: number;
}

export default function Input({
  label = "Quantity",
  type = "number",
  min = 0,
  max = 99,
}: NumberInputProps) {
  const [value, setValue] = useState<string | number>(min);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = e.target.value;

    if (type === "number") {
      const num = parseInt(newValue, 10);
      if (!isNaN(num)) {
        newValue = Math.max(min, Math.min(num, max));
      }
    }

    setValue(newValue);
  };

  return (
    <div className={styles.inputContainer}>
      <label htmlFor="input">{label}</label>
      <input
        id="input"
        type={type}
        value={value}
        onChange={handleChange}
        {...(type === "number" && { min, max })}
      />
    </div>
  );
}
