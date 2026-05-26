import { useEffect, useRef, useId } from "react";
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
  const uid = useId();
  const titleId = `inventory-title-${uid}`;
  const descId = `inventory-desc-${uid}`;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // focus the close button when the inventory opens
    closeButtonRef.current?.focus();

    const getFocusableElements = (root: HTMLElement): HTMLElement[] =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

    const focusFirstDialogElement = (): void => {
      const dialogElement = dialogRef.current;

      if (!dialogElement) return;

      const focusableElements = getFocusableElements(dialogElement);

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return;
      }

      dialogElement.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialogElement = dialogRef.current;
      if (!dialogElement) return;

      const focusableElements = getFocusableElements(dialogElement);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      const dialogElement = dialogRef.current;
      const focusedTarget = event.target;

      if (!(focusedTarget instanceof Node)) return;
      if (!dialogElement || dialogElement.contains(focusedTarget)) return;

      focusFirstDialogElement();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={style.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={style.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          className={style.closeButton}
          onClick={onClose}
          aria-label="Close inventory"
          type="button"
        >
          ✕
        </button>
        <h2 id={titleId}>Inventory</h2>
        <p id={descId} className={style.visuallyHidden}>
          Press Escape to close this dialog. Use Tab and Shift+Tab to move
          between controls.
        </p>
        <div className={style.content}>
          <ItemList
            userId={userId}
            variant="row"
            type="inventory"
            onUseItem={isInBattle && onUseItem ? onUseItem : undefined}
            refreshToggle={refreshToggle}
          />
        </div>
      </div>
    </div>
  );
}
