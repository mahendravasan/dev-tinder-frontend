import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";
import { Mars, Venus, Transgender, Search, Info, MessageSquare, Trash2, Heart, Mail } from "lucide-react";

// Modern Skeleton Loading Card
const SkeletonCard = () => (
  <div className="card bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 animate-pulse">
    <div className="w-full h-48 bg-slate-800/60 rounded-2xl"></div>
    <div className="space-y-2 mt-2">
      <div className="h-6 bg-slate-800/60 rounded w-2/3"></div>
      <div className="h-4 bg-slate-800/60 rounded w-1/3"></div>
    </div>
    <div className="flex gap-2 mt-2">
      <div className="h-5 bg-slate-800/60 rounded w-14"></div>
      <div className="h-5 bg-slate-800/60 rounded w-16"></div>
      <div className="h-5 bg-slate-800/60 rounded w-12"></div>
    </div>
    <div className="h-10 bg-slate-800/60 rounded-xl mt-4"></div>
  </div>
);

// Gorgeous Custom Toast Notification
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast toast-top toast-end z-50 m-4 animate-fade-in">
      <div className="alert alert-success bg-emerald-600 text-white border-none shadow-2xl rounded-2xl flex items-center gap-2.5 p-4">
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
        <span className="font-semibold text-sm">{message}</span>
      </div>
    </div>
  );
};

const Connections = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connection);
  const currentUser = useSelector((store) => store.user);
  const navigate = useNavigate();

  // Stateful UI states
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Interactive Overlays
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [unmatchTarget, setUnmatchTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Stateful Mock Chats
  const [chatMessages, setChatMessages] = useState({});

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnection(res?.data?.data || []));
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 401) {
        dispatch(removeUser());
        navigate("/login");
      }
      dispatch(addConnection([]));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Initialize or retrieve conversations utilizing developer tags
  const getOrInitializeChat = (userId, firstName, skills = []) => {
    if (chatMessages[userId]) return chatMessages[userId];

    const primeSkill = skills.length > 0 ? skills[0] : "development";
    const initialDialog = [
      {
        sender: "them",
        text: `Hey! Realized we connected on DevTinder. I saw you work with code matching my interests. Are you active with ${primeSkill} lately? 💻`,
        time: "10:30 AM",
      },
      {
        sender: "me",
        text: `Hi! Yes, absolutely. I love working with that stack! What project ideas are you thinking about?`,
        time: "10:32 AM",
      },
      {
        sender: "them",
        text: `I'm sketching a high-performance developer dashboard. We should definitely pair program or open-source collaborate! 🚀`,
        time: "10:33 AM",
      },
    ];

    setChatMessages((prev) => ({ ...prev, [userId]: initialDialog }));
    return initialDialog;
  };

  const handleSendMessage = (text) => {
    if (!activeChatUser) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg = {
      sender: "me",
      text,
      time: formattedTime,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeChatUser._id]: [...(prev[activeChatUser._id] || []), newMsg],
    }));

    // Simulated reply from matching developer after 1.5 seconds
    setTimeout(() => {
      const reply = {
        sender: "them",
        text: "That sounds awesome! Let me clone the repo and review the issues. Let's schedule a Zoom call tomorrow! 👨‍💻🔥",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => ({
        ...prev,
        [activeChatUser._id]: [...(prev[activeChatUser._id] || []), reply],
      }));
    }, 1500);
  };

  const confirmUnmatch = async (id) => {
    if (!unmatchTarget) return;
    try {
      const res = await axios.delete(
        BASE_URL + "/user/connection/delete/" + id,
        {
          withCredentials: true,
        },
      );

      const updated = (connections || []).filter(
        (c) => c._id !== unmatchTarget._id,
      );
      dispatch(addConnection(updated));

      setToast(`Unmatched with ${unmatchTarget.firstName} successfully.`);

      if (activeChatUser?._id === unmatchTarget._id) setActiveChatUser(null);
      if (selectedUser?._id === unmatchTarget._id) setSelectedUser(null);

      setUnmatchTarget(null);
    } catch (error) {
      console.log(error);
    }
  };

  // Search & Filter Operations
  const filteredConnections = (connections || []).filter((user) => {
    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const skills = (user.skills || []).map((s) => s.toLowerCase());
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) || skills.some((s) => s.includes(query));

    const gender = user.gender?.toLowerCase() || "other";
    const matchesGender =
      genderFilter === "all" ||
      (genderFilter === "male" && gender === "male") ||
      (genderFilter === "female" && gender === "female") ||
      (genderFilter === "other" && gender !== "male" && gender !== "female");

    return matchesSearch && matchesGender;
  });

  // Sort Operations
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    if (sortBy === "nameAsc") {
      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
      );
    }
    if (sortBy === "nameDesc") {
      return `${b.firstName} ${b.lastName}`.localeCompare(
        `${a.firstName} ${a.lastName}`,
      );
    }
    return 0;
  });

  const genderTheme = {
    male: { badge: "bg-sky-500/10 text-sky-400 border-sky-500/20", icon: Mars },
    female: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: Venus,
    },
    other: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: Transgender,
    },
  };

  const getGenderStyle = (g) =>
    genderTheme[g?.toLowerCase()] || genderTheme.other;

  return (
    <div className="relative min-h-[85vh] w-full bg-slate-950 text-slate-100 py-12 px-4 md:px-8 overflow-hidden flex flex-col items-center">
      {/* Self-contained CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="w-full max-w-6xl z-10 flex flex-col gap-8 flex-grow">
        {/* Title Dashboard Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
              Developer Connections
              <span className="badge badge-md bg-purple-500/20 text-purple-300 border-purple-500/30 py-3 px-3.5 font-bold">
                {connections ? connections.length : 0} Matches
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Browse your matches, start collaborations, and pair program on
              projects.
            </p>
          </div>

          {/* Quick Clear filters shortcut */}
          {(searchQuery || genderFilter !== "all" || sortBy !== "default") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setGenderFilter("all");
                setSortBy("default");
              }}
              className="btn btn-sm btn-ghost text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Dashboard Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-slate-900 p-4 rounded-3xl shadow-xl">
          {/* Live Search Input */}
          <div className="relative flex-grow max-w-lg flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by developer name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-md w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 text-slate-100 rounded-2xl pl-11 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Filters */}
            <div className="join bg-slate-950/60 border border-slate-800 p-0.5 rounded-2xl">
              {[
                { id: "all", label: "All Devs" },
                { id: "male", label: "Male" },
                { id: "female", label: "Female" },
                { id: "other", label: "Other" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGenderFilter(tab.id)}
                  className={`join-item btn btn-xs md:btn-sm border-none font-semibold px-4 rounded-xl transition-all duration-300 ${
                    genderFilter === tab.id
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                      : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Alphabetical Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-md bg-slate-950/60 border border-slate-800 focus:border-purple-500 text-slate-300 rounded-2xl focus:outline-none py-0.5 font-medium transition-all duration-200"
              >
                <option value="default">Sort: Matching Feed</option>
                <option value="nameAsc">Sort: Name (A-Z)</option>
                <option value="nameDesc">Sort: Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading state Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : sortedConnections.length > 0 ? (
          /* Cards Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {sortedConnections.map((user) => {
              const genderStyle = getGenderStyle(user.gender);
              return (
                <div
                  key={user._id}
                  className="card bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-purple-500/30 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between group shadow-lg hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                    <img
                      src={user.photoUrl}
                      alt={user.firstName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent"></div>

                    {/* Gender badge top-right */}
                    <div className="absolute top-3.5 right-3.5">
                      <span
                        className={`badge border text-xs py-2 px-2.5 rounded-xl font-bold shadow-md bg-slate-950/80 backdrop-blur-md flex items-center ${genderStyle.badge}`}
                      >
                        <span className="mr-1 flex items-center">
                          <genderStyle.icon className="w-3.5 h-3.5 shrink-0" />
                        </span>
                        {user.gender || "Developer"}
                      </span>
                    </div>

                    {/* Name inside Overlay bottom-left */}
                    <div className="absolute bottom-3.5 left-4 text-white">
                      <h2 className="text-xl font-extrabold tracking-tight drop-shadow-md select-text">
                        {user.firstName} {user.lastName}
                      </h2>
                      {user.age && (
                        <span className="text-xs text-slate-300 font-medium drop-shadow-sm">
                          Age: {user.age} • Dev Matching
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex-grow flex flex-col justify-between gap-4 bg-slate-900/20">
                    {/* Bio */}
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed min-h-[32px] select-text">
                      {user.about ||
                        "This developer hasn't completed their bio yet. Swipe and chat to discover their stack!"}
                    </p>

                    {/* Skills pill cloud (first 3 + count) */}
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {(user.skills || []).slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="badge badge-outline border-slate-800 text-[10px] text-slate-300 font-semibold py-2 px-2 select-none"
                        >
                          {skill}
                        </span>
                      ))}
                      {(user.skills || []).length > 3 && (
                        <span className="badge badge-outline bg-purple-500/10 border-none text-[10px] text-purple-400 font-bold py-2 px-2 select-none">
                          +{user.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex justify-between items-center gap-2 pt-3.5 border-t border-slate-850">
                      {/* View Profile info */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn btn-square btn-ghost btn-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors duration-200 flex items-center justify-center"
                        title="View Full Profile"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {/* Chat Drawer open */}
                      <button
                        onClick={() => setActiveChatUser(user)}
                        className="btn btn-sm flex-grow rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white text-xs font-bold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat Now
                      </button>

                      {/* Unmatch Action */}
                      <button
                        onClick={() => setUnmatchTarget(user)}
                        className="btn btn-square btn-ghost btn-sm text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200 flex items-center justify-center"
                        title="Unmatch Developer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500/60 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State component */
          <div className="grow flex items-center justify-center py-12">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
              <div className="relative mb-8">
                {/* Halo pulse glow */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-heartbeat"></div>
                <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-purple-500/40 flex items-center justify-center z-10 relative shadow-2xl">
                  <Heart className="w-10 h-10 text-purple-500 animate-pulse shrink-0" />
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white mb-2">
                {searchQuery || genderFilter !== "all"
                  ? "No Matching Devs"
                  : "No Connections Yet"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                {searchQuery || genderFilter !== "all"
                  ? "We couldn't find anyone matching your search filters. Try adjusting your query or resetting filters."
                  : "Keep exploring the community! Swipe right on other developers with matching skills to grow your matching circle."}
              </p>
              {searchQuery || genderFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGenderFilter("all");
                  }}
                  className="btn btn-primary rounded-xl px-6"
                >
                  Clear All Filters
                </button>
              ) : (
                <Link
                  to="/"
                  className="btn btn-primary bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 border-none px-8 py-3 rounded-full text-white font-extrabold transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/25"
                >
                  Start Swiping Now
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MATCH DETAILS MODAL (Custom styled match details overlay) */}
      {selectedUser && (
        <div className="modal modal-open z-50 animate-fade-in">
          <div className="modal-box bg-slate-900 border border-slate-800 rounded-3xl max-w-lg p-0 overflow-hidden shadow-2xl">
            {/* Header profile banner */}
            <div className="relative h-44 bg-gradient-to-r from-purple-700 to-indigo-800">
              <button
                onClick={() => setSelectedUser(null)}
                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-white hover:bg-white/10 z-10"
              >
                ✕
              </button>
              <div className="absolute inset-0 bg-slate-950/20"></div>
            </div>

            {/* Avatar positioning */}
            <div className="px-6 pb-6 relative -mt-16 flex flex-col gap-4">
              <div className="avatar">
                <div className="w-28 h-28 rounded-full border-4 border-slate-900 shadow-xl bg-slate-800">
                  <img
                    src={selectedUser.photoUrl}
                    alt={selectedUser.firstName}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                  {selectedUser.age && (
                    <span className="text-lg font-normal text-slate-400">
                      , {selectedUser.age}
                    </span>
                  )}
                </h2>
                {(() => {
                  const style = getGenderStyle(selectedUser.gender);
                  const IconComp = style.icon;
                  return (
                    <span
                      className={`badge border text-xs py-2 px-2.5 rounded-lg mt-1 font-bold flex items-center gap-1 ${style.badge}`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      {selectedUser.gender || "Developer"}
                    </span>
                  );
                })()}
              </div>

              <div className="divider border-slate-850 m-0"></div>

              {/* Biography */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About Matching Developer
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedUser.about ||
                    "This user hasn't completed their biography page yet."}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Programming Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedUser.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="badge badge-outline border-slate-800 hover:border-purple-500 hover:text-purple-400 transition-colors duration-200 text-xs text-slate-200 py-2.5 px-3 font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mock Developer Links */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Developer Coordinates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 shrink-0">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    <span className="font-semibold text-slate-350">GitHub:</span>
                    <a
                      href={`https://github.com/${selectedUser.firstName?.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline font-bold"
                    >
                      github.com/{selectedUser.firstName?.toLowerCase()}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-355">Email:</span>
                    <span className="text-slate-300 font-semibold">
                      {selectedUser.firstName?.toLowerCase()}@devtinder.io
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat CTA */}
              <button
                onClick={() => {
                  setActiveChatUser(selectedUser);
                  setSelectedUser(null);
                }}
                className="btn btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white w-full rounded-2xl mt-2 font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                Open Dialogue Chat
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          ></div>
        </div>
      )}

      {/* MOCK CHAT DRAWER */}
      {activeChatUser && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30"
            onClick={() => setActiveChatUser(null)}
          ></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-slate-900 border-l border-slate-850 shadow-2xl z-40 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/30">
              <div className="flex items-center gap-3">
                <div className="avatar online">
                  <div className="w-11 h-11 rounded-full ring-2 ring-purple-500/80 ring-offset-2 ring-offset-slate-900">
                    <img
                      src={activeChatUser.photoUrl}
                      alt={activeChatUser.firstName}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {activeChatUser.firstName} {activeChatUser.lastName}
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Pairing Match Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveChatUser(null)}
                className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/10">
              {getOrInitializeChat(
                activeChatUser._id,
                activeChatUser.firstName,
                activeChatUser.skills,
              ).map((msg, index) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={index}
                    className={`chat ${isMe ? "chat-end" : "chat-start"} animate-fade-in`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-8 h-8 rounded-full border border-slate-800">
                        <img
                          src={
                            isMe
                              ? currentUser?.photoUrl || "/default-avatar.png"
                              : activeChatUser.photoUrl
                          }
                          alt="Avatar"
                        />
                      </div>
                    </div>
                    <div className="chat-header text-[10px] text-slate-500 font-bold tracking-wide mb-1">
                      {isMe ? "You" : activeChatUser.firstName}
                      <time className="text-[9px] opacity-40 ml-1.5 font-normal">
                        {msg.time}
                      </time>
                    </div>
                    <div
                      className={`chat-bubble text-sm font-semibold rounded-2xl max-w-[85%] leading-relaxed ${
                        isMe
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10"
                          : "bg-slate-800 border border-slate-700/30 text-slate-100 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggestions panel */}
            <div className="px-4 py-2 border-t border-slate-850 bg-slate-950/30 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                Quick Dev Starters:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[
                  "Let's pair program!",
                  "What tech stack are you learning?",
                  "Collab on a side-project?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] py-1 px-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-750 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = e.target.msg.value;
                  if (!val.trim()) return;
                  handleSendMessage(val);
                  e.target.msg.value = "";
                }}
                className="flex gap-2"
              >
                <input
                  name="msg"
                  type="text"
                  placeholder="Type developer message..."
                  className="input input-md w-full bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 rounded-xl focus:outline-none focus:ring-0 text-sm"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none rounded-xl text-white text-xs font-bold px-5"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* UNMATCH CONFIRMATION MODAL */}
      {unmatchTarget && (
        <div className="modal modal-open z-50 animate-fade-in">
          <div className="modal-box bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm">
            <h3 className="font-extrabold text-xl text-white mb-2">
              Unmatch Developer?
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              Are you sure you want to unmatch with{" "}
              <span className="text-white font-bold">
                {unmatchTarget.firstName} {unmatchTarget.lastName}
              </span>
              ? This will remove them from your matches list permanently.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-ghost rounded-xl text-slate-300 text-xs font-bold"
                onClick={() => setUnmatchTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error bg-red-600 hover:bg-red-700 text-white rounded-xl border-none text-xs font-bold px-5"
                onClick={() => confirmUnmatch(unmatchTarget._id)}
              >
                Unmatch
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setUnmatchTarget(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Connections;
