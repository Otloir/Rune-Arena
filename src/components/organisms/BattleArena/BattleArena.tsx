import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";

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
