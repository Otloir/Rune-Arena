import { useCreatureById, useCreatureBase } from "../../../hooks/useCreature";
import platformImage from "../../../assets/images/platform.svg";
import styles from "./Creature.module.css";

interface CreatureProps {
  readonly userId: string | number;
  readonly creatureId: string | number;
  readonly side: "player" | "opponent";
  readonly isAttacking?: boolean;
  readonly isHit?: boolean;
}

export default function Creature({
  userId,
  creatureId,
  side,
  isAttacking = false,
  isHit = false,
}: CreatureProps): React.ReactElement {
  const playerResult = useCreatureById(userId, creatureId);
  const opponentResult = useCreatureBase(creatureId);
  const { creature, loading, error } =
    side === "opponent" ? opponentResult : playerResult;

  if (loading)
    return <div className={styles.creatureContainer}>Loading...</div>;

  if (error || !creature)
    return (
      <div className={styles.creatureContainer}>
        {error ?? "No creature found"}
      </div>
    );

  // Show front image for opponent, back image for player
  let spriteImage = creature.back_img;
  let spriteDescription = "back";

  if (side === "opponent") {
    spriteImage = creature.front_img;
    spriteDescription = "front";
  }

  const spriteAlt = `${creature.name} ${spriteDescription} sprite`;

  return (
    <div className={styles.creatureContainer}>
      <div className={styles.creatureStack}>
        <img
          src={spriteImage}
          alt={spriteAlt}
          width="500"
          height="600"
          className={`${styles.creatureSprite} ${isAttacking ? (side === "player" ? styles.player : styles.opponent) : ""} ${isHit ? styles.shake : ""}`}
        />

        <img
          src={platformImage}
          alt=""
          aria-hidden="true"
          width="500"
          height="600"
          className={styles.platform}
        />
      </div>
    </div>
  );
}
