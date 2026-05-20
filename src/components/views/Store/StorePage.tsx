import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import ItemList from "../../molecules/itemList/ItemList";
import InventoryPage from "../Inventory/InventoryPage";
import TextCarousel from "../TextCarousel/TextCarousel";
import styles from "./StorePage.module.css";
import IconButton from "../../atoms/buttons/IconButton";
import informationIcon from "../../../assets/icons/information_icon.svg";
import bagIcon from "../../../assets/icons/bag_icon.svg";
import arrowUp from "../../../assets/icons/arrow_up_icon.svg";

export default function StorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Read userId passed from LobbyPage via navigation state
  const userId: string | undefined = location.state?.userId;

  // Disable body scroll when inventory or store is open
  useEffect(() => {
    if (!isInventoryOpen && !isInfoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen, isInfoOpen]);

  if (userId == null) {
    return <Navigate to="/" replace />;
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
      <section id="top" className={styles.storePage}>
        <div className={styles.fixedInformationBar}>
          {/* TODO: make dynamic based on the user's actual balance */}
          <div className={styles.userMoneyDisplay}>
            <span>X€</span>
          </div>
          <Button
            onClick={openInventory}
            backgroundColor="#DCB8A0"
            textColor="#955D38"
            size="sm"
            className={styles.noShadow}
          >
            <span className={styles.buttonLabel}>
              <span
                className={styles.buttonIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${bagIcon})`,
                  maskImage: `url(${bagIcon})`,
                }}
              />
              <span>Bag</span>
            </span>
          </Button>
          <IconButton
            hoverEffect={false}
            iconSrc={informationIcon}
            iconAlt="Information"
            onClick={openInfo}
            label="Open information"
            className={styles.iconButton}
          />
        </div>
        <div className={styles.userShopInfo}>
          <h1>Marketplace</h1>
        </div>

        <Button onClick={navigateLobby} className={styles.backButton}>
          Back to select
        </Button>
        <ItemList type="store" variant="card" userId={userId} />
        <Button
          onClick={() =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className={styles.backButton}
        >
          <span className={styles.buttonLabel}>
            <span
              className={styles.buttonIcon}
              aria-hidden="true"
              style={{
                WebkitMaskImage: `url(${arrowUp})`,
                maskImage: `url(${arrowUp})`,
              }}
            />
            <span>Back to top</span>
          </span>
        </Button>
      </section>
    </>
  );
}
