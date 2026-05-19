import { useState, useEffect } from "react";
import type { Creature, Move, Type } from "../types/creature.types";
import {
  getCreatures,
  getTypes,
  getMoves,
  getUserCreature,
  getUserCreatureById,
} from "../database/creature.database";

// Hook that handles loading/error state for any async fetch.
// FetchedData is a placeholder for the data type gets passed in
export function useAsyncData<FetchedData>(
  fetcher: () => Promise<FetchedData | null>,
  enabled: boolean,
) {
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

    async function load() {
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

export function useCreature() {
  const [creatures, setCreatures] = useState<Creature[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getCreatures();
      if (data) setCreatures(data);
    }
    load();
  }, []);

  return { creatures };
}

export function useUserCreature(userId: string | null) {
  const { data, loading, error } = useAsyncData(
    () => (userId ? getUserCreature(userId) : Promise.resolve(null)),
    Boolean(userId),
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

export function useCreatureById(userId: string | null, creatureId: string) {
  const { data, loading, error } = useAsyncData(
    () =>
      userId && creatureId
        ? getUserCreatureById(userId, creatureId)
        : Promise.resolve(null),
    Boolean(userId) && Boolean(creatureId),
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

export function useType() {
  const [types, setTypes] = useState<Type[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getTypes();
      if (data) setTypes(data);
    }
    load();
  }, []);

  return { types };
}

export function useMoves() {
  const [moves, setMoves] = useState<Move[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getMoves();
      if (data) setMoves(data);
    }
    load();
  }, []);

  return { moves };
}
