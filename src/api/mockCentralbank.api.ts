import type {
  StampAnimal,
  StampMetal,
  SetType,
  Stamptype,
  Stamp,
  User,
  TransactionResponse,
  PayoutResponse,
  IdentityTokenInfo,
  ExchangeResponse,
  ApiResult,
} from "./../types/api.types";

const BASE_URL = import.meta.env.VITE_TIVOLI_API_URL as string;
const API_KEY = import.meta.env.VITE_AMUSEMENT_API_KEY as string;

// -----------------------------------------------------------------------------
// Internal fetch helper
// -----------------------------------------------------------------------------

let csrfToken: string | null = null;

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    // Forward the CSRF token on all state-changing requests
    if (csrfToken && options.method && options.method.toUpperCase() !== "GET") {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: "include", // send session cookie automatically
      headers,
    });

    // Handle no-content responses (e.g. DELETE → 204)
    if (response.status === 204) {
      return { success: true, data: undefined as unknown as T };
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error:
          (body as { message?: string }).message ??
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return { success: true, data: body as T };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  }
}

// -----------------------------------------------------------------------------
// Identity token
// -----------------------------------------------------------------------------

/**
 * Read `identity_token` from the current URL and immediately scrub it from
 * history so it does not leak via referer headers or browser history.
 */
export function readIdentityTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("identity_token");

  if (token) {
    params.delete("identity_token");
    const clean =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", clean);
  }

  return token;
}

/**
 * Resolve an identity token to the user's id + name without consuming it.
 * Unauthenticated — useful for greeting the player before charging.
 */
export async function getPlayerInfo(
  token: string,
): Promise<ApiResult<IdentityTokenInfo>> {
  return apiFetch<IdentityTokenInfo>(`/identity-tokens/${token}`);
}

// -----------------------------------------------------------------------------
// Current user
// -----------------------------------------------------------------------------

/**
 * Get the current authenticated user's profile, including their balance.
 * Used in the lobby and shop to display the player's current balance.
 */
export async function getCurrentUser(): Promise<ApiResult<User>> {
  return apiFetch<User>("/user");
}

// -----------------------------------------------------------------------------
// Transactions  (api_key is read from env — no need to pass it at call site)
// -----------------------------------------------------------------------------

/**
 * Charge the player the entrance fee / stake. The identity_token is consumed here.
 * Always returns a stamp — used when the player starts a game.
 *
 * Error codes to handle:
 *   401 — token expired or already used → show error + link back to tivoli
 *   402 — player has insufficient funds
 */
export async function startTransaction(
  identityToken: string,
  amount: number,
): Promise<ApiResult<TransactionResponse>> {
  return apiFetch<TransactionResponse>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      identity_token: identityToken,
      amount,
      api_key: API_KEY,
    }),
  });
}

/**
 * Pay out winnings to the player after they win.
 * Use the `id` returned by `startTransaction`.
 *
 * Error codes to handle:
 *   409 — transaction already paid out, or amusement is an attraction
 *   403 — api_key does not match the original transaction's amusement
 */
export async function payoutWinnings(
  transactionId: number,
  amount: number,
): Promise<ApiResult<PayoutResponse>> {
  return apiFetch<PayoutResponse>(`/transactions/${transactionId}/payout`, {
    method: "POST",
    body: JSON.stringify({ amount, api_key: API_KEY }),
  });
}

// -----------------------------------------------------------------------------
// Stamps
// -----------------------------------------------------------------------------

/**
 * Get the current user's unexchanged stamps.
 * Used to populate the bag/inventory screen in the lobby.
 */
export async function listStamps(): Promise<ApiResult<{ data: Stamp[] }>> {
  return apiFetch("/stamps");
}

/**
 * Exchange a valid set of stamps for money (session required).
 * Used from the bag/inventory screen.
 *
 * set_type rules:
 *   "metal"     — exactly 3 stamps: one silver + one gold + one platinum → €10
 *   "animal"    — exactly 5 stamps: one of each animal                   → €7
 *   "non_metal" — exactly 3 stamps: 3 different plain (no metal) animals → €3
 */
export async function exchangeStamps(
  userId: number,
  setType: SetType,
  stampIds: number[],
): Promise<ApiResult<ExchangeResponse>> {
  return apiFetch<ExchangeResponse>("/exchanges", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      set_type: setType,
      stamp_ids: stampIds,
    }),
  });
}

// -----------------------------------------------------------------------------
// Client-side stamp utilities
// -----------------------------------------------------------------------------

/** Format a Stamptype into a readable string, e.g. "gold dolphin" or "lion". */
export function formatStamp(stamptype: Stamptype): string {
  return stamptype.metal
    ? `${stamptype.metal} ${stamptype.animal}`
    : stamptype.animal;
}

/** Find all complete metal sets (silver + gold + platinum) in a collection. */
export function findMetalSets(stamps: Stamp[]): Stamp[][] {
  const unexchanged = stamps.filter((s) => !s.exchanged_at);
  const byMetal: Partial<Record<StampMetal, Stamp[]>> = {};
  for (const s of unexchanged) {
    if (!s.stamptype.metal) continue;
    (byMetal[s.stamptype.metal] ??= []).push(s);
  }
  const sets: Stamp[][] = [];
  const silvers = byMetal["silver"] ?? [];
  const golds = byMetal["gold"] ?? [];
  const platinums = byMetal["platinum"] ?? [];
  const count = Math.min(silvers.length, golds.length, platinums.length);
  for (let i = 0; i < count; i++) {
    sets.push([silvers[i], golds[i], platinums[i]]);
  }
  return sets;
}

/** Find all complete animal sets (one of each of the 5 animals). */
export function findAnimalSets(stamps: Stamp[]): Stamp[][] {
  const unexchanged = stamps.filter((s) => !s.exchanged_at);
  const byAnimal: Partial<Record<StampAnimal, Stamp[]>> = {};
  for (const s of unexchanged) {
    (byAnimal[s.stamptype.animal] ??= []).push(s);
  }
  const animals: StampAnimal[] = [
    "lion",
    "dolphin",
    "toucan",
    "beetlebug",
    "snake",
  ];
  const count = Math.min(...animals.map((a) => (byAnimal[a] ?? []).length));
  const sets: Stamp[][] = [];
  for (let i = 0; i < count; i++) {
    sets.push(animals.map((a) => byAnimal[a]![i]));
  }
  return sets;
}

/** Find all complete non-metal sets (3 plain stamps from 3 different animals). */
export function findNonMetalSets(stamps: Stamp[]): Stamp[][] {
  const plain = stamps.filter((s) => !s.exchanged_at && !s.stamptype.metal);
  const byAnimal: Partial<Record<StampAnimal, Stamp[]>> = {};
  for (const s of plain) {
    (byAnimal[s.stamptype.animal] ??= []).push(s);
  }
  const available = (Object.keys(byAnimal) as StampAnimal[]).map((a) => ({
    animal: a,
    stamps: [...byAnimal[a]!],
  }));
  const sets: Stamp[][] = [];
  while (available.filter((a) => a.stamps.length > 0).length >= 3) {
    const candidates = available.filter((a) => a.stamps.length > 0).slice(0, 3);
    if (candidates.length < 3) break;
    sets.push(candidates.map((c) => c.stamps.shift()!));
  }
  return sets;
}
