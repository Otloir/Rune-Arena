import { supabase } from "../lib/supabase";
import type { MoveWithType } from "../types/move.types";

export async function getMoveById(moveId: number | string ): Promise<MoveWithType | null> {
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

  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }

  return {
    ...data,
    move_type: Array.isArray(data.move_type) ? data.move_type[0] : data.move_type,
  } as MoveWithType;
}