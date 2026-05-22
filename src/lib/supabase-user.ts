import { supabase } from "./supabase";
import { getIdentityTokenFromUrl, getPlayerInfo } from "../api/centralbank.api";

export interface LocalUser {
  readonly id: number;
  readonly centralbank_id: number;
  readonly name: string;
  readonly runecoins: number;
}

// Returns a stable negative guest centralbank_id from localStorage.
// Guests get -1, -2, -3... so they never collide with real positive centralbank IDs.
function getOrCreateGuestCentralbankId(): number {
  const stored = localStorage.getItem("guest_centralbank_id");
  const parsed = Number(stored);

  // Reuse the stored id if it's a valid negative number
  if (Number.isFinite(parsed) && parsed < 0) {
    return parsed;
  }

  // No valid id stored — generate the next one in the sequence
  const existingCount = Number(localStorage.getItem("guest_count") ?? 0);
  const nextId = -1 - existingCount;
  localStorage.setItem("guest_centralbank_id", String(nextId));
  localStorage.setItem("guest_count", String(existingCount + 1));
  return nextId;
}

// Upsert a real centralbank user into Supabase.
// If the user already exists (matched by centralbank_id), their name is updated.
export async function upsertCentralbankUser(
  centralbankId: number,
  name: string,
): Promise<LocalUser | null> {
  const { error: upsertError } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: centralbankId, name },
      { onConflict: "centralbank_id" },
    );

  if (upsertError) {
    console.error(
      "[upsertCentralbankUser] upsert failed:",
      upsertError.message,
    );
    return null;
  }

  const { data, error: selectError } = await supabase
    .from("Users")
    .select("id, centralbank_id, name")
    .eq("centralbank_id", centralbankId)
    .single();

  if (selectError) {
    console.error(
      "[upsertCentralbankUser] select failed:",
      selectError.message,
    );
    return null;
  }

  return data;
}

// Upsert a guest user into Supabase using a stable negative centralbank_id.
// Returning guests reuse their existing row thanks to the onConflict clause.
export async function upsertGuestUser(): Promise<LocalUser | null> {
  const guestCentralbankId = getOrCreateGuestCentralbankId();

  const { error: upsertError } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: guestCentralbankId, name: "Guest" },
      { onConflict: "centralbank_id", ignoreDuplicates: true },
    );

  if (upsertError) {
    console.error("[upsertGuestUser] upsert failed:", upsertError.message);
    return null;
  }

  const { data, error: selectError } = await supabase
    .from("Users")
    .select("id, centralbank_id, name")
    .eq("centralbank_id", guestCentralbankId)
    .single();

  if (selectError) {
    console.error("[upsertGuestUser] select failed:", selectError.message);
    return null;
  }

  return data;
}

export type ResolvedPlayer =
  | { isGuest: true; localUser: LocalUser; identityToken: null }
  | { isGuest: false; localUser: LocalUser; identityToken: string };

/**
 * Returns the local user row plus whether they are a guest, and keeps the
 * identity token in memory so LobbyPage can pass it to startTransaction.
 */
export async function resolvePlayer(): Promise<ResolvedPlayer> {
  const token = getIdentityTokenFromUrl();

  if (token) {
    const result = await getPlayerInfo(token);

    if (result.success) {
      const { id: centralbankId, name } = result.data.user;
      const localUser = await upsertCentralbankUser(centralbankId, name);

      if (localUser) {
        return { isGuest: false, localUser, identityToken: token };
      }
      // upsert failed — fall through to guest
      console.warn(
        "[resolvePlayer] upsertCentralbankUser failed, falling back to guest",
      );
    } else {
      // Token expired or invalid — fall through to guest
      console.warn("[resolvePlayer] identity token invalid:", result.error);
    }
  }

  // No token or resolution failed — create / reuse a guest account
  const guestUser = await upsertGuestUser();

  if (!guestUser) {
    throw new Error("[resolvePlayer] Failed to create guest user");
  }

  return { isGuest: true, localUser: guestUser, identityToken: null };
}
