import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";

interface BattleArenaProps {
  playerOne?: string;
  playerTwo?: string;
}

export default function BattleArena({
  playerOne = "1",
  playerTwo = "2",
}: BattleArenaProps) {
  return (
    <>
      <section>
        <StatusPanel userId={playerTwo} currentHp={50} />
        <Creature userId={playerTwo} role="opponent" />
      </section>

      <section>
        <StatusPanel userId={playerOne} currentHp={100} />
        <Creature userId={playerOne} role="player" />
      </section>
    </>
  );
}
