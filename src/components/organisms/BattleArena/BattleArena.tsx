import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import MovesPanel from "../../molecules/MovesPanel/MovesPanel";
import styles from "./BattleArena.module.css";
import type { MoveWithType } from "../../../types/move.types";
import { useCreatureById } from "../../../hooks/useCreature";

interface BattleArenaProps {
  playerOne: number;
  playerTwo: number;
  playerOneCreatureId: number;
  playerTwoCreatureId: number;
}

export default function BattleArena({
  playerOne,
  playerTwo,
  playerOneCreatureId,
  playerTwoCreatureId,
}: BattleArenaProps) {
  const {
    level: playerOneLevel,
  } = useCreatureById(playerOne, playerOneCreatureId);

  const handleMoveSelect = (move: MoveWithType) => {
    console.log("Player selected move:", move);
    // TODO: battle logic here
  };

  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>
        {/* Opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              currentHp={50}
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
              currentHp={100}
            />
            <Creature
              userId={playerOne}
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controlsContainer}>
          <MovesPanel
            creatureId={playerOneCreatureId}
            creatureLevel={playerOneLevel}
            onMoveSelect={handleMoveSelect}
          />
        </div>
      </div>
    </section>
  );
}