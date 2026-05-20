import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";
import { startBattle, endBattle } from "../../../database/battle.database";

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

  // Track the server-side battle id so we can close it on end or forfeit
  const battleIdRef = useRef<number | null>(null);
  // Prevent double-registration in React StrictMode
  const battleStartedRef = useRef<boolean>(false);
  // Track whether the battle concluded normally so the forfeit cleanup knows not to fire
  const battleConcludedRef = useRef<boolean>(false);

  const battleOver: boolean = playerHp <= 0 || opponentHp <= 0;

  // Register the battle server-side when both creatures are loaded
  useEffect((): void => {
    if (!playerOneCreature || !playerTwoCreature) return;
    if (battleStartedRef.current) return;
    battleStartedRef.current = true;

    startBattle({
      playerId: Number(playerOneId),
      opponentId: Number(playerTwoId),
      playerCreatureId: Number(playerOneCreatureId),
      enemyCreatureId: Number(playerTwoCreatureId),
    }).then((battleId: number | null): void => {
      if (battleId === null) {
        console.error("[BattleArena] Failed to register battle server-side.");
        return;
      }
      battleIdRef.current = battleId;
    });
  }, [playerOneCreature, playerTwoCreature, playerOneId, playerTwoId, playerOneCreatureId, playerTwoCreatureId]);

  // Forfeit on unmount if the battle hasn't concluded normally.
  // This covers: back button, navigate away, accidental tab close.
  // Uses a synchronous beacon-style fire-and-forget since cleanup
  // functions cannot be async.
  useEffect((): (() => void) => {
    return (): void => {
      if (battleConcludedRef.current) return;
      const battleId = battleIdRef.current;
      if (battleId === null) return;

      // Fire-and-forget — we can't await in a cleanup function
      endBattle(battleId, 0).catch((err: unknown): void => {
        console.error("[BattleArena] Forfeit on unmount failed:", err);
      });
    };
  }, []); // empty deps — this cleanup should only register once

  // When the battle ends normally, close it server-side then navigate
  useEffect((): (() => void) | void => {
    if (!playerOneCreature || !playerTwoCreature) return;
    if (playerHp > 0 && opponentHp > 0) return;

    const winner: "player" | "opponent" =
      opponentHp <= 0 ? "player" : "opponent";

    const timer = setTimeout(async (): Promise<void> => {
      const battleId = battleIdRef.current;

      if (battleId !== null) {
        const winnerUserId = winner === "player" ? Number(playerOneId) : 0;
        // Mark as concluded before calling endBattle so the unmount
        // cleanup doesn't also try to forfeit the same battle
        battleConcludedRef.current = true;
        await endBattle(battleId, winnerUserId);
      } else {
        console.warn(
          "[BattleArena] Battle ended but no battleId recorded — reward not granted.",
        );
      }

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