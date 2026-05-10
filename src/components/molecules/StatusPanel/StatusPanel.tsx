import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useUserCreature } from "../../../hooks/useCreature";

interface StatusPanelProps {
  user: string;
  currentHp?: number; // Current HP — pass undefined to default to max HP
}

export default function StatusPanel({ user, currentHp }: StatusPanelProps) {
  const { creature, level, currentXp, xpRequired, loading, error } = useUserCreature(user);

  if (loading) return <section className={styles.statusBarContainer}>Loading...</section>;
  if (error || !creature) return <section className={styles.statusBarContainer}>{error ?? "No creature found"}</section>;

  // If no currentHp is passed, default to full HP
  const displayHp = Math.max(0, currentHp ?? creature.hp);

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