import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useUserCreature } from "../../../hooks/useCreature";

interface StatusPanelProps {
  userId: string;
  currentHp?: number;
}

export default function StatusPanel({ userId, currentHp }: StatusPanelProps) {
  const { creature, level, currentXp, xpRequired, loading, error } =
    useUserCreature(userId);

  if (loading)
    return <section className={styles.statusBarContainer}>Loading...</section>;
  if (error || !creature)
    return (
      <section className={styles.statusBarContainer}>
        {error ?? "No creature found"}
      </section>
    );

  // DisplayHp so it never exceeds max or goes below 0
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
