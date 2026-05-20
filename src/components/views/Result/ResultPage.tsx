import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from "./ResultPage.module.css";
import Button from "../../atoms/buttons/Button";
import type { ReactElement } from "react";

interface StampReward {
  name: string;
  imageUrl: string | null;
}

interface ResultState {
  readonly winner: "player" | "opponent";
  readonly playerCreatureName?: string;
  readonly opponentCreatureName?: string;
  readonly xpGained?: number;
  // Only present for real (non-guest) users — null means guest or no stamp
  readonly stamp: StampReward | null;
}

export default function ResultPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const playerWon = state?.winner === "player";
  const playerName = state?.playerCreatureName ?? "Your creature";
  const opponentName = state?.opponentCreatureName ?? "The opponent";
  const xpGained = state?.xpGained ?? 0;
  const stamp = state?.stamp ?? null;

  //consol log to check if the stamp works
  //todo: REMOVE AFTER 100% CERTAIN EVERYTHING WORKS
  useEffect(() => {
    if (stamp === null) {
      console.log("ResultPage: no stamp awarded (guest)");
    }
  }, [stamp]);

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
