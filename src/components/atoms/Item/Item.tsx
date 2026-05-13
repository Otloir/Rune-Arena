import { useItem } from "./../../../hooks/useItem";
import type { Item as ItemType } from "./../../../types/item.types";
import styles from "./Item.module.css";

interface ItemProps {
  item?: ItemType;
  itemId?: number;
  variant?: "row" | "card";
  type?: "store" | "inventory";
  onBuy?: () => void;
}

const Item: React.FC<ItemProps> = ({
  item,
  itemId,
  variant = "row",
  type,
  onBuy,
}) => {
  const {
    item: fetchedItem,
    loading,
    error,
  } = useItem(itemId && !item ? itemId : undefined);
  const displayItem = item || fetchedItem;

  // If an item was passed in directly, skip loading/error states entirely
  if (!item) {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
  }

  if (!displayItem) return <div>No item found.</div>;

  if (variant === "card") {
    return (
      <div className={styles.card}>
        {displayItem.img && (
          <img
            src={displayItem.img}
            alt={displayItem.name}
            className={styles.cardImg}
          />
        )}
        <h3 className={styles.cardName}>{displayItem.name}</h3>
        <p className={styles.cardDescription}>
          Increases {displayItem.property} by {displayItem.propvalue}
        </p>
        <div className={styles.cardFooter}>
          <span className={styles.price}>
            <span className={styles.coinIcon}>€</span>
            {displayItem.price}
          </span>
          {type === "store" && onBuy && (
            <button className={styles.buyBtn} onClick={onBuy}>
              Buy
            </button>
          )}
        </div>
      </div>
    );
  }

  // default: "row" (bag / inventory)
  // TODO: make quantity display dynamic and not fixed
  return (
    <div className={styles.row}>
      {displayItem.img && (
        <img
          src={displayItem.img}
          alt={displayItem.name}
          className={styles.rowImg}
        />
      )}
      <div className={styles.rowBody}>
        <div className={styles.rowTitleRow}>
          <span className={styles.rowName}>{displayItem.name}</span>
          <span className={styles.rowQuantity}>×1</span>
        </div>
        <p className={styles.rowDescription}>
          Increases {displayItem.property} by {displayItem.propvalue}
        </p>
      </div>
    </div>
  );
};

export default Item;
