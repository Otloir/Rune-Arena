// ----------------------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------------------

export type User = {
  uuid: string;
  firstname: string;
  lastname: string;
  saldo: number;
  github: string;
  url: string;
  stamps: Stamp[];
};

// ----------------------------------------------------------------------------------
// Stamps
// ----------------------------------------------------------------------------------

// Animals available as stamps
export type StampAnimal = "lion" | "dolphin" | "tucan" | "beetlebug" | "snake";

// Metal prefixes
export type StampMetal = "silver" | "gold" | "platinum";

export type Stamp = string;

// ----------------------------------------------------------------------------------
// Transactions
// ----------------------------------------------------------------------------------

export type Transaction = {
  seller: string;
  buyer: string;
  amount: number;
  stamp: Stamp; 
};

// Body sent when creating a transaction
export type CreateTransactionBody = {
  seller: string;
  buyer: string;
  amount: number;
};

// What comes back after a transaction is created
export type TransactionReceipt = {
  uuid: string;
  seller: string;
  buyer: string;
  amount: number;
  stamp: Stamp; 
};

// ----------------------------------------------------------------------------------
// API Response helpers
// ----------------------------------------------------------------------------------

// Wrapper for API that can succeed or fail
export type ApiResult<SuccessType> =
  | { success: true; data: SuccessType }
  | { success: false; error: string };
