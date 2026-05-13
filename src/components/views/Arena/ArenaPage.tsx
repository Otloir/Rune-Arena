import { useLocation } from "react-router-dom";
import BattleArena from "./../../organisms/BattleArena/BattleArena";

export default function ArenaPage() {
  const location = useLocation();
  const playerOneUserId = location.state?.playerOneUserId;
  const playerOneCreatureId = location.state?.playerOneCreatureId;

  // TODO: make more dynamic later with multiplayer and bot/singleplayer version
  // player 1 = the user
  // player 2 = opponent
  return (
    <>
      <BattleArena
        playerOne={playerOneUserId}
        playerTwo={2}
        playerOneCreatureId={parseInt(playerOneCreatureId)}
        playerTwoCreatureId={3}
      />
    </>
  );
}
