import { supabase } from "../lib/supabase";
import type { Item as ItemType } from "../types/item.types";
import { purchaseItem } from "./user.database";
import type { PurchaseError } from "./user.database";

export type BuyResult = "success" | "insufficient_funds" | "error";

interface UserItemsRow {
  readonly item: ItemType[] | ItemType | null;
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

  const flatItems = (data as UserItemsRow[])
    .map((row: UserItemsRow) => {
      const item = Array.isArray(row.item) ? row.item[0] : row.item;
      return item;
    })
    .filter((item): item is ItemType => Boolean(item));

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
 * Attempt to buy an item for a user.
 * Delegates to purchaseItem() which calls the secure server-side Postgres function.
 * The server resolves the price and deducts RC — the client sends no amounts.
 *
 * Returns:
 *   "success"            — item purchased, coins deducted, inventory updated
 *   "insufficient_funds" — user cannot afford the item
 *   "error"              — unexpected failure
 */
export async function buyItem(
  userId: string,
  itemId: number,
): Promise<BuyResult> {
  try {
    await purchaseItem(Number(userId), itemId);
    return "success";
  } catch (err) {
    const reason = err as PurchaseError;
    if (reason === "insufficient_funds") return "insufficient_funds";
    return "error";
  }
}