export type StampAnimal = "lion" | "dolphin" | "toucan" | "beetlebug" | "snake";

export type StampMetal = "silver" | "gold" | "platinum";

export type StampType = {
  id: number;
  animal: StampAnimal;
  metal: StampMetal | null;
  image_url: string | null;
};

export type Stamp = {
  id: number;
  user_id: number;
  stamptype_id: number;
  stamptype: StampType;
  image_url: string | null;
  exchanged_at: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  name: string;
  is_active: boolean;
  group_id: number | null;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type TransactionResponse = {
  id: number;
  stamp: Stamp;
};

export type IdentityTokenInfo = {
  user: { id: number; name: string };
  expires_at: string;
};

// Generic result wrapper — every API call returns one of these
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };
