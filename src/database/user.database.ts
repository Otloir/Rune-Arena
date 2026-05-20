import { supabase } from "../lib/supabase";

export interface UserBalance {
  readonly runecoins: number;
}

/**
 * Fetch the current RuneCoin balance for a user.
 */
export async function getUserBalance(userId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("Users")
    .select("runecoins")
    .eq("id", userId)
    .single<UserBalance>();

  if (error) {
    console.error("[getUserBalance]", error.message);
    return null;
  }

  return data.runecoins;
}

/**
 * Atomically add or subtract RuneCoins via the Postgres RPC function.
 * Returns the new balance on success, or null if the operation failed
 * (including when the user has insufficient funds).
 */
export async function updateUserBalance(
  userId: number,
  delta: number,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("update_runecoins", {
    p_user_id: userId,
    p_delta: delta,
  });

  if (error) {
    if (error.message.includes("insufficient_funds")) {
      return null;
    }
    console.error("[updateUserBalance]", error.message);
    return null;
  }

  return data as number;
}