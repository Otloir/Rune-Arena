import { supabase } from "../lib/supabase";

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
  const items = data.map((row: any) => row.item).filter(Boolean);
  return items;
}
