import type { ButtonHTMLAttributes, CSSProperties, FC, ReactNode } from "react";
import styles from "./Button.module.css";

/*
Button options:
- variant: visual style of the button.
  - action: primary green.
  - neutral: default button.
  - destructive: red button.
  - outline: bordered button with transparent fill.
  - invisible: button with no background or shadow.
- size: controls the button's scale and padding.
- shape: controls the button's outline shape.
  - rounded: standard rounded corners.
  - circle: equal width and height.
  - pill: fully pill-shaped corners.
- shadow: adds the raised shadow style.
- textColor: overrides the text color.
- backgroundColor: overrides the background color for custom-colored buttons.
- className: adds extra CSS classes.
- type: button behavior inside forms.
  - button: normal button.
  - submit: submits a form.
  - reset: resets a form.
- loading: shows the spinner and disables interaction.
- radius: custom border radius in pixels.
*/

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "disabled" | "type" | "children"
>;

export interface ButtonProps extends NativeButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  variant?: "action" | "neutral" | "invisible";
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle" | "pill";
  shadow?: boolean;
  textColor?: string;
  backgroundColor?: `#${string}`;
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  radius?: number;
}

function darkenHex(hex: string, amount = 40): string {
  const match = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const Button: FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "action",
  size = "md",
  shape = "rounded",
  shadow = false,
  textColor,
  backgroundColor,
  className = "",
  type = "button",
  loading = false,
  radius,
  style,
  ...nativeProps
}) => {
  const isValidBackgroundColor =
    !backgroundColor || /^#[0-9a-fA-F]{6}$/.test(backgroundColor);

  if (backgroundColor && !isValidBackgroundColor) {
    console.warn(
      `Button: invalid color "${backgroundColor}" — must be a 6-digit hex e.g. #ff0000`,
    );
  }

  const useCustomColor = Boolean(backgroundColor && isValidBackgroundColor);

  const customStyle: CSSProperties | undefined = useCustomColor
    ? ({
        "--btn-custom-bg": backgroundColor!,
        "--btn-custom-border": darkenHex(backgroundColor!),
      } as React.CSSProperties)
    : undefined;

  const textStyle: CSSProperties | undefined = textColor
    ? ({
        "--btn-custom-text": textColor,
      } as React.CSSProperties)
    : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        useCustomColor ? styles.customColor : styles[variant],
        styles[size],
        styles[shape],
        shadow ? styles.withShadow : "",
        className,
      ].join(" ")}
      style={{
        ...(radius !== undefined ? { borderRadius: `${radius}px` } : {}),
        ...(textColor ? { color: textColor } : {}),
        ...customStyle,
        ...textStyle,
        ...style,
      }}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...nativeProps}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" role="status" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
