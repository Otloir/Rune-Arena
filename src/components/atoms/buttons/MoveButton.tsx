import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { MoveWithType } from "./../../../types/move.types";
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
  const [move, setMove] = useState<MoveWithType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const fetchMove = async () => {
      setLoading(true);
      setMove(null);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("Moves")
          .select("id, name, damage, chance, move_type_id, move_type:move_type_id(id, name)")
          .eq("id", moveId)
          .single();
        if (error) throw error;
        if (!data || !isActive) return;
        const normalized: MoveWithType = {
          ...data,
          move_type: Array.isArray(data.move_type) ? data.move_type[0] : data.move_type,
        };
        setMove(normalized);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "Failed to load move");
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchMove();
    return () => { isActive = false; };
  }, [moveId]);

  if (loading) return (
    <div
      className={`${styles.moveBtn} ${styles.skeleton}`}
      role="status"
      aria-label="Loading move"
      aria-busy="true"
    />
  );

  if (error || !move) return (
    <button
      type="button"
      className={[styles.moveBtn, styles.typeNormal, styles[shape], shadow ? styles.withShadow : ""].join(" ")}
      disabled
      aria-label={error ?? "Move unavailable"}
      title={error ?? "Move unavailable"}
    >
      <div className={styles.left}>
        <span className={styles.moveName}>Move unavailable</span>
        <span className={styles.typeTag}>Unknown</span>
      </div>
      <div className={styles.right}>
        <span className={styles.moveStat} aria-label="Damage unknown">⚔️ --</span>
        <span className={styles.moveStat} aria-label="Accuracy unknown">--%</span>
      </div>
    </button>
  );

  const typeClass = styles[`type${move.move_type.name.charAt(0).toUpperCase()}${move.move_type.name.slice(1).toLowerCase()}`] ?? styles.typeNormal;

  return (
    <button
      type="button"
      className={[styles.moveBtn, typeClass, styles[shape], shadow ? styles.withShadow : ""].join(" ")}
      onClick={() => onSelect(move)}
      disabled={disabled}
      aria-label={`${move.name}, ${move.move_type.name} type, ${move.damage} damage, ${move.chance}% accuracy`}
    >
      <div className={styles.left}>
        <span className={styles.moveName}>{move.name}</span>
        <span className={styles.typeTag}>{move.move_type.name}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.moveStat} aria-label={`Damage: ${move.damage}`}>⚔️ {move.damage}</span>
        <span className={styles.moveStat} aria-label={`Accuracy: ${move.chance}%`}>{move.chance}%</span>
      </div>
    </button>
  );
};

export default MoveButton;