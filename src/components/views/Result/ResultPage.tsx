import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResultPage.module.css";
import Button from "../../atoms/buttons/Button";
import { updateUserBalance } from "../../../database/user.database";

const RUNE_COIN_WIN_REWARD = 5 as const;

interface ResultState {
  readonly winner: "player" | "opponent";
  /**
   * The local DB user id (number). Must be included in navigation state
   * when navigating to /result so RuneCoins can be awarded.
   * Example: navigate("/result", { state: { winner: "player", userId: player.id, ... } })
   */
  readonly userId?: number;
  readonly playerCreatureName?: string;
  readonly opponentCreatureName?: string;
  readonly rewardName?: string;
  readonly rewardImage?: string;
  readonly rewardQuantity?: number;
}

export default function ResultPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;
  const [coinsAwarded, setCoinsAwarded] = useState<number | null>(null);

  const winner: ResultState["winner"] | undefined = state?.winner;
  const playerName: string = state?.playerCreatureName ?? "Your creature";
  const opponentName: string = state?.opponentCreatureName ?? "The opponent";
  const rewardName: string = state?.rewardName ?? "Mystery Stamp";
  const rewardImage: string | undefined = state?.rewardImage;
  const rewardQuantity: number = state?.rewardQuantity ?? 1;
  const playerWon: boolean = winner === "player";
  const hasAwardedCoins = useRef(false);

  useEffect((): void => {
    // Guard: only award coins to a real logged-in user who won
    if (!playerWon) return;

    // Prevent double execution in React StrictMode
    if (hasAwardedCoins.current) return;
    hasAwardedCoins.current = true;

    const userId: number | undefined = state?.userId;
    if (userId == null) {
      console.warn(
        "[ResultPage] userId missing from navigation state — RuneCoins not awarded. " +
        "Pass userId when navigating: navigate('/result', { state: { userId: player.id, ... } })"
      );
      return;
    }

    updateUserBalance(userId, RUNE_COIN_WIN_REWARD).then(
      (newBalance: number | null): void => {
        if (newBalance !== null) {
          setCoinsAwarded(RUNE_COIN_WIN_REWARD);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerWon, state]); // intentionally runs once on mount

  const handleReturnHome = (): void => {
    navigate("/");
  };

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

        {playerWon && coinsAwarded !== null && (
          <p
            className={styles.coinsAwarded}
            aria-label={`Earned ${coinsAwarded} RuneCoins`}
          >
            +{coinsAwarded} RC earned!
          </p>
        )}

        <section className={styles.rewardSection} aria-label="Reward information">
          <p className={styles.rewardLabel}>{"You earned:"}</p>

          <article className={styles.rewardCard} aria-label="Item reward details">
            <div className={styles.rewardImageContainer}>
              {rewardImage ? (
                <img
                  src={rewardImage}
                  alt={rewardName}
                  className={styles.rewardImage}
                />
              ) : (
                <span className={styles.rewardFallback}>🪲</span>
              )}

              <span
                className={styles.rewardCount}
                aria-label={`Item quantity: ${rewardQuantity}`}
              >
                {rewardQuantity}
              </span>
            </div>

            <p className={styles.rewardName}>{rewardName}</p>
          </article>
        </section>

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