import { useItem } from "./../../../hooks/useItem";
import type { Item as ItemType } from "./../../../types/item.types";
import styles from "./Item.module.css";
interface ItemProps {
  readonly item?: ItemType;
  readonly itemId?: number;
  readonly variant?: "row" | "card";
  readonly type?: "store" | "inventory";
  readonly onBuy?: () => void | Promise<void>;
  readonly onUse?: () => void | Promise<void>;
  readonly canAfford?: boolean;
  readonly isInBattle?: boolean;
}
const Item: React.FC<ItemProps> = ({
  item,
  itemId,
  variant = "row",
  type,
  onBuy,
  onUse,
  canAfford = true,
  isInBattle = false,
}) => {
  const {
    item: fetchedItem,
    loading,
    error,
  } = useItem(itemId && !item ? itemId : undefined);
  const displayItem: ItemType | undefined = item ?? fetchedItem ?? undefined;
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
        {!isInBattle && (
          <p className={styles.cardDescription}>{displayItem.description}</p>
        )}
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
              onClick={onBuy}
              aria-label={
                  `Buy ${displayItem.name} for ${displayItem.price} RC`
              }
            >
              {"Buy"}
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
        <p className={styles.rowProperty}>
          {displayItem.property} {displayItem.propvalue}
        </p>
        {!isInBattle && (
          <p className={styles.rowDescription}>{displayItem.description}</p>
        )}
      </div>
      {type === "inventory" && onUse && (
        <div className={styles.rowActions}>
          <button
            className={styles.useBtn}
            onClick={onUse}
            aria-label={`Use ${displayItem.name}`}
          >
            Use
          </button>
        </div>
      )}
    </article>
  );
};
export default Item;
