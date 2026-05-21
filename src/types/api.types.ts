// -----------------------------------------------------------------------------
// Shared result wrapper — discriminated union on `success`
// Narrow with `if (result.success)` before accessing `.data` or `.error`
// -----------------------------------------------------------------------------

export type ApiSuccess<T> = {
  readonly success: true;
  readonly data: T;
};

export type ApiFailure = {
  readonly success: false;
  readonly error: string;
  readonly status?: number;
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

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------

export type IdentityTokenInfo = {
  user: { id: number; name: string };
  expires_at: string;
};

// Generic result wrapper — every API call returns one of these
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };
