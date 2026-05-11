/*import styles from "./Button.module.css";

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: string;
  variant?: string;
}

export default function Button({
  label,
  onClick,
  disabled = false,
  type = "button",
  icon,
  variant = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant] || ""}`}
    >
      {icon && <img src={icon} alt="" className={styles.icon} />}
      {label && <span>{label}</span>}
    </button>
  );
}*/

import React from "react";
import styles from "./Button.module.css";

export interface ButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  shape?: "default" | "circle" | "pill";
  shadow?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  radius?: number;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "primary",
  size = "md",
  shape = "default",
  shadow = false,
  className = "",
  type = "button",
  loading = false,
  radius = undefined,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      styles.btn,
      styles[variant],
      styles[size],
      styles[shape],
      shadow ? styles.shadow : "",
      className,
    ].join(" ")}
    style={
      radius !== undefined
        ? { borderRadius: `${radius}px` }
        : undefined
    }
    aria-busy={loading}
  >
    {loading ? <span className={styles.spinner} aria-hidden /> : children}
  </button>
);

export default Button;