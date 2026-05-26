import { useEffect, useId, useRef } from "react";
import type { ReactElement } from "react";
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
  readonly creatureId: Creature["id"];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isBattleView?: boolean;
  readonly currentHp?: number;
  readonly maxHp?: number;
  readonly userId: string | number;
  readonly creatureLevelId?: number;
  readonly statBoosts?: StatBoosts;
}

interface StatCellProps {
  readonly icon: string;
  readonly color: string;
  readonly label: string;
  readonly value: number;
  readonly highlighted?: boolean;
  readonly boosted?: boolean;
}

/* ─────────────────────────── StatCell ──────────────────────── */

function StatCell({
  icon,
  color,
  label,
  value,
  highlighted = false,
  boosted = false,
}: StatCellProps): ReactElement {
  return (
    // CHANGE 1 — SC 2.1.1: tabindex="0" puts stat cells in the tab order so
    // keyboard and VoiceOver users can reach them.
    // role="listitem" pairs with role="list" on the parent grid (CHANGE 3).
    // The aria-label already carries the full readable announcement
    // ("Defense: 45 (boosted)"), so no extra inner text is needed.
    <div
      className={[
        styles.statCell,
        highlighted ? styles.statCellHighlighted : "",
      ].join(" ")}
      role="listitem"
      tabIndex={0}
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
      {/* aria-hidden on label + value because the parent aria-label already
          provides the full announcement — avoids double-reading. */}
      <span className={styles.statLabel} aria-hidden="true">{label}</span>
      <span
        className={[
          styles.statValue,
          boosted ? styles.statValueBoosted : "",
        ].join(" ")}
        aria-hidden="true"
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────── CreatureInfoPage ───────────────── */

function CreatureInfoPage({
  creatureId,
  isOpen,
  onClose,
  isBattleView = false,
  currentHp,
  maxHp: maxHpProp,
  userId,
  creatureLevelId: creatureLevelIdProp,
  statBoosts,
}: CreatureInfoPageProps): ReactElement | null {
  const uid = useId();
  const titleId = `creature-info-title-${uid}`;
  const descId = `creature-info-desc-${uid}`;

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    data: creature,
    loading: creatureLoading,
    error: creatureError,
  } = useAsyncData(() => getCreatureById(String(creatureId)), isOpen);

  const { moveEntries, loading: movesLoading } = useCreatureMoveIds(
    isOpen ? creatureId : null,
    isOpen,
  );

  const { types } = useCreatureTypes(
    isOpen && !isBattleView ? creatureId : null,
    isOpen && !isBattleView,
  );

  const needsLevelFetch = isOpen && creatureLevelIdProp === undefined;
  const {
    level: fetchedLevelNumber,
    levelId: fetchedLevelId,
    loading: levelLoading,
  } = useCreatureById(userId, creatureId);

  const resolvedLevelNumber: number =
    creatureLevelIdProp !== undefined
      ? fetchedLevelNumber
      : (fetchedLevelNumber ?? 1);

  const resolvedLevelId: number | null =
    creatureLevelIdProp !== undefined
      ? creatureLevelIdProp
      : (fetchedLevelId ?? null);

  const loading =
    creatureLoading || movesLoading || (needsLevelFetch && levelLoading);

  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const id = window.setTimeout((): void => {
      closeButtonRef.current?.focus();
    }, 50);
    return (): void => window.clearTimeout(id);
  }, [isOpen]);

  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // SC 2.1.1 — focus trap + Escape key handler (unchanged)
  useEffect((): (() => void) | void => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const dialog =
        overlayRef.current?.querySelector<HTMLElement>('[role="dialog"]');
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
    <div ref={overlayRef} className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={styles.modal}
        onClick={(e): void => e.stopPropagation()}
      >
        {/* ── Sticky header ── */}
        <div className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {isBattleView ? "Creature Details" : "Creature Information"}
          </h2>
          <p id={descId} className={styles.visuallyHidden}>
            Press Escape to close this dialog.
          </p>
          {/* CHANGE 2 — SC 2.5.5: min 44×44px touch/click target on close button */}
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close creature information"
            style={{ minWidth: 44, minHeight: 44 }}
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

              <div className={styles.nameRow}>
                <h3
                  className={styles.creatureName}
                  tabIndex={0}
                >
                  {creature.name}
                </h3>

                {!loading && (
                  <span
                    className={styles.levelBadgeInline}
                    aria-label={`Level ${resolvedLevelNumber}`}
                    tabIndex={0}
                  >
                    Lv.{resolvedLevelNumber}
                  </span>
                )}
              </div>

              {!isBattleView && types.length > 0 && (
                <div className={styles.typeBadges} aria-label="Creature types">
                  {types.map((type) => (
                    <span
                      key={type.id}
                      className={styles.typeBadge}
                      tabIndex={0}
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

              {!isBattleView && creature.description && (
                <p
                  className={styles.description}
                  tabIndex={0}
                >
                  {creature.description}
                </p>
              )}

              <div
                className={styles.hpSection}
                tabIndex={0}
                role="group"
                aria-label={
                  isBattleView
                    ? `Health: ${resolvedCurrentHp} out of ${resolvedMaxHp} HP`
                    : `Health: ${resolvedMaxHp} HP`
                }
              >
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

              {/* CHANGE 3 — SC 2.1.1 + 1.3.1: role="list" groups the stat cells
                  so VoiceOver announces "Creature statistics, list, 3 items" (or 4),
                  and each StatCell's role="listitem" + tabIndex={0} makes it
                  reachable and readable in sequence. */}
              <div
                className={styles.statsGrid}
                role="list"
                aria-label="Creature statistics"
                data-cols={isBattleView ? "3" : "2"}
              >
                {isBattleView ? (
                  (() => {
                    const evadeBoost = statBoosts?.evadeBoost ?? 0;
                    const defenseBoost = statBoosts?.defenseBoost ?? 0;
                    const speedBoost = statBoosts?.speedBoost ?? 0;

                    const effectiveEvade = creature.evade + evadeBoost;
                    const effectiveDefense =
                      creature.defense +
                      Math.floor((creature.defense * defenseBoost) / 100);
                    const effectiveSpeed =
                      creature.speed +
                      Math.floor((creature.speed * speedBoost) / 100);

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
                    <StatCell
                      icon={healthIcon}
                      color="var(--health)"
                      label="Max HP"
                      value={resolvedMaxHp}
                    />
                    <StatCell
                      icon={evadeIcon}
                      color="var(--evade)"
                      label="Evade"
                      value={creature.evade}
                    />
                    <StatCell
                      icon={defenseIcon}
                      color="var(--defense)"
                      label="Defense"
                      value={creature.defense}
                    />
                    <StatCell
                      icon={speedIcon}
                      color="var(--speed)"
                      label="Speed"
                      value={creature.speed}
                    />
                  </>
                )}
              </div>

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
                      const isUnlocked =
                        resolvedLevelId !== null &&
                        requiredLevelId <= resolvedLevelId;

                      // CHANGE 4 — SC 3.3.5: provide context-sensitive help for
                      // locked moves. The hidden span is read by VoiceOver when
                      // the locked label is focused via aria-describedby.
                      const lockHelpId = `lock-help-${uid}-${moveId}`;

                      return (
                        <div key={moveId} className={styles.moveRow}>
                          {/* CHANGE 5 — SC 2.5.5: enforce 44px min height on the
                              move button wrapper so the touch target is large enough */}
                          <div
                            className={styles.infoMoveWrapper}
                            style={{ minHeight: 44 }}
                          >
                            <MoveButton
                              moveId={moveId}
                              onSelect={(): void => undefined}
                              disabled={!isUnlocked}
                              shape="rounded"
                              shadow
                            />
                          </div>
                          {!isUnlocked && (
                            <>
                              {/* SC 3.3.5 help text — visually hidden, read by
                                  screen readers via aria-describedby below */}
                              <span
                                id={lockHelpId}
                                className={styles.visuallyHidden}
                              >
                                This move unlocks at level {requiredLevelId}.
                                Your creature is currently level {resolvedLevelNumber}.
                              </span>
                              <span
                                className={styles.lockedLabel}
                                aria-label={`Move locked until level ${requiredLevelId}`}
                                aria-describedby={lockHelpId}
                              >
                                LOCKED
                              </span>
                            </>
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
}

export default CreatureInfoPage;