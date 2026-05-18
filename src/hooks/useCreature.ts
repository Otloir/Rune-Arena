import { useState, useEffect } from "react";
import type { Creature, Move, Type } from "../types/creature.types";
import {
  getCreatures,
  getTypes,
  getMoves,
  getUserCreature,
  getUserCreatureById,
} from "../api/creature.database";

// Hook that handles loading/error state for any async fetch.
// FetchedData is a placeholder for the data type gets passed in
export function useAsyncData<FetchedData>(
  fetcher: () => Promise<FetchedData | null>,
  enabled: boolean,
): {
  data: FetchedData | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<FetchedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await fetcher();
        if (!result) {
          setError("No data found");
          return;
        }
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [enabled]);

  return { data, loading, error };
}

export function useCreature(): { creatures: Creature[] } {
  const [creatures, setCreatures] = useState<Creature[]>([]);

  useEffect(() => {
    async function load(): Promise<void> {
      const data = await getCreatures();
      if (data) setCreatures(data);
    }
    load();
  }, []);

  return { creatures };
}

export function useUserCreature(userId: number): {
  creature: Creature | null;
  level: number;
  currentXp: number;
  xpRequired: number;
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useAsyncData(
    () => getUserCreature(userId.toString()),
    userId > 0,
  );

  const creatureData = data
    ? Array.isArray(data.creature)
      ? data.creature[0]
      : data.creature
    : null;

  const levelData = data
    ? Array.isArray(data.level)
      ? data.level[0]
      : data.level
    : null;

  return {
    creature: creatureData ?? null,
    level: levelData?.level ?? 1,
    currentXp: data?.current_xp ?? 0,
    xpRequired: levelData?.xp_required ?? 500,
    loading,
    error,
  };
}

export function useCreatureById(userId: number, creatureId: number): {
  creature: Creature | null;
  level: number;
  currentXp: number;
  xpRequired: number;
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useAsyncData(
    () => getUserCreatureById(userId.toString(), creatureId.toString()),
    userId > 0 && creatureId > 0,
  );

  const creatureData = data
    ? Array.isArray(data.creature)
      ? data.creature[0]
      : data.creature
    : null;

  const levelData = data
    ? Array.isArray(data.level)
      ? data.level[0]
      : data.level
    : null;

  return {
    creature: creatureData ?? null,
    level: levelData?.level ?? 1,
    currentXp: data?.current_xp ?? 0,
    xpRequired: levelData?.xp_required ?? 500,
    loading,
    error,
  };
}

export function useType(): { types: Type[] } {
  const [types, setTypes] = useState<Type[]>([]);

  useEffect(() => {
    async function load(): Promise<void> {
      const data = await getTypes();
      if (data) setTypes(data);
    }
    load();
  }, []);

  return { types };
}

export function useMoves(): { moves: Move[] } {
  const [moves, setMoves] = useState<Move[]>([]);

  useEffect(() => {
    async function load(): Promise<void> {
      const data = await getMoves();
      if (data) setMoves(data);
    }
    load();
  }, []);

  return { moves };
}
