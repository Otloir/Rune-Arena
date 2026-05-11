import { supabase } from "../lib/supabase";

// Get all creatures
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

// Get a single creature by its ID
export async function getCreatureById(creatureId: string) {
  const { data, error } = await supabase
    .from("Creatures")
    .select("id, name, front_img, back_img, evade, speed, defense, hp")
    .eq("id", creatureId)
    .single();
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get a user's creature + level info in one query
// Joins: User_Creature_Levels → Creatures + Levels
export async function getUserCreature(userId: string) {
  const { data, error } = await supabase
    .from("User_Creature_Levels")
    .select(
      `
      current_xp,
      creature:creature_id ( id, name, front_img, back_img, evade, speed, defense, hp ),
      level:level_id ( level, xp_required )
    `,
    )
    .eq("user_id", userId)
    .limit(1);
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data && data.length > 0 ? data[0] : null;
}

// Get a specific user's creature by creatureId + level info
// Joins: User_Creature_Levels → Creatures + Levels filtered by creature_id
export async function getUserCreatureById(userId: string, creatureId: string) {
  const { data, error } = await supabase
    .from("User_Creature_Levels")
    .select(
      `
      current_xp,
      creature:creature_id ( id, name, front_img, back_img, evade, speed, defense, hp ),
      level:level_id ( level, xp_required )
    `,
    )
    .eq("user_id", userId)
    .eq("creature_id", creatureId)
    .single();
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get all types
export async function getTypes() {
  const { data, error } = await supabase.from("Types").select("id, name");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get all moves
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
