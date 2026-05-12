import React from "react";
import Button from "./Button";
import type { ButtonProps } from "./Button";

const iconSizeMap: Record<"sm" | "md" | "lg", number> = {
  sm: 16,
  md: 22,
  lg: 28,
};

interface IconButtonProps
  extends Omit<ButtonProps, "children" | "shape"> {
  icon: React.ReactNode;
  label: string;
  shape?: "circle" | "square" | "pill";
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  label,
  disabled = false,
  color,
  size = "md",
  shape = "circle",
  variant = "neutral",
  shadow = false,
  className = "",
  radius,
  ...nativeProps
}) => {
  // Convert IconButton shape to Button-compatible shape
  const buttonShape: ButtonProps["shape"] =
    shape === "square" ? "rounded" : shape;

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-disabled={disabled}
      color={color}
      size={size}
      shape={buttonShape}
      variant={variant}
      shadow={shadow}
      className={className}
      radius={radius}
      {...nativeProps}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${iconSizeMap[size]}px`,
          height: `${iconSizeMap[size]}px`,
        }}
      >
        {icon}
      </span>
    </Button>
  );
};

export default IconButton;