import { useEffect, useRef, useState, type ReactElement } from "react";
import styles from "./TextCarousel.module.css";

interface TextCarouselProps {
  isOpen: boolean;
  onClose: () => void;
}

// TODO: replace temporary text with actual, well written text
const infoSlides = [
  {
    accName: "How to play",
    title: "How-to-play",
    content: [
      { tag: "h4", text: "How do you play?" },
      {
        tag: "p",
        text: "RuneArena is a turn based creature fighting 1v1 experience where you fight one other opponent. By fighting, you earn RC (RuneCoin) and XP.",
      },
      { tag: "h4", text: "Battle" },
      {
        tag: "p",
        text: "In the Arena, you fight with one other opponent. You get to play against a bot. Each turn, you battle by clicking one of the attack buttons, or using one of the items bought in the shop. If the opponent's creature HP reaches 0, you win and gain XP, RC (RuneCoin) and a stamp*!",
      },
      {
        tag: "p",
        text: "*the stamp is only available to get if you are logged into your account on 'https://loopland.se/'",
      },
    ],
  },
  {
    accName: "Levels",
    title: "Levels",
    content: [
      { tag: "h4", text: "How do you level up?" },
      {
        tag: "p",
        text: "You level up by fighting in the Arena. When your creature has reached the criteria for leveling up, it may gain another move to use during battle!",
      },
      { tag: "h4", text: "Levels" },
      {
        tag: "p",
        text: "Currently, the max level for each creature is 5. ",
      },
    ],
  },
  {
    accName: "Properties",
    title: "Properties",
    content: [
      { tag: "h4", text: "What are 'Properties'?" },
      {
        tag: "p",
        text: "Properties are you creatures stats! Each creature have a different base stat, which you can enhance during the battle by using items bought in the store.",
      },
      {
        tag: "h4",
        text: "Properties definition:",
      },
      {
        tag: "p",
        text: "- Health: It decides how much damage your creature can take until it faints.",
      },
      {
        tag: "p",
        text: "- Evade: It decides how easily your creature can dodge an attack.",
      },
      {
        tag: "p",
        text: "- Defence: It decides how much damage your creature can resist.",
      },
      {
        tag: "p",
        text: "- Speed: It decides which creature goes first",
      },
    ],
  },
  {
    accName: "Types",
    title: "Types",
    content: [
      { tag: "h4", text: "Effects" },
      {
        tag: "p",
        text: "Different creature types have different effectiveness on specific types. For example, Grass is more effective on Water types, but weak against Fire. There is also the Normal type, which is neither good nor bad against any type.",
      },
      { tag: "h4", text: "Type Chart" },
    ],
  },
  {
    accName: "Store",
    title: "Store",
    content: [{ tag: "h4", text: "Items" },
      {
        tag: "p",
        text: "Different items you can buy do difrent things. Some gives you more defence, others heals your creature when you are in a critical condition. Each item cost different amount of RC, and can be acessed in your Bag. You can only use items in battle, and gets consumed upon use.",
      },
    ],
  },
] as const;

export default function TextCarousel({
  isOpen,
  onClose,
}: TextCarouselProps): ReactElement | null {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        return;
      }

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

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const previousSlide = () => {
    setActiveSlideIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const nextSlide = () => {
    setActiveSlideIndex((currentIndex) =>
      Math.min(infoSlides.length - 1, currentIndex + 1),
    );
  };

  return (
    <div
      className={styles.textCarouselOverlay}
      onClick={onClose}
      role="presentation"
    >
      <section
        ref={dialogRef}
        className={styles.textCarouselPanel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          className={styles.textCarouselClose}
          onClick={onClose}
        >
          Close
        </button>

        <div className={styles.textCarouselViewport}>
          <div
            className={styles.textCarouselTrack}
            style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
          >
            {infoSlides.map((slide) => (
              <article
                key={slide.accName}
                className={styles.textCarouselSlide}
                data-accname={slide.accName}
              >
                <h2>{slide.title}</h2>
                {slide.content.map((entry, index) => {
                  switch (entry.tag) {
                    case "h4":
                      return (
                        <h4 key={`${slide.accName}-${index}`}>{entry.text}</h4>
                      );
                    case "p":
                      return (
                        <p key={`${slide.accName}-${index}`}>{entry.text}</p>
                      );
                    default: {
                      const exhaustiveCheck: never = entry;
                      return exhaustiveCheck;
                    }
                  }
                })}
              </article>
            ))}
          </div>
        </div>

        <div className={styles.textCarouselControls}>
          <button
            className={styles.textCarouselNavButton}
            onClick={previousSlide}
            disabled={activeSlideIndex === 0}
          >
            Previous
          </button>
          <span className={styles.textCarouselIndicator}>
            {activeSlideIndex + 1} / {infoSlides.length}
          </span>
          <button
            className={styles.textCarouselNavButton}
            onClick={nextSlide}
            disabled={activeSlideIndex === infoSlides.length - 1}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
