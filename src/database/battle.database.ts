import { supabase } from "../lib/supabase";

export interface BattleStartParams {
  readonly playerId: number;
  readonly opponentId: number;
  readonly playerCreatureId: number;
  readonly enemyCreatureId: number;
}

export type BattleError =
  | "already_in_battle"
  | "battle_not_found"
  | "battle_already_ended"
  | "reward_already_claimed"
  | "unknown";

/**
 * Create a battle record when the arena loads.
 * Returns the new battle id on success.
 * Throws a BattleError string on failure.
 */
export async function startBattle(
  params: BattleStartParams,
): Promise<number> {
  const { data, error } = await supabase.rpc("start_battle", {
    p_player_id: params.playerId,
    p_opponent_id: params.opponentId,
    p_player_creature_id: params.playerCreatureId,
    p_enemy_creature_id: params.enemyCreatureId,
  });

  if (error) {
    const reason: BattleError = parseBattleError(error.message);
    console.error("[startBattle]", reason, error.message);
    throw reason;
  }

  return data as number;
}

/**
 * Close the battle record and grant RC to the winner server-side.
 * Pass winnerUserId = 0 when the opponent wins (no reward issued).
 * Returns the player's new runecoins balance on success.
 * Throws a BattleError string on failure.
 * battle_already_ended is not logged — it is an expected case when a
 * duplicate tab has overridden this session.
 */
export async function endBattle(
  battleId: number,
  winnerUserId: number,
): Promise<number> {
  const { data, error } = await supabase.rpc("end_battle", {
    p_battle_id: battleId,
    p_winner_user_id: winnerUserId,
  });

  if (error) {
    const reason: BattleError = parseBattleError(error.message);
    if (reason !== "battle_already_ended") {
      console.error("[endBattle]", reason, error.message);
    }
    throw reason;
  }

  return data as number;
}

function parseBattleError(message: string): BattleError {
  if (message.includes("already_in_battle")) return "already_in_battle";
  if (message.includes("battle_not_found")) return "battle_not_found";
  if (message.includes("battle_already_ended")) return "battle_already_ended";
  if (message.includes("reward_already_claimed")) return "reward_already_claimed";
  return "unknown";
}