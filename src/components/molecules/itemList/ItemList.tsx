import { useEffect, useState } from "react";
import Item from "../../atoms/Item/Item";
import { getItems } from "../../../api/item.database";
import type { Item as ItemType } from "../../../types/item.types";
import styles from "./ItemList.module.css";

interface ListProps {
  store?: boolean;
  variant: "card" | "row";
}
export default function ItemList({ store, variant }: ListProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const data = await getItems();
      if (data) {
        setItems(data);
      } else {
        setError("Failed to load items");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Loading items...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.shopItemList}>
      {items.map((item) => (
        <Item key={item.id} itemId={item.id} variant={variant} store={store} />
      ))}
    </div>
  );
}
