import type { Item } from "./../../../types/item.types";
import styles from "./ItemDisplay.module.css";

interface Props {
  item: Item;
  variant?: "row" | "card";         // controls layout
  onBuy?: () => void;               // optional — shop card only
}

const ItemDisplay: React.FC<Props> = ({ item, variant = "row", onBuy }) => {
  if (variant === "card") {
    return (
      <div className={styles.card}>
        <img src={item.img} alt={item.name} className={styles.cardImg} />
        <h3 className={styles.cardName}>{item.name}</h3>
        <p className={styles.cardDescription}>
          Increases {item.property} by {item.propvalue}
        </p>
        <div className={styles.cardFooter}>
          <span className={styles.price}>
            <span className={styles.coinIcon}>🪙</span>
            {item.price}
          </span>
          {onBuy && (
            <button className={styles.buyBtn} onClick={onBuy}>
              Buy
            </button>
          )}
        </div>
      </div>
    );
  }

  // default: "row" (bag / inventory)
  return (
    <div className={styles.row}>
      <img src={item.img} alt={item.name} className={styles.rowImg} />
      <div className={styles.rowBody}>
        <div className={styles.rowTitleRow}>
          <span className={styles.rowName}>{item.name}</span>
          <span className={styles.rowQuantity}>×1</span>
        </div>
        <p className={styles.rowDescription}>
          Increases {item.property} by {item.propvalue}
        </p>
      </div>
    </div>
  );
};

export default ItemDisplay;