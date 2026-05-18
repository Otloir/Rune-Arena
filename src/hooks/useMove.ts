import { useAsyncData } from "./useCreature";
import { getMoveById } from "../api/move.database";
import type { MoveWithType } from "../types/move.types";

export function useMove(moveId: number): {
  move: MoveWithType | null;
  loading: boolean;
  error: string | null;
} {
  const { data: move, loading, error } = useAsyncData<MoveWithType>(
    () => getMoveById(moveId),
    moveId > 0,
  );

  return { move, loading, error };
}