import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import MoveButton from "../../atoms/buttons/MoveButton";
import type { MoveWithType } from "../../../types/move.types";
import styles from "./MovesPanel.module.css";

interface MovesPanelProps {
  creatureId: number;
  creatureLevel?: number;
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
  const [moveIds, setMoveIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchCreatureMoves = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("Creature_Moves")
          .select("move_id, level_id")
          .eq("creature_id", creatureId)
          .order("level_id", { ascending: true });

        if (creatureLevel !== undefined) {
          query = query.lte("level_id", creatureLevel);
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!isActive) return;

        const resolvedMoveIds =
          data?.map((entry) => entry.move_id).slice(0, 4) ?? [];

        setMoveIds(resolvedMoveIds);
      } catch (err) {
        if (!isActive) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load creature moves.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCreatureMoves();

    return () => {
      isActive = false;
    };
  }, [creatureId, creatureLevel]);

  if (loading) {
    return (
      <section
        className={styles.movesPanel}
        aria-label="Loading available battle moves"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={styles.emptyMoveSlot}
            aria-hidden="true"
          >
            Loading...
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={styles.movesPanel}
        aria-label="Move selection unavailable"
      >
        <div className={styles.errorMessage}>
          Failed to load moves.
        </div>
      </section>
    );
  }

  const paddedMoveIds = [...moveIds];

  while (paddedMoveIds.length < 4) {
    paddedMoveIds.push(0);
  }

  return (
    <section
      className={styles.movesPanel}
      aria-label="Available battle moves"
    >
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
            No Move
          </button>
        ),
      )}
    </section>
  );
}