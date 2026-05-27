import { forwardRef, type ReactElement } from "react";
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
  sm: "22px",
  md: "44px",
  lg: "1.75rem",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
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
    },
    ref,
  ): ReactElement {
    const resolvedIconSize = iconSize ?? iconSizeMap[size];

    const buttonShape: ButtonProps["shape"] =
      shape === "square" ? "rounded" : shape;

    return (
      <Button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
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
          {iconSrc ? (
            <span
              aria-hidden="true"
              style={{
                width: resolvedIconSize,
                height: resolvedIconSize,
                display: "block",
                backgroundColor: "currentColor",
                WebkitMaskImage: `url(${iconSrc})`,
                maskImage: `url(${iconSrc})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          ) : (
            icon
          )}
        </span>
      </Button>
    );
  },
);

export default IconButton;
