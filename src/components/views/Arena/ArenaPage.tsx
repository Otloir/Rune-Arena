import { Navigate, useLocation } from "react-router-dom";
import BattleArena from "./../../organisms/BattleArena/BattleArena";

export default function ArenaPage() {
  const location = useLocation();
  const playerOneUserId = location.state?.playerOneUserId;
  const playerOneCreatureId = location.state?.playerOneCreatureId;

  if (!playerOneUserId || !playerOneCreatureId) {
    return <Navigate to="/" replace />;
  }

  // TODO: make more dynamic later
  // player 1 = the user
  // player 2 = opponent
  return (
    <>
      <BattleArena
        playerOne={playerOneUserId}
        playerTwo="2"
        playerOneCreatureId={playerOneCreatureId}
        playerTwoCreatureId="3"
      />
    </>
  );
}
