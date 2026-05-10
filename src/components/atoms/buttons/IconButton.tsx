import React from "react";
import styles from "./IconButton.module.css";

interface IconButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square" | "pill";
  variant?: "default" | "ghost";
  shadow?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  label,
  disabled = false,
  size = "md",
  shape = "circle",
  variant = "default",
  shadow = false,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={[
      styles.iconBtn,
      styles[size],
      styles[shape],
      styles[variant],
      shadow ? styles.shadow : "",
      className,
    ].join(" ")}
  >
    {icon}
  </button>
);

export default IconButton;