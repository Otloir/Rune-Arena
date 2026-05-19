import { supabase } from "./supabase";

export type LocalUser = {
  centralbank_id: number;
  name: string;
  last_seen: string;
};

export async function upsertCentralbankUser(
  id: number,
  name: string,
): Promise<LocalUser | null> {
  const { data, error } = await supabase
    .from("Users")
    .upsert(
      {
        centralbank_id: id,
        name,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "centralbank_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("[upsertCentralbankUser]", error.message);
    return null;
  }

  return data as LocalUser;
}
