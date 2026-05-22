import { useState } from "react";
import type { FC } from "react";
import { useAsyncData } from "../../../hooks/useCreature";
import { getCreatureById } from "../../../database/creature.database";
import type { Creature } from "../../../types/creature.types";
import CreatureInfoPage from "../../views/CreatureInfo/CreatureInfoPage";
import styles from "./CreatureButton.module.css";
import defenseIcon from "./../../../assets/icons/defence_icon.svg";
import healthIcon from "./../../../assets/icons/health_icon.svg";
import speedIcon from "./../../../assets/icons/speed_icon.svg";
import evadeIcon from "./../../../assets/icons/evade_icon.svg";
import swordIcon from "./../../../assets/icons/sword_icon.svg";
import informationIcon from "./../../../assets/icons/information_icon.svg";

interface CreatureButtonProps {
  readonly creatureId: Creature["id"];
  readonly onSelect: (creature: Creature) => void;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly shape?: "rounded" | "pill";
  readonly shadow?: boolean;
}

const CreatureButton: FC<CreatureButtonProps> = ({
  creatureId,
  onSelect,
  selected = false,
  disabled = false,
  shape = "rounded",
  shadow = false,
}) => {
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  const {
    data: creature,
    loading,
    error,
  } = useAsyncData(() => getCreatureById(String(creatureId)), true);

  // ── Loading state ──
  if (loading)
    return (
      <div className={styles.cardWrapper}>
        <button
          type="button"
          className={[
            styles.card,
            styles[shape],
            styles.loadingPlaceholder,
            shadow ? styles.withShadow : "",
          ].join(" ")}
          disabled
          aria-busy="true"
          aria-label="Loading creature"
        />
      </div>
    );

  // ── Error state ──
  if (error)
    return (
      <div className={styles.cardWrapper}>
        <button
          type="button"
          className={[
            styles.card,
            styles[shape],
            shadow ? styles.withShadow : "",
          ].join(" ")}
          disabled
          aria-label={error}
        >
          {error}
        </button>
      </div>
    );

  // ── No creature returned ──
  if (!creature)
    return (
      <div className={styles.cardWrapper}>
        <button
          type="button"
          className={[
            styles.card,
            styles[shape],
            shadow ? styles.withShadow : "",
          ].join(" ")}
          disabled
          aria-label="Creature unavailable"
        >
          Creature unavailable.
        </button>
      </div>
    );

  return (
    <>
      {/* Modal is rendered in a sibling tree, outside the wrapper div,
          so it can portal over everything without z-index issues */}
      <CreatureInfoPage
        creatureId={creatureId}
        isOpen={infoOpen}
        onClose={(): void => setInfoOpen(false)}
        isBattleView={false}
      />

      {/*
       * .cardWrapper gives us a relative positioning context so the
       * absolutely-positioned info button sits in the card's corner.
       * It does NOT interfere with the parent list layout because it
       * uses `display: contents` only on desktop — see the CSS note.
       */}
      <div className={styles.cardWrapper}>
        <button
          type="button"
          className={[
            styles.card,
            styles[shape],
            selected ? styles.selected : "",
            shadow ? styles.withShadow : "",
          ].join(" ")}
          onClick={(): void => onSelect(creature)}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={`${selected ? "Selected: " : "Select "}${creature.name}, HP ${creature.hp}, Evade ${creature.evade}, Defense ${creature.defense}, Speed ${creature.speed}`}
        >
          {selected && (
            <div className={styles.selectedBadge} aria-hidden="true">
              Selected
            </div>
          )}
          <img
            src={creature.front_img}
            alt={creature.name}
            className={styles.sprite}
          />
          <h3 className={styles.name}>{creature.name}</h3>
          <div className={styles.hpRow}>
            <span className={styles.hpLabel}>
              <span
                className={styles.propertieIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${healthIcon})`,
                  maskImage: `url(${healthIcon})`,
                  backgroundColor: "var(--health)",
                }}
              />{" "}
              Health
            </span>
            <span
              className={styles.hpValue}
              aria-label={`${creature.hp} of ${creature.hp} HP`}
            >
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
              <span
                className={styles.propertieIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${swordIcon})`,
                  maskImage: `url(${swordIcon})`,
                  backgroundColor: "var(--evade)",
                }}
              />{" "}
              {creature.evade}
            </span>
            <span className={styles.stat} aria-label={`Defense: ${creature.defense}`}>
              <span
                className={styles.propertieIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${defenseIcon})`,
                  maskImage: `url(${defenseIcon})`,
                  backgroundColor: "var(--defense)",
                }}
              />{" "}
              {creature.defense}
            </span>
            <span className={styles.stat} aria-label={`Speed: ${creature.speed}`}>
              <span
                className={styles.propertieIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${speedIcon})`,
                  maskImage: `url(${speedIcon})`,
                  backgroundColor: "var(--speed)",
                }}
              />{" "}
              {creature.speed}
            </span>
            <span className={styles.stat} aria-label={`Evade: ${creature.evade}`}>
              <span
                className={styles.propertieIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${evadeIcon})`,
                  maskImage: `url(${evadeIcon})`,
                  backgroundColor: "var(--evade)",
                }}
              />{" "}
              {creature.evade}
            </span>
          </div>
        </button>

        {/*
         * Info button — a separate <button> SIBLING (not child) of .card.
         * This keeps the HTML valid (no nested interactive elements).
         *
         * SC 2.5.5: min-width/height 44px enforced in CSS.
         * SC 3.3.5: aria-label gives contextual help about the control.
         */}
        <button
          type="button"
          className={styles.infoButton}
          onClick={(e): void => {
            e.stopPropagation(); // don't bubble to parent list handlers
            setInfoOpen(true);
          }}
          aria-label={`View detailed information for ${creature.name}`}
          aria-haspopup="dialog"
        >
          <img
            src={informationIcon}
            alt=""
            aria-hidden="true"
            className={styles.infoIcon}
          />
        </button>
      </div>
    </>
  );
};

export default CreatureButton;