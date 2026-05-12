import { useItem } from "./../../../hooks/useItem";
import styles from "./Item.module.css";

interface ItemProps {
  itemId: number;
  variant?: "row" | "card";
  store?: boolean;
  onBuy?: () => void;
}

const Item: React.FC<ItemProps> = ({
  itemId,
  variant = "row",
  store,
  onBuy,
}) => {
  const { item, loading, error, retry } = useItem(itemId);

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        <p>{error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  if (!item) return <div>No item found.</div>;

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
          {store === true && (
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

export default Item;
