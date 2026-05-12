import ItemList from "../components/molecules/itemList/ItemList";

interface InventoryItemProps {
  userId?: number;
}
export default function Inventory({ userId }: InventoryItemProps) {
// hardcoded user id. update to a dynamic one when we get ids from the centralbank
  userId = 2;
  return (
    <>
      <ItemList userId={userId} variant="row" />
    </>
  );
}
