import { useCreatureById } from "../../../hooks/useCreature";
import platformImage from "../../../assets/images/platform.png";
import styles from "./Creature.module.css";

interface CreatureProps {
  userId: string | number;
  creatureId: string | number;
  role: "player" | "opponent";
}

export default function Creature({ userId, creatureId, role }: CreatureProps) {
  // Get the specific creature for this user
  const { creature, loading, error } = useCreatureById(userId, creatureId);

  if (loading)
    return <section className={styles.creatureContainer}>Loading...</section>;

  if (error || !creature)
    return (
      <section className={styles.creatureContainer}>
        {error ?? "No creature found"}
      </section>
    );

  // Show front image for opponent, back image for player
  let spriteImage = creature.back_img;
  let spriteDescription = "back";

  if (role === "opponent") {
    spriteImage = creature.front_img;
    spriteDescription = "front";
  }

  const spriteAlt = `${creature.name} ${spriteDescription} sprite`;

  return (
    <section className={styles.creatureContainer}>
      <img
        src={spriteImage}
        alt={spriteAlt}
        width="500"
        height="600"
        className={styles.creatureSprite}
      />
      <img
        src={platformImage}
        alt="Platform"
        width="500"
        height="600"
        className={styles.platform}
      />
    </section>
  );
}
