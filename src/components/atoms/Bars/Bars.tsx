import styles from "./Bars.module.css";

interface BarProps {
  current: number;
  max: number;
  label?: string;
  variant?: "hp" | "xp";
}

export default function Bars({
  current,
  max,
  variant = "hp",
}: BarProps) {
  const percentage = (current / max) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <div
          className={styles[variant]}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        >
        </div>
      </div>
      {variant === "hp" && (
        <p>
          {current} / {max}
        </p>
      )}
    </div>
  );
}
