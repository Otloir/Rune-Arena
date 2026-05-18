import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResultPage.module.css";

interface ResultState {
  winner: "player" | "opponent";
  playerCreatureName?: string;
  opponentCreatureName?: string;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const winner = state?.winner;
  const playerName = state?.playerCreatureName ?? "Your creature";
  const opponentName = state?.opponentCreatureName ?? "The opponent";
  const playerWon = winner === "player";

  return (
    <main className={styles.resultPage}>
      <div className={`${styles.card} ${playerWon ? styles.cardVictory : styles.cardDefeat}`}>
        <span className={`${styles.badge} ${playerWon ? styles.badgeVictory : styles.badgeDefeat}`}>
          Battle over
        </span>
        <h1 className={`${styles.title} ${playerWon ? styles.titleVictory : styles.titleDefeat}`}>
          {playerWon ? "Victory!" : "Defeated!"}
        </h1>
        <p className={styles.subtitle}>
          {playerWon
            ? `${playerName} defeated ${opponentName}!`
            : `${playerName} was defeated by ${opponentName}...`}
        </p>
        <button className={styles.button} onClick={() => navigate("/")}>
          Return home
        </button>
      </div>
    </main>
  );
}