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

// Fetch move IDs available to a creature
async function fetchCreatureMoveIds(creatureId: number, level?: number): Promise<number[]> {
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

  // Initialize HP and turn order once creatures load
  useEffect(() => {
    if (!playerCreature || !opponentCreature) return;
    setPlayerHp(playerCreature.hp);
    setOpponentHp(opponentCreature.hp);

    // Higher speed goes first; ties go to player
    const firstTurn: TurnOwner =
      opponentCreature.speed > playerCreature.speed ? "opponent" : "player";
    setTurnOwner(firstTurn);

    setBattleLog([
      `${firstTurn === "player" ? playerCreature.name : opponentCreature.name} goes first!`,
    ]);
  }, [playerCreature, opponentCreature]);

  // Fetch opponent's available moves for PVE
  useEffect(() => {
  if (mode !== "pve" || !opponentCreatureId) return;
  fetchCreatureMoveIds(opponentCreatureId).then((ids) => {
    console.log("Opponent move IDs:", ids);
    setOpponentMoveIds(ids);
  });
}, [opponentCreatureId, mode]);

  const log = (message: string) =>
    setBattleLog((prev) => [...prev, message]);

  // Apply damage to opponent
  const damageOpponent = useCallback((move: MoveWithType) => {
    setOpponentHp((prev) => {
      const current = prev ?? opponentCreature?.hp ?? 0;
      return Math.max(0, current - move.damage);
    });
    log(`${playerCreature?.name} used ${move.name} for ${move.damage} damage!`);
  }, [playerCreature, opponentCreature]);

  // Apply damage to player
  const damagePlayer = useCallback((move: MoveWithType) => {
    setPlayerHp((prev) => {
      const current = prev ?? playerCreature?.hp ?? 0;
      return Math.max(0, current - move.damage);
    });
    log(`${opponentCreature?.name} used ${move.name} for ${move.damage} damage!`);
  }, [playerCreature, opponentCreature]);

  // PVE: pick and execute a random opponent move
  const executeOpponentTurn = useCallback(async () => {
    if (!opponentMoveIds.length) {
      log(`${opponentCreature?.name} has no moves!`);
      setTurnOwner("player");
      return;
    }

    const randomId = opponentMoveIds[Math.floor(Math.random() * opponentMoveIds.length)];
    const move = await getMoveById(randomId);

    if (!move) {
      log("Opponent's move failed.");
      setTurnOwner("player");
      return;
    }

    damagePlayer(move);
    setTurnOwner("player");
  }, [opponentMoveIds, opponentCreature, damagePlayer]);

  // Called when the player selects a move
  const handlePlayerMove = useCallback(async (move: MoveWithType) => {
    if (turnOwner !== "player" || isProcessing) return;
    setIsProcessing(true);

    damageOpponent(move);

    if (mode === "pve") {
      // Small delay so the player can see their attack land
      await new Promise((res) => setTimeout(res, 800));
      await executeOpponentTurn();
    } else {
      // PVP: just pass the turn
      setTurnOwner("opponent");
    }

    setIsProcessing(false);
  }, [turnOwner, isProcessing, damageOpponent, executeOpponentTurn, mode]);

  // PVP only: called when the opponent player selects a move
  const handleOpponentMove = useCallback(async (move: MoveWithType) => {
    if (turnOwner !== "opponent" || isProcessing) return;
    setIsProcessing(true);
    damagePlayer(move);
    setTurnOwner("player");
    setIsProcessing(false);
  }, [turnOwner, isProcessing, damagePlayer]);

  const resolvedPlayerHp = playerHp ?? playerCreature?.hp ?? 0;
  const resolvedOpponentHp = opponentHp ?? opponentCreature?.hp ?? 0;

  return {
    playerHp: resolvedPlayerHp,
    opponentHp: resolvedOpponentHp,
    turnOwner,
    isProcessing,
    battleLog,
    handlePlayerMove,
    handleOpponentMove,   // expose for future PVP use
  };
}