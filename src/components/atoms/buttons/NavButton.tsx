import { useNavigate } from "react-router-dom";
import Button from "./Button";
import type { ButtonProps } from "./Button";

type NavTarget = "menu" | "start" | "external";

interface NavButtonProps extends Omit<ButtonProps, "onClick"> {
  to: NavTarget;
  externalUrl?: string;     // required when to="external"
}

const destinations: Record<Exclude<NavTarget, "external">, string> = {
  menu:  "/arena",
  start: "/arena/creature-select",
};

const labels: Record<NavTarget, string> = {
  menu:     "← Main Menu",
  start:    "Start Game",
  external: "← Back to Site",
};

const NavButton: React.FC<NavButtonProps> = ({ to, externalUrl, children, ...rest }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === "external" && externalUrl) {
      window.location.href = externalUrl;
    } else if (to !== "external") {
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