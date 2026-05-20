import type { ReactElement } from "react";
import { useItem } from "./../../../hooks/useItem";
import type { Item as ItemType } from "./../../../types/item.types";
import styles from "./Item.module.css";

interface ItemProps {
  readonly item?: ItemType;
  readonly itemId?: number;
  readonly variant?: "row" | "card";
  readonly type?: "store" | "inventory";
  readonly onBuy?: () => void;
  readonly canAfford?: boolean;
}

export default function Item({
  item,
  itemId,
  variant = "row",
  type,
  onBuy,
  canAfford = true,
}: ItemProps): ReactElement {
  const {
    item: fetchedItem,
    loading,
    error,
  } = useItem(itemId && !item ? itemId : undefined);

  const displayItem: ItemType | undefined = item ?? fetchedItem;

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

        <p className={styles.cardProperty}>
          {displayItem.property} {displayItem.propvalue}
        </p>

        <p className={styles.cardDescription}>{displayItem.description}</p>

        <div className={styles.cardFooter}>
          <span className={styles.price}>
            <span aria-hidden="true" className={styles.coinIcon}>
              RC
            </span>
            {displayItem.price}
          </span>

          {type === "store" && onBuy && (
            <button
              className={`${styles.buyBtn}${!canAfford ? ` ${styles.buyBtnDisabled}` : ""}`}
              onClick={canAfford ? onBuy : undefined}
              disabled={!canAfford}
              aria-label={
                canAfford
                  ? `Buy ${displayItem.name} for ${displayItem.price} RC`
                  : `Cannot afford ${displayItem.name} (costs ${displayItem.price} RC)`
              }
            >
              {canAfford ? "Buy" : "Can't afford"}
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
          <span className={styles.rowQuantity} aria-label="Quantity owned">
            × {displayItem.quantity ?? 1}
          </span>
        </div>
        <p className={styles.rowProperty}>
          {displayItem.property} {displayItem.propvalue}
        </p>
        <p className={styles.rowDescription}>{displayItem.description}</p>
      </div>
    </article>
  );
}