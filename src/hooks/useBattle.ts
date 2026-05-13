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

// Accuracy check based on defender evade stat
function attackHits(defenderEvade: number = 0): boolean {
  // Example:
  // evade 0 = 100% hit chance
  // evade 10 = 90% hit chance
  // evade 25 = 75% hit chance
  const hitChance = Math.max(10, 100 - defenderEvade);
  return Math.random() * 100 < hitChance;
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

  // Utility logger
  const log = useCallback((message: string) => {
    setBattleLog((prev) => [...prev, message]);
  }, []);

  // Initialize battle state
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

  // Fetch opponent moves
  useEffect(() => {
    if (mode !== "pve" || !opponentCreatureId) return;

    fetchCreatureMoveIds(opponentCreatureId).then((ids) => {
      console.log("Opponent move IDs:", ids);
      setOpponentMoveIds(ids);
    });
  }, [opponentCreatureId, mode]);

  // Player attacks opponent
  const damageOpponent = useCallback(
    (move: MoveWithType) => {
      const defenderEvade = opponentCreature?.evade ?? 0;

      if (!attackHits(defenderEvade)) {
        log(`${playerCreature?.name} used ${move.name}, but it missed!`);
        return;
      }

      setOpponentHp((prev) => {
        const current = prev ?? opponentCreature?.hp ?? 0;
        return Math.max(0, current - move.damage);
      });

      log(
        `${playerCreature?.name} used ${move.name} for ${move.damage} damage!`
      );
    },
    [playerCreature, opponentCreature, log]
  );

  // Opponent attacks player
  const damagePlayer = useCallback(
    (move: MoveWithType) => {
      const defenderEvade = playerCreature?.evade ?? 0;

      if (!attackHits(defenderEvade)) {
        log(`${opponentCreature?.name} used ${move.name}, but it missed!`);
        return;
      }

      setPlayerHp((prev) => {
        const current = prev ?? playerCreature?.hp ?? 0;
        return Math.max(0, current - move.damage);
      });

      log(
        `${opponentCreature?.name} used ${move.name} for ${move.damage} damage!`
      );
    },
    [playerCreature, opponentCreature, log]
  );

  // NPC turn logic
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

      damagePlayer(move);
      setTurnOwner("player");
    },
    [opponentCreature, damagePlayer, log]
  );

  // Automatic opponent turn
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

  // Player turn
  const handlePlayerMove = useCallback(
    async (move: MoveWithType) => {
      if (turnOwner !== "player" || isProcessing) return;

      setIsProcessing(true);

      damageOpponent(move);

      setTurnOwner("opponent");

      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damageOpponent]
  );

  // PVP opponent turn
  const handleOpponentMove = useCallback(
    async (move: MoveWithType) => {
      if (turnOwner !== "opponent" || isProcessing) return;

      setIsProcessing(true);

      damagePlayer(move);

      setTurnOwner("player");

      setIsProcessing(false);
    },
    [turnOwner, isProcessing, damagePlayer]
  );

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