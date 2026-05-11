import { useUserCreature } from "../../../hooks/useCreature";
import styles from "./Creature.module.css";

interface CreatureProps {
  userId: string;
  role?: "player" | "opponent";
}

export default function Creature({ userId, role = "player" }: CreatureProps) {
  const { creature, loading, error } = useUserCreature(userId);

  // Platform image is now stored in public folder for stable, client-side access
  const platformImage = "src/assets/images/platform.png";

  if (loading)
    return <section className={styles.creatureContainer}>Loading...</section>;
  if (error || !creature)
    return (
      <section className={styles.creatureContainer}>
        {error ?? "No creature found"}
      </section>
    );

  const imageSpriteBack = creature.back_img;
  const imageSpriteFront = creature.front_img;

  let spriteSrc: string;
  let spriteAlt: string;

  switch (role) {
    case "player":
      spriteSrc = imageSpriteBack;
      spriteAlt = `${creature.name} back sprite`;
      break;
    case "opponent":
      spriteSrc = imageSpriteFront;
      spriteAlt = `${creature.name} front sprite`;
      break;
  }
  return (
    <section className={styles.creatureContainer}>
      <img
        src={spriteSrc}
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
    