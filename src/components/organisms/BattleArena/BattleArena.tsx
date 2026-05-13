import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import BattleControls from "../../molecules/BattleControls/BattleControls";
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

        {/* Bottom controls panel */}
        <div className={styles.controlsWrapper}>
          <BattleControls
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