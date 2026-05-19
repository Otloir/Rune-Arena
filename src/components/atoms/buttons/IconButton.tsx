import type { FC } from "react";
import Button from "./Button";
import type { ButtonProps } from "./Button";

interface IconButtonProps extends Omit<ButtonProps, "children" | "shape"> {
  /** optional React node icon */
  icon?: string;
  /** optional image source path for an icon */
  iconSrc?: string;
  /** alt text for the image icon (required for accessibility when using iconSrc) */
  iconAlt?: string;
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
  iconSrc,
  iconAlt,
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
        aria-hidden={iconSrc ? "false" : "true"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: resolvedIconSize,
          height: resolvedIconSize,
        }}
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={iconAlt ?? label}
            style={{
              width: resolvedIconSize,
              height: resolvedIconSize,
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          icon
        )}
      </span>
    </Button>
  );
};

export default IconButton;
