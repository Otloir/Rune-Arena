import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import styles from "./PurchaseModal.module.css";
import type { BuyResult } from "../../../database/item.database";

export type PurchaseStatus = BuyResult | null;

interface PurchaseModalProps {
  readonly itemName: string;
  readonly status: PurchaseStatus;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function PurchaseModal({
  itemName,
  status,
  isOpen,
  onClose,
}: PurchaseModalProps): ReactElement | null {
  const isSuccess = status === "success";
  const isInsufficientFunds = status === "insufficient_funds";
  const modalClassName = `${styles.modal}${!isSuccess ? ` ${styles.failure}` : ""}`;
  const titleId = "purchase-modal-title";
  const descId = "purchase-modal-desc";

  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialogElement = dialogRef.current;
      if (!dialogElement) return;

      const focusableElements = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

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
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !status) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={modalClassName}
        onClick={(e: React.MouseEvent): void => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {isSuccess
              ? "Purchase Successful!"
              : isInsufficientFunds
                ? "Not Enough RuneCoins"
                : "Purchase Failed"}
          </h2>
          <p id={descId} className={styles.visuallyHidden}>
            Press Escape to close this dialog. Use Tab and Shift+Tab to move
            between controls.
          </p>
          <p className={styles.message}>
            {isSuccess ? (
              <>
                <strong>{itemName}</strong> has been added to your inventory.
              </>
            ) : isInsufficientFunds ? (
              <>
                You can&apos;t afford <strong>{itemName}</strong>. Earn more RC
                by winning battles!
              </>
            ) : (
              <>
                Failed to purchase <strong>{itemName}</strong>. Please try
                again.
              </>
            )}
          </p>
          <button
            className={styles.button}
            onClick={onClose}
            aria-label={isSuccess ? "Continue shopping" : "Dismiss error"}
            type="button"
          >
            {isSuccess ? "Continue Shopping" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
