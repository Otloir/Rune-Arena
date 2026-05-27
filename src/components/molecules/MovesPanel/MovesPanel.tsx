import { useId } from "react";
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
  const panelId = useId();
  const disabledHelpId = `${panelId}-move-disabled-help`;
  const { moveIds, loading, error } = useCreatureMoves(
    creatureId,
    creatureLevel,
  );

  if (loading) {
    return (
      <div
        className={styles.movesPanel}
        role="group"
        aria-label="Loading available battle moves"
        aria-busy="true"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.emptyMoveSlot} aria-hidden="true">
            Loading...
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={styles.movesPanel}
        role="group"
        aria-label="Move selection unavailable"
      >
        <div className={styles.errorMessage} role="alert">
          Failed to load moves.
        </div>
      </div>
    );
  }

  const paddedMoveIds = [...(moveIds ?? [])];
  while (paddedMoveIds.length < 4) paddedMoveIds.push(0);

  return (
    <div
      className={styles.movesPanel}
      role="group"
      aria-label="Available battle moves"
    >
      {disabled && (
        <span id={disabledHelpId} className="visuallyHidden">
          Moves cannot be selected while it is not your turn or while the
          current action is processing.
        </span>
      )}
      {paddedMoveIds.map((moveId, index) =>
        moveId > 0 ? (
          <MoveButton
            key={`${moveId}-${index}`}
            moveId={moveId}
            onSelect={onMoveSelect}
            disabled={disabled}
            helpTextId={disabled ? disabledHelpId : undefined}
            shadow={shadow}
          />
        ) : (
          <button
            key={`empty-${index}`}
            type="button"
            disabled
            className={styles.emptyMoveSlot}
            aria-label="Empty move slot, no move available"
          >
            No Move available
          </button>
        ),
      )}
    </div>
  );
}
