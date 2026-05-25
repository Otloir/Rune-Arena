import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import MovesPanel from "../MovesPanel/MovesPanel";
import Button from "../../atoms/buttons/Button";
import CreatureInfoPage from "../../views/CreatureInfo/CreatureInfoPage";
import styles from "./PlayerPanel.module.css";
import type { MoveWithType } from "../../../types/move.types";
import type { Creature } from "../../../types/creature.types";
import type { StatBoosts } from "../../../types/battleEffects.types";
import bagIcon from "../../../assets/icons/bag_icon.svg";

interface PlayerPanelProps {
  readonly creatureId: number;
  readonly creatureLevel: number;
  readonly creatureLevelId: number | null;
  readonly onMoveSelect: (move: MoveWithType) => void;
  readonly disabled: boolean;
  readonly battleLog: string[];
  readonly playerCreature: Creature | null;
  readonly onOpenInventory?: () => void;
  readonly currentHp?: number;
  readonly maxHp?: number;
  readonly userId: string | number;
  readonly statBoosts?: StatBoosts;
}

export default function PlayerPanel({
  creatureId,
  creatureLevel,
  creatureLevelId,
  onMoveSelect,
  disabled,
  battleLog,
  playerCreature,
  onOpenInventory,
  currentHp,
  maxHp,
  userId,
  statBoosts,
}: PlayerPanelProps): ReactElement {
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const [statsOpen, setStatsOpen] = useState<boolean>(false);

  useEffect((): void => {
    const node = logScrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [battleLog]);

  return (
    <>
      {/* Creature info modal — battle layout variant */}
      {playerCreature && (
        <CreatureInfoPage
          creatureId={playerCreature.id}
          userId={userId}
          isOpen={statsOpen}
          onClose={(): void => setStatsOpen(false)}
          isBattleView
          currentHp={currentHp ?? playerCreature.hp}
          maxHp={maxHp ?? playerCreature.hp}
          creatureLevelId={creatureLevelId ?? undefined}
          statBoosts={statBoosts}
        />
      )}

      <div
        className={styles.controlsPanel}
        aria-label="Battle controls"
        role="region"
      >
        {/* Left: battle log */}
        <div className={styles.logPanel}>
          <h3 className={styles.logTitle}>Battle Log</h3>
          <div
            ref={logScrollRef}
            className={styles.logScroll}
            aria-live="polite"
            aria-label="Battle log"
          >
            {battleLog.map((entry, i) => (
              <p key={i} className={styles.logEntry}>
                {entry}
              </p>
            ))}
          </div>
        </div>

        {/* Right: moves + action buttons */}
        <div className={styles.actionPanel}>
          <div className={styles.actionPanelMovesContainer}>
            <h3 className={styles.actionTitle}>Choose Move</h3>
            <div className={styles.movesWrapper}>
              <MovesPanel
                creatureId={creatureId}
                creatureLevel={creatureLevel}
                onMoveSelect={onMoveSelect}
                disabled={disabled}
              />
            </div>
          </div>
          <div
            className={styles.actionButtons}
            role="group"
            aria-label="Battle actions"
          >
            <Button
              onClick={(): void => onOpenInventory?.()}
              aria-label="Open inventory"
              backgroundColor="#DCB8A0"
              textColor="#955D38"
              size="sm"
              className={styles.actionBtn}
            >
              <span className={styles.buttonLabel}>
                <span
                  className={styles.buttonIcon}
                  aria-hidden="true"
                  style={{
                    WebkitMaskImage: `url(${bagIcon})`,
                    maskImage: `url(${bagIcon})`,
                  }}
                />
                <span>Bag</span>
              </span>
            </Button>

            <Button
              variant="neutral"
              size="sm"
              onClick={(): void => {
                if (playerCreature) setStatsOpen(true);
              }}
              disabled={!playerCreature}
              className={styles.actionBtn}
              aria-label={
                playerCreature
                  ? `View stats for ${playerCreature.name}`
                  : "View creature stats (unavailable)"
              }
              aria-haspopup="dialog"
            >
              View Stats
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
