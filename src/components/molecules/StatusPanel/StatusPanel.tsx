import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useCreatureById, useCreatureBase } from "../../../hooks/useCreature";


interface StatusPanelProps {
  readonly userId: string | number;
  readonly creatureId: string | number;
  readonly currentHp?: number;
  readonly side: "player" | "opponent";
  /**
   * Overrides the fetched level number — used for the opponent whose
   * level is randomized in BattleArena rather than stored in the DB.
   */
  readonly overrideLevel?: number;
}


export default function StatusPanel({
  userId,
  creatureId,
  currentHp,
  side,
  overrideLevel,
}: StatusPanelProps): React.ReactElement {
  
  const playerResult = useCreatureById(userId, creatureId);
  const opponentResult = useCreatureBase(creatureId);

  // Rules of Hooks: both hooks always called, pick after
  const isOpponent = side === "opponent";
  const creature = isOpponent ? opponentResult.creature : playerResult.creature;
  const loading = isOpponent ? opponentResult.loading : playerResult.loading;
  const error = isOpponent ? opponentResult.error : playerResult.error;
  // Opponent level comes from BattleArena's randomizedOpponentLevel — not
  // available here. Show a dash rather than a wrong number.
  const level = isOpponent ? null : playerResult.level;
  const currentXp = isOpponent ? 0 : playerResult.currentXp;
  const xpRequired = isOpponent ? 1 : playerResult.xpRequired;
  const displayLevel = overrideLevel ?? (isOpponent ? null : level);

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
        <span>{displayLevel !== null ? `Lv. ${displayLevel}` : ""}</span>
      </div>

      <Bars current={currentXp} max={xpRequired} variant="xp" aria="xp bar" />
      <Bars current={displayHp} max={creature.hp} variant="hp" aria="hp bar" />
    </section>
  );
}