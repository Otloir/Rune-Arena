import { supabase } from "../lib/supabase";

// get creature
export async function getCreatures() {
  const { data, error } = await supabase
    .from("Creatures")
    .select("id, name, front_img, back_img, evade, speed, defense, hp");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// get types
export async function getTypes() {
  const { data, error } = await supabase.from("Types").select("id, name");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// get moves
export async function getMoves() {
  const { data, error } = await supabase
    .from("Moves")
    .select("id, name, damage, chance, move_type_id");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}