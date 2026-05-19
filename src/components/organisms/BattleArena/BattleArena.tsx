import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import MovesPanel from "../../molecules/MovesPanel/MovesPanel";
import styles from "./BattleArena.module.css";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

interface BattleArenaProps {
  playerOneId: number;
  playerTwoId: number;
  playerOneCreatureId: number;
  playerTwoCreatureId: number;
  mode?: "pve" | "pvp";
}

export default function BattleArena({
  playerOneId,
  playerTwoId,
  playerOneCreatureId,
  playerTwoCreatureId,
  mode = "pve",
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

        {/* Opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwoId}
              creatureId={playerTwoCreatureId}
              currentHp={opponentHp}
              side="opponent"
            />
            <Creature
              userId={playerTwoId}
              creatureId={playerTwoCreatureId}
              role="opponent"
            />
          </div>
        </div>

        {/* Player */}
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <StatusPanel
              userId={playerOneId}
              creatureId={playerOneCreatureId}
              currentHp={playerHp}
              side="player"
            />
            <Creature
              userId={playerOneId}  
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className={styles.controlsWrapper}>
          <PlayerPanel
            creatureId={playerOneCreatureId}
            creatureLevel={playerOneLevel}
            onMoveSelect={handlePlayerMove}
            disabled={turnOwner !== "player" || isProcessing}
            battleLog={battleLog}
            playerCreature={playerOneCreature}
          />
        </div>

        {/* PVP opponent controls */}
        {mode === "pvp" && (
          <div className={styles.opponentControlsContainer}>
            <MovesPanel
              creatureId={playerTwoCreatureId}
              creatureLevel={playerTwoLevel}
              onMoveSelect={handleOpponentMove}
              disabled={turnOwner !== "opponent" || isProcessing}
            />
          </div>
        )}

      </div>
    </section>
  );
}