import type { ReactElement } from "react";
import styles from "./PurchaseModal.module.css";
import type { BuyResult } from "../../../database/item.database";

// "null" means the modal is closed — no status to show
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
  if (!isOpen || !status) return null;

  const isSuccess = status === "success";
  const isInsufficientFunds = status === "insufficient_funds";
  const modalClassName = `${styles.modal}${!isSuccess ? ` ${styles.failure}` : ""}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={modalClassName} onClick={(e: React.MouseEvent): void => e.stopPropagation()}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {isSuccess
              ? "Purchase Successful!"
              : isInsufficientFunds
                ? "Not Enough RuneCoins"
                : "Purchase Failed"}
          </h2>
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
                Failed to purchase <strong>{itemName}</strong>. Please try again.
              </>
            )}
          </p>
          <button className={styles.button} onClick={onClose}>
            {isSuccess ? "Continue Shopping" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}