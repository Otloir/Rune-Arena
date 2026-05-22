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
  readonly stamp: StampReward | null;
  readonly isGuest: boolean;
}

const loopland_url = "https://loopland.se";

export default function ResultPage(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const playerWon = state?.winner === "player";
  const playerName = state?.playerCreatureName ?? "Your creature";
  const opponentName = state?.opponentCreatureName ?? "The opponent";
  const xpGained = state?.xpGained ?? 0;
  const stamp = state?.stamp ?? null;
  const isGuest = state?.isGuest ?? true;

  useEffect(() => {
    if (stamp === null) {
      console.log("ResultPage: no stamp awarded (guest)");
    }
  }, [stamp]);

  const handleBack = () => {
    if (isGuest) {
      navigate("/");
    } else {
      window.location.href = loopland_url;
    }
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
          onClick={handleBack}
          aria-label={isGuest ? "Return to lobby" : "Return to Tivoli"}
          className={styles.secondaryButton}
        >
          {isGuest ? "Back to Lobby" : "Back to Tivoli"}
        </Button>
      </section>
    </main>
  );
}
