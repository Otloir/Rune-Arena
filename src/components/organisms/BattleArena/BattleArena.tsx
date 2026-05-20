import type { ReactElement } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";

interface BattleArenaProps {
  readonly playerOneId: string | number;
  readonly playerTwoId: string | number;
  readonly playerOneCreatureId: string | number;
  readonly playerTwoCreatureId: string | number;
}

export default function BattleArena({
  playerOneId,
  playerTwoId,
  playerOneCreatureId,
  playerTwoCreatureId,
}: BattleArenaProps): ReactElement {
  const { creature: playerOneCreature, level: playerOneLevel } =
    useCreatureById(playerOneId, playerOneCreatureId);

  const { creature: playerTwoCreature, level: playerTwoLevel } =
    useCreatureById(playerTwoId, playerTwoCreatureId);

  const {
    playerHp,
    opponentHp,
    turnOwner,
    isProcessing,
    battleLog,
    handlePlayerMove,
  } = useBattle({
    playerCreature: playerOneCreature,
    opponentCreature: playerTwoCreature,
    opponentCreatureId: playerTwoCreatureId,
    opponentLevel: playerTwoLevel,
  });

  const navigate = useNavigate();

  const battleOver: boolean = playerHp <= 0 || opponentHp <= 0;

  useEffect((): (() => void) | void => {
    if (!playerOneCreature || !playerTwoCreature) return;
    if (playerHp > 0 && opponentHp > 0) return;

    const winner: "player" | "opponent" =
      opponentHp <= 0 ? "player" : "opponent";

    const timer = setTimeout((): void => {
      navigate("/result", {
        replace: true,
        state: {
          winner,
          userId: Number(playerOneId),
          playerCreatureName: playerOneCreature.name,
          opponentCreatureName: playerTwoCreature.name,
        },
      });
    }, 1200);

    return (): void => clearTimeout(timer);
  }, [playerHp, opponentHp, playerOneCreature, playerTwoCreature, playerOneId, navigate]);

  if (!playerOneCreature || !playerTwoCreature) {
    return (
      <section className={styles.arena}>
        <div
          className={styles.loadingState}
          role="status"
          aria-live="polite"
          aria-label="Loading battle..."
        >
          Loading battle...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.arena}>
      <div className={styles.arenaContainer}>
        {/* Opponent */}
        <div className={styles.opponentContainer}>
          <div className={styles.opponent}>
            <StatusPanel
              userId={playerTwoId}
              creatureId={playerTwoCreatureId}
              currentHp={opponentHp}
              side="opponent"
            />
            <Creature
              userId={playerTwoId}
              creatureId={playerTwoCreatureId}
              role="opponent"
            />
          </div>
        </div>

        {/* Player */}
        <div className={styles.playerContainer}>
          <div className={styles.player}>
            <StatusPanel
              userId={playerOneId}
              creatureId={playerOneCreatureId}
              currentHp={playerHp}
              side="player"
            />
            <Creature
              userId={playerOneId}
              creatureId={playerOneCreatureId}
              role="player"
            />
          </div>
        </div>

        {/* Bottom controls panel */}
        <div className={styles.controlsWrapper}>
          <PlayerPanel
            creatureId={Number(playerOneCreatureId)}
            creatureLevel={playerOneLevel}
            onMoveSelect={handlePlayerMove}
            disabled={turnOwner !== "player" || isProcessing || battleOver}
            battleLog={battleLog}
            playerCreature={playerOneCreature}
          />
        </div>
      </div>
    </section>
  );
}