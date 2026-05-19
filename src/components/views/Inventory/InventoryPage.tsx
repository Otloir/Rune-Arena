import ItemList from "../../molecules/itemList/ItemList";
import style from "./InventoryPage.module.css";

interface InventoryPageProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryPage({
  userId,
  isOpen,
  onClose,
}: InventoryPageProps) {
  if (!isOpen) return null;

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={style.closeButton}
          onClick={onClose}
          aria-label="Close inventory"
        >
          ✕
        </button>
        <h2>Inventory</h2>
        <div className={style.content}>
          <ItemList userId={userId} variant="row" type="inventory" />
        </div>
      </div>
    </div>
  );
}
