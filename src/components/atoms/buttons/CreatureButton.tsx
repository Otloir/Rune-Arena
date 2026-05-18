import React from "react";
import { useAsyncData } from "../../../hooks/useCreature";
import { getCreatureById } from "../../../database/creature.database";
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
  const { data: creature, loading, error } = useAsyncData(
    () => getCreatureById(String(creatureId)),
    true,
  );

  if (loading) return (
    <button
      type="button"
      className={[styles.card, styles[shape], styles.loadingPlaceholder, shadow ? styles.withShadow : ""].join(" ")}
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
        <span className={styles.stat} aria-label={`Evade: ${creature.evade}`}>
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