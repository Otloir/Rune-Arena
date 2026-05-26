import ItemList from "../../molecules/itemList/ItemList";
import type { Item as ItemType } from "../../../types/item.types";
import style from "./InventoryPage.module.css";

interface InventoryPageProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  isInBattle?: boolean;
  onUseItem?: (item: ItemType) => Promise<boolean>;
  refreshToggle?: boolean;
}

export default function InventoryPage({
  userId,
  isOpen,
  onClose,
  isInBattle = false,
  onUseItem,
  refreshToggle,
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
          <ItemList
            userId={userId}
            variant="row"
            type="inventory"
            onUseItem={isInBattle && onUseItem ? onUseItem : undefined}
            refreshToggle={refreshToggle}
            isInBattle={isInBattle}
          />
        </div>
      </div>
    </div>
  );
}
