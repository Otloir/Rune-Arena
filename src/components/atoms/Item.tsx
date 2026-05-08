import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

interface ItemProps {
  itemId: number;
}

interface ItemRow {
    id: number;
    name: string;
    property: string;
    propvalue: number;
    description: string;
    price: number;
    img: string;
}

const Item: React.FC<ItemProps> = ({ itemId }) => {
  const [item, setItem] = useState<ItemRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("Items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
      } else {
        setItem(data);
      }
    };

    fetchItem();
  }, [itemId]);

  if (!item) return <div>Loading...</div>;
=======
  const fetchItem = async () => {
     setLoading(true);
     setError(null);
     const { data, error } = await supabase
       .from("Items")
       .select("*")
       .eq("id", itemId)
       .single();

       if (error) {
       console.error("Error fetching item:", error);
       setItem(null);
       setError("Failed to load item. Please try again.");
     } else {
       setItem(data);
     }
     setLoading(false);
   };
   useEffect(() => {
    fetchItem();
  }, [itemId]);

  if (loading) return <div>Loading...</div>;

  if (error) {
     return (
       <div className="item">
         <p>{error}</p>
         <button type="button" onClick={fetchItem}>Retry</button>
       </div>
     );
   }
   if (!item) return <div>No item found.</div>;

>>>>>>> 3202359 (Updated item with better error catching)

  return (
    <div className="item">
        <img src={item.img} alt={item.name} className="item-img"/>
        <h3 className="item-name">{item.name}</h3>
        <p className="item-property">Type: {item.property}</p>
        <p className="item-propvalue">Value: {item.propvalue}</p>
        <p className="item-description">{item.description}</p>
        <p className="item-price">Price: {item.price} coins</p>
    </div>
  );
};

export default Item;