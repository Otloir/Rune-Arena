import { supabase } from "../lib/supabase";
import type { Item as ItemType } from "../types/item.types";

interface UserItemsRow {
  item: ItemType[] | ItemType | null;
}

// Get all items from the database
export async function getItems() {
  const { data, error } = await supabase
    .from("Items")
    .select("id, name, property, propvalue, description, price, img");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get items a specific user has
export async function getUserItems(userId: number) {
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
  const items = data
    .map((row: UserItemsRow) => {
      const item = Array.isArray(row.item) ? row.item[0] : row.item;
      return item;
    })
    .filter((item): item is ItemType => Boolean(item));
  return items;
}

// Add an item to a user's inventory
export async function buyItem(userId: number, itemId: number) {
  const { error } = await supabase
    .from("User_Items")
    .insert({ user_id: userId, item_id: itemId });
  if (error) {
    console.error("Supabase error:", error.message);
    return false;
  }
  return true;
}
