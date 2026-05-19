import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import MovesPanel from "../../molecules/MovesPanel/MovesPanel";
import styles from "./BattleArena.module.css";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";

interface BattleArenaProps {
  playerOne: string | number;
  playerTwo: string | number;
  playerOneCreatureId: string | number;
  playerTwoCreatureId: string | number;
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