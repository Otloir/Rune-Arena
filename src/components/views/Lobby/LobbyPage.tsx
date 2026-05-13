import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import CreatureButton from "../../atoms/buttons/CreatureButton";
import styles from "./LobbyPage.module.css";

export default function LobbyPage() {
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  const handleCreatureSelect = (creatureId: string) => {
    setSelectedCreatureId(creatureId);
  };

  const handleStartArena = () => {
    if (selectedCreatureId) {
      navigate("/arena", {
        state: { playerOneCreatureId: selectedCreatureId },
      });
    }
  };

  const navigateStore = () => {
    navigate("/store");
  };

  const navigateInventory = () => {
    navigate("/inventory");
  };

  return (
    <section className={styles.lobbyPage}>
      <section>
        <h1>RuneArena</h1>
        <p>Choose your fighter and dominate the arena!</p>
        <nav>
          <Button onClick={navigateStore}> Store </Button>
          <Button onClick={navigateInventory}> Inventory </Button>
        </nav>
      </section>
      <section>
        <section className={styles.creatureSelectButtons}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartArena();
            }}
          >
            <h2>Select Your Creature</h2>
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
            <Button
              onClick={handleStartArena}
              type="submit"
              disabled={!selectedCreatureId}
            >
              Start (1€)
            </Button>
          </form>
        </section>
      </section>
    </section>
  );
}
