import React from "react";
import { useMove } from "../../../hooks/useMove";
import type { MoveWithType } from "../../../types/move.types";
import styles from "./MoveButton.module.css";

interface MoveButtonProps {
  moveId: number;
  onSelect: (move: MoveWithType) => void;
  disabled?: boolean;
  shape?: "rounded" | "pill";
  shadow?: boolean;
}

const MoveButton: React.FC<MoveButtonProps> = ({
  moveId,
  onSelect,
  disabled = false,
  shape = "rounded",
  shadow = false,
}) => {
  const { move, loading, error } = useMove(moveId);

  if (loading) {
    return (
      <div
        className={`${styles.moveBtn} ${styles.skeleton}`}
        role="status"
        aria-label="Loading move"
        aria-busy="true"
      />
    );
  }

  if (error || !move) {
    return (
      <button
        type="button"
        className={[
          styles.moveBtn,
          styles.typeNormal,
          styles[shape],
          shadow ? styles.withShadow : "",
        ].join(" ")}
        disabled
        aria-label={error ?? "Move unavailable"}
        title={error ?? "Move unavailable"}
      >
        <div className={styles.left}>
          <span className={styles.moveName}>Move unavailable</span>
          <span className={styles.typeTag}>Unknown</span>
        </div>

        <div className={styles.right}>
          <span
            className={styles.moveStat}
            aria-label="Damage unknown"
          >
            ⚔️ --
          </span>

          <span
            className={styles.moveStat}
            aria-label="Accuracy unknown"
          >
            --%
          </span>
        </div>
      </button>
    );
  }

  const moveTypeName =
    move.move_type?.name?.toLowerCase() ?? "normal";

  const typeClass =
    styles[
      `type${moveTypeName.charAt(0).toUpperCase()}${moveTypeName.slice(1)}`
    ] ?? styles.typeNormal;

  return (
    <button
      type="button"
      className={[
        styles.moveBtn,
        typeClass,
        styles[shape],
        shadow ? styles.withShadow : "",
      ].join(" ")}
      onClick={() => onSelect(move)}
      disabled={disabled}
      aria-label={`${move.name}, ${move.move_type.name} type, ${move.damage} damage, ${move.chance}% accuracy`}
    >
      <div className={styles.left}>
        <span className={styles.moveName}>
          {move.name}
        </span>

        <span className={styles.typeTag}>
          {move.move_type.name}
        </span>
      </div>

      <div className={styles.right}>
        <span
          className={styles.moveStat}
          aria-label={`Damage: ${move.damage}`}
        >
          ⚔️ {move.damage}
        </span>

        <span
          className={styles.moveStat}
          aria-label={`Accuracy: ${move.chance}%`}
        >
          {move.chance}%
        </span>
      </div>
    </button>
  );
};

export default MoveButton;