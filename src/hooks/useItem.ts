import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Item } from "../types/item.types";

export const useItem = (itemId?: number): {
  item: Item | null;
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
} => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async (): Promise<void> => {
    if (itemId == null) {
      setItem(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("Items")
      .select("id, name, property, propvalue, description, price, img")
      .eq("id", itemId)
      .single();

    if (error) {
      setItem(null);
      setError("Failed to load item.");
    } else {
      setItem(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  return { item, loading, error, retry: fetchItem };
};
