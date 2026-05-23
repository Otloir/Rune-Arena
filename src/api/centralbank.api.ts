import type {
  TransactionStamp,
  TransactionResponse,
  IdentityTokenInfo,
  ApiResult,
} from "./../types/api.types";

function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const BASE_URL = getRequiredEnvVar("VITE_TIVOLI_API_URL").replace(/\/$/, "");
const API_KEY = getRequiredEnvVar("VITE_AMUSEMENT_API_KEY");

// -----------------------------------------------------------------------------
// Internal fetch helper
// -----------------------------------------------------------------------------

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

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
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
 * Read `identity_token` from the current URL without removing it.
 */
export function getIdentityTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("identity_token");
}

/**
 * Resolve an identity token to the player's centralbank id and name.
 * Unauthenticated — possession of a valid, unexpired token is sufficient.
 */
export async function getPlayerInfo(
  token: string,
): Promise<ApiResult<IdentityTokenInfo>> {
  return apiFetch<IdentityTokenInfo>(`/identity-tokens/${token}`);
}

// -----------------------------------------------------------------------------
// Transactions
// -----------------------------------------------------------------------------

/**
 * Charge the player the entrance fee and receive a stamp.
 * The identity_token is consumed for stamp-minting on the first call;
 * subsequent calls with the same token still process the payment but
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

// -----------------------------------------------------------------------------
// Stamps
// -----------------------------------------------------------------------------

/**
 * Format a transaction stamp into a human-readable name.
 * Examples: "gold dolphin", "silver lion", "toucan"
 */
export function formatStamp(stamp: TransactionStamp): string {
  if (stamp.metal) {
    return `${stamp.metal} ${stamp.animal}`;
  }
  return stamp.animal;
}
