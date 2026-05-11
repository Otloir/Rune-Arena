/*import Button from "./Button";
import { Move } from "../../../types/battle.types";

interface Props {
  move: Move;
  onClick: (move: Move) => void;
  disabled?: boolean;
}

export default function MoveButton({ move, onClick, disabled }: Props) {
  return (
    <Button
      label={move.name}
      onClick={() => onClick(move)}
      disabled={disabled}
      variant={`move ${move.type_type_id}`} // e.g. "fire", "water"
    />
  );
}*/
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

  useEffect(() => {
    supabase
      .from("Moves")
      .select("id, name, damage, chance, move_type_id, move_type:move_type_id(id, name)")
      .eq("id", moveId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const normalized: MoveWithType = {
          ...data,
          move_type: Array.isArray(data.move_type) ? data.move_type[0] : data.move_type,
        };
        setMove(normalized);
        setLoading(false);
      });
  }, [moveId]);

  if (loading) return <div className={`${styles.moveBtn} ${styles.skeleton}`} />;
  if (!move) return null;

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