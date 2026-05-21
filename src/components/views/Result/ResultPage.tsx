import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResultPage.module.css";
import Button from "../../atoms/buttons/Button";
import { getUserBalance } from "../../../database/user.database";
import type { BattleError } from "../../../database/battle.database";

interface StampReward {
  name: string;
  imageUrl: string | null;
}

interface ResultState {
  readonly winner?: "player" | "opponent";
  readonly userId?: number;
  readonly playerCreatureName?: string;
  readonly opponentCreatureName?: string;
  readonly rewardName?: string;
  readonly rewardImage?: string;
  readonly rewardQuantity?: number;
  readonly xpGained?: number;
  readonly stamp: StampReward | null;
  /**
   * Set when the battle session was invalid (e.g. duplicate tab).
   * When present, winner/creature names are not shown.
   */
  readonly sessionError?: BattleError;
}

const SESSION_ERROR_MESSAGES: Record<BattleError, string> = {
  already_in_battle:
    "This session is invalid — a battle is already in progress in another tab. " +
    "Please close the other tab and start a new battle.",
  battle_not_found: "Battle session not found. Please start a new battle.",
  battle_already_ended:
    "This battle session was overridden by a newer battle in another tab. " +
    "No RuneCoins were awarded. Please close duplicate tabs and start a new battle.",
  reward_already_claimed: "The reward for this battle has already been claimed.",
  unknown: "Failed to load battle data. This can happen with duplicate tabs or a connection issue. Please start a new battle.",
};

export default function ResultPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const sessionError: BattleError | undefined = state?.sessionError;
  const winner: "player" | "opponent" | undefined = state?.winner;
  const playerName: string = state?.playerCreatureName ?? "Your creature";
  const opponentName: string = state?.opponentCreatureName ?? "The opponent";
  const rewardName: string = state?.rewardName ?? "Mystery Stamp";
  const rewardImage: string | undefined = state?.rewardImage;
  const rewardQuantity: number = state?.rewardQuantity ?? 1;
  const xpGained: number = state?.xpGained ?? 0;  
  const playerWon: boolean = winner === "player";
  const stamp = state?.stamp ?? null;

  const [newBalance, setNewBalance] = useState<number | null>(null);

  useEffect((): void => {
    const userId: number | undefined = state?.userId;
    if (userId == null || !playerWon) return;
    
    if (stamp === null) {
      console.log("ResultPage: no stamp awarded (guest)");
    }

    getUserBalance(userId).then((balance: number | null): void => {
      if (balance !== null) setNewBalance(balance);
    });
  }, [stamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReturnHome = (): void => {
    navigate("/");
  };

  // -----------------------------------------------------------------------
  // Invalid session screen
  // -----------------------------------------------------------------------
  if (sessionError) {
    return (
      <main className={styles.resultPage} aria-label="Battle session error">
        <section className={styles.content} aria-live="polite">
          <h1 className={`${styles.title} ${styles.defeat}`}>
            Invalid Session
          </h1>
          <p className={styles.subtitle}>
            {SESSION_ERROR_MESSAGES[sessionError]}
          </p>
          <Button
            type="button"
            variant="neutral"
            onClick={handleReturnHome}
            aria-label="Return to main arena"
            className={styles.secondaryButton}
          >
            Back to Arena
          </Button>
        </section>
      </main>
    );
  }
  
  

  //consol log to check if the stamp works
  //todo: REMOVE AFTER 100% CERTAIN EVERYTHING WORKS
  

  // -----------------------------------------------------------------------
  // Normal result screen
  // -----------------------------------------------------------------------
  return (
    <main className={styles.resultPage} aria-label="Battle result">
      <section
        className={styles.content}
        aria-live="polite"
        aria-label="Battle outcome details"
      >
        <h1
          className={`${styles.title} ${playerWon ? styles.victory : styles.defeat}`}
        >
          {playerWon ? "Victory!" : "Defeated!"}
        </h1>

        <p className={styles.subtitle}>
          {playerWon
            ? `${playerName} defeated ${opponentName}!`
            : `${playerName} was defeated by ${opponentName}...`}
        </p>

        {playerWon && (
          <p
            className={styles.coinsAwarded}
            aria-label="RuneCoins earned this battle"
          >
            {newBalance !== null
              ? `+5 RC earned! (Balance: ${newBalance} RC)`
              : "+5 RC earned!"}
          </p>
        )}
        
        {/* Only show the stamp section for real users who received one */}
        {stamp !== null && (
          <section className={styles.rewardSection} aria-label="Stamp reward">
            <p className={styles.rewardLabel}>You earned a stamp:</p>
            <article className={styles.rewardCard} aria-label="Stamp details">
              <div className={styles.rewardImageContainer}>
                {stamp.imageUrl ? (
                  <img
                    src={stamp.imageUrl}
                    alt={stamp.name}
                    className={styles.rewardImage}
                  />
                ) : (
                  <span className={styles.rewardFallback}>🪲</span>
                )}
              </div>
              <p className={styles.rewardName}>{stamp.name}</p>
            </article>
          </section>
        )}

        <p className={styles.xpGained} aria-label={`XP gained: ${xpGained}`}>
          +{xpGained} XP
        </p>

        <Button
          type="button"
          variant="neutral"
          onClick={() => navigate("/")}
          aria-label="Return to main arena"
          className={styles.secondaryButton}
        >
          Back to Arena
        </Button>
      </section>
    </main>
  );
}
