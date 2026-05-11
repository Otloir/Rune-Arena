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

type NavButtonProps = Omit<ButtonProps, "onClick"> & NavTarget;

const destinations: Record<"menu" | "start", string> = {
  menu:  "/arena",
  start: "/arena/creature-select",
};

const labels: Record<"menu" | "start" | "external", string> = {
  menu:     "← Main Menu",
  start:    "Start Game",
  external: "← Back to Site",
};

const NavButton: React.FC<NavButtonProps> = ({ to, externalUrl, children, ...rest }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === "external") {
      window.location.href = externalUrl;
    } else {
      navigate(destinations[to]);
    }
  };

  return (
    <Button onClick={handleClick} {...rest}>
      {children ?? labels[to]}
    </Button>
  );
};

export default NavButton;