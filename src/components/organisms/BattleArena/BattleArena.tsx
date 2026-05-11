import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";

interface BattleArenaProps {
  playerOne: string;
  playerTwo: string;
}

export default function BattleArena({
  playerOne,
  playerTwo,
}: BattleArenaProps) {
  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>
        <div className={styles.opponent}>
          <StatusPanel userId={playerTwo} currentHp={50} />
          <Creature userId={playerTwo} role="opponent" />
        </div>

        <div className={styles.player}>
          <StatusPanel userId={playerOne} currentHp={100} />
          <Creature userId={playerOne} role="player" />
        </div>
      </div>
    </section>
  );
}
