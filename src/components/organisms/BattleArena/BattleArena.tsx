import StatusPanel from "../../molecules/StatusPanel/StatusPanel";
import Creature from "../../molecules/Creature/Creature";
import styles from "./BattleArena.module.css";
import PlayerPanel from "../../molecules/PlayerPanel/PlayerPanel";
import { useCreatureById } from "../../../hooks/useCreature";
import { useBattle } from "../../../hooks/useBattle";
import { useEffect, useMemo, useState } from "react";
import InventoryPage from "../../views/Inventory/InventoryPage";
import { useNavigate } from "react-router-dom";
import { formatStamp } from "../../../api/centralbank.api";
import type { TransactionResponse } from "../../../types/api.types";

interface BattleArenaProps {
  playerOneId: string | number;
  playerTwoId: string | number;
  playerOneCreatureId: string | number;
  playerTwoCreatureId: string | number;
  transaction: TransactionResponse | null;
}

export default function BattleArena({
  playerOneId,
  playerTwoId,
  playerOneCreatureId,
  playerTwoCreatureId,
  transaction,
}: BattleArenaProps) {
  const { creature: playerOneCreature, level: playerOneLevel } =
    useCreatureById(playerOneId, playerOneCreatureId);

  const { creature: playerTwoCreature } = useCreatureById(
    playerTwoId,
    playerTwoCreatureId,
  );

  const randomizedOpponentLevel = useMemo(() => {
    if (!playerOneLevel) return 1;

    const roll = Math.floor(Math.random() * 3);

    if (roll === 0) {
      return Math.max(1, playerOneLevel - 1);
    }

    if (roll === 2) {
      return playerOneLevel + 1;
    }

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
    playerStatBoosts,
    handlePlayerUseItem,
  } = useBattle({
    playerCreature: playerOneCreature,
    opponentCreature: playerTwoCreature,
    opponentCreatureId: playerTwoCreatureId,
    opponentLevel: randomizedOpponentLevel,
    playerUserId: playerOneId,
    playerCreatureId: playerOneCreatureId,
  });

  const navigate = useNavigate();

  const battleOver = playerHp <= 0 || opponentHp <= 0;

  // Track damage for shake animation
  const [prevPlayerHp, setPrevPlayerHp] = useState<number | null>(null);
  const [prevOpponentHp, setPrevOpponentHp] = useState<number | null>(null);
  const [playerIsHit, setPlayerIsHit] = useState(false);
  const [opponentIsHit, setOpponentIsHit] = useState(false);

  useEffect(() => {
    if (prevPlayerHp !== null && playerHp < prevPlayerHp) {
      setPlayerIsHit(true);
      const timer = setTimeout(() => setPlayerIsHit(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevPlayerHp(playerHp);
  }, [playerHp, prevPlayerHp]);

  useEffect(() => {
    if (prevOpponentHp !== null && opponentHp < prevOpponentHp) {
      setOpponentIsHit(true);
      const timer = setTimeout(() => setOpponentIsHit(false), 400);
      return () => clearTimeout(timer);
    }
    setPrevOpponentHp(opponentHp);
  }, [opponentHp, prevOpponentHp]);

  // Inventory modal state (mirror Lobby behavior)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    if (!playerOneCreature || !playerTwoCreature) return;

    if (playerHp <= 0 || opponentHp <= 0) {
      const winner: "player" | "opponent" =
        opponentHp <= 0 ? "player" : "opponent";

      const timer = setTimeout(() => {
        navigate("/result", {
          replace: true,
          state: {
            winner,
            playerCreatureName: playerOneCreature.name,
            opponentCreatureName: playerTwoCreature.name,
            xpGained,
            stamp: transaction?.stamp
              ? {
                  name: formatStamp(transaction.stamp.stamptype),
                  imageUrl: transaction.stamp.stamptype.image_url,
                }
              : null,
          },
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [
    playerHp,
    opponentHp,
    playerOneCreature,
    playerTwoCreature,
    navigate,
    xpGained,
    transaction,
  ]);

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
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        userId={String(playerOneId)}
        isInBattle={true}
        onUseItem={async (item) => {
          try {
            setIsInventoryOpen(false);
            await handlePlayerUseItem(item);
          } catch (err) {
            console.error("Error using item:", err);
          }
        }}
      />
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
              isAttacking={turnOwner === "opponent" && isProcessing}
              isHit={opponentIsHit}
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
              isAttacking={turnOwner === "player" && isProcessing}
              isHit={playerIsHit}
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
            onOpenInventory={() => setIsInventoryOpen(true)}
          />
        </div>
      </div>
    </section>
  );
}
