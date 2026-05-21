import type {
  StampType,
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
const BASE_URL = getRequiredEnvVar("VITE_TIVOLI_API_URL");
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
      credentials: "include",
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
 * The token is saved to sessionStorage first so it survives the page load
 * and can still be used even after the URL is cleaned up.
 */
export function readIdentityTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("identity_token");

  if (token) {
    // Save to sessionStorage before scrubbing from URL
    sessionStorage.setItem("identity_token", token);

    params.delete("identity_token");
    const clean =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", clean);
  }

  // Fall back to sessionStorage if token wasn't in the URL this load
  return token ?? sessionStorage.getItem("identity_token");
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
// Transactions (api_key is read from env — no need to pass it at call site)
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

// -----------------------------------------------------------------------------
// Stamps
// -----------------------------------------------------------------------------

/** Format a stamp's type into a readable string, e.g. "gold dolphin" or "lion". */
export function formatStamp(stampType: StampType): string {
  if (stampType.metal) {
    return `${stampType.metal} ${stampType.animal}`;
  }
  return stampType.animal;
}
