import styles from "./PurchaseModal.module.css";

interface PurchaseModalProps {
  itemName: string;
  status: "success" | "failure" | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseModal({
  itemName,
  status,
  isOpen,
  onClose,
}: PurchaseModalProps) {
  if (!isOpen || !status) return null;

  const isSuccess = status === "success";
  const modalClassName = `${styles.modal}${status === "failure" ? ` ${styles.failure}` : ""}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={modalClassName} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {isSuccess ? "Purchase Successful!" : "Purchase Failed"}
          </h2>
          <p className={styles.message}>
            {isSuccess ? (
              <>
                <strong>{itemName}</strong> has been added to your inventory.
              </>
            ) : (
              <>
                Failed to purchase <strong>{itemName}</strong>. Please try
                again.
              </>
            )}
          </p>
          <button className={styles.button} onClick={onClose}>
            {isSuccess ? "Continue Shopping" : "Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}
