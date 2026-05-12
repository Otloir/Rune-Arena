import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { MoveWithType } from "./../../../types/move.types";
import styles from "./MoveButton.module.css";

interface MoveButtonProps {
  moveId: number;
  onSelect: (move: MoveWithType) => void;
  disabled?: boolean;
  shape?: "default" | "pill";
  shadow?: boolean;
}

const MoveButton: React.FC<MoveButtonProps> = ({
  moveId,
  onSelect,
  disabled = false,
  shape = "default",
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

        if (error) {
          throw error;
        }

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
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchMove();

    return () => {
      isActive = false;
    };
  }, [moveId]);

  if (loading) return <div className={`${styles.moveBtn} ${styles.skeleton}`} />;
  if (error || !move) {
    return (
      <button
        type="button"
        className={[
          styles.moveBtn,
          styles.normal,
          styles[shape],
          shadow ? styles.shadow : "",
        ].join(" ")}
        disabled
        title={error ?? "Move unavailable"}
        aria-label={error ?? "Move unavailable"}
      >
        <div className={styles.left}>
          <span className={styles.moveName}>Move unavailable</span>
          <span className={styles.typeTag}>Unknown</span>
        </div>
        <div className={styles.right}>
          <span className={styles.stat} title="Damage">⚔️ --</span>
          <span className={styles.stat} title="Accuracy">--%</span>
        </div>
      </button>
    );
  }

  const typeName = move.move_type.name.toLowerCase();

  return (
    <button
      type="button"
      className={[
        styles.moveBtn,
        styles[typeName] ?? styles.normal,
        styles[shape],
        shadow ? styles.shadow : "",
      ].join(" ")}
      onClick={() => onSelect(move)}
      disabled={disabled}
    >
      <div className={styles.left}>
        <span className={styles.moveName}>{move.name}</span>
        <span className={styles.typeTag}>{move.move_type.name}</span>
      </div>
      <div className={styles.right}>
        <span className={styles.stat} title="Damage">⚔️ {move.damage}</span>
        <span className={styles.stat} title="Accuracy">{move.chance}%</span>
      </div>
    </button>
  );
};

export default MoveButton;