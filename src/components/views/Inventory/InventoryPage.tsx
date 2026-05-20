import type { ReactElement } from "react";
import ItemList from "../../molecules/itemList/ItemList";
import style from "./InventoryPage.module.css";

interface InventoryPageProps {
  readonly userId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function InventoryPage({
  userId,
  isOpen,
  onClose,
}: InventoryPageProps): ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className={style.overlay} onClick={onClose}>
      <div
        className={style.modal}
        onClick={(e: React.MouseEvent): void => e.stopPropagation()}
      >
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