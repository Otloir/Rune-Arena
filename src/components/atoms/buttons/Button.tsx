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
  variant?: "action" | "neutral" | "destructive" | "outline" | "invisible";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle" | "pill";
  shadow?: boolean;
  color?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  radius?: number;
}

function darkenHex(hex: string, amount = 40): string {
  const cleanHex = hex.replace("#", "");
  const n = parseInt(cleanHex, 16);

  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);

  return `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "action",
  size = "md",
  shape = "rounded",
  shadow = false,
  color,
  className = "",
  type = "button",
  loading = false,
  radius,
  style,
  ...nativeProps
}) => {
  const customStyle: React.CSSProperties | undefined = color
    ? ({
        "--btn-custom-bg": color,
        "--btn-custom-border": darkenHex(color),
      } as React.CSSProperties)
    : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        color ? styles.customColor : styles[variant],
        styles[size],
        styles[shape],
        shadow ? styles.withShadow : "",
        className,
      ].join(" ")}
      style={{
        ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
        ...customStyle,
        ...style,
      }}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...nativeProps}
    >
      {loading ? (
        <span
          className={styles.spinner}
          aria-hidden="true"
          role="status"
        />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;