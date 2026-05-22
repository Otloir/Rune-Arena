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
   * Pass the value from battle state so the modal never has to
   * re-derive it from a Supabase fetch (which always returns base stats).
   */
  readonly maxHp?: number;
}

interface StatCellProps {
  readonly icon: string;
  readonly color: string;
  readonly label: string;
  readonly value: number;
  readonly highlighted?: boolean;
}

/* ─────────────────────────── StatCell ─────────────────────────── */

const StatCell: FC<StatCellProps> = ({
  icon,
  color,
  label,
  value,
  highlighted = false,
}) => (
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

/* ─────────────────────────── CreatureInfoPage ─────────────────────────── */

const CreatureInfoPage: FC<CreatureInfoPageProps> = ({
  creatureId,
  isOpen,
  onClose,
  isBattleView = false,
  currentHp,
  maxHp: maxHpProp,
}) => {
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

  // SC 2.1.1 — move focus to close button when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    return (): void => window.clearTimeout(id);
  }, [isOpen]);

  // SC 2.1.1 — focus trap + Escape key
  useEffect(() => {
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
   *   - Battle view: use the props passed from the arena (live values).
   *     Never trust creature.hp here — it's always the Supabase base stat.
   *   - Selection view: creature.hp from the DB is correct (always full).
   */
  const resolvedMaxHp = isBattleView
    ? (maxHpProp ?? creature?.hp ?? 0)
    : (creature?.hp ?? 0);

  const resolvedCurrentHp = isBattleView
    ? (currentHp ?? resolvedMaxHp)
    : resolvedMaxHp;

  const hpPercent =
    resolvedMaxHp > 0
      ? Math.max(0, Math.min(100, (resolvedCurrentHp / resolvedMaxHp) * 100))
      : 100;

  const hpBarColor =
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

          {creatureError && !loading && (
            <p role="alert" className={styles.errorState}>
              Failed to load creature information. Please try again.
            </p>
          )}

          {creature && !loading && (
            <>
              <img
                src={creature.front_img}
                alt={creature.name}
                className={styles.sprite}
              />

              <h3 className={styles.creatureName}>{creature.name}</h3>

              {/* Description — selection view only (SC 3.3.5: contextual help) */}
              {!isBattleView && creature.description && (
                <p className={styles.description}>{creature.description}</p>
              )}

              {/* HP section */}
              <section className={styles.hpSection} aria-label="Health">
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
              </section>

              {/* Stats grid */}
              <section
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
              </section>

              {/* Moves */}
              {moveIds.length > 0 && (
                <section
                  className={styles.movesSection}
                  aria-label="Available moves"
                >
                  <h4 className={styles.movesHeading}>
                    {isBattleView ? "Moves" : "Available Moves"}
                  </h4>
                  <div className={styles.movesList}>
                    {moveIds.map((moveId) => (
                      <MoveButton
                        key={moveId}
                        moveId={moveId}
                        onSelect={(): void => undefined}
                        disabled
                        shape="rounded"
                        shadow
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatureInfoPage;