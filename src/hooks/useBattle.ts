import { useState, useEffect, useCallback } from "react";
import type { MoveWithType } from "../types/move.types";
import type { Creature } from "../types/creature.types";
import type { Item } from "../types/item.types";
import type { StatBoosts } from "../types/battleEffects.types";
import { getMoveById } from "../database/move.database";
import { supabase } from "../lib/supabase";
import { awardXpToCreature } from "../database/creature.database";

export type TurnOwner = "player" | "opponent";

// Add to UseBattleProps:
interface UseBattleProps {
  playerCreature: Creature | null;
  opponentCreature: Creature | null;
  opponentCreatureId: number | string;
  opponentLevel?: number;
  playerUserId: number | string;
  playerCreatureId: number | string;
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

async function fetchAllTypeEffectiveness(): Promise<Map<
  number,
  Map<number, number>
> | null> {
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
  map: Map<number, Map<number, number>>,
): Promise<DamageResult> {
  // Defense is intentionally NOT applied here — callers handle it so that
  // stat boosts (items) can be factored in before the single reduction.
  let dmg = move.damage;
 
  const multiplier = getTypeMultiplier(map, move.move_type_id, defenderTypes);
 
  let message: string | null = null;
 
  if (multiplier > 1) message = "It's super effective!";
  else if (multiplier < 1) message = "It's not very effective...";
 
  dmg = Math.max(1, Math.floor(dmg * multiplier));
 
  return { damage: dmg, message };
}

// =========================
// HOOK
// =========================

export function useBattle({
  playerCreature,
  opponentCreature,
  opponentCreatureId,
  opponentLevel,
  playerUserId,
  playerCreatureId,
}: UseBattleProps): {
  playerHp: number;
  opponentHp: number;
  turnOwner: TurnOwner | null;
  isProcessing: boolean;
  battleLog: string[];
  battleError: string | null;
  xpGained: number;
  playerStatBoosts: StatBoosts;
  handlePlayerMove: (move: MoveWithType) => Promise<void>;
  handlePlayerUseItem: (item: Item) => Promise<void>;
} {
  const [xpGained, setXpGained] = useState(0);
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [opponentHp, setOpponentHp] = useState<number | null>(null);
  const [turnOwner, setTurnOwner] = useState<TurnOwner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponentMoveIds, setOpponentMoveIds] = useState<number[]>([]);
  const [playerTypeIds, setPlayerTypeIds] = useState<number[]>([]);
  const [opponentTypeIds, setOpponentTypeIds] = useState<number[]>([]);
  const [effectivenessMap, setEffectivenessMap] = useState<Map<
    number,
    Map<number, number>
  > | null>(null);
  const [battleError, setBattleError] = useState<string | null>(null);
  const [playerStatBoosts, setPlayerStatBoosts] = useState<StatBoosts>({
    evadeBoost: 0,
    speedBoost: 0,
    defenseBoost: 0,
  });

  // =========================
  // READY STATE
  // =========================

  const isReady =
    !!playerCreature && !!opponentCreature && effectivenessMap !== null;

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
      opponentCreature.speed > playerCreature.speed ? "opponent" : "player";

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

  useEffect(() => {
    if (playerCreature?.id) {
      fetchCreatureTypeIds(Number(playerCreature.id)).then((ids) => {
        if (ids.length === 0) {
          console.warn(
            `[useBattle] Player creature "${playerCreature.name}" (id: ${playerCreature.id}) ` +
              `has no types in the database. Damage multipliers will default to ×1.`,
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
              `has no types in the database. Damage multipliers will default to ×1.`,
          );
        }
        setOpponentTypeIds(ids);
      });
    }
  }, [playerCreature, opponentCreature]);

  // =========================
  // LOAD OPPONENT MOVES
  // =========================

  useEffect(() => {
    if (!opponentCreatureId) return;
    fetchCreatureMoveIds(Number(opponentCreatureId), opponentLevel).then(
      setOpponentMoveIds,
    );
  }, [opponentCreatureId, opponentLevel]);

  // =========================
  // PLAYER DAMAGE
  // =========================

  const damageOpponent = useCallback(
    async (move: MoveWithType): Promise<boolean> => {
      if (!isReady || !opponentCreature || !effectivenessMap) return false;
  
      const attackerName = playerCreature?.name ?? "Your creature";
      const moveName = move.name;
  
      if (!attackHits(move.chance ?? 100, opponentCreature.evade ?? 0)) {
        log(`${attackerName} used ${moveName}, but it missed!`);
        return true;
      }
  
      const result = await calculateDamage(
        move,
        opponentCreature,
        opponentTypeIds,
        effectivenessMap,
      );
  
      // Apply defense once — opponent has no boosts
      const finalDamage = applyDefense(result.damage, opponentCreature.defense ?? 0);
  
      const currentHp = opponentHp ?? opponentCreature.hp;
      const newHp = Math.max(0, currentHp - finalDamage);
  
      setOpponentHp(newHp);
      log(`${attackerName} used ${moveName} for ${finalDamage} damage!`);
      if (result.message) log(result.message);
  
      if (newHp <= 0) {
        const awarded = await awardXpToCreature(playerUserId, playerCreatureId, 100);
        if (awarded) {
          setXpGained(100);
          log(`${attackerName} gained 100 XP!`);
        }
        return false;
      }
  
      return true;
    },
    [
      isReady,
      playerCreature,
      opponentCreature,
      opponentHp,
      opponentTypeIds,
      effectivenessMap,
      playerUserId,
      playerCreatureId,
      log,
    ],
  );

  // =========================
  // OPPONENT DAMAGE
  // =========================

  const damagePlayer = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (!isReady || !playerCreature || !effectivenessMap) return;
  
      const attackerName = opponentCreature?.name ?? "The opponent";
      const moveName = move.name;
  
      // Evade boost is flat points — add directly, same unit as base evade
      const effectiveEvade =
        (playerCreature.evade ?? 0) + playerStatBoosts.evadeBoost;
  
      if (!attackHits(move.chance ?? 100, effectiveEvade)) {
        log(`${attackerName} used ${moveName}, but it missed!`);
        return;
      }
  
      const result = await calculateDamage(
        move,
        playerCreature,
        playerTypeIds,
        effectivenessMap,
      );
  
      // Defense boost is percentage-based — scales off base stat
      const baseDefense = playerCreature.defense ?? 0;
      const defenseBoostAmount = Math.floor(
        (baseDefense * playerStatBoosts.defenseBoost) / 100,
      );
      const effectiveDefense = baseDefense + defenseBoostAmount;
      const finalDamage = applyDefense(result.damage, effectiveDefense);
  
      setPlayerHp((p) => Math.max(0, (p ?? playerCreature.hp) - finalDamage));
      log(`${attackerName} used ${moveName} for ${finalDamage} damage!`);
      if (result.message) log(result.message);
    },
    [
      isReady,
      playerCreature,
      opponentCreature,
      playerTypeIds,
      effectivenessMap,
      playerStatBoosts,
      log,
    ],
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

  useEffect(() => {
    if (
      turnOwner !== "opponent" ||
      isProcessing ||
      !opponentMoveIds.length ||
      !isReady
    )
      return;

    const run = async (): Promise<void> => {
      setIsProcessing(true);
      await new Promise((r) => setTimeout(r, 600));
      await executeOpponentTurn(opponentMoveIds);
      setIsProcessing(false);
    };

    run();
  }, [turnOwner, isProcessing, opponentMoveIds, executeOpponentTurn, isReady]);

  // =========================
  // PLAYER MOVE
  // =========================

  
  const applyItemEffect = useCallback(
    (item: Item): void => {
      const { property, propvalue } = item;
      const propLower = property.toLowerCase().trim();
  
      if (
        propLower === "hp" ||
        propLower === "health" ||
        propLower === "healing"
      ) {
        const currentHp = playerHp ?? playerCreature?.hp ?? 0;
        const maxHp = playerCreature?.hp ?? 0;
        const healed = Math.min(propvalue, maxHp - currentHp);
        setPlayerHp(currentHp + healed);
        log(
          `${playerCreature?.name ?? "Your creature"} recovered ${healed} HP!`,
        );
        return;
      }
  
      if (propLower === "evade") {
        // propvalue is added as flat evade points, matching the unit
        // used by attackHits() which subtracts evade directly from move chance.
        setPlayerStatBoosts((prev) => ({
          ...prev,
          evadeBoost: prev.evadeBoost + propvalue,
        }));
        log(
          `${playerCreature?.name ?? "Your creature"}'s evade increased by ${propvalue}!`,
        );
        return;
      }
  
      const boostMap: Record<string, keyof StatBoosts> = {
        defense: "defenseBoost",
        speed: "speedBoost",
      };
  
      const boostKey = boostMap[propLower];
      if (boostKey) {
        setPlayerStatBoosts((prev) => ({
          ...prev,
          [boostKey]: prev[boostKey] + propvalue,
        }));
        log(
          `${playerCreature?.name ?? "Your creature"}'s ${property} increased by ${propvalue}%!`,
        );
      } else {
        log(`Used ${item.name}... (effect unknown)`);
      }
    },
    [playerHp, playerCreature, log],
  );

  // =========================
  // PLAYER MOVE
  // =========================

  const handlePlayerMove = useCallback(
    async (move: MoveWithType): Promise<void> => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);
      await new Promise((r) => setTimeout(r, 800));
      const opponentAlive = await damageOpponent(move);

      if (opponentAlive) {
        setTurnOwner("opponent");
      }
      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damageOpponent],
  );

  const handlePlayerUseItem = useCallback(
    async (item: Item): Promise<void> => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);
      await new Promise((r) => setTimeout(r, 300));

      // Apply the item's effect
      applyItemEffect(item);

      // Using an item consumes the player's turn
      await new Promise((r) => setTimeout(r, 300));
      setTurnOwner("opponent");
      setIsProcessing(false);
    },
    [turnOwner, isProcessing, applyItemEffect],
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
    xpGained,
    playerStatBoosts,
    handlePlayerMove,
    handlePlayerUseItem,
  };
}
