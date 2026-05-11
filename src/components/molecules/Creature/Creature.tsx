import { useUserCreature } from "../../../hooks/useCreature";
import styles from "./Creature.module.css";

interface CreatureProps {
  userId: string;
  role?: "player" | "opponent";
}

export default function Creature({ userId, role = "player" }: CreatureProps) {
  const { creature, loading, error } = useUserCreature(userId);

  const platform =
    "https://bkisbeaptfntuhcokvbf.supabase.co/storage/v1/object/sign/images/platform.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MjQ2YzQ1Ny1iNTViLTQ3OTMtYTQ5OS01YjU3YzM3MzFhYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcGxhdGZvcm0ucG5nIiwiaWF0IjoxNzc4NDg4NDU4LCJleHAiOjE4MTAwMjQ0NTh9.1ng5iJ0AIHEkpL8Y6nXlsdETvH0pXNbVfS0i81Kn4eE";

  if (loading) return <section>Loading...</section>;
  if (error || !creature)
    return <section>{error ?? "No creature found"}</section>;

  const imageSpriteBack = creature.back_img;
  const imageSpriteFront = creature.front_img;

  switch (role) {
    case "player":
      return (
        <section className={styles.creatureContainer}>
          <img
            src={imageSpriteBack}
            alt={`${creature.name} back sprite`}
            width="500"
            height="600"
            className={styles.creatureSprite}
          />
          <img
            src={platform}
            alt="Platform"
            width="500"
            height="600"
            className={styles.platform}
          />
        </section>
      );
    case "opponent":
      return (
        <section className={styles.creatureContainer}>
          <img
            src={imageSpriteFront}
            alt={`${creature.name} front sprite`}
            width="500"
            height="600"
            className={styles.creatureSprite}
          />
          <img
            src={platform}
            alt="Platform"
            width="500"
            height="600"
            className={styles.platform}
          />
        </section>
      );
    default:
      return null;
  }
}
