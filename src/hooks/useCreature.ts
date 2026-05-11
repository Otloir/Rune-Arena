import { useState, useEffect } from "react";
import type { Creature, Move, Type } from "../types/creature.types";
import {
  getCreatures,
  getTypes,
  getMoves,
  getUserCreature,
  getUserCreatureById,
} from "../api/creature.database";

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
  const [creature, setCreature] = useState<Creature | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [xpRequired, setXpRequired] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCreature(null);
      setLevel(1);
      setCurrentXp(0);
      setXpRequired(500);
      setError(null);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      setCreature(null);

      try {
        const userIdStr = String(userId);
        const data = await getUserCreature(userIdStr);

        if (!data) {
          setError(`Unable to load creature for user ${userId}`);
          return;
        }

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
            : `Failed to load creature for user ${userId}`,
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return { creature, level, currentXp, xpRequired, loading, error };
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

// Get a specific user's creature by creatureId + their level and XP
export function useCreatureById(
  userId: number,
  creatureId: number,
) {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [xpRequired, setXpRequired] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !creatureId) {
      setCreature(null);
      setLevel(1);
      setCurrentXp(0);
      setXpRequired(500);
      setError(null);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      setCreature(null);

      try {
        const userIdStr = String(userId);
        const creatureIdStr = String(creatureId);
        const data = await getUserCreatureById(userIdStr, creatureIdStr);

        if (!data) {
          setError(`Unable to load creature ${creatureId} for user ${userId}`);
          return;
        }

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
            : `Failed to load creature ${creatureId} for user ${userId}`,
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, creatureId]);

  return { creature, level, currentXp, xpRequired, loading, error };
}
