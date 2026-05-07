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