import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../../atoms/buttons/Button";
import ItemList from "../../molecules/itemList/ItemList";
import InventoryPage from "../Inventory/InventoryPage";
import Tutorial from "../Tutorial/Tutorial";
import { getUserBalance } from "../../../database/user.database";
import styles from "./StorePage.module.css";
import IconButton from "../../atoms/buttons/IconButton";
import informationIcon from "../../../assets/icons/information_icon.svg";
import bagIcon from "../../../assets/icons/bag_icon.svg";
import arrowUp from "../../../assets/icons/arrow_up_icon.svg";

interface StoreLocationState {
  readonly userId?: string;
}

export default function StorePage(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);

  const { userId } = (location.state ?? {}) as StoreLocationState;

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!userId) return;
    const b = await getUserBalance(Number(userId));
    setBalance(b);
  }, [userId]);

  useEffect((): void => {
    refreshBalance();
  }, [refreshBalance]);

  useEffect((): (() => void) | void => {
    if (!isInventoryOpen && !isInfoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInventoryOpen, isInfoOpen]);

  if (userId == null) {
    return <Navigate to="/" replace />;
  }

  const navigateLobby = (): void => void navigate("/");
  const openInventory = (): void => setIsInventoryOpen(true);
  const closeInventory = (): void => setIsInventoryOpen(false);
  const openInfo = (): void => setIsInfoOpen(true);
  const closeInfo = (): void => setIsInfoOpen(false);

  return (
    <>
      <InventoryPage
        isOpen={isInventoryOpen}
        onClose={closeInventory}
        userId={userId}
      />
      <Tutorial isOpen={isInfoOpen} onClose={closeInfo} />
      <section id="top" className={styles.storePage}>
        <div className={styles.fixedInformationBar}>
          <output
            className={styles.userMoneyDisplay}
            aria-label={
              balance === null
                ? "Loading balance"
                : `Balance: ${balance} RuneCoins`
            }
            aria-live="polite"
          >
            {balance === null ? (
              <span>…</span>
            ) : (
              <>
                <span className={styles.balanceValue}>{balance}</span>
                <span className={styles.balanceCurrency}>RC</span>
              </>
            )}
          </output>
          <Button
            onClick={openInventory}
            backgroundColor="#DCB8A0"
            textColor="#955D38"
            size="sm"
            className={styles.noShadow}
          >
            <span className={styles.buttonLabel}>
              <span
                className={styles.buttonIcon}
                aria-hidden="true"
                style={{
                  WebkitMaskImage: `url(${bagIcon})`,
                  maskImage: `url(${bagIcon})`,
                }}
              />
              <span>Bag</span>
            </span>
          </Button>
          <IconButton
            iconSrc={informationIcon}
            onClick={openInfo}
            label="Open information"
            className={styles.iconButton}
          />
        </div>
        <div className={styles.userShopInfo}>
          <h1 className={styles.storeTitle}>Marketplace</h1>
        </div>
        <Button onClick={navigateLobby} className={styles.backButton}>
          Back to select
        </Button>
        <ItemList
          type="store"
          variant="card"
          userId={userId}
          balance={balance ?? undefined}
          onBalanceChange={refreshBalance}
        />
        <Button
          onClick={(): void =>
            document
              .getElementById("top")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className={styles.backToTopButton}
        >
          <span className={styles.buttonLabel}>
            <span
              className={styles.buttonIcon}
              aria-hidden="true"
              style={{
                WebkitMaskImage: `url(${arrowUp})`,
                maskImage: `url(${arrowUp})`,
              }}
            />
            <span>Back to top</span>
          </span>
        </Button>
      </section>
    </>
  );
}
