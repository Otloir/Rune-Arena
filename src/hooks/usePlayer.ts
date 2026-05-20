import { useState, useEffect } from "react";
import {
  readIdentityTokenFromUrl,
  getPlayerInfo,
} from "../api/centralbank.api";
import { upsertCentralbankUser, upsertGuestUser } from "../lib/supabase-user";
import { initUserCreatures } from "../database/creature.database";

export interface Player {
  readonly id: number;
  readonly name: string;
  readonly isGuest: boolean;
}

export type PlayerState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly player: Player }
  | { readonly status: "error"; readonly message: string };

async function loadGuestPlayer(): Promise<Player | null> {
  const user = await upsertGuestUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: "Guest",
    isGuest: true,
  };
}

export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({
    status: "loading",
  });

  useEffect((): void => {
    async function load(): Promise<void> {
      try {
        const token = readIdentityTokenFromUrl();

        // -------------------------------------------------------------------
        // No token → guest mode
        // -------------------------------------------------------------------

        if (!token) {
          const guest = await loadGuestPlayer();

          if (!guest) {
            setState({
              status: "error",
              message: "Failed to create guest player.",
            });

            return;
          }

          await initUserCreatures(guest.id);

          setState({
            status: "ready",
            player: guest,
          });

          return;
        }

        // -------------------------------------------------------------------
        // Attempt authenticated player lookup
        // -------------------------------------------------------------------

        const result = await getPlayerInfo(token);

        // IMPORTANT:
        // This only works correctly if getPlayerInfo is typed as:
        //
        // Promise<ApiResult<IdentityTokenInfo>>
        //
        // in centralbank.api.ts
        // -------------------------------------------------------------------

        if (result.success === false) {
          console.warn(
            "[usePlayer] API unavailable, falling back to guest:",
            result.error
          );

          const guest = await loadGuestPlayer();

          if (!guest) {
            setState({
              status: "error",
              message: "Failed to create guest player.",
            });

            return;
          }

          await initUserCreatures(guest.id);

          setState({
            status: "ready",
            player: guest,
          });

          return;
        }

        // -------------------------------------------------------------------
        // Authenticated player success
        // -------------------------------------------------------------------

        const { id, name } = result.data.user;

        const upsertedUser = await upsertCentralbankUser(id, name);

        if (upsertedUser === null) {
          setState({
            status: "error",
            message: "Failed to persist player locally.",
          });

          return;
        }

        await initUserCreatures(upsertedUser.id);

        setState({
          status: "ready",
          player: {
            id: upsertedUser.id,
            name,
            isGuest: false,
          },
        });
      } catch (error) {
        console.error("[usePlayer] Unexpected error:", error);

        setState({
          status: "error",
          message: "Unexpected error while loading player.",
        });
      }
    }

    void load();
  }, []);

  return state;
}