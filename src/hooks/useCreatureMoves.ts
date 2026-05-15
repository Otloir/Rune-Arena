// hooks/useCreatureMoves.ts
import { useAsyncData } from "./useCreature";
import { supabase } from "../lib/supabase";

export function useCreatureMoves(creatureId: number, creatureLevel?: number) {
  const { data: moveIds, loading, error } = useAsyncData<number[]>(
    async () => {
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
      return data?.map((entry) => entry.move_id).slice(0, 4) ?? [];
    },
    creatureId > 0,
  );

  return { moveIds, loading, error };
}