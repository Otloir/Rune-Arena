import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import CreatureButton from "../../atoms/buttons/CreatureButton";
import InventoryPage from "../Inventory/InventoryPage";
import TextCarousel from "../TextCarousel/TextCarousel";
import styles from "./LobbyPage.module.css";
import IconButton from "../../atoms/buttons/IconButton";
import informationIcon from "../../../assets/icons/information_icon.svg";

//TODO: make userid not hardcoded.
export default function LobbyPage() {
  const userId = "1";
  const navigate = useNavigate();
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Disable body scroll when inventory or store is open
  useEffect(() => {
    if (!isInventoryOpen && !isInfoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen, isInfoOpen]);

  const handleCreatureSelect = (creatureId: string): void => {
    setSelectedCreatureId(creatureId);
  };

  const handleStartArena = (): void => {
    if (!selectedCreatureId) return;
    navigate("/arena", {
      state: {
        playerOneUserId: userId,
        playerOneCreatureId: selectedCreatureId,
      },
    });
  };

  const navigateStore = (): void => {
    navigate("/store", { state: { userId } });
  };

  const openInventory = () => setIsInventoryOpen(true);
  const closeInventory = () => setIsInventoryOpen(false);
  const openInfo = () => setIsInfoOpen(true);
  const closeInfo = () => setIsInfoOpen(false);

  return (
    <>
      <TextCarousel isOpen={isInfoOpen} onClose={closeInfo} />
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        userId={userId}
      />
      <section className={styles.lobbyPage}>
        <section>
          <div>
            <h1>RuneArena</h1>
            <p>Choose your fighter and dominate the arena!</p>
          </div>
          <IconButton
            hoverEffect={false}
            iconSrc={informationIcon}
            iconAlt="Information"
            onClick={openInfo}
            label="Open information"
            className={styles.iconButton}
          />
          <div className={styles.inventoryShopComtainer}>
            <nav>
              <Button
                onClick={navigateStore}
                aria-label="navigate to shop button"
              >
                Store
              </Button>
            </nav>
            <Button onClick={openInventory} aria-label="open inventory button">
              Bag
            </Button>
          </div>
        </section>

        <section>
          <section className={styles.creatureSelectContainer}>
            <h2>Select Your Creature</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartArena();
              }}
            >
              <div className={styles.creatureSelectButtons}>
                <CreatureButton
                  creatureId="1"
                  onSelect={() => handleCreatureSelect("1")}
                  selected={selectedCreatureId === "1"}
                />
                <CreatureButton
                  creatureId="2"
                  onSelect={() => handleCreatureSelect("2")}
                  selected={selectedCreatureId === "2"}
                />
                <CreatureButton
                  creatureId="3"
                  onSelect={() => handleCreatureSelect("3")}
                  selected={selectedCreatureId === "3"}
                />
              </div>
              <Button
                className={styles.startButton}
                type="submit"
                disabled={!selectedCreatureId}
              >
                Start
              </Button>
            </form>
          </section>
        </section>
      </section>
    </>
  );
}
