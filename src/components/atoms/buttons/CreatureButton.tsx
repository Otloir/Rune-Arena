import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Creature } from "../../../types/creature.types";
import styles from "./CreatureButton.module.css";

interface CreatureButtonProps {
  creatureId: Creature["id"];
  onSelect: (creature: Creature) => void;
  selected?: boolean;
  disabled?: boolean;
  shape?: "rounded" | "pill";
  shadow?: boolean;
}

const CreatureButton: React.FC<CreatureButtonProps> = ({
  creatureId,
  onSelect,
  selected = false,
  disabled = false,
  shape = "rounded",
  shadow = false,
}) => {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchCreature = async () => {
      setLoading(true);
      setError(null);
      setCreature(null);
      try {
        const { data, error } = await supabase
          .from("Creatures")
          .select("id, name, front_img, back_img, evade, speed, defense, hp")
          .eq("id", creatureId)
          .single();
        if (error) throw error;
        if (!data) throw new Error("Creature not found.");
        if (!isCancelled) setCreature(data);
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err.message : "Failed to load creature.");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchCreature();
    return () => { isCancelled = true; };
  }, [creatureId]);

  if (loading) return (
    <button
      type="button"
      className={[styles.card, styles[shape], styles.skeleton, shadow ? styles.withShadow : ""].join(" ")}
      disabled
      aria-busy="true"
      aria-label="Loading creature"
    />
  );

  if (error) return (
    <button
      type="button"
      className={[styles.card, styles[shape], shadow ? styles.withShadow : ""].join(" ")}
      disabled
      aria-label={error}
    >
      {error}
    </button>
  );

  if (!creature) return (
    <button
      type="button"
      className={[styles.card, styles[shape], shadow ? styles.withShadow : ""].join(" ")}
      disabled
      aria-label="Creature unavailable"
    >
      Creature unavailable.
    </button>
  );

  return (
    <button
      type="button"
      className={[
        styles.card,
        styles[shape],
        selected ? styles.selected : "",
        shadow ? styles.withShadow : "",
      ].join(" ")}
      onClick={() => onSelect(creature)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? "Selected: " : "Select "}${creature.name}, HP ${creature.hp}, Attack ${creature.evade}, Defense ${creature.defense}, Speed ${creature.speed}`}
    >
      {selected && <div className={styles.selectedBadge} aria-hidden="true">Selected ✓</div>}
      <img src={creature.front_img} alt={creature.name} className={styles.sprite} />
      <h3 className={styles.name}>{creature.name}</h3>
      <div className={styles.hpRow}>
        <span className={styles.hpLabel}>
          <span className={styles.heartIcon} aria-hidden="true">♡</span> Health
        </span>
        <span className={styles.hpValue} aria-label={`${creature.hp} of ${creature.hp} HP`}>
          {creature.hp}/{creature.hp}
        </span>
      </div>
      <div
        className={styles.hpBar}
        role="progressbar"
        aria-valuenow={creature.hp}
        aria-valuemin={0}
        aria-valuemax={creature.hp}
        aria-label="HP bar"
      >
        <div className={styles.hpFill} style={{ width: "100%" }} />
      </div>
      <div className={styles.stats} aria-label="Creature stats">
        <span className={styles.stat} aria-label={`Attack: ${creature.evade}`}>
          <span className={styles.statIcon} aria-hidden="true">🗡️</span> {creature.evade}
        </span>
        <span className={styles.stat} aria-label={`Defense: ${creature.defense}`}>
          <span className={styles.statIcon} aria-hidden="true">🛡️</span> {creature.defense}
        </span>
        <span className={styles.stat} aria-label={`Speed: ${creature.speed}`}>
          <span className={styles.statIcon} aria-hidden="true">⚡</span> {creature.speed}
        </span>
      </div>
    </button>
  );
};

export default CreatureButton;