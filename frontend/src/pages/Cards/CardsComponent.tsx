import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGlowStore } from "../../stores/glowStore";
import getMajorityColor from "../../utils/MajorityColor";
import { WalletConnect } from "../../components/WalletConnect";
import { useWallet, usePosts, useContract } from "../../hooks/useContract";
import { PostImageViewer } from "../../components/IPFSImageViewer";
import { formatEther } from "../../utils/wallet";

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
  tokenId?: number;
  creator?: string;
  isActive?: boolean;
  totalEarnings?: bigint;
  ipfsHash?: string;
  title?: string;
  description?: string;
  aiLabels?: string[];
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

// Social Media Post Card Renderer
const socialMediaCardRenderer = (
  card: CardData,
  onLike?: () => void,
  onCheer?: () => void
) => (
  <>
    {/* Post Header */}
    <div className="p-4 flex items-center justify-between border-b border-border">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
          {card.creator
            ? card.creator.slice(2, 4).toUpperCase()
            : card.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-base text-card-foreground">
            {card.creator
              ? `${card.creator.slice(0, 6)}...${card.creator.slice(-4)}`
              : card.username}
          </p>
          {card.location && (
            <p className="text-sm text-muted-foreground">{card.location}</p>
          )}
        </div>
      </div>
      <div className="text-muted-foreground">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </div>

    {/* Post Image */}
    <div className="relative bg-muted">
      {card.ipfsHash ? (
        <PostImageViewer
          post={{
            ipfsHash: card.ipfsHash,
            title: card.title || "Post",
            description: card.description || card.caption,
          }}
          className="w-full h-80 object-cover"
        />
      ) : (
        <img
          src={card.postImage}
          alt="Post content"
          className="w-full h-80 object-cover"
          draggable={false}
        />
      )}
    </div>

    {/* Post Stats */}
    <div className="p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-1 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            {card.likes}
          </span>
          {card.totalEarnings && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              {formatEther(card.totalEarnings)} ETH
            </span>
          )}
        </div>
        <span>{card.timestamp}</span>
      </div>

      {/* Title and Caption */}
      {card.title && (
        <h3 className="font-bold text-lg text-card-foreground mb-2">
          {card.title}
        </h3>
      )}
      <div className="text-base mb-4">
        <span className="text-card-foreground">
          {card.description || card.caption}
        </span>
      </div>

      {/* AI Labels */}
      {card.aiLabels && card.aiLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {card.aiLabels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="h-16"></div>
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
      renderContent,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotate = useTransform(
      x,
      [-200, 0, 200],
      [-rotationDegree, 0, rotationDegree]
    );
    const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98]);
    const leftLabelOpacity = useTransform(x, [-thresholdPx, -20, 0], [1, 0, 0]);
    const rightLabelOpacity = useTransform(x, [0, 20, thresholdPx], [0, 0, 1]);

    const leftOverlayOpacity = useTransform(
      x,
      [-thresholdPx, -10, 0],
      [0.3, 0.1, 0]
    );
    const rightOverlayOpacity = useTransform(
      x,
      [0, 10, thresholdPx],
      [0, 0.1, 0.3]
    );

    const stackOffset = Math.min(index, stackSize - 1);
    const stackScale = 1 - stackOffset * 0.04;
    const stackY = -stackOffset * 20;
    const stackX = stackOffset * 4;
    const stackOpacity = index < 3 ? 1 - stackOffset * 0.25 : 0;

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

    useImperativeHandle(ref, () => ({
      swipeLeft,
      swipeRight,
    }));

    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = (_event: any, info: PanInfo) => {
      setIsDragging(false);

      const { offset, velocity } = info;
      const swipeThreshold = thresholdPx;
      const swipeVelocityThreshold = throwVelocity;

      const shouldSwipeLeft =
        offset.x < -swipeThreshold || velocity.x < -swipeVelocityThreshold;
      const shouldSwipeRight =
        offset.x > swipeThreshold || velocity.x > swipeVelocityThreshold;

      if (shouldSwipeLeft) {
        swipeLeft();
      } else if (shouldSwipeRight) {
        swipeRight();
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (index !== 0) return;

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
          x: isDragging && index === 0 ? x : stackX,
          y: isDragging && index === 0 ? y : stackY,
          rotate: isDragging && index === 0 ? rotate : 0,
          scale: isDragging && index === 0 ? scale : stackScale,
          opacity: stackOpacity,
          zIndex: stackSize - index + 10,
          transformOrigin: "center",
          willChange: "transform",
          display: index >= 3 ? "none" : "block",
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
        <div
          className="bg-card rounded-4xl h-[34rem] overflow-hidden border border-border relative shadow-lg"
          style={{
            width: "384px",
            boxShadow:
              index === 0
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : `0 ${4 + stackOffset * 4}px ${8 + stackOffset * 8}px -${
                    stackOffset * 2
                  }px rgba(0, 0, 0, ${0.1 + stackOffset * 0.05})`,
            transform:
              index > 0
                ? `translateZ(-${stackOffset * 20}px)`
                : "translateZ(0)",
          }}
        >
          {/* Color Overlay for Swipe Feedback */}
          {index === 0 && (
            <>
              <motion.div
                className="absolute inset-0 bg-red-500/50 rounded-2xl pointer-events-none z-10"
                style={{ opacity: isDragging ? leftOverlayOpacity : 0 }}
              />
              <motion.div
                className="absolute inset-0 bg-green-500/50 rounded-2xl pointer-events-none z-10"
                style={{ opacity: isDragging ? rightOverlayOpacity : 0 }}
              />
            </>
          )}

          <div className="relative z-20">{renderContent(card)}</div>

          {/* Swipe Labels */}
          <motion.div
            className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl pointer-events-none z-30"
            style={{ opacity: leftLabelOpacity }}
          >
            SKIP
          </motion.div>

          <motion.div
            className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl pointer-events-none z-30"
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

// Social Media Cards Component
const SocialMediaCards: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { posts, isLoading, hasMore, loadMore, refresh } = usePosts(10);
  const { likePost, cheerPost } = useContract();
  const topCardRef = useRef<SwipeCardRef>(null);
  const { setGlowColor } = useGlowStore();

  const [isCheeringOpen, setIsCheeringOpen] = useState(false);
  const [cheerAmount, setCheerAmount] = useState("0.01");
  const [currentCheerPost, setCurrentCheerPost] = useState<CardData | null>(
    null
  );

  const convertPostsToCards = (posts: any[]): CardData[] => {
    return posts.map((post) => ({
      id: post.tokenId,
      tokenId: post.tokenId,
      username: `${post.creator.slice(0, 6)}...${post.creator.slice(-4)}`,
      userAvatar: "",
      postImage: "",
      caption: post.description,
      likes: post.likes,
      timestamp: new Date(Number(post.timestamp) * 1000).toLocaleDateString(),
      creator: post.creator,
      isActive: post.isActive,
      totalEarnings: post.totalEarnings,
      ipfsHash: post.ipfsHash,
      title: post.title,
      description: post.description,
      aiLabels: post.aiLabels,
    }));
  };

  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    if (posts.length > 0) {
      const convertedCards = convertPostsToCards(posts);
      setCards(convertedCards);
    }
  }, [posts]);

  const updateGlowColorForNextPost = async (remainingCards: CardData[]) => {
    if (remainingCards.length > 0) {
      try {
        setGlowColor("#26AFE0");
      } catch (error) {
        console.error("Error getting majority color:", error);
        setGlowColor("#26AFE0");
      }
    } else {
      setGlowColor("#26AFE0");
    }
  };

  useEffect(() => {
    if (cards.length > 0) {
      updateGlowColorForNextPost(cards);
    }
  }, [cards]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        refresh();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isConnected) {
      refresh();
    }
  }, [isConnected, refresh]);

  const handleLike = async (cardData: CardData) => {
    if (!cardData.tokenId) return;

    try {
      await likePost(cardData.tokenId, () => {
        console.log("Post liked successfully!");
        refresh();
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const openCheerModal = (cardData: CardData) => {
    setCurrentCheerPost(cardData);
    setIsCheeringOpen(true);
  };

  const handleCheer = async () => {
    if (!currentCheerPost?.tokenId) return;

    try {
      await cheerPost(currentCheerPost.tokenId, cheerAmount, () => {
        console.log("Post cheered successfully!");
        refresh();
      });
      setIsCheeringOpen(false);
      setCurrentCheerPost(null);
    } catch (error) {
      console.error("Error cheering post:", error);
    }
  };

  const handleSwipe = (direction: "left" | "right", cardData: CardData) => {
    if (direction === "right") {
      handleLike(cardData);
      console.log(`Liked post by ${cardData.username}:`, cardData);
    } else {
      console.log(`Skipped post by ${cardData.username}:`, cardData);
    }

    const remainingCards = cards.filter((card) => card.id !== cardData.id);
    setCards(remainingCards);

    if (remainingCards.length <= 2 && hasMore) {
      loadMore();
    }

    updateGlowColorForNextPost(remainingCards);
  };

  return (
    <div className="min-h-screen  flex flex-col md:flex-row px-4 md:px-32">
      {/* Left Column - Details and Controls (30% width on desktop, hidden on mobile) */}
      <div className="hidden lg:flex w-full  justify-center items-center">
        <img
          src="/cl.png"
          alt=""
          className="w-30 z-[100] p-2 shadow-lg relative -top-60"
        />
      </div>

      {/* Right Column - Card Swipe UI (70% width on desktop, full width on mobile) */}
      <div className="w-full lg:w-7/10 min-h-screen flex flex-col items-center justify-center">
        <div className="p-4 md:p-8 w-full flex flex-col items-center">
          {/* Mobile Header - Only shown on mobile */}
          <div className="block md:hidden mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Card Feed
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Swipe through posts
            </p>
            {!isConnected && (
              <div className="bg-card border border-border rounded-lg p-4 shadow-sm mb-4">
                <WalletConnect />
              </div>
            )}
          </div>

          {/* Card Stack */}
          <div
            className="relative w-96 h-[32rem] mb-8 z-10"
            role="list"
            aria-label="Swipeable posts"
            style={{
              perspective: "1000px",
              minWidth: "384px",
              maxWidth: "384px",
            }}
          >
            {isLoading ? (
              <div
                className="flex items-center justify-center h-full bg-card rounded-xl shadow-lg border border-border"
                style={{ width: "384px" }}
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground text-lg ml-3">
                  Loading posts...
                </p>
              </div>
            ) : cards.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full bg-card rounded-xl shadow-lg border border-border p-8"
                style={{ width: "384px" }}
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Be the first to create a post on the blockchain!
                </p>
                <button
                  onClick={() => navigate("/createpost")}
                  disabled={!isConnected}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground disabled:text-muted-foreground rounded-lg font-medium transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              cards.slice(0, 3).map((card, index) => (
                <SwipeCard
                  key={card.id}
                  ref={index === 0 ? topCardRef : null}
                  card={card}
                  index={index}
                  onSwipe={handleSwipe}
                  onThrowAway={() => {}}
                  renderContent={(cardData) =>
                    socialMediaCardRenderer(
                      cardData,
                      () => handleLike(cardData),
                      () => openCheerModal(cardData)
                    )
                  }
                />
              ))
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-6 mb-4 z-10 relative -top-6">
            <button
              onClick={() => topCardRef.current?.swipeLeft()}
              disabled={cards.length === 0 || isLoading}
              className="bg-card hover:bg-accent disabled:bg-muted shadow-xl text-card-foreground disabled:text-muted-foreground w-16 h-16 rounded-full border border-border transition-colors flex items-center justify-center shadow-lg"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="red"
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
              disabled={cards.length === 0 || isLoading}
              className="bg-card shadow-xl hover:bg-accent disabled:bg-muted text-card-foreground disabled:text-muted-foreground w-16 h-16 rounded-full border border-border transition-colors flex items-center justify-center"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="skyblue"
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
            <button
              onClick={() => topCardRef.current?.swipeRight()}
              disabled={cards.length === 0 || isLoading}
              aria-label="Save / Like (sparkle)"
              className="bg-card shadow-xl hover:bg-accent disabled:bg-muted text-card-foreground disabled:text-muted-foreground w-16 h-16 rounded-full border border-border transition-colors flex items-center justify-center"
            >
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="orange"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Sparkle / star icon */}
                <path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9-1.9 4.6-1.9-4.6L5.5 9.4l4.6-1.9L12 3z" />
                <path d="M4 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                <path d="M20 15l.8 1.6L22 17.4l-1.2.8L20 20l-.8-1.8-1.2-.8 1.2-.8.8-1.6z" />
              </svg>
            </button>
          </div>

          {/* Instructions - Mobile */}
          <div className="text-center text-muted-foreground text-sm max-w-md z-10 block md:hidden">
            <p className="mb-2">
              <strong>Swipe right</strong> to like • <strong>Swipe left</strong>{" "}
              to skip
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-full  justify-center items-center">
        <img
          src="/cr.png"
          alt=""
          className="w-30  z-[100] p-2 shadow-lg relative -top-60"
        />
      </div>
      <img
        className=" absolute bottom-0 left-0  h-[50%] w-full object-cover"
        src="heropattern.png"
        alt=""
      />

      {/* Cheer Modal */}
      {isCheeringOpen && currentCheerPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Cheer this post
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                value={cheerAmount}
                onChange={(e) => setCheerAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 0.01 ETH
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsCheeringOpen(false);
                  setCurrentCheerPost(null);
                }}
                className="flex-1 px-4 py-2 border border-border text-card-foreground rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheer}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                Send Cheer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility announcer */}
      <div aria-live="polite" className="sr-only">
        {cards.length === 0
          ? "No more posts available"
          : `${cards.length} posts remaining`}
      </div>

      {/* <img
        src="/share.png"
        alt=""
        className="w-full md:w-[40%] object-contain md:fixed -bottom-[100px] left-0 hidden md:block opacity-50"
      /> */}
    </div>
  );
};

export default SocialMediaCards;
