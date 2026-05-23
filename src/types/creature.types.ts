// Creature
export type Creature = {
  readonly id: string;
  readonly name: string;
  readonly front_img: string;
  readonly back_img: string;
  readonly evade: number;
  readonly speed: number;
  readonly defense: number;
  readonly hp: number;
  /** Lore / flavour text stored in the Supabase `description` column. */
  readonly description?: string;
  /**
   * IDs of moves this creature can use.
   * Populated when the creature is fetched with move data joined.
   */
  readonly move_ids?: readonly number[];
};

// Types
export type Type = {
  readonly id: number;
  readonly name: string;
};

// Moves
export type Move = {
  readonly id: number;
  readonly name: string;
  readonly damage: number;
  readonly chance: number;
};

// Type Effectiveness
export type TypeEffectiveness = {
  readonly id: number;
  readonly attacker_id: number;
  readonly defender_id: number;
  readonly effectiveness: number;
};

// Levels
export type Level = {
  readonly id: number;
  readonly level: number;
  readonly xp_required: number;
};

/**
 * A move ID paired with the level_id required to unlock it.
 * level_id is the FK to Levels.id, NOT the display level number.
 */
export type CreatureMoveEntry = {
  readonly moveId: number;
  readonly requiredLevelId: number;
};