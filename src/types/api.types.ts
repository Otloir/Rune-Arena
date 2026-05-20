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
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

// -----------------------------------------------------------------------------
// Domain types
// -----------------------------------------------------------------------------

export type StampAnimal = "lion" | "dolphin" | "toucan" | "beetlebug" | "snake";
export type MetalType = "silver" | "gold" | "platinum";
export type SetType = "metal" | "animal" | "non_metal";

export interface StampType {
  readonly animal: StampAnimal;
  readonly metal?: MetalType;
}

export interface Stamp {
  readonly id: number;
  readonly stamp_type: StampType;
  readonly exchanged_at: string | null;
}

export interface User {
  readonly id: number;
  readonly name: string;
}

export interface IdentityTokenInfo {
  readonly user: User;
}

export interface TransactionResponse {
  readonly id: number;
  readonly amount: number;
}

export interface PayoutResponse {
  readonly id: number;
  readonly amount: number;
}

export interface ExchangeResponse {
  readonly id: number;
  readonly set_type: SetType;
  readonly stamp_ids: readonly number[];
}