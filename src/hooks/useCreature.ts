import { useState, useEffect } from "react";
import type { Creature, Move, Type } from "../types/creature.types";
import {
  getCreatures,
  getTypes,
  getMoves,
  getUserCreature,
  getUserCreatureById,
} from "../api/creature.database";

// Load creature data
function useLoadCreature(
  fetcher: () => Promise<any>,
  deps: any[],
  errorPrefix: string,
) {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [xpRequired, setXpRequired] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setCreature(null);

      try {
        const data = await fetcher();

        if (!data) {
          setError(`${errorPrefix}: Unable to load creature`);
          return;
        }

        // Normalize creature and level (handle both single object and array)
        const creatureData = Array.isArray(data.creature)
          ? data.creature[0]
          : data.creature;
        const levelData = Array.isArray(data.level)
          ? data.level[0]
          : data.level;

        setCreature(creatureData);
        setLevel(levelData.level);
        setCurrentXp(data.current_xp);
        setXpRequired(levelData.xp_required);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `${errorPrefix}: Failed to load creature`,
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, deps);

  return { creature, level, currentXp, xpRequired, loading, error };
}

// Get all creatures
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

// Get a user's active creature + their level and XP
export function useUserCreature(userId: string | number | undefined) {
  if (!userId) {
    return {
      creature: null,
      level: 1,
      currentXp: 0,
      xpRequired: 500,
      loading: false,
      error: null,
    };
  }

  const userIdStr = String(userId);
  return useLoadCreature(
    () => getUserCreature(userIdStr),
    [userIdStr],
    `User ${userId}`,
  );
}

// Get a specific user's creature by creatureId + their level and XP
export function useCreatureById(userId: number, creatureId: number) {
  if (!userId || !creatureId) {
    return {
      creature: null,
      level: 1,
      currentXp: 0,
      xpRequired: 500,
      loading: false,
      error: null,
    };
  }

  const userIdStr = String(userId);
  const creatureIdStr = String(creatureId);

  return useLoadCreature(
    () => getUserCreatureById(userIdStr, creatureIdStr),
    [userIdStr, creatureIdStr],
    `User ${userId} Creature ${creatureId}`,
  );
}

// Get all types
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

// Get all moves
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
