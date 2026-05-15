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

  if (!item) {
    if (loading) return <div aria-busy="true">Loading item...</div>;
    if (error) return <div role="alert">{error}</div>;
  }

  if (!displayItem) return <div role="status">No item found.</div>;

  if (variant === "card") {
    return (
      <article
        className={styles.card}
        aria-label={`${displayItem.name} item card`}
      >
        {displayItem.img && (
          <img
            src={displayItem.img}
            alt={displayItem.name}
            className={styles.cardImg}
          />
        )}

        <h3 className={styles.cardName}>{displayItem.name}</h3>

        <p className={styles.cardDescription}>{displayItem.description}</p>

        <div className={styles.cardFooter}>
          <span className={styles.price}>
            <span aria-hidden="true" className={styles.coinIcon}>
              €
            </span>
            {displayItem.price}
          </span>

          {type === "store" && onBuy && (
            <button
              className={styles.buyBtn}
              onClick={onBuy}
              aria-label={`Buy ${displayItem.name} for ${displayItem.price} euros`}
            >
              Buy
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={styles.row}
      aria-label={`${displayItem.name} inventory item`}
    >
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

          {/* Show quantity if available, otherwise default to 1 */}
          <span className={styles.rowQuantity} aria-label="Quantity owned">
            × {displayItem.quantity ?? 1}
          </span>
        </div>

        <p className={styles.rowDescription}>{displayItem.description}</p>
      </div>
    </article>
  );
};

export default Item;
