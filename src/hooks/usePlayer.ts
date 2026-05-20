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
  | { status: "ready"; player: Player }
  | { status: "error"; message: string };

async function loadGuestPlayer(): Promise<Player | null> {
  const user = await upsertGuestUser();
  if (!user) return null;
  return { id: user.id, name: "Guest", isGuest: true };
}

export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    async function load(): Promise<void> {
      const token = readIdentityTokenFromUrl();

      // No token — fall back to guest
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
        setState({ status: "ready", player: guest });
        return;
      }

      const result = await getPlayerInfo(token);

      // API down or token invalid — fall back to guest
      if (!result.success) {
        console.warn(
          "[usePlayer] API unavailable, falling back to guest:",
          result.error,
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
        setState({ status: "ready", player: guest });
        return;
      }

      // Real user
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
        player: { id: upsertedUser.id, name, isGuest: false },
      });
    }

    load();
  }, []);

  return state;
}
