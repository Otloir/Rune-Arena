import { useState } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Help text displayed below the input (WCAG 2.1 SC 3.3.5) */
  helpText?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Whether field is required */
  required?: boolean;
}

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  name,
  min,
  max,
  helpText,
  error,
  required,
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
      {label && (
        <label htmlFor={name || "input"}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={name || "input"}
          name={name}
          type={type}
          value={currentValue}
          onChange={handleChange}
          min={isNumber ? min : undefined}
          max={isNumber ? max : undefined}
          className={`${isNumber ? styles.number : ""} ${error ? styles.error : ""}`}
          aria-describedby={helpText || error ? `${name}-help` : undefined}
          aria-required={required}
          aria-invalid={!!error}
          {...rest}
        />
      </div>
      {(helpText || error) && (
        <div
          id={`${name}-help`}
          className={error ? styles.errorMessage : styles.helpText}
          role={error ? "alert" : "region"}
          aria-live="polite"
        >
          {error || helpText}
        </div>
      )}
    </div>
  );
}
