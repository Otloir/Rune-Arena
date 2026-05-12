import React from "react";
import Button from "./Button";
import type { ButtonProps } from "./Button";

interface IconButtonProps
  extends Omit<ButtonProps, "children" | "shape"> {
  icon: React.ReactNode;
  label: string;
  shape?: "circle" | "square" | "pill";
  iconSize?: string;
}

const iconSizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "1rem",
  md: "1.375rem",
  lg: "1.75rem",
};

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
  iconSize,
  ...nativeProps
}) => {
  // Resolve icon size inside component scope
  const resolvedIconSize = iconSize ?? iconSizeMap[size];

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
          width: resolvedIconSize,
          height: resolvedIconSize,
        }}
      >
        {icon}
      </span>
    </Button>
  );
};

export default IconButton;