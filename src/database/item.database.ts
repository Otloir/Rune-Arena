import { supabase } from "../lib/supabase";
import type { Item as ItemType } from "../types/item.types";

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

// Get items a specific user has, grouped by item so duplicates show as quantity
export async function getUserItems(userId: number): Promise<ItemType[] | null> {
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
      // Item already seen — increment quantity
      acc[item.id].quantity = (acc[item.id].quantity ?? 1) + 1;
    } else {
      // First time seeing this item — add it with quantity 1
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {});

  // Convert the grouped object back into an array
  return Object.values(grouped);
}

// Add an item to a user's inventory
export async function buyItem(
  userId: number,
  itemId: number,
): Promise<boolean> {
  const { error } = await supabase
    .from("User_Items")
    .insert({ user_id: userId, item_id: itemId });
  if (error) {
    console.error("Supabase error:", error.message);
    return false;
  }
  return true;
}
