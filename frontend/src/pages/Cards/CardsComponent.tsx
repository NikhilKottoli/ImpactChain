import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { PanInfo } from "framer-motion";

// Types
interface CardData {
  id: string | number;
  username: string;
  userAvatar: string;
  postImage: string;
  caption: string;
  likes: number;
  timestamp: string;
  location?: string;
  [key: string]: any; // Allow additional properties
}

interface SwipeCardProps {
  card: CardData;
  index: number;
  onSwipe: (direction: "left" | "right", cardData: CardData) => void;
  onThrowAway?: () => void;
  thresholdPx?: number;
  throwVelocity?: number;
  rotationDegree?: number;
  stackSize?: number;
  renderContent?: (card: CardData) => React.ReactNode; // Custom renderer function
}

interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

// Default card content renderer - Instagram post style
const defaultCardRenderer = (card: CardData) => (
  <>
    {/* Post Header */}
    <div className="p-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center">
        <img
          src={card.userAvatar}
          alt={card.username}
          className="w-10 h-10 rounded-full object-cover"
          draggable={false}
        />
        <div className="ml-3">
          <p className="font-semibold text-base text-gray-900">
            {card.username}
          </p>
          {card.location && (
            <p className="text-sm text-gray-500">{card.location}</p>
          )}
        </div>
      </div>
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </div>

    {/* Post Image */}
    <div className="relative bg-gray-100">
      <img
        src={card.postImage}
        alt="Post content"
        className="w-full h-80 object-cover"
        draggable={false}
      />
    </div>

    {/* Post Actions */}
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>
        <svg
          className="w-7 h-7 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </div>

      {/* Likes and Caption */}
      <p className="font-semibold text-base text-gray-900 mb-2">
        {card.likes.toLocaleString()} likes
      </p>
      <div className="text-base">
        <span className="font-semibold text-gray-900">{card.username}</span>
        <span className="text-gray-700 ml-1">{card.caption}</span>
      </div>
      <p className="text-sm text-gray-500 mt-2 uppercase">{card.timestamp}</p>
    </div>
  </>
);

const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  (
    {
      card,
      index,
      onSwipe,
      onThrowAway,
      thresholdPx = 120,
      throwVelocity = 500,
      rotationDegree = 12,
      stackSize = 3,
      renderContent = defaultCardRenderer,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Motion values for smooth animations
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Transform values based on drag position
    const rotate = useTransform(
      x,
      [-200, 0, 200],
      [-rotationDegree, 0, rotationDegree]
    );
    const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);
    const leftLabelOpacity = useTransform(x, [-thresholdPx, -20, 0], [1, 0, 0]);
    const rightLabelOpacity = useTransform(x, [0, 20, thresholdPx], [0, 0, 1]);

    // Stack positioning for layered effect
    const stackOffset = Math.min(index, stackSize - 1);
    const stackScale = 1 - stackOffset * 0.05;
    const stackY = stackOffset * 4;

    // Programmatic swipe functions
    const swipeLeft = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      animate(x, -window.innerWidth, { duration: 0.3 }).then(() => {
        onSwipe("left", card);
        onThrowAway?.();
      });
    };

    const swipeRight = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      animate(x, window.innerWidth, { duration: 0.3 }).then(() => {
        onSwipe("right", card);
        onThrowAway?.();
      });
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      swipeLeft,
      swipeRight,
    }));

    // Handle drag events
    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = (_event: any, info: PanInfo) => {
      setIsDragging(false);

      const { offset, velocity } = info;
      const swipeThreshold = thresholdPx;
      const swipeVelocityThreshold = throwVelocity;

      // Determine swipe based on distance or velocity
      const shouldSwipeLeft =
        offset.x < -swipeThreshold || velocity.x < -swipeVelocityThreshold;
      const shouldSwipeRight =
        offset.x > swipeThreshold || velocity.x > swipeVelocityThreshold;

      if (shouldSwipeLeft) {
        swipeLeft();
      } else if (shouldSwipeRight) {
        swipeRight();
      } else {
        // Spring back to center with reduced stiffness
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
      }
    };

    // Keyboard event handlers
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (index !== 0) return; // Only handle keyboard on top card

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          swipeLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          swipeRight();
          break;
        case "Escape":
          event.preventDefault();
          animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
          animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          // Peek animation
          animate(y, -10, { duration: 0.1 }).then(() => {
            animate(y, 0, { duration: 0.1 });
          });
          break;
      }
    };

    return (
      <motion.div
        ref={cardRef}
        className="absolute cursor-grab active:cursor-grabbing select-none"
        style={{
          x,
          y,
          rotate,
          scale: isDragging ? scale : stackScale,
          zIndex: stackSize - index,
          top: stackY,
          left: stackOffset * 2,
          right: stackOffset * 2,
          transformOrigin: "center",
          willChange: "transform",
        }}
        drag={index === 0 && !isAnimating}
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={index === 0 ? { scale: 0.98 } : {}}
        tabIndex={index === 0 ? 0 : -1}
        onKeyDown={handleKeyDown}
        role="listitem"
        aria-label={`Post ${index + 1} by ${card.username}`}
      >
        {/* Main Card */}
        <div className="bg-white rounded-4xl shadow-lg h-[32rem] w-full max-w-md mx-auto overflow-hidden border border-gray-200">
          {/* Custom or Default Content */}
          {renderContent(card)}

          {/* Swipe Labels */}
          <motion.div
            className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl pointer-events-none"
            style={{ opacity: leftLabelOpacity }}
          >
            SKIP
          </motion.div>

          <motion.div
            className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl pointer-events-none"
            style={{ opacity: rightLabelOpacity }}
          >
            SAVE
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

SwipeCard.displayName = "SwipeCard";

// Demo Container Component
const CardStackDemo: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: 1,
      username: "travel_diaries",
      userAvatar:
        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
      postImage:
        "https://images.pexels.com/photos/1557652/pexels-photo-1557652.jpeg?cs=srgb&dl=pexels-lukas-hartmann-304281-1557652.jpg&fm=jpg",
      caption:
        "Amazing sunset at Malibu Beach! 🌅 Can't get enough of these golden hour vibes ✨",
      likes: 1247,
      timestamp: "2 hours ago",
      location: "Malibu, California",
    },
    {
      id: 2,
      username: "foodie_adventures",
      userAvatar:
        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
      postImage:
        "https://images.pexels.com/photos/1557652/pexels-photo-1557652.jpeg?cs=srgb&dl=pexels-lukas-hartmann-304281-1557652.jpg&fm=jpg",
      caption: "Homemade carbonara pasta 🍝 Recipe in my bio!",
      likes: 892,
      timestamp: "5 hours ago",
      location: "New York, NY",
    },
    {
      id: 3,
      username: "urban_explorer",
      userAvatar:
        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
      postImage:
        "https://images.pexels.com/photos/1557652/pexels-photo-1557652.jpeg?cs=srgb&dl=pexels-lukas-hartmann-304281-1557652.jpg&fm=jpg",
      caption: "The city never sleeps 🏙️ #urbanjungle #citylife",
      likes: 2156,
      timestamp: "1 day ago",
      location: "Manhattan, New York",
    },
    {
      id: 4,
      username: "nature_lover",
      userAvatar:
        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
      postImage:
        "https://images.pexels.com/photos/1557652/pexels-photo-1557652.jpeg?cs=srgb&dl=pexels-lukas-hartmann-304281-1557652.jpg&fm=jpg",
      caption: "Hiking in the Rocky Mountains 🏔️ Nature is the best therapy",
      likes: 3421,
      timestamp: "2 days ago",
      location: "Colorado, USA",
    },
    {
      id: 5,
      username: "coffee_culture",
      userAvatar:
        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg",
      postImage:
        "https://images.pexels.com/photos/1557652/pexels-photo-1557652.jpeg?cs=srgb&dl=pexels-lukas-hartmann-304281-1557652.jpg&fm=jpg",
      caption: "Perfect latte art to start the day ☕️ #coffeelife",
      likes: 567,
      timestamp: "3 days ago",
      location: "Seattle, WA",
    },
  ]);

  const topCardRef = useRef<SwipeCardRef>(null);

  const handleSwipe = (direction: "left" | "right", cardData: CardData) => {
    console.log(
      `${direction === "right" ? "Saved" : "Skipped"} post by ${
        cardData.username
      }:`,
      cardData
    );
    setCards((prev) => prev.filter((card) => card.id !== cardData.id));
  };

  return (
    <div className="min-h-screen bg-none flex flex-col items-center justify-center p-4">
      <div
        className="relative w-96 h-[32rem] mb-8"
        role="list"
        aria-label="Swipeable posts"
      >
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No more posts!</p>
          </div>
        ) : (
          cards.map((card, index) => (
            <SwipeCard
              key={card.id}
              ref={index === 0 ? topCardRef : null}
              card={card}
              index={index}
              onSwipe={handleSwipe}
              onThrowAway={() => {}}
            />
          ))
        )}
      </div>
      {/* Control Buttons */}
      <div className="flex gap-6 mb-4">
        <button
          onClick={() => topCardRef.current?.swipeLeft()}
          disabled={cards.length === 0}
          className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 w-16 h-16 rounded-full border border-gray-200 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button
          onClick={() => topCardRef.current?.swipeRight()}
          disabled={cards.length === 0}
          className="bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 w-16 h-16 rounded-full border border-gray-200 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      {/* Instructions */}
      {/* <div className="text-center text-gray-600 text-sm max-w-md">
        <p className="mb-2">
          <strong>Drag:</strong> Swipe posts left to skip or right to save
        </p>
        <p className="mb-2">
          <strong>Keyboard:</strong> ← → arrows or A/D to swipe, Space/Enter to
          peek, Esc to cancel
        </p>
        <p>
          <strong>Buttons:</strong> Click Skip/Save or use keyboard shortcuts
        </p>
      </div> */}
      {/* Accessibility announcer */}
      <div aria-live="polite" className="sr-only">
        {cards.length === 0
          ? "No more posts available"
          : `${cards.length} posts remaining`}
      </div>
    </div>
  );
};

export default CardStackDemo;
