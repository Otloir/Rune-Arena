import { useState, useEffect } from "react";
import {
  readIdentityTokenFromUrl,
  getPlayerInfo,
} from "../api/centralbank.api";
import { upsertCentralbankUser } from "../lib/supabase-user";

export type Player = {
  id: number;
  name: string;
  isGuest: boolean;
};

export type PlayerState =
  | { status: "loading" }
  | { status: "ready"; player: Player }
  | { status: "error"; message: string };


// Uses a negative number to avoid colliding with real IDs.
function getOrCreateGuestId(): number {
  const stored = localStorage.getItem("guest_id");
  if (stored) return Number(stored);

  const newId = -(Math.floor(Math.random() * 1_000_000) + 1);
  localStorage.setItem("guest_id", String(newId));
  return newId;
}

const GUEST_PLAYER: Player = {
  id: getOrCreateGuestId(),
  name: "Guest",
  isGuest: true,
};

export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    async function load(): Promise<void> {
      const token = readIdentityTokenFromUrl();

      // No token — API unavailable or user came directly, fall back to guest
      if (!token) {
        await upsertCentralbankUser(GUEST_PLAYER.id, GUEST_PLAYER.name);
        setState({ status: "ready", player: GUEST_PLAYER });
        return;
      }

      const result = await getPlayerInfo(token);

      // API down or token invalid — fall back to guest
      if (!result.success) {
        console.warn(
          "[usePlayer] API unavailable, falling back to guest:",
          result.error,
        );
        await upsertCentralbankUser(GUEST_PLAYER.id, GUEST_PLAYER.name);
        setState({ status: "ready", player: GUEST_PLAYER });
        return;
      }

      const { id, name } = result.data.user;
      const upsertedUser = await upsertCentralbankUser(id, name);

      if (upsertedUser === null) {
        setState({
          status: "error",
          message: "Failed to persist player locally.",
        });
        return;
      }

      setState({ status: "ready", player: { id, name, isGuest: false } });
    }

    load();
  }, []);

  return state;
}
