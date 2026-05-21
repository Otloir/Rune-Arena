import { useEffect, useRef } from "react";
import MovesPanel from "../MovesPanel/MovesPanel";
import Button from "../../atoms/buttons/Button";
import styles from "./PlayerPanel.module.css";
import type { MoveWithType } from "../../../types/move.types";
import type { Creature } from "../../../types/creature.types";
import bagIcon from "../../../assets/icons/bag_icon.svg";

interface PlayerPanelProps {
  creatureId: number;
  creatureLevel: number;
  onMoveSelect: (move: MoveWithType) => void;
  disabled: boolean;
  battleLog: string[];
  playerCreature: Creature | null;
  onOpenInventory?: () => void;
}

export default function PlayerPanel({
  creatureId,
  creatureLevel,
  onMoveSelect,
  disabled,
  battleLog,
  playerCreature,
  onOpenInventory,
}: PlayerPanelProps) {
  const logScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = logScrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [battleLog]);

  return (
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
        <h3 className={styles.actionTitle}>Choose Move</h3>
        <div className={styles.movesWrapper}>
          <MovesPanel
            creatureId={creatureId}
            creatureLevel={creatureLevel}
            onMoveSelect={onMoveSelect}
            disabled={disabled}
          />
        </div>
        <div
          className={styles.actionButtons}
          role="group"
          aria-label="Battle actions"
        >
          <Button
            onClick={() => onOpenInventory && onOpenInventory()}
            aria-label="open inventory button"
            backgroundColor="#DCB8A0"
            textColor="#955D38"
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
            disabled
            className={styles.actionBtn}
            aria-label={
              playerCreature
                ? `View stats for ${playerCreature.name} (not yet available)`
                : "View creature stats (not yet available)"
            }
            title={
              playerCreature
                ? `Viewing stats for ${playerCreature.name} is not yet available.`
                : "Viewing creature stats is not yet available."
            }
          >
            View Stats
          </Button>
        </div>
      </div>
    </div>
  );
}
