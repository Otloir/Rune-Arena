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
  readonly description?: string;
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

export type CreatureMoveEntry = {
  readonly moveId: number;
  readonly requiredLevelId: number;
};