import Button from "../../atoms/buttons/Button";
import ItemList from "../../molecules/itemList/ItemList";
import { useNavigate, useLocation } from "react-router-dom";

export default function StorePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read userId passed from LobbyPage via navigation state
  const userId = location.state?.userId;

  const navigateLobby = () => {
    navigate("/");
  };

  return (
    <>
      <h1>Item Shop</h1>
      <ItemList type="store" variant="card" userId={userId} />
      <Button onClick={navigateLobby}> Back to select </Button>
    </>
  );
}
