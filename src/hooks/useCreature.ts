import { useState, useEffect } from "react";
import type {
  Creature,
  Move,
  Type,
} from "../types/creature.types";
import { getCreatures, getTypes, getMoves } from "../api/creature.database";

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
  