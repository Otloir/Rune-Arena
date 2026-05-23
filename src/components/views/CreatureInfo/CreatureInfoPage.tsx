import { useEffect, useId, useRef } from "react";
import type { FC } from "react";
import type { Creature } from "../../../types/creature.types";
import { useAsyncData, useCreatureMoveIds } from "../../../hooks/useCreature";
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
}

interface StatCellProps {
  readonly icon: string;
  readonly color: string;
  readonly label: string;
  readonly value: number;
  /** Gives the cell a blue tint — used for the centre stat in battle view. */
  readonly highlighted?: boolean;
}

/* ─────────────────────────── StatCell ──────────────────────── */

const StatCell: FC<StatCellProps> = ({
  icon,
  color,
  label,
  value,
  highlighted = false,
}): React.ReactElement => (
  <div
    className={[
      styles.statCell,
      highlighted ? styles.statCellHighlighted : "",
    ].join(" ")}
    aria-label={`${label}: ${value}`}
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
    <span className={styles.statValue}>{value}</span>
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
}): React.ReactElement | null => {
  const uid = useId();
  const titleId = `creature-info-title-${uid}`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    data: creature,
    loading: creatureLoading,
    error: creatureError,
  } = useAsyncData(
    () => getCreatureById(String(creatureId)),
    isOpen,
  );

  const { moveIds, loading: movesLoading } = useCreatureMoveIds(
    isOpen ? creatureId : null,
    isOpen,
  );

  const loading = creatureLoading || movesLoading;

  // SC 2.1.1 — move keyboard focus to close button when modal opens
  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const id = window.setTimeout((): void => {
      closeButtonRef.current?.focus();
    }, 50);
    return (): void => window.clearTimeout(id);
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

              <h3 className={styles.creatureName}>{creature.name}</h3>

              {/*
               * SC 3.3.5 — contextual help: description gives the player
               * lore/context about the creature before committing to it.
               * Only shown in selection view where it's relevant.
               */}
              {!isBattleView && creature.description && (
                <p className={styles.description}>{creature.description}</p>
              )}

              {/*
               * HP block.
               * <div> not <section> — avoids inheriting the lobbyPage
               * `.lobbyPage section` rule (display:flex / align-items:center)
               * which would override our grid and block layouts.
               */}
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

              {/*
               * Stats grid — <div> for the same reason as hpSection above.
               * data-cols drives grid-template-columns via an attribute
               * selector in the CSS (avoids :has() browser-support issues).
               */}
              <div
                className={styles.statsGrid}
                aria-label="Creature statistics"
                data-cols={isBattleView ? "3" : "2"}
              >
                {isBattleView ? (
                  <>
                    <StatCell icon={evadeIcon}   color="var(--evade)"   label="Evade"   value={creature.evade} />
                    <StatCell icon={defenseIcon} color="var(--defense)" label="Defense" value={creature.defense} highlighted />
                    <StatCell icon={speedIcon}   color="var(--speed)"   label="Speed"   value={creature.speed} />
                  </>
                ) : (
                  <>
                    <StatCell icon={healthIcon}  color="var(--health)"  label="Max HP"  value={resolvedMaxHp} />
                    <StatCell icon={evadeIcon}   color="var(--evade)"   label="Evade"   value={creature.evade} />
                    <StatCell icon={defenseIcon} color="var(--defense)" label="Defense" value={creature.defense} />
                    <StatCell icon={speedIcon}   color="var(--speed)"   label="Speed"   value={creature.speed} />
                  </>
                )}
              </div>

              {/* Moves — <div> for same reason */}
              {moveIds.length > 0 && (
                <div
                  className={styles.movesSection}
                  aria-label="Available moves"
                >
                  <h4 className={styles.movesHeading}>
                    {isBattleView ? "Moves" : "Available Moves"}
                  </h4>
                  <div className={styles.movesList}>
                    {moveIds.map((moveId: number): React.ReactElement => (
                      <MoveButton
                        key={moveId}
                        moveId={moveId}
                        /*
                         * Info-only context — button is disabled so onSelect
                         * is never called, but the prop is required by the
                         * MoveButton interface.
                         */
                        onSelect={(): void => undefined}
                        disabled
                        shape="rounded"
                        shadow
                      />
                    ))}
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