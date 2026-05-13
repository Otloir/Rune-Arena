import { useState } from "react";
import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import MovesPanel from "../../molecules/MovesPanel/MovesPanel";
import styles from "./BattleArena.module.css";
import type { MoveWithType } from "../../../types/move.types";
import { useCreatureById } from "../../../hooks/useCreature";

interface BattleArenaProps {
  playerOne: number;
  playerTwo: number;
  playerOneCreatureId: number;
  playerTwoCreatureId: number;
}

export default function BattleArena({
  playerOne,
  playerTwo,
  playerOneCreatureId,
  playerTwoCreatureId,
}: BattleArenaProps) {
  // Player creature info
  const {
    level: playerOneLevel,
    creature: playerOneCreature,
  } = useCreatureById(playerOne, playerOneCreatureId);

  // Opponent creature info
  const {
    creature: playerTwoCreature,
  } = useCreatureById(playerTwo, playerTwoCreatureId);

  // Dynamic HP state
  const [playerHp, setPlayerHp] = useState<number | null>(null);
  const [opponentHp, setOpponentHp] = useState<number | null>(null);

  // Initialize HP once creatures load
  const resolvedPlayerHp =
    playerHp ?? playerOneCreature?.hp ?? 0;

  const resolvedOpponentHp =
    opponentHp ?? playerTwoCreature?.hp ?? 0;

  const handleMoveSelect = (move: MoveWithType) => {
    if (!playerTwoCreature) return;

    setOpponentHp((prevHp) => {
      const currentHp = prevHp ?? playerTwoCreature.hp;
      return Math.max(0, currentHp - move.damage);
    });

    console.log(
      `${playerOneCreature?.name} used ${move.name} for ${move.damage} damage!`,
    );
  };

  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>
        {/* Opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              currentHp={resolvedOpponentHp}
            />
            <Creature
              userId={playerTwo}
              creatureId={playerTwoCreatureId}
              role="opponent"
            />
          </div>
        </div>

        {/* Player */}
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <StatusPanel
              userId={playerOne}
              creatureId={playerOneCreatureId}
              currentHp={resolvedPlayerHp}
            />
            <Creature
              userId={playerOne}
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controlsContainer}>
          <MovesPanel
            creatureId={playerOneCreatureId}
            creatureLevel={playerOneLevel}
            onMoveSelect={handleMoveSelect}
          />
        </div>
      </div>
    </section>
  );
}