export type MoveType = {
  id: number;
  name: string;
};

export type MoveRow = {
  id: number;
  name: string;
  damage: number;
  chance: number;
  move_type_id: number;
};

export type MoveWithType = MoveRow & {
  move_type: MoveType;
};