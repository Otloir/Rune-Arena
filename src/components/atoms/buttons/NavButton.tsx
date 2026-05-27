import type { ReactElement, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import type { ButtonProps } from "./Button";

type InternalNav = {
  to: "menu" | "start";
  externalUrl?: never;
};

type ExternalNav = {
  to: "external";
  externalUrl: string;
};

type NavTarget = InternalNav | ExternalNav;

type NavButtonProps = Omit<ButtonProps, "onClick"> &
  NavTarget & {
    icon?: ReactNode;
    label?: string;
  };

const destinations: Record<"menu" | "start", string> = {
  menu: "/arena",
  start: "/arena/creature-select",
};

const defaultLabels: Record<"menu" | "start" | "external", string> = {
  menu: "Main Menu",
  start: "Start Game",
  external: "Back to Site",
};

function NavButton({
  to,
  externalUrl,
  children,
  icon,
  label,
  ...rest
}: NavButtonProps): ReactElement {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === "external") {
      window.location.href = externalUrl;
    } else {
      navigate(destinations[to]);
    }
  };

  const displayText = children ?? label ?? defaultLabels[to];

  return (
    <Button onClick={handleClick} {...rest}>
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        {icon && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        )}
        <span>{displayText}</span>
      </span>
    </Button>
  );
}

export default NavButton;
