import { useState, useEffect } from "react";
import {
  readIdentityTokenFromUrl,
  getPlayerInfo,
} from "../api/centralbank.api";
import { upsertCentralbankUser } from "../lib/supabase-user";

export type Player = {
  id: number;
  name: string;
};

export type PlayerState =
  | { status: "loading" }
  | { status: "ready"; player: Player }
  | { status: "no_token" }
  | { status: "error"; message: string };

export function usePlayer(): PlayerState {
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    async function load(): Promise<void> {
      const token = readIdentityTokenFromUrl();

      if (!token) {
        setState({ status: "no_token" });
        return;
      }

      const result = await getPlayerInfo(token);

      if (result.success) {
        const { id, name } = result.data.user;
        await upsertCentralbankUser(id, name);
        setState({ status: "ready", player: { id, name } });
      } else {
        setState({ status: "error", message: result.error });
      }
    }

    load();
  }, []);

  return state;
}
