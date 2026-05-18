import { useState, type ReactElement } from "react";
import type { CarouselSlide } from "../../../types/carouselSlide.types";
import styles from "./textCarousel.module.css";

interface TextCarouselProps {
  isOpen: boolean;
  onClose: () => void;
}

const infoSlides: readonly CarouselSlide[] = [
  {
    accName: "Item 1",
    title: "How to play",
    content: [
      { tag: "h4", text: "How do you play?" },
      {
        tag: "p",
        text: "RuneArena is a turn based creature fighting 1v1 experience where you fight one other opponent.",
      },
      { tag: "h4", text: "Battle" },
      {
        tag: "p",
        text: "In the Arena, you fight with one other opponent. You can play multiplayer or singleplayer against a bot. Each turn, you battle by pressing one of the attack buttons, or using items bought in the shop. If the opponent's creature HP reaches 0, you win and gain XP!",
      },
    ],
  },
  {
    accName: "Item 2",
    title: "Levels",
    content: [
      { tag: "h4", text: "How do you level up?" },
      {
        tag: "p",
        text: "You level up by fighting in the Arena. When your creature has reached the criteria for leveling up, it may gain better base stats, or even another move to use during battle!",
      },
    ],
  },
  {
    accName: "Item 3",
    title: "Properties",
    content: [],
  },
  {
    accName: "Item 4",
    title: "Types",
    content: [
      { tag: "h4", text: "Effects" },
      {
        tag: "p",
        text: "Different creature types have different effectiveness on specific types. For example, Grass is more effective on Water types, but weak against Fire. There is also the Normal type, which is neither good nor bad against any type.",
      },
    ],
  },
  {
    accName: "Item 5",
    title: "Store",
    content: [{ tag: "h4", text: "Choose what game mode to play!" }],
  },
] as const;

export default function TextCarousel({
  isOpen,
  onClose,
}: TextCarouselProps): ReactElement | null {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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
        className={styles.textCarouselPanel}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="How to play"
      >
        <button className={styles.textCarouselClose} onClick={onClose}>
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
                  if (entry.tag === "h4") {
                    return (
                      <h4 key={`${slide.accName}-${index}`}>{entry.text}</h4>
                    );
                  }
                  if (entry.tag === "p") {
                    return (
                      <p key={`${slide.accName}-${index}`}>{entry.text}</p>
                    );
                  }
                  return null;
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
