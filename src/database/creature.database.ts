import { supabase } from "../lib/supabase";
import type { Creature, Level, Type, Move } from "../types/creature.types";

export type JoinedCreatureLevel = Pick<Level, "level" | "xp_required">;

export type UserCreatureRow = {
  current_xp: number;
  creature: Creature | Creature[];
  level: JoinedCreatureLevel | JoinedCreatureLevel[];
};

// Get all creatures
export async function getCreatures(): Promise<Creature[] | null> {
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
export async function getCreatureById(creatureId: string | number ): Promise<Creature | null> {
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
export async function getUserCreature(userId: string | number): Promise<UserCreatureRow | null> {
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
    .single();
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get a specific user's creature by creatureId + level info
// Joins: User_Creature_Levels → Creatures + Levels filtered by creature_id
export async function getUserCreatureById(
  userId: string,
  creatureId: string,
): Promise<UserCreatureRow | null> {
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
export async function getTypes(): Promise<Type[] | null> {
  const { data, error } = await supabase.from("Types").select("id, name");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Get all moves
export async function getMoves(): Promise<Move[] | null> {
  const { data, error } = await supabase
    .from("Moves")
    .select("id, name, damage, chance, move_type_id");
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  return data;
}

// Award XP to a player's creature, levelling up if threshold is crossed
export async function awardXpToCreature(
  userId: string | number,
  creatureId: string | number,
  xpAmount: number
): Promise<{ newXp: number; newLevelId: number } | null> {
  const { data: row, error: fetchError } = await supabase
    .from("User_Creature_Levels")
    .select("current_xp, level_id")
    .eq("user_id", userId)
    .eq("creature_id", creatureId)
    .single();

  if (fetchError || !row) {
    console.error("[awardXpToCreature] Failed to fetch creature row:", fetchError?.message);
    return null;
  }

  const { data: levels, error: levelsError } = await supabase
    .from("Levels")
    .select("id, level, xp_required")
    .order("level", { ascending: true });

  if (levelsError || !levels) {
    console.error("[awardXpToCreature] Failed to fetch levels:", levelsError?.message);
    return null;
  }

  // Find current level entry — compare as numbers to avoid string/number mismatch
    // Find current level entry
  const currentLevel = levels.find((l) => l.id === row.level_id);

  if (!currentLevel) {
    console.error("[awardXpToCreature] Current level not found");
    return null;
  }

  const nextLevel = levels.find(
    (l) => l.level === currentLevel.level + 1
  );

  const tentativeXp = row.current_xp + xpAmount;

  let newXp = tentativeXp;
  let newLevelId = row.level_id;

  // Compare against CURRENT level's requirement
  if (nextLevel && tentativeXp >= currentLevel.xp_required) {
    newLevelId = nextLevel.id;
    newXp = tentativeXp - currentLevel.xp_required;
  }
  
  const { error: updateError } = await supabase
    .from("User_Creature_Levels")
    .update({ current_xp: newXp, level_id: newLevelId })
    .eq("user_id", userId)
    .eq("creature_id", creatureId);

  if (updateError) {
    console.error("[awardXpToCreature] Failed to update XP:", updateError.message);
    return null;
  }

  return { newXp, newLevelId };
}