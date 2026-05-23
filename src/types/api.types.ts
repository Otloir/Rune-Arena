export type StampAnimal = "lion" | "dolphin" | "toucan" | "beetlebug" | "snake";

export type StampMetal = "silver" | "gold" | "platinum";

export type TransactionStamp = {
  animal: StampAnimal;
  metal: StampMetal | null;
  image_url: string | null;
};

export type Stamp = {
  id: number;
  transaction_id: number | null;
  animal: StampAnimal;
  metal: StampMetal | null;
  image_url: string | null;
  created_at: string;
};


export type CentralbankUser = {
  uuid: string;
  first_name: string;
  last_name: string | null;
  github_url: string | null;
  website_url: string | null;
  balance: number;
  stamp_count: number;
};

export type IdentityTokenInfo = {
  user: { id: number; name: string };
  expires_at: string;
};

export type TransactionResponse = {
  transaction_id: number;
  amount: number;
  stamp: TransactionStamp | null;
};

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };