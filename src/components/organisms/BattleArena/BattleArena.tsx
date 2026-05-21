import type { ReactElement } from "react";
import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";
import { startBattle, endBattle } from "../../../database/battle.database";
import type { BattleError } from "../../../database/battle.database";

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
  const {
    creature: playerOneCreature,
    level: playerOneLevel,
    loading: playerOneLoading,
    error: playerOneError,
  } = useCreatureById(playerOneId, playerOneCreatureId);

  const {
    creature: playerTwoCreature,
    loading: playerTwoLoading,
    error: playerTwoError,
  } = useCreatureById(playerTwoId, playerTwoCreatureId);

  // ========================================
  // RESTORED RANDOM OPPONENT LEVEL FEATURE
  // ========================================

  const randomizedOpponentLevel = useMemo((): number => {
    if (!playerOneLevel) return 1;

    const roll = Math.floor(Math.random() * 3);

    // -1 level
    if (roll === 0) {
      return Math.max(1, playerOneLevel - 1);
    }

    // +1 level
    if (roll === 2) {
      return playerOneLevel + 1;
    }

    // same level
    return playerOneLevel;
  }, [playerOneLevel]);

  const {
    playerHp,
    opponentHp,
    turnOwner,
    isProcessing,
    battleLog,
    handlePlayerMove,
    xpGained,
  } = useBattle({
    playerCreature: playerOneCreature,
    opponentCreature: playerTwoCreature,
    opponentCreatureId: playerTwoCreatureId,

    // Use randomized level instead of actual DB level
    opponentLevel: randomizedOpponentLevel,

    playerUserId: playerOneId,
    playerCreatureId: playerOneCreatureId,
  });

  const navigate = useNavigate();

  const battleIdRef = useRef<number | null>(null);
  const battleStartedRef = useRef<boolean>(false);
  const battleConcludedRef = useRef<boolean>(false);
  const sessionInvalidRef = useRef<boolean>(false);

  const battleOver: boolean = playerHp <= 0 || opponentHp <= 0;

  const creatureLoadFailed: boolean =
    (!playerOneLoading && playerOneError !== null) ||
    (!playerTwoLoading && playerTwoError !== null);

  // ========================================
  // HANDLE CREATURE LOAD FAILURE
  // ========================================

  useEffect((): void => {
    if (!creatureLoadFailed) return;

    sessionInvalidRef.current = true;
    battleConcludedRef.current = true;

    navigate("/result", {
      replace: true,
      state: {
        sessionError: "unknown" as BattleError,
        userId: Number(playerOneId),
      },
    });
  }, [creatureLoadFailed, navigate, playerOneId]);

  // ========================================
  // REGISTER BATTLE
  // ========================================

  useEffect((): void => {
    if (!playerOneCreature || !playerTwoCreature) return;
    if (battleStartedRef.current) return;

    battleStartedRef.current = true;

    startBattle({
      playerId: Number(playerOneId),
      opponentId: Number(playerTwoId),
      playerCreatureId: Number(playerOneCreatureId),
      enemyCreatureId: Number(playerTwoCreatureId),
    })
      .then((battleId: number): void => {
        battleIdRef.current = battleId;
      })
      .catch((reason: BattleError): void => {
        sessionInvalidRef.current = true;
        battleConcludedRef.current = true;

        navigate("/result", {
          replace: true,
          state: {
            sessionError: reason,
            userId: Number(playerOneId),
          },
        });
      });
  }, [
    playerOneCreature,
    playerTwoCreature,
    playerOneId,
    playerTwoId,
    playerOneCreatureId,
    playerTwoCreatureId,
    navigate,
  ]);

  // ========================================
  // FORFEIT ON UNMOUNT
  // ========================================

  useEffect((): (() => void) => {
    return (): void => {
      if (battleConcludedRef.current) return;

      const battleId = battleIdRef.current;

      if (battleId === null) return;

      endBattle(battleId, 0).catch((): void => {
        // Ignore unmount cleanup errors
      });
    };
  }, []);

  // ========================================
  // HANDLE BATTLE END
  // ========================================

  useEffect((): (() => void) | void => {
    if (!playerOneCreature || !playerTwoCreature) return;
    if (playerHp > 0 && opponentHp > 0) return;
    if (sessionInvalidRef.current) return;

    const winner: "player" | "opponent" =
      opponentHp <= 0 ? "player" : "opponent";

    const timer = setTimeout(async (): Promise<void> => {
      battleConcludedRef.current = true;

      const battleId = battleIdRef.current;

      if (battleId === null) {
        console.warn(
          "[BattleArena] Battle ended but no battleId recorded — reward not granted.",
        );

        navigate("/result", {
          replace: true,
          state: {
            sessionError: "battle_not_found" as BattleError,
            userId: Number(playerOneId),
          },
        });

        return;
      }

      const winnerUserId = winner === "player"
        ? Number(playerOneId)
        : 0;

      try {
        await endBattle(battleId, winnerUserId);

        navigate("/result", {
          replace: true,
          state: {
            winner,
            userId: Number(playerOneId),
            playerCreatureName: playerOneCreature.name,
            opponentCreatureName: playerTwoCreature.name,

            // Use ACTUAL XP gained from useBattle
            xpGained: winner === "player" ? xpGained : 0,
          },
        });
      } catch (reason: unknown) {
        navigate("/result", {
          replace: true,
          state: {
            sessionError: reason as BattleError,
            userId: Number(playerOneId),
          },
        });
      }
    }, 1200);

    return (): void => clearTimeout(timer);
  }, [
    playerHp,
    opponentHp,
    playerOneCreature,
    playerTwoCreature,
    playerOneId,
    navigate,
    xpGained,
  ]);

  // ========================================
  // LOADING STATE
  // ========================================

  if (playerOneLoading || playerTwoLoading) {
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

  // ========================================
  // LOAD FAILURE FALLBACK
  // ========================================

  if (creatureLoadFailed || !playerOneCreature || !playerTwoCreature) {
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

  // ========================================
  // RENDER
  // ========================================

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
              levelOverride={randomizedOpponentLevel}
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

        {/* Controls */}
        <div className={styles.controlsWrapper}>
          <PlayerPanel
            creatureId={Number(playerOneCreatureId)}
            creatureLevel={playerOneLevel}
            onMoveSelect={handlePlayerMove}
            disabled={
              turnOwner !== "player" ||
              isProcessing ||
              battleOver
            }
            battleLog={battleLog}
            playerCreature={playerOneCreature}
          />
        </div>
      </div>
    </section>
  );
}