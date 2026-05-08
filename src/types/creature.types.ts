// Creature
export type Creatures = {
  id: string;
  name: string;
  front_img: string;
  back_img: string;
  evade: number;
  speed: number;
  defense: number;
  hp: number;
}

// Types
export type Type = {
  id: number;
  name: string;
}

// Moves
export type Move = {
  id: number;
  name: string;
  damage: number;
  chance: number;
}

// Type Effectivness
export type TypeEffectivness = {
  id: number;
  attacker_id: number;
  defender_id: number;
  effectivness: number;
};

// Levels
export type Levels = {
  id: number;
  level: number;
  xp_required: number;
};