import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResultPage.module.css";

interface ResultState {
  readonly winner: "player" | "opponent";
  readonly playerCreatureName?: string;
  readonly opponentCreatureName?: string;
  readonly rewardName?: string;
  readonly rewardImage?: string;
  readonly rewardQuantity?: number;
}

export default function ResultPage(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const winner = state?.winner;
  const playerName = state?.playerCreatureName ?? "Your creature";
  const opponentName = state?.opponentCreatureName ?? "The opponent";

  const rewardName = state?.rewardName ?? "Mystery Stamp";
  const rewardImage = state?.rewardImage;
  const rewardQuantity = state?.rewardQuantity ?? 1;

  const playerWon = winner === "player";

  function handleReturnHome(): void {
    navigate("/");
  }

  return (
    <main className={styles.resultPage} aria-label="Battle result">
      <section
        className={styles.content}
        aria-live="polite"
        aria-label="Battle outcome details"
      >
        <h1
          className={`${styles.title} ${
            playerWon ? styles.victory : styles.defeat
          }`}
        >
          {playerWon ? "Victory!" : "Defeated!"}
        </h1>

        <p className={styles.subtitle}>
          {playerWon
            ? `${playerName} defeated ${opponentName}!`
            : `${playerName} was defeated by ${opponentName}...`}
        </p>

        {/* Always rendered reward block (key fix) */}
        <section className={styles.rewardSection} aria-label="Reward information">
          <p className={styles.rewardLabel}>
            {playerWon ? "You gained:" : "Better luck next time"}
          </p>

          <article
            className={styles.rewardCard}
            aria-label="Item reward details"
          >
            <div className={styles.rewardImageContainer}>
              {playerWon ? (
                rewardImage ? (
                  <img
                    src={rewardImage}
                    alt={rewardName}
                    className={styles.rewardImage}
                  />
                ) : (
                  <span className={styles.rewardFallback}>🪲</span>
                )
              ) : (
                <span className={styles.noReward}>❌</span>
              )}

              {playerWon && (
                <span
                  className={styles.rewardCount}
                  aria-label={`Item quantity: ${rewardQuantity}`}
                >
                  {rewardQuantity}
                </span>
              )}
            </div>

            <p className={styles.rewardName}>
              {playerWon ? rewardName : "No reward earned"}
            </p>
          </article>
        </section>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleReturnHome}
          aria-label="Return to main arena"
        >
          Back to Arena
        </button>
      </section>
    </main>
  );
}