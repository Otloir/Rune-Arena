import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { MoveWithType } from "../types/move.types";

export function useMove(moveId: number) {
  const [move, setMove] = useState<MoveWithType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchMove = async () => {
      setLoading(true);
      setError(null);
      setMove(null);

      try {
        const { data, error } = await supabase
          .from("Moves")
          .select(`
            id,
            name,
            damage,
            chance,
            move_type_id,
            move_type:move_type_id (
              id,
              name
            )
          `)
          .eq("id", moveId)
          .single();

        if (error) throw error;
        if (!data || !isActive) return;

        const normalized: MoveWithType = {
          ...data,
          move_type: Array.isArray(data.move_type)
            ? data.move_type[0]
            : data.move_type,
        };

        setMove(normalized);
      } catch (err) {
        if (!isActive) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load move."
        );
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

  return {
    move,
    loading,
    error,
  };
}