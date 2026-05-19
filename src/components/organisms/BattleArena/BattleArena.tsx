import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

interface BattleArenaProps {
  playerOne: string | number;
  playerTwo: string | number;
  playerOneCreatureId: string | number;
  playerTwoCreatureId: string | number;
}

export default function BattleArena({
  playerOne,
  playerTwo,
  playerOneCreatureId,
  playerTwoCreatureId,
}: BattleArenaProps) {
  const { creature: playerOneCreature, level: playerOneLevel } =
    useCreatureById(playerOneId, playerOneCreatureId);

  const { creature: playerTwoCreature, level: playerTwoLevel } =
    useCreatureById(playerTwoId, playerTwoCreatureId);

  const {
    playerHp,
    opponentHp,
    turnOwner,
    isProcessing,
    battleLog,
    handlePlayerMove,
    handleOpponentMove,
  } = useBattle({
    playerCreature: playerOneCreature,
    opponentCreature: playerTwoCreature,
    opponentCreatureId: playerTwoCreatureId,
    opponentLevel: playerTwoLevel,
    mode,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!playerOneCreature || !playerTwoCreature) return;

    if (playerHp <= 0 || opponentHp <= 0) {
      const winner: "player" | "opponent" =
        opponentHp <= 0 ? "player" : "opponent";

      const timer = setTimeout(() => {
        navigate("/result", {
          replace: true,
          state: {
            winner,
            playerCreatureName: playerOneCreature.name,
            opponentCreatureName: playerTwoCreature.name,
          },
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [
    playerHp,
    opponentHp,
    playerOneCreature,
    playerTwoCreature,
    navigate,
  ]);

  if (!playerOneCreature || !playerTwoCreature) {
    return (
      <section className={styles.arena}>
        <div className={styles.loadingState} role="status" aria-live="polite" aria-label="Loading battle...">Loading battle...</div>
      </section>
    );
  }

  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>
        {/* opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              currentHp={50}
              side="opponent"
            />
            <Creature
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              role="opponent"
            />
          </div>
        </div>

        {/* player/user */}
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <StatusPanel
              userId={playerOne}
              creatureId={playerOneCreatureId}
              side="player"
              currentHp={100}
            />
            <Creature
              userId={playerOne}
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
