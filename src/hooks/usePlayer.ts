import { useState, useEffect } from "react";
import {
  readIdentityTokenFromUrl,
  getPlayerInfo,
} from "../api/centralbank.api";
import { upsertCentralbankUser, upsertGuestUser } from "../lib/supabase-user";
import { initUserCreatures } from "../database/creature.database";

export type Player = {
  id: number;
  name: string;
  isGuest: boolean;
};

export type PlayerState =
  | { status: "loading" }
  | { status: "ready"; player: Player; identityToken: string | null }
  | { status: "error"; message: string };

// Creates or reuses a guest player in Supabase
async function loadGuestPlayer(): Promise<Player | null> {
  const user = await upsertGuestUser();
  if (!user) return null;
  return { id: user.id, name: "Guest", isGuest: true };
}

// Sets state to a guest player and initialises their creatures
async function setGuestState(
  guest: Player,
  setState: (state: PlayerState) => void,
): Promise<void> {
  await initUserCreatures(guest.id);
  setState({ status: "ready", player: guest, identityToken: null });
}

export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    async function load(): Promise<void> {
      const token = readIdentityTokenFromUrl();
      console.log(
        "[usePlayer] identity token from URL:",
        token ? "present" : "missing",
      );

      // No token means the user came directly or the API is unavailable — use guest
      if (!token) {
        const guest = await loadGuestPlayer();
        if (!guest) {
          setState({
            status: "error",
            message: "Failed to create guest player.",
          });
          return;
        }
        await setGuestState(guest, setState);
        return;
      }

      // Try to resolve the token to a real user
      const result = await getPlayerInfo(token);

      // If the API is down or the token is invalid, fall back to guest
      if (!result.success) {
        console.error(
          "[usePlayer] getPlayerInfo failed — status:",
          result.status,
          "error:",
          result.error,
          "| falling back to guest",
        );
        const guest = await loadGuestPlayer();
        if (!guest) {
          setState({
            status: "error",
            message: "Failed to create guest player.",
          });
          return;
        }
        await setGuestState(guest, setState);
        return;
      }

      // Token resolved — save the real user to Supabase
      const { id: centralbankId, name } = result.data.user;
      const savedUser = await upsertCentralbankUser(centralbankId, name);

      if (!savedUser) {
        setState({
          status: "error",
          message: "Failed to persist player locally.",
        });
        return;
      }

      // Clear the token from sessionStorage now that the user is identified
      sessionStorage.removeItem("identity_token");

      // Initialise creatures and store the token so LobbyPage can charge the user on Start
      await initUserCreatures(savedUser.id);
      setState({
        status: "ready",
        player: { id: savedUser.id, name, isGuest: false },
        identityToken: token,
      });
    }

    load();
  }, []);

  return state;
}
