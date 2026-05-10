import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Creature } from "../../../types/creature.types";
import styles from "./CreatureButton.module.css";

interface CreatureButtonProps {
  creatureId: number;
  onSelect: (creature: Creature) => void;
  selected?: boolean;
  disabled?: boolean;
  shape?: "default" | "pill";
  shadow?: boolean;
}

const CreatureButton: React.FC<CreatureButtonProps> = ({
  creatureId,
  onSelect,
  selected = false,
  disabled = false,
  shape = "default",
  shadow = false,
}) => {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("Creatures")
      .select("id, name, front_img, back_img, evade, speed, defense, hp")
      .eq("id", creatureId)
      .single()
      .then(({ data }) => {
        setCreature(data);
        setLoading(false);
      });
  }, [creatureId]);

  if (loading) return <div className={`${styles.card} ${styles.skeleton}`} />;
  if (!creature) return null;

  return (
    <button
      type="button"
      className={[
        styles.card,
        styles[shape],
        selected ? styles.selected : "",
        shadow ? styles.shadow : "",
      ].join(" ")}
      onClick={() => onSelect(creature)}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected && <div className={styles.selectedBadge}>Selected ✓</div>}

      <img src={creature.front_img} alt={creature.name} className={styles.sprite} />

      <h3 className={styles.name}>{creature.name}</h3>

      <div className={styles.hpRow}>
        <span className={styles.hpLabel}>
          <span className={styles.heartIcon}>♡</span> Health
        </span>
        <span className={styles.hpValue}>{creature.hp}/{creature.hp}</span>
      </div>
      <div className={styles.hpBar}>
        <div className={styles.hpFill} style={{ width: "100%" }} />
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}><span className={styles.statIcon}>🗡️</span> {creature.evade}</span>
        <span className={styles.stat}><span className={styles.statIcon}>🛡️</span> {creature.defense}</span>
        <span className={styles.stat}><span className={styles.statIcon}>⚡</span> {creature.speed}</span>
      </div>
    </button>
  );
};

export default CreatureButton;