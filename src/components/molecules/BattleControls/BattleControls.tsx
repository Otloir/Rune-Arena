import { useEffect, useRef } from "react";
import MovesPanel from "../MovesPanel/MovesPanel";
import Button from "../../atoms/buttons/Button";
import styles from "./BattleControls.module.css";
import type { MoveWithType } from "../../../types/move.types";
import type { Creature } from "../../../types/creature.types";

interface BattleControlsProps {
  creatureId: number;
  creatureLevel: number;
  onMoveSelect: (move: MoveWithType) => void;
  disabled: boolean;
  battleLog: string[];
  playerCreature: Creature | null;
}

export default function BattleControls({
  creatureId,
  creatureLevel,
  onMoveSelect,
  disabled,
  battleLog,
  playerCreature,
}: BattleControlsProps) {
  const logScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = logScrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [battleLog]);

  return (
    <div className={styles.controlsPanel}>

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
            <p key={i} className={styles.logEntry}>{entry}</p>
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
        <div className={styles.actionButtons}>
          <Button
            variant="action"
            color="#a855f7"
            onClick={() => console.log("Use item — placeholder")}
            disabled={disabled}
            className={styles.actionBtn}
          >
            Use Item
          </Button>
          <Button
            variant="neutral"
            onClick={() => {
              if (!playerCreature) return;
              alert(
                `${playerCreature.name}\n` +
                `HP: ${playerCreature.hp}\n` +
                `Defense: ${playerCreature.defense}\n` +
                `Speed: ${playerCreature.speed}\n` +
                `Evade: ${playerCreature.evade}`
              );
            }}
            className={styles.actionBtn}
          >
            View Stats
          </Button>
        </div>
      </div>

    </div>
  );
}