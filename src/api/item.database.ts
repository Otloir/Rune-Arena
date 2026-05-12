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
