import React from "react";
import styles from "./Button.module.css";

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled" | "type" | "children"
>;

export interface ButtonProps extends NativeButtonProps {
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
  radius,
  style,
  ...nativeProps
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
    style={{
      ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
      ...style,
    }}
    aria-busy={loading}
    {...nativeProps}
  >
    {loading ? <span className={styles.spinner} aria-hidden /> : children}
  </button>
);

export default Button;