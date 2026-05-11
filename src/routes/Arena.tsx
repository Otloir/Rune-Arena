import BattleArena from "../components/organisms/BattleArena/BattleArena";

export default function Arena() {
  // make more dynamic later with multiplayer and bot/snigleplayer version
  // player 1 = the user
  // player 2 = oponent
  return (
    <>
      <BattleArena
        playerOne={1}
        playerTwo={2}
        playerOneCreatureId={1}
        playerTwoCreatureId={1}
      />
    </>
  );
}
