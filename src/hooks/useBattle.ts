import { useState, useEffect, useCallback } from "react";
import type { MoveWithType } from "../types/move.types";
import type { Creature } from "../types/creature.types";
import { getMoveById } from "../database/move.database";
import { supabase } from "../lib/supabase";

export type TurnOwner = "player" | "opponent";

interface UseBattleProps {
  readonly playerCreature: Creature | null;
  readonly opponentCreature: Creature | null;
  readonly opponentCreatureId: number | string;
  readonly opponentLevel?: number;
}

// =========================
// HELPERS
// =========================

async function fetchCreatureMoveIds(
  creatureId: number,
  creatureLevel?: number,
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
  return data.map((e: { move_id: number }) => e.move_id).slice(0, 4);
}

async function fetchCreatureTypeIds(creatureId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from("Creature_Types")
    .select("type_id")
    .eq("creature_id", creatureId);

  if (error || !data) return [];
  return data.map((e: { type_id: number }) => e.type_id);
}

async function fetchAllTypeEffectiveness(): Promise<Map<number, Map<number, number>> | null> {
  const { data, error } = await supabase
    .from("Type_Effectiveness")
    .select("attacker_id, defender_id, effectiveness");

  if (error || !data) return null;

  const map = new Map<number, Map<number, number>>();
  for (const row of data) {
    if (!map.has(row.attacker_id)) {
      map.set(row.attacker_id, new Map());
    }
    map.get(row.attacker_id)!.set(row.defender_id, Number(row.effectiveness));
  }
  return map;
}

// =========================
// TYPE EFFECTIVENESS
// =========================

function getTypeMultiplier(
  map: Map<number, Map<number, number>>,
  attackerTypeId: number,
  defenderTypeIds: number[],
): number {
  const attackerMap = map.get(attackerTypeId);
  if (!attackerMap) return 1;

  return defenderTypeIds.reduce<number>((mult, defId) => {
    const value = attackerMap.get(defId);
    return value !== undefined ? mult * value : mult;
  }, 1);
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

interface DamageResult {
  readonly damage: number;
  readonly message: string | null;
}

async function calculateDamage(
  move: MoveWithType,
  defender: Creature,
  defenderTypes: number[],
  map: Map<number, Map<number, number>>,
): Promise<DamageResult> {
  const baseDmg = applyDefense(move.damage, defender.defense ?? 0);
  const multiplier = getTypeMultiplier(map, move.move_type_id, defenderTypes);

  let message: string | null = null;
  if (multiplier > 1) message = "It's super effective!";
  else if (multiplier < 1) message = "It's not very effective...";

  return {
    damage: Math.max(1, Math.floor(baseDmg * multiplier)),
    message,
  };
}

// =========================
// HOOK
// =========================

interface UseBattleResult {
  readonly playerHp: number;
  readonly opponentHp: number;
  readonly turnOwner: TurnOwner | null;
  readonly isProcessing: boolean;
  readonly battleLog: string[];
  readonly battleError: string | null;
  readonly handlePlayerMove: (move: MoveWithType) => Promise<void>;
}

export function useBattle({
  playerCreature,
  opponentCreature,
  opponentCreatureId,
  opponentLevel,
}: UseBattleProps): UseBattleResult {
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [opponentHp, setOpponentHp] = useState<number | null>(null);
  const [turnOwner, setTurnOwner] = useState<TurnOwner | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponentMoveIds, setOpponentMoveIds] = useState<number[]>([]);
  const [playerTypeIds, setPlayerTypeIds] = useState<number[]>([]);
  const [opponentTypeIds, setOpponentTypeIds] = useState<number[]>([]);
  const [effectivenessMap, setEffectivenessMap] =
    useState<Map<number, Map<number, number>> | null>(null);
  const [battleError, setBattleError] = useState<string | null>(null);

  const isReady: boolean =
    !!playerCreature && !!opponentCreature && effectivenessMap !== null;

  const log = useCallback((msg: string): void => {
    setBattleLog((prev) => [...prev, msg]);
  }, []);

  // =========================
  // INIT BATTLE
  // =========================

  useEffect((): void => {
    if (!playerCreature || !opponentCreature) return;

    setPlayerHp(playerCreature.hp);
    setOpponentHp(opponentCreature.hp);

    const first: TurnOwner =
      opponentCreature.speed > playerCreature.speed ? "opponent" : "player";

    setTurnOwner(first);
    setBattleLog([
      `${first === "player" ? playerCreature.name : opponentCreature.name} goes first!`,
    ]);
  }, [playerCreature, opponentCreature]);

  // =========================
  // LOAD EFFECTIVENESS
  // =========================

  useEffect((): void => {
    async function load(): Promise<void> {
      const map = await fetchAllTypeEffectiveness();
      if (map === null) {
        console.error("[useBattle] Failed to load Type_Effectiveness table.");
        setBattleError(
          "Could not load battle data. Please check your connection and try again.",
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

  useEffect((): void => {
    if (playerCreature?.id) {
      fetchCreatureTypeIds(Number(playerCreature.id)).then((ids: number[]): void => {
        if (ids.length === 0) {
          console.warn(
            `[useBattle] Player creature "${playerCreature.name}" has no types — ` +
            `damage multipliers will default to ×1.`,
          );
        }
        setPlayerTypeIds(ids);
      });
    }

    if (opponentCreature?.id) {
      fetchCreatureTypeIds(Number(opponentCreature.id)).then((ids: number[]): void => {
        if (ids.length === 0) {
          console.warn(
            `[useBattle] Opponent creature "${opponentCreature.name}" has no types — ` +
            `damage multipliers will default to ×1.`,
          );
        }
        setOpponentTypeIds(ids);
      });
    }
  }, [playerCreature, opponentCreature]);

  // =========================
  // LOAD OPPONENT MOVES
  // =========================

  useEffect((): void => {
    if (!opponentCreatureId) return;
    fetchCreatureMoveIds(Number(opponentCreatureId), opponentLevel).then(
      setOpponentMoveIds,
    );
  }, [opponentCreatureId, opponentLevel]);

  // =========================
  // PLAYER DAMAGE
  // =========================

  const damageOpponent = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (!isReady || !opponentCreature || !effectivenessMap) return;

      const attackerName = playerCreature?.name ?? "Your creature";

      if (!attackHits(move.chance ?? 100, opponentCreature.evade ?? 0)) {
        log(`${attackerName} used ${move.name}, but it missed!`);
        return;
      }

      const result = await calculateDamage(
        move,
        opponentCreature,
        opponentTypeIds,
        effectivenessMap,
      );

      setOpponentHp((prev) =>
        Math.max(0, (prev ?? opponentCreature.hp) - result.damage),
      );

      log(`${attackerName} used ${move.name} for ${result.damage} damage!`);
      if (result.message) log(result.message);
    },
    [isReady, playerCreature, opponentCreature, opponentTypeIds, effectivenessMap, log],
  );

  // =========================
  // OPPONENT DAMAGE
  // =========================

  const damagePlayer = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (!isReady || !playerCreature || !effectivenessMap) return;

      const attackerName = opponentCreature?.name ?? "The opponent";

      if (!attackHits(move.chance ?? 100, playerCreature.evade ?? 0)) {
        log(`${attackerName} used ${move.name}, but it missed!`);
        return;
      }

      const result = await calculateDamage(
        move,
        playerCreature,
        playerTypeIds,
        effectivenessMap,
      );

      setPlayerHp((prev) =>
        Math.max(0, (prev ?? playerCreature.hp) - result.damage),
      );

      log(`${attackerName} used ${move.name} for ${result.damage} damage!`);
      if (result.message) log(result.message);
    },
    [isReady, playerCreature, opponentCreature, playerTypeIds, effectivenessMap, log],
  );

  // =========================
  // NPC TURN
  // =========================

  const executeOpponentTurn = useCallback(
    async (ids: number[], currentOpponentHp: number): Promise<void> => {
      if (!ids.length) {
        log(`${opponentCreature?.name ?? "The opponent"} has no moves!`);
        setTurnOwner("player");
        return;
      }

      const move = await getMoveById(
        ids[Math.floor(Math.random() * ids.length)],
      );

      if (!move) {
        log("Opponent move failed.");
        setTurnOwner("player");
        return;
      }

      await damagePlayer(move);
      setTurnOwner("player");
    },
    [damagePlayer, opponentCreature, log],
  );

  // =========================
  // AUTO NPC TURN
  // =========================

  useEffect((): void => {
    if (
      turnOwner !== "opponent" ||
      isProcessing ||
      !opponentMoveIds.length ||
      !isReady
    )
      return;

    // FIX 1: Don't let the opponent attack if it's already dead
    const currentOpponentHp = opponentHp ?? 0;
    if (currentOpponentHp <= 0) return;

    const run = async (): Promise<void> => {
      setIsProcessing(true);
      await new Promise<void>((r) => setTimeout(r, 800));
      await executeOpponentTurn(opponentMoveIds, currentOpponentHp);
      setIsProcessing(false);
    };

    run();
  }, [turnOwner, isProcessing, opponentMoveIds, executeOpponentTurn, isReady, opponentHp]);

  // =========================
  // PLAYER MOVE
  // =========================

  const handlePlayerMove = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);
      await damageOpponent(move);

      // FIX 1: Only pass the turn to the opponent if it's still alive
      // Read the latest HP from state via functional update to avoid stale closure
      setOpponentHp((currentHp) => {
        const hp = currentHp ?? 0;
        if (hp > 0) {
          setTurnOwner("opponent");
        }
        return hp;
      });

      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damageOpponent],
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
  };
}