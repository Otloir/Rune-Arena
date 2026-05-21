import { supabase } from "../lib/supabase";

export interface UserBalance {
  readonly runecoins: number;
}

export type PurchaseError =
  | "insufficient_funds"
  | "item_not_found"
  | "unknown";

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
 * Purchase an item for a user via the secure server-side Postgres function.
 * Price is resolved and deducted server-side — the client never touches runecoins directly.
 * Returns the new runecoins balance on success.
 * Throws a PurchaseError string on failure so callers can catch and handle it.
 */
export async function purchaseItem(
  userId: number,
  itemId: number,
): Promise<number> {
  const { data, error } = await supabase.rpc("purchase_item", {
    p_user_id: userId,
    p_item_id: itemId,
  });

  if (error) {
    const reason: PurchaseError = parsePurchaseError(error.message);
    // Only log genuinely unexpected errors — insufficient_funds and item_not_found
    // are handled by the caller and shown to the user via the purchase modal
    if (reason === "unknown") {
      console.error("[purchaseItem]", reason, error.message);
    }
    throw reason;
  }

  return data as number;
}

function parsePurchaseError(message: string): PurchaseError {
  if (message.includes("insufficient_funds")) return "insufficient_funds";
  if (message.includes("item_not_found")) return "item_not_found";
  return "unknown";
}