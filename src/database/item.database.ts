import { supabase } from "../lib/supabase";
import type { Item as ItemType } from "../types/item.types";
import { purchaseItem } from "./user.database";
import type { PurchaseError } from "./user.database";
export type BuyResult = "success" | "insufficient_funds" | "error";
interface UserItemsRow {
  item: ItemType[] | ItemType | null;
}
// Get all items from the database
export async function getItems(): Promise<ItemType[] | null> {
  const { data, error } = await supabase
    .from("Items")
    .select("id, name, property, propvalue, description, price, img");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}
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
    console.error("Supabase error:", error.message);
    return null;
  }
  if (!data) return [];
  // Flatten joined rows into a flat list of items
  const flatItems = data
    .map((row: UserItemsRow) => {
      const item = Array.isArray(row.item) ? row.item[0] : row.item;
      return item;
    })
    .filter((item): item is ItemType => Boolean(item));
  // Group items by id and count how many the user has of each
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
// Remove one instance of an item from a user's inventory.
export async function consumeUserItem(
  userId: string,
  itemId: number,
): Promise<boolean> {
  const { data: rows, error: selectError } = await supabase
    .from("User_Items")
    .select("id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .limit(1);
  if (selectError) {
    console.error(
      "Supabase select error while consuming item:",
      selectError.message,
    );
    return false;
  }
  if (!rows || (Array.isArray(rows) && rows.length === 0)) {
    return false;
  }
  interface UserItemRowId {
    readonly id: number;
  }
  const rowId = Array.isArray(rows)
    ? (rows[0] as UserItemRowId).id
    : (rows as UserItemRowId).id;
  const { error: delError } = await supabase
    .from("User_Items")
    .delete()
    .eq("id", rowId);
  if (delError) {
    console.error(
      "Supabase delete error while consuming item:",
      delError.message,
    );
    return false;
  }
  return true;
}