import { useEffect, useState } from "react";
import Item from "../../atoms/Item/Item";
import {
  getItems,
  getUserItems,
  buyItem,
} from "../../../database/item.database";
import type { Item as ItemType } from "../../../types/item.types";
import styles from "./ItemList.module.css";
import PurchaseModal from "../PurchaseModal/PurchaseModal";

interface ListProps {
  type?: "store" | "inventory";
  variant: "card" | "row";
  userId?: string;
  onUseItem?: (item: ItemType) => Promise<boolean>;
  refreshToggle?: boolean;
}

type InventoryConsumptionWindow = Window & {
  __consumingItems?: Set<string>;
};

function getInventoryConsumptionWindow(): InventoryConsumptionWindow {
  return window as InventoryConsumptionWindow;
}

export default function ItemList({
  type,
  variant,
  userId,
  onUseItem,
  refreshToggle,
}: ListProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<{
    itemName: string;
    status: "success" | "failure";
  } | null>(null);
  const [inProgressIds, setInProgressIds] = useState<number[]>([]);

  const handleBuy = async (item: ItemType): Promise<void> => {
    if (!userId) {
      return;
    }
    const success = await buyItem(userId, item.id);
    if (success) {
      setPurchaseStatus({ itemName: item.name, status: "success" });
    } else {
      setPurchaseStatus({ itemName: item.name, status: "failure" });
    }
  };

  const closePurchaseModal = () => {
    setPurchaseStatus(null);
  };

  useEffect(() => {
    let isComponentMounted = true;

    async function loadItems(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data =
          type === "inventory" && userId != null
            ? await getUserItems(userId)
            : await getItems();
        if (!isComponentMounted) return;
        if (data) {
          setItems(Array.isArray(data) ? data : []);
        } else {
          setError("Failed to load items");
        }
      } catch (e) {
        if (!isComponentMounted) return;
        setError("Failed to load items");
      } finally {
        if (isComponentMounted) setLoading(false);
      }
    }

    loadItems();

    const inventoryChangeHandler = (event: Event) => {
      try {
        const inventoryChangeEvent = event as CustomEvent;
        if (!userId) return;
        const changedUserId = String(inventoryChangeEvent.detail?.userId ?? "");
        if (changedUserId === String(userId)) {
          loadItems();
        }
      } catch (err) {
      }
    };

    window.addEventListener(
      "inventory:changed",
      inventoryChangeHandler as EventListener,
    );

    return () => {
      isComponentMounted = false;
      window.removeEventListener(
        "inventory:changed",
        inventoryChangeHandler as EventListener,
      );
    };
  }, [userId, type, refreshToggle]);

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

  const handleUse = async (item: ItemType) => {
    if (!onUseItem) return;

    if (inProgressIds.includes(item.id)) {
      return;
    }

    const consumptionWindow = getInventoryConsumptionWindow();
    consumptionWindow.__consumingItems ??= new Set<string>();
    const consumptionKey = `${userId}:${item.id}`;
    const activeConsumptionSet = consumptionWindow.__consumingItems;
    if (activeConsumptionSet && activeConsumptionSet.has(consumptionKey)) {
      return;
    }
    if (activeConsumptionSet) activeConsumptionSet.add(consumptionKey);

    setInProgressIds((p) => [...p, item.id]);

    const previousItems = items;

    const itemIndex = items.findIndex(
      (currentItem) => currentItem.id === item.id,
    );
    if (itemIndex !== -1) {
      const updatedItems = items
        .map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity ?? 1) - 1 } : i,
        )
        .filter((i) => (i.quantity ?? 1) > 0);
      setItems(updatedItems);
    }

    try {
      const wasItemUsed = await onUseItem(item);
      if (!wasItemUsed) {
        setItems(previousItems);
      } else {
        if (userId) {
          const refreshedItems = await getUserItems(userId);
          if (refreshedItems) setItems(refreshedItems);
        }
      }
    } catch (err) {
      setItems(previousItems);
    } finally {
      setInProgressIds((p) => p.filter((id) => id !== item.id));
      consumptionWindow.__consumingItems?.delete(consumptionKey);
    }
  };

  return (
    <div
      className={
        type === "store" ? styles.shopItemList : styles.inventoryItemList
      }
    >
      <PurchaseModal
        itemName={purchaseStatus?.itemName || ""}
        status={purchaseStatus?.status || null}
        isOpen={purchaseStatus !== null}
        onClose={closePurchaseModal}
      />
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          variant={variant}
          type={type}
          onBuy={type === "store" ? () => handleBuy(item) : undefined}
          onUse={
            type === "inventory" && onUseItem
              ? () => handleUse(item)
              : undefined
          }
        />
      ))}
    </div>
  );
}
