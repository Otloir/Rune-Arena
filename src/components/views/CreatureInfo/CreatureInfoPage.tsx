import { useEffect, useId, useRef } from "react";
import type { FC } from "react";
import type { Creature } from "../../../types/creature.types";
import type { StatBoosts } from "../../../types/battleEffects.types";
import {
  useAsyncData,
  useCreatureMoveIds,
  useCreatureTypes,
  useCreatureById,
} from "../../../hooks/useCreature";
import { getCreatureById } from "../../../database/creature.database";
import MoveButton from "../../atoms/buttons/MoveButton";
import styles from "./CreatureInfoPage.module.css";
import defenseIcon from "../../../assets/icons/defence_icon.svg";
import healthIcon from "../../../assets/icons/health_icon.svg";
import speedIcon from "../../../assets/icons/speed_icon.svg";
import evadeIcon from "../../../assets/icons/evade_icon.svg";

/* ─────────────────────────── Types ─────────────────────────── */

interface CreatureInfoPageProps {
  /** The creature whose info to display. */
  readonly creatureId: Creature["id"];
  /** Whether the modal is currently open. */
  readonly isOpen: boolean;
  /** Called when the user dismisses the modal. */
  readonly onClose: () => void;
  /**
   * `true`  → "battle" layout: live HP bar shown, description hidden.
   * `false` → "selection" layout: max HP shown, description visible.
   * Defaults to `false`.
   */
  readonly isBattleView?: boolean;
  /**
   * Current (live) HP — only used when `isBattleView` is true.
   * Must be kept in sync by the arena/battle parent.
   */
  readonly currentHp?: number;
  /**
   * Max HP — only used when `isBattleView` is true.
   * Pass the value from battle state so the modal never re-derives
   * it from Supabase (which always returns the base stat, not live HP).
   */
  readonly maxHp?: number;
  /**
   * The player's user ID — used to fetch the creature's current level
   * from User_Creature_Levels.
   */
  readonly userId: string | number;
  /**
   * The player's current level_id (FK to Levels.id) for this creature.
   * When provided directly (e.g. from battle state) we skip the DB fetch.
   * Used for move lock comparisons — requiredLevelId <= playerLevelId means unlocked.
   */
  readonly creatureLevelId?: number;
  /**
   * Active item-based stat boosts from the current battle.
   * Only used when `isBattleView` is true — ignored in selection view.
   * When a boost is non-zero the affected stat value turns green.
   */
  readonly statBoosts?: StatBoosts;
}

interface StatCellProps {
  readonly icon: string;
  readonly color: string;
  readonly label: string;
  readonly value: number;
  /** Gives the cell a blue tint — used for the centre stat in battle view. */
  readonly highlighted?: boolean;
  /** When true the value is shown in green to indicate an active item buff. */
  readonly boosted?: boolean;
}

/* ─────────────────────────── StatCell ──────────────────────── */

const StatCell: FC<StatCellProps> = ({
  icon,
  color,
  label,
  value,
  highlighted = false,
  boosted = false,
}): React.ReactElement => (
  <div
    className={[
      styles.statCell,
      highlighted ? styles.statCellHighlighted : "",
    ].join(" ")}
    aria-label={`${label}: ${value}${boosted ? " (boosted)" : ""}`}
  >
    <span
      className={styles.statIcon}
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url(${icon})`,
        maskImage: `url(${icon})`,
        backgroundColor: color,
      }}
    />
    <span className={styles.statLabel}>{label}</span>
    <span
      className={[styles.statValue, boosted ? styles.statValueBoosted : ""].join(" ")}
    >
      {value}
    </span>
  </div>
);

/* ─────────────────────────── CreatureInfoPage ───────────────── */

const CreatureInfoPage: FC<CreatureInfoPageProps> = ({
  creatureId,
  isOpen,
  onClose,
  isBattleView = false,
  currentHp,
  maxHp: maxHpProp,
  userId,
  creatureLevelId: creatureLevelIdProp,
  statBoosts,
}): React.ReactElement | null => {
  const uid = useId();
  const titleId = `creature-info-title-${uid}`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ── Creature base data ──
  const {
    data: creature,
    loading: creatureLoading,
    error: creatureError,
  } = useAsyncData(
    () => getCreatureById(String(creatureId)),
    isOpen,
  );

  // ── Move entries (with required level_id per move) ──
  const { moveEntries, loading: movesLoading } = useCreatureMoveIds(
    isOpen ? creatureId : null,
    isOpen,
  );

  // ── Types (selection view only) ──
  const { types } = useCreatureTypes(
    isOpen && !isBattleView ? creatureId : null,
    isOpen && !isBattleView,
  );

  /*
   * Level resolution:
   * If the parent passes creatureLevelId directly (FK to Levels.id), use it
   * and skip the fetch. Otherwise fetch via useCreatureById.
   * We always call the hook (Rules of Hooks) but gate its result on whether
   * we actually need it.
   */
  const needsLevelFetch = isOpen && creatureLevelIdProp === undefined;
  const {
    level: fetchedLevelNumber,
    levelId: fetchedLevelId,
    loading: levelLoading,
  } = useCreatureById(userId, creatureId);

  const resolvedLevelNumber: number =
    creatureLevelIdProp !== undefined
      ? fetchedLevelNumber  // still show the number from fetch; prop only affects locking
      : (fetchedLevelNumber ?? 1);

  const resolvedLevelId: number | null =
    creatureLevelIdProp !== undefined
      ? creatureLevelIdProp
      : (fetchedLevelId ?? null);

  const loading = creatureLoading || movesLoading || (needsLevelFetch && levelLoading);

  // SC 2.1.1 — move keyboard focus to close button when modal opens
  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const id = window.setTimeout((): void => {
      closeButtonRef.current?.focus();
    }, 50);
    return (): void => window.clearTimeout(id);
  }, [isOpen]);

  // Prevent page scroll behind the modal on mobile
  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // SC 2.1.1 — focus trap + Escape key handler
  useEffect((): (() => void) | void => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog = overlayRef.current?.querySelector<HTMLElement>(
        '[role="dialog"]',
      );
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            "button:not([disabled])",
            "[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(", "),
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return (): void => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /*
   * HP resolution:
   *   Battle view  → use props from arena (live values). Never trust
   *                  creature.hp; it is always the Supabase base stat.
   *   Selection view → creature.hp from the DB is correct (always full).
   */
  const resolvedMaxHp: number = isBattleView
    ? (maxHpProp ?? creature?.hp ?? 0)
    : (creature?.hp ?? 0);

  const resolvedCurrentHp: number = isBattleView
    ? (currentHp ?? resolvedMaxHp)
    : resolvedMaxHp;

  const hpPercent: number =
    resolvedMaxHp > 0
      ? Math.max(0, Math.min(100, (resolvedCurrentHp / resolvedMaxHp) * 100))
      : 100;

  const hpBarColor: string =
    hpPercent > 50
      ? "var(--hp-bar)"
      : hpPercent > 25
        ? "#f5a623"
        : "var(--hp-bar-damage)";

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.modal}
        onClick={(e): void => e.stopPropagation()}
      >
        {/* ── Sticky header ── */}
        <div className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {isBattleView ? "Creature Details" : "Creature Information"}
          </h2>
          {/* SC 2.5.5 — 44×44 px minimum touch target enforced in CSS */}
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close creature information"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className={styles.body}>

          {/* Loading skeleton */}
          {loading && (
            <div
              role="status"
              aria-busy="true"
              aria-label="Loading creature information"
              className={styles.loadingState}
            >
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} style={{ width: "60%" }} />
            </div>
          )}

          {/* Error */}
          {creatureError && !loading && (
            <p role="alert" className={styles.errorState}>
              Failed to load creature information. Please try again.
            </p>
          )}

          {/* Content */}
          {creature && !loading && (
            <>
              <img
                src={creature.front_img}
                alt={creature.name}
                className={styles.sprite}
              />

              {/* Name + level badge side by side */}
              <div className={styles.nameRow}>
                <h3 className={styles.creatureName}>{creature.name}</h3>
                {!loading && (
                  <span
                    className={styles.levelBadgeInline}
                    aria-label={`Level ${resolvedLevelNumber}`}
                  >
                    Lv.{resolvedLevelNumber}
                  </span>
                )}
              </div>

              {/*
               * Type badges — selection view only, between name and description.
               * Colour comes from --type-{name}-1 CSS vars in index.css.
               */}
              {!isBattleView && types.length > 0 && (
                <div className={styles.typeBadges} aria-label="Creature types">
                  {types.map((type) => (
                    <span
                      key={type.id}
                      className={styles.typeBadge}
                      style={{
                        background: `var(--type-${type.name.toLowerCase()}-1, var(--type-normal-1))`,
                        boxShadow: `0 0.125rem 0 var(--type-${type.name.toLowerCase()}-shadow, var(--type-normal-shadow))`,
                      }}
                      aria-label={`${type.name} type`}
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              )}

              {/*
               * SC 3.3.5 — contextual help: description gives the player
               * lore/context about the creature before committing to it.
               */}
              {!isBattleView && creature.description && (
                <p className={styles.description}>{creature.description}</p>
              )}

              {/* HP block — <div> avoids LobbyPage's .lobbyPage section override */}
              <div className={styles.hpSection} aria-label="Health">
                <div className={styles.hpRow}>
                  <span className={styles.hpLabel}>
                    <span
                      className={styles.hpIcon}
                      aria-hidden="true"
                      style={{
                        WebkitMaskImage: `url(${healthIcon})`,
                        maskImage: `url(${healthIcon})`,
                        backgroundColor: "var(--health)",
                      }}
                    />
                    Health
                  </span>
                  <span
                    className={styles.hpValue}
                    aria-label={
                      isBattleView
                        ? `${resolvedCurrentHp} of ${resolvedMaxHp} HP`
                        : `${resolvedMaxHp} HP`
                    }
                  >
                    {isBattleView
                      ? `${resolvedCurrentHp} / ${resolvedMaxHp}`
                      : resolvedMaxHp}
                  </span>
                </div>

                {isBattleView && (
                  <div
                    className={styles.hpBar}
                    role="progressbar"
                    aria-valuenow={resolvedCurrentHp}
                    aria-valuemin={0}
                    aria-valuemax={resolvedMaxHp}
                    aria-label="HP bar"
                  >
                    <div
                      className={styles.hpFill}
                      style={{
                        width: `${hpPercent}%`,
                        backgroundColor: hpBarColor,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div
                className={styles.statsGrid}
                aria-label="Creature statistics"
                data-cols={isBattleView ? "3" : "2"}
              >
                {isBattleView ? (
                  /*
                   * Battle view: show effective (boosted) stat values.
                   * Evade boost is flat points added directly.
                   * Defense boost is a percentage of the base stat.
                   * Speed boost is a percentage of the base stat.
                   * A green value signals an active item buff.
                   */
                  (() => {
                    const evadeBoost = statBoosts?.evadeBoost ?? 0;
                    const defenseBoost = statBoosts?.defenseBoost ?? 0;
                    const speedBoost = statBoosts?.speedBoost ?? 0;

                    const effectiveEvade = creature.evade + evadeBoost;
                    const effectiveDefense = creature.defense + Math.floor(
                      (creature.defense * defenseBoost) / 100,
                    );
                    const effectiveSpeed = creature.speed + Math.floor(
                      (creature.speed * speedBoost) / 100,
                    );

                    return (
                      <>
                        <StatCell
                          icon={evadeIcon}
                          color="var(--evade)"
                          label="Evade"
                          value={effectiveEvade}
                          boosted={evadeBoost > 0}
                        />
                        <StatCell
                          icon={defenseIcon}
                          color="var(--defense)"
                          label="Defense"
                          value={effectiveDefense}
                          highlighted
                          boosted={defenseBoost > 0}
                        />
                        <StatCell
                          icon={speedIcon}
                          color="var(--speed)"
                          label="Speed"
                          value={effectiveSpeed}
                          boosted={speedBoost > 0}
                        />
                      </>
                    );
                  })()
                ) : (
                  <>
                    <StatCell icon={healthIcon}  color="var(--health)"  label="Max HP"  value={resolvedMaxHp} />
                    <StatCell icon={evadeIcon}   color="var(--evade)"   label="Evade"   value={creature.evade} />
                    <StatCell icon={defenseIcon} color="var(--defense)" label="Defense" value={creature.defense} />
                    <StatCell icon={speedIcon}   color="var(--speed)"   label="Speed"   value={creature.speed} />
                  </>
                )}
              </div>

              {/* Moves */}
              {moveEntries.length > 0 && (
                <div
                  className={styles.movesSection}
                  aria-label="Available moves"
                >
                  <h4 className={styles.movesHeading}>
                    {isBattleView ? "Moves" : "Available Moves"}
                  </h4>
                  <div className={styles.movesList}>
                    {moveEntries.map(({ moveId, requiredLevelId }) => {
                      /*
                       * Lock check: compare level_id FK to FK.
                       * requiredLevelId is the Levels.id needed to unlock.
                       * resolvedLevelId is the player's current Levels.id.
                       * Higher id = higher level (ordered ascending in DB).
                       */
                      const isUnlocked =
                        resolvedLevelId !== null &&
                        requiredLevelId <= resolvedLevelId;

                      return (
                        <div key={moveId} className={styles.moveRow}>
                          <div className={styles.infoMoveWrapper}>
                            <MoveButton
                              moveId={moveId}
                              onSelect={(): void => undefined}
                              disabled={!isUnlocked}
                              shape="rounded"
                              shadow
                            />
                          </div>
                          {!isUnlocked && (
                            <span
                              className={styles.lockedLabel}
                              aria-label={`Move locked until level ${requiredLevelId}`}
                            >
                              LOCKED
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatureInfoPage;