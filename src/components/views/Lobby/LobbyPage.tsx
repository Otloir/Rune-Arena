import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import CreatureButton from "../../atoms/buttons/CreatureButton";
import InventoryPage from "../Inventory/InventoryPage";
import styles from "./LobbyPage.module.css";

//TODO: make userid not hardcoded.
export default function LobbyPage() {
  const userId = "1";
  const navigate = useNavigate();
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    if (!isInventoryOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen]);

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

  return (
    <>
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        userId={userId}
      />
      <section className={styles.lobbyPage}>
        <section>
          <nav>
            <Button>Info</Button>
          </nav>
          <div>
            <h1>RuneArena</h1>
            <p>Choose your fighter and dominate the arena!</p>
          </div>
          <nav>
            <Button onClick={navigateStore}>Store</Button>
            <Button onClick={() => setIsInventoryOpen(true)}>Bag</Button>
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
                Start
              </Button>
            </form>
          </section>
        </section>
      </section>
    </>
  );
}
