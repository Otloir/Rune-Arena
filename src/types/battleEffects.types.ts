export type StatBoosts = {
  hpBoost: number;
  evadeBoost: number;
  speedBoost: number;
  defenseBoost: number;
};

export type ItemEffect = {
  itemName: string;
  property: string;
  propvalue: number;
  appliedAt: number;
};

export type ItemUseResult = {
  success: boolean;
  message: string;
  hpHealed?: number;
  statsBoosted?: Partial<StatBoosts>;
};
