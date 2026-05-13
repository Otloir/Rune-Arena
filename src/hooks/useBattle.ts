import { useState, useEffect, useCallback } from "react";
import type { MoveWithType } from "../types/move.types";
import type { Creature } from "../types/creature.types";
import { getMoveById } from "../api/move.database";
import { supabase } from "../lib/supabase";

export type BattleMode = "pve" | "pvp";
export type TurnOwner = "player" | "opponent";

interface UseBattleProps {
  playerCreature: Creature | null;
  opponentCreature: Creature | null;
  opponentCreatureId: number;
  mode: BattleMode;
}

// =========================
// DATABASE HELPERS
// =========================

// Fetch move IDs available to a creature
async function fetchCreatureMoveIds(
  creatureId: number,
  level?: number
): Promise<number[]> {
  let query = supabase
    .from("Creature_Moves")
    .select("move_id, level_id")
    .eq("creature_id", creatureId)
    .order("level_id", { ascending: true });

  if (level !== undefined) {
    query = query.lte("level_id", level);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((entry) => entry.move_id).slice(0, 4);
}

// Fetch all type IDs attached to a creature
async function fetchCreatureTypeIds(creatureId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from("Creature_Types")
    .select("type_id")
    .eq("creature_id", creatureId);

  if (error || !data) return [];

  return data.map((entry) => entry.type_id);
}

// Fetch type effectiveness multiplier
async function fetchTypeEffectiveness(
  attackerTypeId: number,
  defenderTypeIds: number[]
): Promise<number> {
  if (!defenderTypeIds.length) return 1;

  let multiplier = 1;

  for (const defenderTypeId of defenderTypeIds) {
    const { data, error } = await supabase
      .from("Type_Effectiveness")
      .select("effectiveness")
      .eq("attacker_id", attackerTypeId)
      .eq("defender_id", defenderTypeId)
      .single();

    if (!error && data?.effectiveness !== undefined) {
      multiplier *= Number(data.effectiveness);
    }
  }

  return multiplier;
}

// =========================
// BATTLE CALCULATIONS
// =========================

// Hit check
function attackHits(
  moveChance: number = 100,
  defenderEvade: number = 0
): boolean {
  const finalHitChance = Math.max(
    5,
    Math.min(100, moveChance - defenderEvade)
  );

  return Math.random() * 100 < finalHitChance;
}

// Defense reduction
function calculateDefenseAdjustedDamage(
  baseDamage: number,
  defense: number = 0
): number {
  const reductionMultiplier = Math.max(0, 1 - defense / 100);
  return Math.max(1, Math.floor(baseDamage * reductionMultiplier));
}

// Full damage pipeline
async function calculateFinalDamage(
  move: MoveWithType,
  defender: Creature,
  defenderTypeIds: number[]
): Promise<number> {
  // Step 1: defense
  let damage = calculateDefenseAdjustedDamage(
    move.damage,
    defender.defense ?? 0
  );

  // Step 2: type effectiveness
  if (move.move_type_id) {
    const effectiveness = await fetchTypeEffectiveness(
      move.move_type_id,
      defenderTypeIds
    );

    damage = Math.max(1, Math.floor(damage * effectiveness));
  }

  return damage;
}

export function useBattle({
  playerCreature,
  opponentCreature,
  opponentCreatureId,
  mode,
}: UseBattleProps) {
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [opponentHp, setOpponentHp] = useState<number | null>(null);
  const [turnOwner, setTurnOwner] = useState<TurnOwner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [opponentMoveIds, setOpponentMoveIds] = useState<number[]>([]);
  const [playerTypeIds, setPlayerTypeIds] = useState<number[]>([]);
  const [opponentTypeIds, setOpponentTypeIds] = useState<number[]>([]);

  // =========================
  // LOGGING
  // =========================
  const log = useCallback((message: string) => {
    setBattleLog((prev) => [...prev, message]);
  }, []);

  // =========================
  // INITIALIZE BATTLE
  // =========================
  useEffect(() => {
    if (!playerCreature || !opponentCreature) return;

    setPlayerHp(playerCreature.hp);
    setOpponentHp(opponentCreature.hp);

    const firstTurn: TurnOwner =
      opponentCreature.speed > playerCreature.speed
        ? "opponent"
        : "player";

    setTurnOwner(firstTurn);

    setBattleLog([
      `${
        firstTurn === "player"
          ? playerCreature.name
          : opponentCreature.name
      } goes first!`,
    ]);
  }, [playerCreature, opponentCreature]);

  // =========================
  // FETCH CREATURE TYPES
  // =========================
  useEffect(() => {
  if (playerCreature?.id) {
        fetchCreatureTypeIds(Number(playerCreature.id)).then(setPlayerTypeIds);
    }

    if (opponentCreature?.id) {
        fetchCreatureTypeIds(Number(opponentCreature.id)).then(setOpponentTypeIds);
    }
    }, [playerCreature, opponentCreature]);

  // =========================
  // FETCH NPC MOVES
  // =========================
  useEffect(() => {
    if (mode !== "pve" || !opponentCreatureId) return;

    fetchCreatureMoveIds(opponentCreatureId).then((ids) => {
      setOpponentMoveIds(ids);
    });
  }, [opponentCreatureId, mode]);

  // =========================
  // PLAYER ATTACKS OPPONENT
  // =========================
  const damageOpponent = useCallback(
    async (move: MoveWithType) => {
      if (!opponentCreature) return;

      const defenderEvade = opponentCreature.evade ?? 0;
      const moveChance = move.chance ?? 100;

      // MISS CHECK
      if (!attackHits(moveChance, defenderEvade)) {
        log(
          `${playerCreature?.name} used ${move.name}, but it missed!`
        );
        return;
      }

      // DAMAGE CALCULATION
      const finalDamage = await calculateFinalDamage(
        move,
        opponentCreature,
        opponentTypeIds
      );

      setOpponentHp((prev) => {
        const current = prev ?? opponentCreature.hp;
        return Math.max(0, current - finalDamage);
      });

      log(
        `${playerCreature?.name} used ${move.name} for ${finalDamage} damage!`
      );
    },
    [
      playerCreature,
      opponentCreature,
      opponentTypeIds,
      log,
    ]
  );

  // =========================
  // OPPONENT ATTACKS PLAYER
  // =========================
  const damagePlayer = useCallback(
    async (move: MoveWithType) => {
      if (!playerCreature) return;

      const defenderEvade = playerCreature.evade ?? 0;
      const moveChance = move.chance ?? 100;

      // MISS CHECK
      if (!attackHits(moveChance, defenderEvade)) {
        log(
          `${opponentCreature?.name} used ${move.name}, but it missed!`
        );
        return;
      }

      // DAMAGE CALCULATION
      const finalDamage = await calculateFinalDamage(
        move,
        playerCreature,
        playerTypeIds
      );

      setPlayerHp((prev) => {
        const current = prev ?? playerCreature.hp;
        return Math.max(0, current - finalDamage);
      });

      log(
        `${opponentCreature?.name} used ${move.name} for ${finalDamage} damage!`
      );
    },
    [
      playerCreature,
      opponentCreature,
      playerTypeIds,
      log,
    ]
  );

  // =========================
  // NPC TURN
  // =========================
  const executeOpponentTurn = useCallback(
    async (moveIds: number[]) => {
      if (!moveIds.length) {
        log(`${opponentCreature?.name} has no moves!`);
        setTurnOwner("player");
        return;
      }

      const randomId =
        moveIds[Math.floor(Math.random() * moveIds.length)];

      const move = await getMoveById(randomId);

      if (!move) {
        log("Opponent's move failed.");
        setTurnOwner("player");
        return;
      }

      await damagePlayer(move);

      setTurnOwner("player");
    },
    [opponentCreature, damagePlayer, log]
  );

  // =========================
  // AUTO NPC TURNS
  // =========================
  useEffect(() => {
    if (
      mode !== "pve" ||
      turnOwner !== "opponent" ||
      isProcessing ||
      opponentMoveIds.length === 0
    ) {
      return;
    }

    const runOpponentTurn = async () => {
      setIsProcessing(true);

      await new Promise((res) => setTimeout(res, 800));

      await executeOpponentTurn(opponentMoveIds);

      setIsProcessing(false);
    };

    runOpponentTurn();
  }, [
    mode,
    turnOwner,
    isProcessing,
    opponentMoveIds,
    executeOpponentTurn,
  ]);

  // =========================
  // PLAYER TURN
  // =========================
  const handlePlayerMove = useCallback(
    async (move: MoveWithType) => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);

      await damageOpponent(move);

      setTurnOwner("opponent");

      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damageOpponent]
  );

  // =========================
  // PVP TURN
  // =========================
  const handleOpponentMove = useCallback(
    async (move: MoveWithType) => {
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
  const resolvedPlayerHp = playerHp ?? playerCreature?.hp ?? 0;
  const resolvedOpponentHp = opponentHp ?? opponentCreature?.hp ?? 0;

  return {
    playerHp: resolvedPlayerHp,
    opponentHp: resolvedOpponentHp,
    turnOwner,
    isProcessing,
    battleLog,
    handlePlayerMove,
    handleOpponentMove,
  };
}