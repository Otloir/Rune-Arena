import { supabase } from "./supabase";

export type LocalUser = {
  id: number;
  centralbank_id: number;
  name: string;
};

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
  const { data, error } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: centralbankId, name },
      { onConflict: "centralbank_id" },
    )
    .select("id, centralbank_id, name")
    .single();

  if (error) {
    console.error("[upsertCentralbankUser]", error.message);
    return null;
  }

  return data;
}

// Upsert a guest user into Supabase using a stable negative centralbank_id.
// Returning guests reuse their existing row thanks to the onConflict clause.
export async function upsertGuestUser(): Promise<LocalUser | null> {
  const guestCentralbankId = getOrCreateGuestCentralbankId();

  const { data, error } = await supabase
    .from("Users")
    .upsert(
      { centralbank_id: guestCentralbankId, name: "Guest" },
      { onConflict: "centralbank_id" },
    )
    .select("id, centralbank_id, name")
    .single();

  if (error) {
    console.error("[upsertGuestUser]", error.message);
    return null;
  }

  return data;
}
