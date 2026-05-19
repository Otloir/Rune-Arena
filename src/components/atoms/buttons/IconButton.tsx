import type { FC, ReactNode } from "react";
import Button from "./Button";
import type { ButtonProps } from "./Button";

interface IconButtonProps
  extends Omit<ButtonProps, "children" | "shape"> {
  icon: ReactNode;
  label: string;
  shape?: "circle" | "square" | "pill";
  iconSize?: string;
}

const iconSizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "1rem",
  md: "1.375rem",
  lg: "1.75rem",
};

const IconButton: FC<IconButtonProps> = ({
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
  const resolvedIconSize = iconSize ?? iconSizeMap[size];

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