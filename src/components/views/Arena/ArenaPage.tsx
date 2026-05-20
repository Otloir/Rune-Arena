import { Navigate, useLocation } from "react-router-dom";
import BattleArena from "./../../organisms/BattleArena/BattleArena";
import type { TransactionResponse } from "../../../types/api.types";

interface ArenaState {
  readonly playerOneUserId: string;
  readonly playerOneCreatureId: string;
  readonly transaction: TransactionResponse | null;
}

export default function ArenaPage() {
  const location = useLocation();
  const state = location.state as ArenaState | undefined;
  const playerOneUserId = state?.playerOneUserId;
  const playerOneCreatureId = state?.playerOneCreatureId;
  const transaction = state?.transaction ?? null;

  if (!playerOneUserId || !playerOneCreatureId) {
    return <Navigate to="/" replace />;
  }

  // TODO: make more dynamic later
  // player 1 = the user
  // player 2 = opponent
  return (
    <>
      <BattleArena
        playerOneId={playerOneUserId}
        playerTwoId="2"
        playerOneCreatureId={playerOneCreatureId}
        playerTwoCreatureId="3"
        transaction={transaction}
      />
    </>
  );
}
