import styles from "./StatusPanel.module.css";
import Bars from "../../atoms/Bars/Bars";
import { useCreature } from "../../../hooks/useCreature";

export default function StatusPanel() {
  const { creatures } = useCreature();

  // temporary fixed placeholder. make dynamic later
  const creature = creatures[0];

  return (
    <>
      <section className={styles.statusBarContainer}>
        <div className={styles.statusBarInfo}>
          <span>{creature?.name}</span>
          {/* add dynamic creature lvl here instead of fixed value*/}
          <span>lv. 1</span>
        </div>

        <Bars current={500} max={2000} variant="xp" aria="xp bar" />
        <Bars current={80} max={creature?.hp} variant="hp" aria="hp bar" />
      </section>
    </>
  );
}
