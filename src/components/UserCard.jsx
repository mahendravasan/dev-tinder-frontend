import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import axios from "axios";
import { removeUserFromFeed } from "../utils/feedSlic";

const UserCard = ({ user, showButtons = true, onSwipe }) => {
  if (!user) return null;

  const { _id, firstName, lastName, gender, age, photoUrl, about, skills } =
    user;

  const dispatch = useDispatch();

  // Gesture swiping states
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // "left" or "right"

  // Modern Tailwind-v4 mapping for gender badges
  const genderTheme = {
    male: {
      badge:
        "bg-sky-100/90 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40",
      icon: "♂️",
      label: "Male Developer",
    },
    female: {
      badge:
        "bg-rose-100/90 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40",
      icon: "♀️",
      label: "Female Developer",
    },
    other: {
      badge:
        "bg-purple-100/90 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40",
      icon: "⚧️",
      label: "Non-Binary Dev",
    },
  };

  const currentGender = genderTheme[gender?.toLowerCase()] || genderTheme.other;

  const handleSendRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        {
          withCredentials: true,
        },
      );
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.log("error:", error);
    }
  };

  // Touch & Mouse Drag Handlers for tactile Tinder-swiping
  const handleDragStart = (e) => {
    if (!showButtons || swipeDirection) return;
    
    // Support touch and mouse coords
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging || swipeDirection) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging || swipeDirection) return;
    setIsDragging(false);
    
    const threshold = 120; // 120px threshold to trigger swipe action
    if (dragOffset.x > threshold) {
      triggerSwipe("interested", "right");
    } else if (dragOffset.x < -threshold) {
      triggerSwipe("ignored", "left");
    } else {
      // Snap back to original position
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (status, direction) => {
    if (swipeDirection) return;
    setSwipeDirection(direction);
    // Push the card completely off screen in the direction of swipe
    setDragOffset({
      x: direction === "right" ? 600 : -600,
      y: dragOffset.y * 1.5, // maintain vertical offset
    });

    // Wait for exit transition (350ms) before executing action
    setTimeout(async () => {
      if (onSwipe) {
        await onSwipe(status, _id);
      } else {
        await handleSendRequest(status, _id);
      }
    }, 350);
  };

  // Compute dynamic card style based on drag offset & swipe state
  const cardStyle = {
    transform: swipeDirection
      ? `translate3d(${swipeDirection === "right" ? "150%" : "-150%"}, ${dragOffset.y}px, 0) rotate(${swipeDirection === "right" ? "25deg" : "-25deg"})`
      : isDragging
        ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.05}deg)`
        : "none",
    transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.255), opacity 0.4s ease-out",
    cursor: showButtons ? (isDragging ? "grabbing" : "grab") : "default",
    touchAction: "none", // disable mobile vertical scroll while swiping
    userSelect: "none",
  };

  // Dynamic stamp overlay opacities
  const likeOpacity = swipeDirection === "right" ? 1 : Math.max(0, Math.min(1, dragOffset.x / 120));
  const nopeOpacity = swipeDirection === "left" ? 1 : Math.max(0, Math.min(1, -dragOffset.x / 120));

  return (
    <div
      style={cardStyle}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      className="card w-full bg-base-100 shadow-2xl border border-base-200/50 rounded-3xl overflow-hidden flex flex-col max-w-sm sm:max-w-md mx-auto relative select-none"
    >
      {/* Immersive Image Container */}
      <figure className="relative h-[360px] sm:h-[400px] w-full overflow-hidden select-none bg-base-300">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-105"
        />

        {/* Dynamic Stamp Overlays for gorgeous user-friendly tactile feedback */}
        {showButtons && (
          <>
            {/* LIKE Stamp */}
            <div
              style={{
                opacity: likeOpacity,
                transform: "rotate(-15deg)",
              }}
              className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 font-black uppercase text-3xl tracking-widest py-1.5 px-4 rounded-xl pointer-events-none select-none z-20 transition-opacity duration-75 shadow-lg bg-black/10 backdrop-blur-[0.5px]"
            >
              LIKE
            </div>

            {/* NOPE Stamp */}
            <div
              style={{
                opacity: nopeOpacity,
                transform: "rotate(15deg)",
              }}
              className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-black uppercase text-3xl tracking-widest py-1.5 px-4 rounded-xl pointer-events-none select-none z-20 transition-opacity duration-75 shadow-lg bg-black/10 backdrop-blur-[0.5px]"
            >
              NOPE
            </div>
          </>
        )}

        {/* Soft, rich ambient gradient overlay over image bottom for excellent contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-900/20 to-transparent"></div>

        {/* Visual Gender/Dev Badge inside Image (Top-Right) */}
        <div className="absolute top-4 right-4">
          <span
            className={`badge badge-md py-3.5 px-4 font-bold shadow-lg border backdrop-blur-md bg-opacity-80 transition-all duration-300 hover:scale-105 ${currentGender.badge}`}
          >
            <span className="mr-1.5">{currentGender.icon}</span>{" "}
            {gender || "Developer"}
          </span>
        </div>

        {/* Text Details overlayed directly on the bottom part of the image for full Tinder aesthetic */}
        <div className="absolute bottom-4 left-5 right-5 text-neutral-50 flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-md select-text">
              {firstName} {lastName}
            </h2>
            {age && (
              <span className="text-2xl font-normal opacity-90 drop-shadow-md">
                {age}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-200 mt-1 select-none font-medium">
            <span>📍 Tech Hub</span>
            <span className="opacity-50">•</span>
            <span>Active recently</span>
          </div>
        </div>
      </figure>

      {/* Card Content Body */}
      <div className="card-body p-5 gap-4 bg-base-100 flex-grow select-text">
        {/* Bio / About */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 select-none">
            About Me
          </h3>
          <p className="text-sm text-base-content/80 leading-relaxed font-normal">
            {about}
          </p>
        </div>

        {/* Skills Tag Cloud */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 select-none">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills?.map((skill, index) => (
              <span
                key={index}
                className="badge badge-outline border-base-content/25 text-base-content/85 hover:border-primary hover:text-primary transition-colors duration-200 font-semibold text-xs py-2.5 px-3 select-none"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Tinder Action Buttons */}
        {showButtons && (
          <div className="card-actions justify-center items-center gap-6 mt-3 pt-2 border-t border-base-200/50 select-none">
            {/* Dislike/Ignore Button */}
            <button
              aria-label="Pass"
              className="btn btn-circle btn-lg border-2 border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-md hover:shadow-rose-500/20"
              onClick={(e) => {
                e.stopPropagation();
                triggerSwipe("ignored", "left");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Interested Button */}
            <button
              aria-label="Interested"
              className="btn btn-circle btn-lg border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-md hover:shadow-emerald-500/20"
              onClick={(e) => {
                e.stopPropagation();
                triggerSwipe("interested", "right");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
