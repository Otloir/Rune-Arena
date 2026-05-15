import Button from "../../atoms/buttons/Button";
import { useState, useEffect } from "react";
import ItemList from "../../molecules/itemList/ItemList";
import { useNavigate, useLocation } from "react-router-dom";
import InventoryPage from "../Inventory/InventoryPage";
import styles from "./StorePage.module.css";

export default function StorePage() {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const navigate = useNavigate();

  // Disable body scroll when inventory is open
  useEffect(() => {
    if (!isInventoryOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen]);
  const location = useLocation();

  // Read userId passed from LobbyPage via navigation state
  const userId = location.state?.userId;

  const navigateLobby = () => {
    navigate("/");
  };

  const openInventory = () => {
    setIsInventoryOpen(true);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
  };

  return (
    <>
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        userId={userId}
      />
      <section id="top" className={styles.storePage}>
        <div className={styles.userShopInfo}>
          <h1>Marketplace</h1>
          <div>
            {/* TODO: hardcoded, make dynamic and be based on the users money */}
            <div className={styles.userMoneyDisplay}>
              <span>X€</span>
            </div>
            <Button
              onClick={openInventory}
              backgroundColor={"#DBEAFE"}
              textColor="black"
              size="sm"
            >
              Bag
            </Button>
          </div>
        </div>
        <Button onClick={navigateLobby}> Back to select </Button>
        <ItemList type="store" variant="card" userId={userId} />
        <Button
          onClick={() =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          {" "}
          Back to top{" "}
        </Button>
      </section>
    </>
  );
}
