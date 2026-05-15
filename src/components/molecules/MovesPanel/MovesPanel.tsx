import MoveButton from "../../atoms/buttons/MoveButton";
import type { MoveWithType } from "../../../types/move.types";
import styles from "./MovesPanel.module.css";
import { useCreatureMoves } from "../../../hooks/useCreatureMoves";

interface MovesPanelProps {
  creatureId: number;
  creatureLevel?: number; //When creatureLevel is undefined, all moves load
  onMoveSelect: (move: MoveWithType) => void;
  disabled?: boolean;
  shadow?: boolean;
}

export default function MovesPanel({
  creatureId,
  creatureLevel,
  onMoveSelect,
  disabled = false,
  shadow = false,
}: MovesPanelProps) {
  const { moveIds, loading, error } = useCreatureMoves(creatureId, creatureLevel);

  if (loading) {
    return (
      <section className={styles.movesPanel} aria-label="Loading available battle moves">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.emptyMoveSlot} aria-hidden="true">
            Loading...
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.movesPanel} aria-label="Move selection unavailable">
        <div className={styles.errorMessage}>Failed to load moves.</div>
      </section>
    );
  }

  const paddedMoveIds = [...(moveIds ?? [])];
  while (paddedMoveIds.length < 4) paddedMoveIds.push(0);

  return (
    <section className={styles.movesPanel} aria-label="Available battle moves">
      {paddedMoveIds.map((moveId, index) =>
        moveId > 0 ? (
          <MoveButton
            key={`${moveId}-${index}`}
            moveId={moveId}
            onSelect={onMoveSelect}
            disabled={disabled}
            shadow={shadow}
          />
        ) : (
          <button
            key={`empty-${index}`}
            type="button"
            disabled
            className={styles.emptyMoveSlot}
            aria-label="Empty move slot"
          >
            No Move available
          </button>
        ),
      )}
    </section>
  );
}