import { useAsyncData } from "./useCreature";
import { getMoveById } from "../database/move.database";
import type { MoveWithType } from "../types/move.types";

export function useMove(moveId: number) {
  const { data: move, loading, error } = useAsyncData<MoveWithType>(
    () => getMoveById(moveId),
    moveId > 0,
  );

  return { move, loading, error };
}