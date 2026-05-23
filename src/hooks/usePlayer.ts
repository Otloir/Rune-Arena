import { useEffect, useState } from "react";
import { resolvePlayer } from "../lib/supabase-user";
import type { LocalUser } from "../lib/supabase-user";
import { initUserCreatures } from "../database/creature.database";

export type PlayerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      player: LocalUser & { isGuest: boolean };
      identityToken: string | null;
    };

/**
 * Reads the identity_token from the URL. 
 * If a token exists, calls GET /identity-tokens/{token} then upserts them into Supabase Users table.
 * If no token (or resolution fails), creates / reuses a guest account.
 * After the user row exists, ensures all creature rows are initialised
 */
export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { isGuest, localUser, identityToken } = await resolvePlayer();

        // Ensure the user has creature rows so the arena won't 404
        await initUserCreatures(localUser.id);

        if (!cancelled) {
          setState({
            status: "ready",
            player: { ...localUser, isGuest },
            identityToken,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              err instanceof Error ? err.message : "Unknown error during login",
          });
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
