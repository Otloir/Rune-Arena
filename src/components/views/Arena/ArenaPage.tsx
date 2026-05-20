import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import BattleArena from "./../../organisms/BattleArena/BattleArena";

interface ArenaLocationState {
  readonly playerOneUserId?: string | number;
  readonly playerOneCreatureId?: string | number;
}

export default function ArenaPage(): ReactElement {
  const location = useLocation();
  const { playerOneUserId, playerOneCreatureId } =
    (location.state ?? {}) as ArenaLocationState;

  if (!playerOneUserId || !playerOneCreatureId) {
    return <Navigate to="/" replace />;
  }

  // TODO: make more dynamic later
  // player 1 = the user, player 2 = opponent
  return (
    <BattleArena
      playerOneId={playerOneUserId}
      playerTwoId="2"
      playerOneCreatureId={playerOneCreatureId}
      playerTwoCreatureId="3"
    />
  );
}