import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Item from "../../atoms/Item/Item";
import {
  getItems,
  getUserItems,
  buyItem,
} from "../../../database/item.database";
import type { BuyResult } from "../../../database/item.database";
import type { Item as ItemType } from "../../../types/item.types";
import styles from "./ItemList.module.css";
import PurchaseModal from "../PurchaseModal/PurchaseModal";

interface ListProps {
  readonly type?: "store" | "inventory";
  readonly variant: "card" | "row";
  readonly userId?: string;
  readonly balance?: number;
  readonly onBalanceChange?: () => void;
}

interface ActivePurchase {
  readonly itemName: string;
  readonly status: BuyResult;
}

export default function ItemList({
  type,
  variant,
  userId,
  balance,
  onBalanceChange,
}: ListProps): ReactElement {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<ActivePurchase | null>(null);

  const handleBuy = async (item: ItemType): Promise<void> => {
    if (!userId) {
      console.error("[ItemList] Cannot buy item: no userId provided");
      return;
    }
    const result: BuyResult = await buyItem(userId, item.id);
    setPurchaseStatus({ itemName: item.name, status: result });
    if (result === "success") {
      onBalanceChange?.();
    }
  };

  const closePurchaseModal = (): void => {
    setPurchaseStatus(null);
  };

  useEffect((): void => {
    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      const data: ItemType[] | null =
        type === "inventory" && userId != null
          ? await getUserItems(userId)
          : await getItems();

      if (data) {
        setItems(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to load items");
      }
      setLoading(false);
    }
    load();
  }, [userId, type]);

  if (loading) return <div>Loading items...</div>;
  if (error) return <div>{error}</div>;

  if (items.length === 0 && type === "inventory") {
    return (
      <div className={styles.emptyState}>
        <p>Your inventory is empty</p>
        <p>Visit the store to get started!</p>
      </div>
    );
  }

  if (items.length === 0 && type === "store") {
    return (
      <div className={styles.emptyState}>
        <p>No items available in the store</p>
      </div>
    );
  }

  return (
    <div
      className={
        type === "store" ? styles.shopItemList : styles.inventoryItemList
      }
    >
      <PurchaseModal
        itemName={purchaseStatus?.itemName ?? ""}
        status={purchaseStatus?.status ?? null}
        isOpen={purchaseStatus !== null}
        onClose={closePurchaseModal}
      />
      {items.map((item: ItemType) => (
        <Item
          key={item.id}
          item={item}
          variant={variant}
          type={type}
          onBuy={type === "store" ? (): Promise<void> => handleBuy(item) : undefined}
          canAfford={balance == null || item.price <= balance}
        />
      ))}
    </div>
  );
}