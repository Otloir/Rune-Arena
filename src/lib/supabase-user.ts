import { supabase } from "./supabase";

export type LocalUser = {
  id: number;
  centralbank_id: number;
  name: string;
};

// Real centralbank user — matches on centralbank_id
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

// Get or create a sequential negative centralbank_id for guests (-1, -2, -3...)
function getOrCreateGuestCentralbankId(): number {
  const stored = localStorage.getItem("guest_centralbank_id");
  const parsed = Number(stored);

  if (Number.isFinite(parsed) && parsed < 0) {
    return parsed;
  }

  // Find the next available negative id by decrementing from -1
  const nextId = -1 - Number(localStorage.getItem("guest_count") ?? 0);
  localStorage.setItem("guest_centralbank_id", String(nextId));
  localStorage.setItem("guest_count", String(Math.abs(nextId)));
  return nextId;
}

// Upsert a guest user with a stable negative centralbank_id
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
