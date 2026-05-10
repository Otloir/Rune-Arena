import styles from "./Bars.module.css";

interface BarProps {
  current: number;
  max: number;
  aria: string;
  variant?: "hp" | "xp";
}

export default function Bars({
  current,
  max,
  aria,
  variant = "hp",
}: BarProps) {
  const percentage =
    Number.isFinite(current) && Number.isFinite(max) && max > 0
      ? Math.max(0, Math.min(100, (current / max) * 100))
      : 0;

  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        role="statusbar"
        aria-label={aria}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={styles[variant]} style={{ width: `${percentage}%` }} />
      </div>
      {/* commenting out just in case i want it back in a lil bit */}
      {/* {variant === "hp" && (
        <p>
          {current} / {max}
        </p>
      )} */}
    </div>
  );
}
