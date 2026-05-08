import { useItem } from "./useItem";
import ItemDisplay from "./ItemDisplay";

const Item: React.FC<{ itemId: number }> = ({ itemId }) => {
  const { item, loading, error, retry } = useItem(itemId);
  if (loading) return <div>Loading...</div>;
  if (error) return <div><p>{error}</p><button onClick={retry}>Retry</button></div>;
  if (!item) return <div>No item found.</div>;
  return <ItemDisplay item={item} variant="row" />;
};

export default Item;