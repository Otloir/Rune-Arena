import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useCreatureById } from "../../../hooks/useCreature";

interface StatusPanelProps {
  userId: string | number;
  creatureId: string | number;
  currentHp?: number;
  side: "player" | "opponent";
}

export default function StatusPanel({
  userId,
  creatureId,
  currentHp,
  side,
}: StatusPanelProps) {
  const { creature, level, currentXp, xpRequired, loading, error } =
    useCreatureById(userId, creatureId);

  if (loading)
    return <section className={styles.statusBarContainer}>Loading...</section>;

  if (error || !creature)
    return (
      <section className={styles.statusBarContainer}>
        {error ?? "No creature found"}
      </section>
    );

  const displayHp = Math.min(
    Math.max(0, currentHp ?? creature.hp),
    creature.hp,
  );

  return (
    <section
      className={styles.statusBarContainer}
      aria-label={`${side === "player" ? "Player creature status" : "Opponent creature status"}`}
    >
      <div className={styles.statusBarInfo}>
        <span>{creature.name}</span>
        <span>Lv. {level}</span>
      </div>

      <Bars current={currentXp} max={xpRequired} variant="xp" aria="xp bar" />
      <Bars current={displayHp} max={creature.hp} variant="hp" aria="hp bar" />
    </section>
  );
}