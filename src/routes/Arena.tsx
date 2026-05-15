  import BattleArena from "../components/organisms/BattleArena/BattleArena";

  export default function Arena() {
    // FIX: make more dynamic later with multiplayer and bot/singleplayer version
    // player 1 = the user
    // player 2 = opponent
    return (
      <>
        <BattleArena
          playerOneId={1}
          playerTwoId={2}
          playerOneCreatureId={1}
          playerTwoCreatureId={3}
        />
      </>
    );
  }
