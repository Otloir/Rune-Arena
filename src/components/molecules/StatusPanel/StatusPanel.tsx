import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useCreatureById } from "../../../hooks/useCreature";

interface StatusPanelProps {
  userId: number;
  creatureId: number;
  currentHp?: number;
}

export default function StatusPanel({
  userId,
  creatureId,
  currentHp,
}: StatusPanelProps) {
  // Get the specific creature for this user
  const { creature, level, currentXp, xpRequired, loading, error } =
    useCreatureById(userId, creatureId);

  // Show loading state
  if (loading)
    return <section className={styles.statusBarContainer}>Loading...</section>;

  // Show error if something went wrong
  if (error || !creature)
    return (
      <section className={styles.statusBarContainer}>
        {error ?? "No creature found"}
      </section>
    );

  // Make sure HP doesn't go below 0 or above max HP
  const displayHp = Math.min(
    Math.max(0, currentHp ?? creature.hp),
    creature.hp,
  );

  return (
    <section className={styles.statusBarContainer}>
      <div className={styles.statusBarInfo}>
        <span>{creature.name}</span>
        <span>Lv. {level}</span>
      </div>

      <Bars current={currentXp} max={xpRequired} variant="xp" aria="xp bar" />
      <Bars current={displayHp} max={creature.hp} variant="hp" aria="hp bar" />
    </section>
  );
}
