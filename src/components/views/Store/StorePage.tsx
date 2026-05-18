import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import ItemList from "../../molecules/itemList/ItemList";
import InventoryPage from "../Inventory/InventoryPage";
import TextCarousel from "../turtorial/textCarousel";
import styles from "./StorePage.module.css";

export default function StorePage() {
  // All hooks at the top
  const navigate = useNavigate();
  const location = useLocation();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Read userId passed from LobbyPage via navigation state
  const userId: number | undefined = location.state?.userId;

  // Disable body scroll when inventory is open
  useEffect(() => {
    if (!isInventoryOpen && !isInfoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen, isInfoOpen]);

  // Redirect to lobby if userId is missing (e.g. navigated here directly)
  if (!userId) {
    navigate("/");
    return null;
  }

  const navigateLobby = () => navigate("/");
  const openInventory = () => setIsInventoryOpen(true);
  const closeInventory = () => setIsInventoryOpen(false);
  const openInfo = () => setIsInfoOpen(true);
  const closeInfo = () => setIsInfoOpen(false);

  return (
    <>
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        userId={userId}
      />
      <TextCarousel isOpen={isInfoOpen} onClose={closeInfo} />
      <nav>
        <Button onClick={openInfo}>Info</Button>
      </nav>
      <section id="top" className={styles.storePage}>
        <div className={styles.userShopInfo}>
          <h1>Marketplace</h1>
          <div>
            {/* TODO: make dynamic based on the user's actual balance */}
            <div className={styles.userMoneyDisplay}>
              <span>X€</span>
            </div>
            <Button
              onClick={openInventory}
              backgroundColor="#DBEAFE"
              textColor="black"
              size="sm"
            >
              Bag
            </Button>
          </div>
        </div>

        <Button onClick={navigateLobby}>Back to select</Button>
        <ItemList type="store" variant="card" userId={userId} />
        <Button
          onClick={() =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Back to top
        </Button>
      </section>
    </>
  );
}
