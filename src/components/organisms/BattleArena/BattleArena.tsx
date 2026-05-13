import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import MovesPanel from "../../molecules/MovesPanel/MovesPanel";
import styles from "./BattleArena.module.css";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";

interface BattleArenaProps {
  playerOne: number;
  playerTwo: number;
  playerOneCreatureId: number;
  playerTwoCreatureId: number;
  mode?: "pve" | "pvp";
}

export default function BattleArena({
  playerOne,
  playerTwo,
  playerOneCreatureId,
  playerTwoCreatureId,
  mode = "pve",
}: BattleArenaProps) {
  const { creature: playerOneCreature, level: playerOneLevel } =
    useCreatureById(playerOne, playerOneCreatureId);

  const { creature: playerTwoCreature, level: playerTwoLevel } =
    useCreatureById(playerTwo, playerTwoCreatureId);

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
    mode,
  });

  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>

        {/* Opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              currentHp={opponentHp}
            />
            <Creature
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              role="opponent"
            />
          </div>
        </div>

        {/* Player */}
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <StatusPanel
              userId={playerOne}
              creatureId={playerOneCreatureId}
              currentHp={playerHp}
            />
            <Creature
              userId={playerOne}
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>

        {/* Battle log */}
        <div className={styles.battleLog} aria-live="polite">
          {battleLog.map((entry, i) => (
            <p key={i}>{entry}</p>
          ))}
        </div>

        {/* Player controls */}
        <div className={styles.controlsContainer}>
          <MovesPanel
            creatureId={playerOneCreatureId}
            creatureLevel={playerOneLevel}
            onMoveSelect={handlePlayerMove}
            disabled={turnOwner !== "player" || isProcessing}
          />
        </div>

        {/* PVP opponent controls — hidden in PVE, ready for PVP */}
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