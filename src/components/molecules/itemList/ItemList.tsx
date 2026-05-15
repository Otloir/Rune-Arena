import { useEffect, useState } from "react";
import Item from "../../atoms/Item/Item";
import { getItems, getUserItems } from "../../../api/item.database";
import type { Item as ItemType } from "../../../types/item.types";
import styles from "./ItemList.module.css";

interface ListProps {
  type?: "store" | "inventory";
  variant: "card" | "row";
  userId?: number;
}
export default function ItemList({ type, variant, userId }: ListProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = (item: ItemType) => {
    console.log("Buying:", item.name);
    // TODO: Implement purchase logic 
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const data =
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
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          variant={variant}
          type={type}
          onBuy={type === "store" ? () => handleBuy(item) : undefined}
        />
      ))}
    </div>
  );
}
