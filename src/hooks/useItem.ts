import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Item } from "../types/item.types";

interface UseItemResult {
  readonly item: Item | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly retry: () => Promise<void>;
}

export function useItem(itemId?: number): UseItemResult {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (): Promise<void> => {
    if (itemId == null) {
      setItem(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase
      .from("Items")
      .select("id, name, property, propvalue, description, price, img")
      .eq("id", itemId)
      .single<Item>();

    if (supabaseError) {
      setItem(null);
      setError("Failed to load item.");
    } else {
      setItem(data);
    }

    setLoading(false);
  }, [itemId]);

  useEffect((): void => {
    fetchItem();
  }, [fetchItem]);

  return { item, loading, error, retry: fetchItem };
}