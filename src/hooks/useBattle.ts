import { useState, useEffect, useCallback } from "react";
import type { MoveWithType } from "../types/move.types";
import type { Creature } from "../types/creature.types";
import { getMoveById } from "../database/move.database";
import { supabase } from "../lib/supabase";


export type BattleMode = "pve" | "pvp";
export type TurnOwner = "player" | "opponent";

interface UseBattleProps {
  playerCreature: Creature | null;
  opponentCreature: Creature | null;
  opponentCreatureId: number;
  opponentLevel?: number;
  mode: BattleMode;
}

// =========================
// HELPERS
// =========================

async function fetchCreatureMoveIds(
  creatureId: number,
  creatureLevel?: number
): Promise<number[]> {
  let query = supabase
    .from("Creature_Moves")
    .select("move_id, level_id")
    .eq("creature_id", creatureId)
    .order("level_id", { ascending: true });

  if (creatureLevel !== undefined) {
    query = query.lte("level_id", creatureLevel);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((e) => e.move_id).slice(0, 4);
}

async function fetchCreatureTypeIds(creatureId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from("Creature_Types")
    .select("type_id")
    .eq("creature_id", creatureId);

  if (error || !data) return [];
  return data.map((e) => e.type_id);
}

async function fetchAllTypeEffectiveness(): Promise<Map<number, Map<number, number>> | null> {
  const { data, error } = await supabase
    .from("Type_Effectiveness")
    .select("attacker_id, defender_id, effectiveness");

  if (error || !data) return null; // null = fetch failed, distinct from an empty table

  const map = new Map<number, Map<number, number>>();

  for (const row of data) {
    if (!map.has(row.attacker_id)) {
      map.set(row.attacker_id, new Map());
    }

    map.get(row.attacker_id)!.set(
      row.defender_id,
      Number(row.effectiveness)
    );
  }

  return map;
}

// =========================
// TYPE EFFECTIVENESS
// =========================

function getTypeMultiplier(
  map: Map<number, Map<number, number>>,
  attackerTypeId: number,
  defenderTypeIds: number[]
): number {
  let multiplier = 1;

  const attackerMap = map.get(attackerTypeId);
  if (!attackerMap) return 1;

  for (const defId of defenderTypeIds) {
    const value = attackerMap.get(defId);
    if (value !== undefined) {
      multiplier *= value;
    }
  }

  return multiplier;
}

// =========================
// BATTLE LOGIC
// =========================

function attackHits(moveChance = 100, evade = 0): boolean {
  const final = Math.max(5, Math.min(100, moveChance - evade));
  return Math.random() * 100 < final;
}

function applyDefense(damage: number, defense = 0): number {
  const mult = Math.max(0, 1 - defense / 100);
  return Math.max(1, Math.floor(damage * mult));
}

type DamageResult = {
  damage: number;
  message: string | null;
};

async function calculateDamage(
  move: MoveWithType,
  defender: Creature,
  defenderTypes: number[],
  map: Map<number, Map<number, number>>
): Promise<DamageResult> {
  let dmg = applyDefense(move.damage, defender.defense ?? 0);

  const multiplier = getTypeMultiplier(
    map,
    move.move_type_id,
    defenderTypes
  );

  let message: string | null = null;

  if (multiplier > 1) message = "It's super effective!";
  else if (multiplier < 1) message = "It's not very effective...";

  dmg = Math.max(1, Math.floor(dmg * multiplier));

  return {
    damage: dmg,
    message,
  };
}

// =========================
// HOOK
// =========================

export function useBattle({
  playerCreature,
  opponentCreature,
  opponentCreatureId,
  opponentLevel,
  mode,
}: UseBattleProps): {
  playerHp: number;
  opponentHp: number;
  turnOwner: TurnOwner | null;
  isProcessing: boolean;
  battleLog: string[];
  battleError: string | null;
  handlePlayerMove: (move: MoveWithType) => Promise<void>;
  handleOpponentMove: (move: MoveWithType) => Promise<void>;
} {
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [opponentHp, setOpponentHp] = useState<number | null>(null);
  const [turnOwner, setTurnOwner] = useState<TurnOwner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponentMoveIds, setOpponentMoveIds] = useState<number[]>([]);
  const [playerTypeIds, setPlayerTypeIds] = useState<number[]>([]);
  const [opponentTypeIds, setOpponentTypeIds] = useState<number[]>([]);
  const [effectivenessMap, setEffectivenessMap] =
    useState<Map<number, Map<number, number>> | null>(null);
  const [battleError, setBattleError] = useState<string | null>(null);

  // =========================
  // READY STATE
  // =========================
  const isReady =
    !!playerCreature &&
    !!opponentCreature &&
    effectivenessMap !== null; // null means still loading or load failed

  const log = useCallback((msg: string) => {
    setBattleLog((p) => [...p, msg]);
  }, []);

  // =========================
  // INIT BATTLE
  // =========================

  useEffect(() => {
    if (!playerCreature || !opponentCreature) return;

    setPlayerHp(playerCreature.hp);
    setOpponentHp(opponentCreature.hp);

    const first =
      opponentCreature.speed > playerCreature.speed
        ? "opponent"
        : "player";

    setTurnOwner(first);

    setBattleLog([
      `${first === "player" ? playerCreature.name : opponentCreature.name} goes first!`,
    ]);
  }, [playerCreature, opponentCreature]);

  // =========================
  // LOAD EFFECTIVENESS
  // =========================

  useEffect(() => {
    async function load(): Promise<void> {
      const map = await fetchAllTypeEffectiveness();

      if (map === null) {
        console.error("[useBattle] Failed to load Type_Effectiveness table.");
        setBattleError(
          "Could not load battle data. Please check your connection and try again."
        );
        return;
      }

      setEffectivenessMap(map);
    }
    load();
  }, []);

  // =========================
  // LOAD TYPES
  // =========================

  useEffect(() => {
    if (playerCreature?.id) {
      fetchCreatureTypeIds(Number(playerCreature.id)).then((ids) => {
        if (ids.length === 0) {
          console.warn(
            `[useBattle] Player creature "${playerCreature.name}" (id: ${playerCreature.id}) ` +
            `has no types in the database. Damage multipliers will default to ×1.`
          );
        }
        setPlayerTypeIds(ids);
      });
    }

    if (opponentCreature?.id) {
      fetchCreatureTypeIds(Number(opponentCreature.id)).then((ids) => {
        if (ids.length === 0) {
          console.warn(
            `[useBattle] Opponent creature "${opponentCreature.name}" (id: ${opponentCreature.id}) ` +
            `has no types in the database. Damage multipliers will default to ×1.`
          );
        }
        setOpponentTypeIds(ids);
      });
    }
  }, [playerCreature, opponentCreature]);

  // =========================
  // LOAD MOVES
  // =========================

  useEffect(() => {
    if (mode !== "pve" || !opponentCreatureId) return;

    fetchCreatureMoveIds(opponentCreatureId, opponentLevel).then(setOpponentMoveIds);
  }, [opponentCreatureId, opponentLevel, mode]);

  // =========================
  // PLAYER DAMAGE
  // =========================

  const damageOpponent = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (!isReady || !opponentCreature || !effectivenessMap) return;

      const attackerName = playerCreature?.name ?? "Your creature";
      const moveName = move.name;

      if (!attackHits(move.chance ?? 100, opponentCreature.evade ?? 0)) {
        log(`${attackerName} used ${moveName}, but it missed!`);
        return;
      }

      const result = await calculateDamage(
        move,
        opponentCreature,
        opponentTypeIds,
        effectivenessMap
      );

      setOpponentHp((p) =>
        Math.max(0, (p ?? opponentCreature.hp) - result.damage)
      );

      log(`${attackerName} used ${moveName} for ${result.damage} damage!`);

      if (result.message) {
        log(result.message);
      }
    },
    [isReady, playerCreature, opponentCreature, opponentTypeIds, effectivenessMap, log]
  );

  // =========================
  // OPPONENT DAMAGE
  // =========================

  const damagePlayer = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (!isReady || !playerCreature || !effectivenessMap) return;

      const attackerName = opponentCreature?.name ?? "The opponent";
      const moveName = move.name;

      if (!attackHits(move.chance ?? 100, playerCreature.evade ?? 0)) {
        log(`${attackerName} used ${moveName}, but it missed!`);
        return;
      }

      const result = await calculateDamage(
        move,
        playerCreature,
        playerTypeIds,
        effectivenessMap
      );

      setPlayerHp((p) =>
        Math.max(0, (p ?? playerCreature.hp) - result.damage)
      );

      log(`${attackerName} used ${moveName} for ${result.damage} damage!`);

      if (result.message) {
        log(result.message);
      }
    },
    [isReady, playerCreature, opponentCreature, playerTypeIds, effectivenessMap, log]
  );

  // =========================
  // NPC TURN
  // =========================

  const executeOpponentTurn = useCallback(
    async (ids: number[]): Promise<void> => {
      if (!ids.length) {
        log(`${opponentCreature?.name ?? "The opponent"} has no moves!`);
        setTurnOwner("player");
        return;
      }

      const move = await getMoveById(
        ids[Math.floor(Math.random() * ids.length)]
      );

      if (!move) {
        log("Opponent move failed.");
        setTurnOwner("player");
        return;
      }

      await damagePlayer(move);
      setTurnOwner("player");
    },
    [damagePlayer, opponentCreature, log]
  );

  // =========================
  // AUTO NPC TURN
  // =========================

  useEffect(() => {
    if (
      mode !== "pve" ||
      turnOwner !== "opponent" ||
      isProcessing ||
      !opponentMoveIds.length ||
      !isReady
    ) return;

    const run = async (): Promise<void> => {
      setIsProcessing(true);
      await new Promise((r) => setTimeout(r, 800));
      await executeOpponentTurn(opponentMoveIds);
      setIsProcessing(false);
    };

    run();
  }, [
    mode,
    turnOwner,
    isProcessing,
    opponentMoveIds,
    executeOpponentTurn,
    isReady,
  ]);

  // =========================
  // PLAYER MOVE
  // =========================

  const handlePlayerMove = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);
      await damageOpponent(move);
      setTurnOwner("opponent");
      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damageOpponent]
  );

  // =========================
  // PVP MOVE
  // =========================

  const handleOpponentMove = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (turnOwner !== "opponent" || isProcessing) return;

      setIsProcessing(true);
      await damagePlayer(move);
      setTurnOwner("player");
      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damagePlayer]
  );

  // =========================
  // RETURN
  // =========================

  return {
    playerHp: playerHp ?? playerCreature?.hp ?? 0,
    opponentHp: opponentHp ?? opponentCreature?.hp ?? 0,
    turnOwner,
    isProcessing,
    battleLog,
    battleError,
    handlePlayerMove,
    handleOpponentMove,
  };
}