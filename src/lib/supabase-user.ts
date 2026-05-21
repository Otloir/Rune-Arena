import { supabase } from "./supabase";

export interface LocalUser {
  readonly id: number;
  readonly centralbank_id: number;
  readonly name: string;
  readonly runecoins: number;
}

// Upsert a real centralbank user into Supabase.
// If the user already exists (matched by centralbank_id), their name is updated.
export async function upsertCentralbankUser(
  centralbankId: number,
  name: string,
): Promise<LocalUser | null> {
  const { data, error } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: centralbankId, name },
      { onConflict: "centralbank_id" },
    )
    .select("id, centralbank_id, name, runecoins")
    .single<LocalUser>();

  if (error) {
    console.error("[upsertCentralbankUser]", error.message);
    return null;
  }

  return data;
}

/**
 * Get or create a stable negative centralbank_id for this guest session.
 * Stored in localStorage so the same guest maps to the same DB row on reload.
 */
function getOrCreateGuestCentralbankId(): number {
  const stored = localStorage.getItem("guest_centralbank_id");
  const parsed = Number(stored);

  if (Number.isFinite(parsed) && parsed < 0) {
    return parsed;
  }

  const nextId = -1 - Number(localStorage.getItem("guest_count") ?? 0);
  localStorage.setItem("guest_centralbank_id", String(nextId));
  localStorage.setItem("guest_count", String(Math.abs(nextId)));
  return nextId;
}

/**
 * Upsert a guest user with a stable negative centralbank_id.
 */
export async function upsertGuestUser(): Promise<LocalUser | null> {
  const guestCentralbankId = getOrCreateGuestCentralbankId();

  const { data, error } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: guestCentralbankId, name: "Guest" },
      { onConflict: "centralbank_id" },
    )
    .select("id, centralbank_id, name, runecoins")
    .single<LocalUser>();

  if (error) {
    console.error("[upsertGuestUser]", error.message);
    return null;
  }

  return data;
}