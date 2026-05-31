import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed } from "../utils/feedSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";
import { Link } from "react-router-dom";

// Gorgeous Custom Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const alertClass =
    type === "interested"
      ? "alert-success bg-emerald-600 border-none text-white shadow-2xl rounded-2xl flex items-center gap-2.5 p-4"
      : "alert-error bg-rose-600 border-none text-white shadow-2xl rounded-2xl flex items-center gap-2.5 p-4";

  return (
    <div className="toast toast-top toast-end z-50 m-4 animate-fade-in pointer-events-none select-none">
      <div className={`alert ${alertClass}`}>
        {type === "interested" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="font-semibold text-sm">{message}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [toast, setToast] = useState(null);

  const getFeeds = async () => {
    try {
      if (feed) return;
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFeeds();
  }, []);

  const handleSwipe = async (status, userId) => {
    const swipedUser = feed.find((user) => user._id === userId);
    if (!swipedUser) return;

    try {
      // Hit the API to send the request
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        {
          withCredentials: true,
        },
      );

      // Show gorgeous toast notification
      if (status === "interested") {
        setToast({
          message: `Sent connection interest to ${swipedUser.firstName}!`,
          type: "interested",
        });
      } else {
        setToast({
          message: `Skipped ${swipedUser.firstName}`,
          type: "ignored",
        });
      }

      // Remove the user from Redux feed
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.log("error:", error);
    }
  };

  // Loading State
  if (feed === null) {
    return (
      <div className="flex flex-col justify-center items-center grow bg-slate-950 text-slate-100 min-h-[80vh] w-full">
        <span className="loading loading-ring loading-lg text-rose-500 mb-4 scale-125"></span>
        <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
          Curating your developer feed...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center py-12 px-4 overflow-hidden grow">
      {/* Self-contained CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient background glows for gorgeous dark-mode premium feel */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-rose-600/5 blur-[120px] pointer-events-none"></div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-md z-10 flex flex-col items-center justify-center flex-grow">
        {feed && feed.length > 0 ? (
          <div className="relative w-full max-w-sm sm:max-w-md min-h-[500px]">
            {/* Underneath background card (rendered first to sit behind) */}
            {feed.length > 1 && (
              <div className="absolute inset-0 pointer-events-none scale-[0.96] translate-y-4 opacity-50 blur-[0.5px] transition-all duration-300 ease-out origin-bottom">
                <UserCard user={feed[1]} showButtons={false} />
              </div>
            )}

            {/* Active interactive card */}
            <div className="relative z-10 transition-transform duration-300">
              <UserCard
                key={feed[0]._id} // Reset state when active user changes
                user={feed[0]}
                onSwipe={handleSwipe}
              />
            </div>
          </div>
        ) : (
          /* High-Fidelity Gorgeous Empty Feed State */
          <div className="w-full max-w-sm sm:max-w-md py-12 px-6 bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl text-center flex flex-col items-center justify-center shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-heartbeat"></div>
              <div className="w-24 h-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10 relative shadow-inner">
                <span className="text-4xl animate-pulse">✨</span>
              </div>
            </div>

            <h2 className="text-2xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 select-none">
              All Caught Up!
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[280px]">
              You've swiped on all available developer profiles. Come back later
              to find new connections or check your existing matches!
            </p>

            <div className="flex flex-col w-full gap-3">
              <Link
                to="/connections"
                className="btn btn-primary bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 border-none w-full py-3.5 rounded-2xl text-white font-extrabold shadow-lg shadow-rose-500/15 hover:scale-[1.02] transition-transform duration-300"
              >
                💬 View Matches
              </Link>
              <Link
                to="/requests"
                className="btn btn-ghost hover:bg-slate-800/40 text-slate-350 hover:text-white w-full rounded-2xl font-bold"
              >
                📥 Review Requests
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
