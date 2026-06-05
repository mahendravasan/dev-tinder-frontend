import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed, removeUserFromFeed, promoteUserToFront } from "../utils/feedSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";
import { Sparkles, Compass, Zap, ArrowRight, Heart, Search, MessageSquare, UserCheck } from "lucide-react";

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

// Real-time Compatibility Match Engine
const calculateSynergy = (userA, userB) => {
  if (!userA?.skills || !userB?.skills) {
    return {
      score: 60,
      shared: [],
      complementType: "Tech Synergy",
      insight: "Connect to explore tech stacks and collaborate on projects!",
    };
  }

  const skillsA = userA.skills.map((s) => s.trim().toLowerCase());
  const skillsB = userB.skills.map((s) => s.trim().toLowerCase());

  // Find shared skills (case-insensitive)
  const shared = userB.skills.filter((skill) =>
    skillsA.includes(skill.trim().toLowerCase())
  );

  // Define front-end and back-end categories
  const frontendTerms = [
    "react",
    "vue",
    "angular",
    "html",
    "css",
    "tailwind",
    "next",
    "javascript",
    "typescript",
    "frontend",
    "ui",
    "ux",
    "svelte",
  ];
  const backendTerms = [
    "node",
    "express",
    "mongodb",
    "mongoose",
    "sql",
    "postgresql",
    "python",
    "java",
    "go",
    "golang",
    "c#",
    "backend",
    "django",
    "flask",
    "aws",
    "docker",
    "redis",
    "firebase",
  ];

  const hasFrontendA = skillsA.some((s) =>
    frontendTerms.some((term) => s.includes(term))
  );
  const hasBackendA = skillsA.some((s) =>
    backendTerms.some((term) => s.includes(term))
  );
  const hasFrontendB = skillsB.some((s) =>
    frontendTerms.some((term) => s.includes(term))
  );
  const hasBackendB = skillsB.some((s) =>
    backendTerms.some((term) => s.includes(term))
  );

  let score = 55; // base score
  let complementType = "Tech Collaboration";
  let insight = "A great opportunity to expand your network and exchange knowledge!";

  if (shared.length > 0) {
    score += shared.length * 15;
  }

  if ((hasFrontendA && hasBackendB) || (hasBackendA && hasFrontendB)) {
    score += 15;
    complementType = "Fullstack Partnership";
    insight =
      "You bring complementary skills! One of you dominates the Frontend, the other covers the Backend. Together, you can build full-stack apps.";
  } else if (hasFrontendA && hasFrontendB) {
    score += 10;
    complementType = "Frontend Alliance";
    insight =
      "Both of you are client-side specialists. Perfect for sharing React UI designs, styling tips, and front-end performance tweaks.";
  } else if (hasBackendA && hasBackendB) {
    score += 10;
    complementType = "Backend Alliance";
    insight =
      "Both of you are backend developers. Great for discussing microservices, API architectures, server scalability, and database design.";
  }

  // Custom insights based on specific shared skills
  if (shared.length > 0) {
    const mainShared = shared.slice(0, 2).join(" & ");
    insight = `You both share expertise in ${mainShared}. Ideal for pairing up on projects and brainstorming advanced architecture.`;
  }

  // Cap score at 99
  score = Math.min(score, 99);

  return {
    score,
    shared,
    complementType,
    insight,
  };
};

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const currentUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      if (err?.response?.status === 401) {
        dispatch(removeUser());
        navigate("/login");
      }
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
        }
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
      console.error("API error during swipe:", error);
      setToast({
        message: `Failed to send request: ${error.response?.data?.message || error.message || "Server Error"}`,
        type: "error",
      });
      // Rethrow to let the UserCard component handle the error/snapback state
      throw error;
    }
  };

  // Loading State
  if (feed === null || !currentUser) {
    return (
      <div className="flex flex-col justify-center items-center grow bg-slate-950 text-slate-100 min-h-[80vh] w-full">
        <span className="loading loading-ring loading-lg text-rose-500 mb-4 scale-125"></span>
        <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">
          Curating your developer feed...
        </p>
      </div>
    );
  }

  // Active card details & match calculations
  const activeUser = feed.length > 0 ? feed[0] : null;
  const synergy = activeUser ? calculateSynergy(currentUser, activeUser) : null;

  return (
    <div className="relative min-h-[80vh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center py-10 px-4 overflow-hidden grow">
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
        .text-glow-emerald {
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
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

      {feed.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto z-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center px-2 md:px-6">
          
          {/* Left Column: Tech Synergy Analyzer (Desktop only, hidden on mobile but accessible via dialog) */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 shadow-2xl sticky top-24 self-start animate-fade-in min-h-[480px]">
            {activeUser && synergy && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-emerald-400 w-5 h-5 animate-pulse" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Match Radar</h3>
                </div>

                {/* Radar Compatibility Score */}
                <div className="flex flex-col items-center justify-center my-2 relative">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" className="stroke-slate-800/80" strokeWidth="5.5" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-emerald-500 transition-all duration-1000 ease-out"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray="263.89"
                        strokeDashoffset={263.89 - (263.89 * synergy.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-black text-emerald-400 text-glow-emerald leading-none select-none">
                        {synergy.score}%
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-1">
                        Compatibility
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complementary Badge */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    {synergy.complementType}
                  </span>
                </div>

                {/* Shared Tech Stack */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shared Stack</h4>
                  {synergy.shared.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {synergy.shared.map((skill, index) => (
                        <span
                          key={index}
                          className="badge badge-outline border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-bold text-xs py-2.5 px-3 select-none flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No exact matching skills. Perfect opportunity to trade code secrets!
                    </p>
                  )}
                </div>

                {/* Match Insight */}
                <div className="flex flex-col gap-2 bg-slate-950/40 p-4 border border-slate-800/50 rounded-2xl">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Dev Insight</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {synergy.insight}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Interactive Swiper Card */}
          <div className="col-span-1 lg:col-span-4 xl:col-span-4 flex flex-col items-center justify-center">
            
            {/* Mobile Compatibility Badge Trigger */}
            {activeUser && synergy && (
              <button
                onClick={() => document.getElementById("synergy-modal").showModal()}
                className="lg:hidden flex items-center gap-1.5 mb-4 py-2 px-4 bg-slate-900/80 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 hover:bg-slate-800 transition-all shadow-lg animate-fade-in"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Compatibility: <strong className="text-white">{synergy.score}%</strong> (View Details)</span>
              </button>
            )}

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
          </div>

          {/* Right Column: Dev Spotlight Queue */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 shadow-2xl sticky top-24 self-start animate-fade-in gap-4 min-h-[480px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="text-indigo-400 w-5 h-5" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Dev Spotlight</h3>
              </div>
              <span className="badge bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold text-[10px] py-1.5 px-2">
                {feed.length - 1} in queue
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {feed.length > 1 ? (
                feed.slice(1, 5).map((user) => (
                  <div
                    key={user._id}
                    className="group relative flex items-center justify-between p-3.5 bg-slate-950/30 border border-slate-900/80 rounded-2xl transition-all duration-300 hover:bg-slate-900/50 hover:border-slate-800 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-850 shrink-0">
                        <img
                          src={user.photoUrl}
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full"></div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {user.firstName}, {user.age}
                        </span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {user.skills.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold py-0.5 px-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {/* Promote Button */}
                      <button
                        onClick={() => dispatch(promoteUserToFront(user._id))}
                        title="Promote to Feed Center"
                        className="btn btn-circle btn-sm bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-650 text-slate-400 hover:text-white transition-all shadow animate-pulse hover:animate-none"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {/* Quick Connect Button */}
                      <button
                        onClick={() => handleSwipe("interested", user._id)}
                        title="Quick Connect"
                        className="btn btn-circle btn-sm bg-slate-900 hover:bg-emerald-600 border border-slate-800 hover:border-emerald-650 text-slate-400 hover:text-white transition-all shadow"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/20 my-auto">
                  <Search className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-slate-400">Spotlight Queue Empty</p>
                  <p className="text-[10px] text-slate-500 mt-1">Check back later for new developers.</p>
                </div>
              )}
            </div>
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
              <Sparkles className="w-10 h-10 text-rose-400 animate-pulse shrink-0" />
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
              className="btn btn-primary bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 border-none w-full py-3.5 rounded-2xl text-white font-extrabold shadow-lg shadow-rose-500/15 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              View Matches
            </Link>
            <Link
              to="/requests"
              className="btn btn-ghost hover:bg-slate-800/40 text-slate-350 hover:text-white w-full rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Review Requests
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Synergy Dialog Modal */}
      {activeUser && synergy && (
        <dialog id="synergy-modal" className="modal modal-bottom sm:modal-middle bg-slate-950/40 backdrop-blur-md">
          <div className="modal-box bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-slate-400 hover:text-white">✕</button>
            </form>
            
            <div className="flex flex-col items-center gap-5 mt-2">
              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="text-emerald-400 w-5 h-5 animate-pulse" />
                <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-200">Match Synergy</h3>
              </div>
              
              {/* Radar Compatibility Score */}
              <div className="flex flex-col items-center justify-center my-1">
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-slate-800" strokeWidth="5.5" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-emerald-500"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * synergy.score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2.5xl font-black text-emerald-400 leading-none">{synergy.score}%</span>
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-0.5">Match</span>
                  </div>
                </div>
              </div>

              {/* Complementary Badge */}
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400">
                <Zap className="w-3 h-3" />
                {synergy.complementType}
              </span>

              {/* Shared Tech Stack */}
              <div className="w-full flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shared Stack</h4>
                {synergy.shared.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {synergy.shared.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-outline border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-bold text-xs py-2 px-2.5 select-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No overlapping skills found. Expand your horizons!</p>
                )}
              </div>

              {/* Match Insight */}
              <div className="w-full flex flex-col gap-2 bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl text-left">
                <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Insight</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {synergy.insight}
                </p>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default Feed;
