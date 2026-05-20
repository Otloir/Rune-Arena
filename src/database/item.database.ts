import { supabase } from "../lib/supabase";
import type { Item as ItemType } from "../types/item.types";
import { updateUserBalance } from "./user.database";

export type BuyResult = "success" | "insufficient_funds" | "error";

interface UserItemsRow {
  readonly item: ItemType[] | ItemType | null;
}

interface ItemPrice {
  readonly price: number;
}

/**
 * Get all items from the database.
 */
export async function getItems(): Promise<ItemType[] | null> {
  const { data, error } = await supabase
    .from("Items")
    .select("id, name, property, propvalue, description, price, img");

  if (error) {
    console.error("[getItems] Supabase error:", error.message);
    return null;
  }

  return data as ItemType[];
}

/**
 * Get items a specific user owns, grouped by item with a quantity field.
 */
export async function getUserItems(
  userId: string | number,
): Promise<ItemType[] | null> {
  const { data, error } = await supabase
    .from("User_Items")
    .select(
      "item:item_id(id, name, property, propvalue, description, price, img)",
    )
    .eq("user_id", userId);

  if (error) {
    console.error("[getUserItems] Supabase error:", error.message);
    return null;
  }
  if (!data) return [];

  // Flatten joined rows into a flat list of items
  const flatItems = (data as UserItemsRow[])
    .map((row: UserItemsRow) => {
      const item = Array.isArray(row.item) ? row.item[0] : row.item;
      return item;
    })
    .filter((item): item is ItemType => Boolean(item));

  // Group items by id and count duplicates as quantity
  const grouped = flatItems.reduce<Record<number, ItemType>>((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity = (acc[item.id].quantity ?? 1) + 1;
    } else {
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {});

  return Object.values(grouped);
}

/**
 * Attempt to purchase an item for a user.
 *
 * Steps:
 *   1. Fetch the item price.
 *   2. Deduct RuneCoins atomically — aborts if insufficient funds.
 *   3. Insert a row into User_Items.
 *   4. If the insert fails, issue a best-effort refund and return "error".
 *
 * Returns:
 *   "success"            — item purchased and coins deducted
 *   "insufficient_funds" — user cannot afford the item
 *   "error"              — unexpected failure (DB or network)
 */
export async function buyItem(
  userId: string,
  itemId: number,
): Promise<BuyResult> {
  // 1. Fetch item price
  const { data: itemData, error: itemError } = await supabase
    .from("Items")
    .select("price")
    .eq("id", itemId)
    .single<ItemPrice>();

  if (itemError || !itemData) {
    console.error("[buyItem] Could not fetch item price:", itemError?.message);
    return "error";
  }

  // 2. Deduct coins atomically
  const newBalance = await updateUserBalance(Number(userId), -itemData.price);
  if (newBalance === null) {
    return "insufficient_funds";
  }

  // 3. Insert into User_Items
  const { error: insertError } = await supabase
    .from("User_Items")
    .insert({ user_id: userId, item_id: itemId });

  if (insertError) {
    console.error("[buyItem] Insert failed, attempting refund:", insertError.message);
    // Best-effort refund — if this also fails, an admin must reconcile manually
    await updateUserBalance(Number(userId), itemData.price);
    return "error";
  }

  return "success";
}