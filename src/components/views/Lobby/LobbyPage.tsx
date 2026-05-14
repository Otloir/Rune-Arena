import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import CreatureButton from "../../atoms/buttons/CreatureButton";
import InventoryPage from "../Inventory/InventoryPage";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
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

  const handleCreatureSelect = (creatureId: string) => {
    setSelectedCreatureId(creatureId);
  };

  const handleStartArena = () => {
    if (selectedCreatureId) {
      navigate("/arena", {
        state: {
          playerOneUserId: userId,
          playerOneCreatureId: selectedCreatureId,
        },
      });
    }
  };

  const navigateStore = () => {
    navigate("/store");
  };

  const openInventory = () => {
    setIsInventoryOpen(true);
  };

  const closeInventory = () => {
    setIsInventoryOpen(false);
  };

  //TODO: make userid be dynamic and not hardcoded
  const userId = 1;

  return (
    <>
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        userId={userId}
      />
      <section className={styles.lobbyPage}>
        <section>
          <nav>
            <Button> Back to Tivoli </Button>
            <Button> Info </Button>
          </nav>
          <div>
            <h1>RuneArena</h1>
            <p>Choose your fighter and dominate the arena!</p>
          </div>
          <nav>
            <Button onClick={navigateStore}> Store </Button>
            <Button onClick={openInventory}> Inventory </Button>
          </nav>
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
              <Button type="submit" disabled={!selectedCreatureId}>
                Start (1€)
              </Button>
            </form>
          </section>
        </section>
      </section>
    </>
  );
}
