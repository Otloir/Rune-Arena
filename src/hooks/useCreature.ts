import { useState, useEffect } from "react";
import type { Creature, Move, Type, Level, CreatureMoveEntry } from "../types/creature.types";
import {
  getCreatures,
  getTypes,
  getMoves,
  getUserCreature,
  getUserCreatureById,
  getMoveIdsByCreatureId,
  getTypesByCreatureId,
  getLevelById,
} from "../database/creature.database";

// Hook that handles loading/error state for any async fetch.
// The `enabled` flag lets callers defer fetching (e.g. until a modal opens).
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

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const result = await fetcher();
        if (cancelled) return;
        if (!result) {
          setError("No data found");
          return;
        }
        setData(result);
        setError(null);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Cleanup: ignore stale responses if creatureId or enabled changes mid-flight
    return (): void => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export function useUserCreature(userId: number | string): {
  creature: Creature | null;
  level: number;
  levelId: number | null;
  currentXp: number;
  xpRequired: number;
  loading: boolean;
  error: string | null;
} {
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
    levelId: levelData?.id ?? null,
    currentXp: data?.current_xp ?? 0,
    xpRequired: levelData?.xp_required ?? 500,
    loading,
    error,
  };
}

export function useCreatureById(
  userId: string | number,
  creatureId: number | string,
): {
  creature: Creature | null;
  level: number;
  levelId: number | null;
  currentXp: number;
  xpRequired: number;
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useAsyncData(
    () =>
      userId && creatureId
        ? getUserCreatureById(String(userId), String(creatureId))
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
    levelId: levelData?.id ?? null,
    currentXp: data?.current_xp ?? 0,
    xpRequired: levelData?.xp_required ?? 500,
    loading,
    error,
  };
}

/**
 * Fetches all moves for a creature paired with their required level_id.
 * Only fires when `enabled` is true (e.g. when the info modal is open).
 */
export function useCreatureMoveIds(
  creatureId: Creature["id"] | null,
  enabled: boolean,
): {
  readonly moveEntries: readonly CreatureMoveEntry[];
  readonly loading: boolean;
  readonly error: string | null;
} {
  const [moveEntries, setMoveEntries] = useState<readonly CreatureMoveEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): (() => void) | void => {
    if (!enabled || !creatureId) {
      setMoveEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const entries = await getMoveIdsByCreatureId(creatureId!);
        if (cancelled) return;
        setMoveEntries(entries ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load moves");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return (): void => {
      cancelled = true;
    };
  }, [creatureId, enabled]);

  return { moveEntries, loading, error };
}

/**
 * Resolves a level_id (FK to Levels.id) to the full Level row,
 * giving access to the display level number and xp_required.
 * Only fires when `enabled` is true.
 */
export function useLevelById(
  levelId: number | null,
  enabled: boolean,
): {
  readonly level: Level | null;
  readonly loading: boolean;
  readonly error: string | null;
} {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): (() => void) | void => {
    if (!enabled || levelId === null) {
      setLevel(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const result = await getLevelById(levelId!);
        if (cancelled) return;
        setLevel(result);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load level");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return (): void => {
      cancelled = true;
    };
  }, [levelId, enabled]);

  return { level, loading, error };
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

/**
 * Fetches the types belonging to a creature (e.g. Fire, Grass).
 * Only fires when `enabled` is true, so callers can defer until needed.
 */
export function useCreatureTypes(
  creatureId: Creature["id"] | null,
  enabled: boolean,
): {
  readonly types: readonly Type[];
  readonly loading: boolean;
  readonly error: string | null;
} {
  const [types, setTypes] = useState<readonly Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect((): (() => void) | void => {
    if (!enabled || !creatureId) {
      setTypes([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const result = await getTypesByCreatureId(creatureId!);
        if (cancelled) return;
        setTypes(result ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load types");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return (): void => {
      cancelled = true;
    };
  }, [creatureId, enabled]);

  return { types, loading, error };
}