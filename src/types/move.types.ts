export type MoveType = {
  id: number;
  name: string;
};

export type Move = {
  id: number;
  name: string;
  damage: number;
  chance: number;
  move_type_id: number;
};

export type MoveWithType = Move & {
  move_type: MoveType;
};