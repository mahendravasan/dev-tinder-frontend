import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addrequest, removeRequest } from "../utils/requestSlice";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";

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
    </div>
    <div className="h-10 bg-slate-800/60 rounded-xl mt-4"></div>
  </div>
);

// Gorgeous Custom Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const alertClass =
    type === "accepted"
      ? "alert-success bg-emerald-600"
      : "alert-error bg-rose-600";

  return (
    <div className="toast toast-top toast-end z-50 m-4 animate-fade-in">
      <div
        className={`alert ${alertClass} text-white border-none shadow-2xl rounded-2xl flex items-center gap-2.5 p-4`}
      >
        {type === "accepted" ? (
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

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.request);
  const navigate = useNavigate();

  // Stateful UI states
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Interactive Overlays
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Track swipe animation per card ID: { [requestId]: "accepted" | "rejected" }
  const [swipingCards, setSwipingCards] = useState({});

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });
      dispatch(addrequest(res?.data?.data || []));
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 401) {
        dispatch(removeUser());
        navigate("/login");
      }
      dispatch(addrequest([]));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReviewRequest = async (status, requestId, developerName) => {
    if (swipingCards[requestId]) return; //This stops a double-click from firing the whole thing twice

    // Trigger swipe-out animation
    setSwipingCards((prev) => ({ ...prev, [requestId]: status }));

    // Wait for the animation to complete (350ms) before hitting API & updating Redux
    setTimeout(async () => {
      try {
        await axios.post(
          BASE_URL + "/request/review/" + status + "/" + requestId,
          {},
          { withCredentials: true },
        );

        dispatch(removeRequest(requestId));

        // Trigger gorgeous customized feedback toast
        if (status === "accepted") {
          setToast({
            message: `Connected with ${developerName}! Check matches.`,
            type: "accepted",
          });
        } else {
          setToast({
            message: `Passed on request from ${developerName}`,
            type: "rejected",
          });
        }
      } catch (error) {
        console.error("Error reviewing request:", error);
        // Reset card swiping state in case of failure
        setSwipingCards((prev) => {
          const next = { ...prev };
          delete next[requestId];
          return next;
        });
      }
    }, 350);
  };

  // Search & Filter Operations
  const filteredRequests = (requests || []).filter((req) => {
    const fromUser = req.fromUserId;
    if (!fromUser) return false;

    const fullName =
      `${fromUser.firstName || ""} ${fromUser.lastName || ""}`.toLowerCase();
    const skills = (fromUser.skills || []).map((s) => s.toLowerCase());
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) || skills.some((s) => s.includes(query));

    const gender = fromUser.gender?.toLowerCase() || "other";
    const matchesGender =
      genderFilter === "all" ||
      (genderFilter === "male" && gender === "male") ||
      (genderFilter === "female" && gender === "female") ||
      (genderFilter === "other" && gender !== "male" && gender !== "female");

    return matchesSearch && matchesGender;
  });

  const genderTheme = {
    male: { badge: "bg-sky-500/10 text-sky-400 border-sky-500/20", icon: "♂️" },
    female: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: "♀️",
    },
    other: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: "⚧️",
    },
  };

  const getGenderStyle = (g) =>
    genderTheme[g?.toLowerCase()] || genderTheme.other;

  return (
    <div className="relative min-h-[85vh] w-full bg-slate-950 text-slate-100 py-12 px-4 md:px-8 overflow-hidden flex flex-col items-center">
      {/* Self-contained CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes swipeRight {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(280px, 30px) rotate(18deg); opacity: 0; }
        }
        @keyframes swipeLeft {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-280px, 30px) rotate(-18deg); opacity: 0; }
        }
        .animate-slide-in {
          animation: slideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
        .animate-swipe-right {
          animation: swipeRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-swipe-left {
          animation: swipeLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-rose-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-6xl z-10 flex flex-col gap-8 flex-grow">
        {/* Title Dashboard Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              Developer Requests
              <span className="badge badge-md bg-rose-500/20 text-rose-300 border-rose-500/30 py-3 px-3.5 font-bold">
                {requests ? requests.length : 0} Active
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Review incoming connection requests from developers interested in
              matching with you.
            </p>
          </div>

          {/* Quick Clear filters shortcut */}
          {(searchQuery || genderFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setGenderFilter("all");
              }}
              className="btn btn-sm btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Dashboard Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-slate-900 p-4 rounded-3xl shadow-xl">
          {/* Live Search Input */}
          <div className="relative flex-grow max-w-lg">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by developer name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-md w-full bg-slate-950/60 border border-slate-800 focus:border-rose-500 text-slate-100 rounded-2xl pl-11 focus:outline-none transition-all duration-200"
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
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg"
                      : "bg-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
        ) : filteredRequests.length > 0 ? (
          /* Cards Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRequests.map((req) => {
              const user = req.fromUserId;
              const genderStyle = getGenderStyle(user.gender);

              // Apply swipe classes dynamically based on swiped card state
              let swipeClass = "";
              if (swipingCards[req._id] === "accepted") {
                swipeClass = "animate-swipe-right pointer-events-none";
              } else if (swipingCards[req._id] === "rejected") {
                swipeClass = "animate-swipe-left pointer-events-none";
              } else {
                swipeClass = "animate-slide-in";
              }

              return (
                <div
                  key={req._id}
                  className={`card bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-rose-500/30 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col justify-between group shadow-lg hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-1 ${swipeClass}`}
                >
                  {/* Photo Container */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                    <img
                      src={user.photoUrl || "https://i.pravatar.cc/150"}
                      alt={user.firstName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent"></div>

                    {/* Gender badge top-right */}
                    <div className="absolute top-3.5 right-3.5">
                      <span
                        className={`badge border text-xs py-2 px-2.5 rounded-xl font-bold shadow-md bg-slate-950/80 backdrop-blur-md ${genderStyle.badge}`}
                      >
                        <span className="mr-1">{genderStyle.icon}</span>
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
                          Age: {user.age} • Match Interest
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex-grow flex flex-col justify-between gap-4 bg-slate-900/20">
                    {/* Bio */}
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed min-h-[32px] select-text">
                      {user.about || "No bio added yet."}
                    </p>

                    {/* Skills pill cloud (first 3 + count) */}
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="badge badge-outline ...">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          No skills listed
                        </span>
                      )}
                      {(user.skills || []).length > 3 && (
                        <span className="badge badge-outline bg-rose-500/10 border-none text-[10px] text-rose-400 font-bold py-2 px-2 select-none">
                          +{user.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex justify-between items-center gap-3 pt-3.5 border-t border-slate-850">
                      {/* View Profile info */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn btn-square btn-ghost btn-sm text-slate-450 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors duration-200"
                        title="View Profile Details"
                      >
                        ℹ️
                      </button>

                      <div className="flex items-center gap-2 flex-grow">
                        {/* Reject Button (Pass) */}
                        <button
                          onClick={() =>
                            handleReviewRequest(
                              "rejected",
                              req._id,
                              user.firstName,
                            )
                          }
                          className="btn btn-sm flex-1 rounded-xl bg-slate-800 hover:bg-rose-950/65 text-slate-300 hover:text-rose-400 border border-slate-700/35 hover:border-rose-900/40 text-xs font-extrabold transition-all duration-300"
                        >
                          Dismiss
                        </button>

                        {/* Accept Button (Interested) */}
                        <button
                          onClick={() =>
                            handleReviewRequest(
                              "accepted",
                              req._id,
                              user.firstName,
                            )
                          }
                          className="btn btn-sm flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 border-none text-white text-xs font-black transition-all duration-300 hover:scale-[1.02] shadow-md shadow-rose-500/10"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State component */
          <div className="grow flex items-center justify-center py-12 animate-fade-in">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
              <div className="relative mb-8">
                {/* Halo pulse glow */}
                <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-heartbeat"></div>
                <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-rose-500/40 flex items-center justify-center z-10 relative shadow-2xl">
                  <span className="text-4xl animate-pulse">✨</span>
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white mb-2">
                {searchQuery ? "No Matching Requests" : "Clear as a Blue Sky"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                {searchQuery
                  ? "We couldn't find any pending requests matching your search query. Try adjusting your keywords."
                  : "You've reviewed all incoming developer requests. Great job staying connected! Keep matching to build your network."}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-primary bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl px-6"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to="/"
                  className="btn btn-primary bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:via-pink-700 hover:to-purple-700 border-none px-8 py-3 rounded-full text-white font-extrabold transition-all duration-300 hover:scale-105 shadow-xl shadow-rose-500/25"
                >
                  Explore Dev Feed
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DEVELOPER PROFILE DETAILS MODAL */}
      {selectedUser && (
        <div className="modal modal-open z-50 animate-fade-in">
          <div className="modal-box bg-slate-900 border border-slate-800 rounded-3xl max-w-lg p-0 overflow-hidden shadow-2xl">
            {/* Header profile banner */}
            <div className="relative h-44 bg-gradient-to-r from-rose-750 to-pink-850">
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
                    src={selectedUser.photoUrl || "https://i.pravatar.cc/150"}
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
                <span
                  className={`badge border text-xs py-2 px-2.5 rounded-lg mt-1 font-bold ${getGenderStyle(selectedUser.gender).badge}`}
                >
                  {selectedUser.gender || "Developer"}
                </span>
              </div>

              <div className="divider border-slate-850 m-0"></div>

              {/* Biography */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About Developer
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedUser.about ||
                    "This user is ready to pair program! Accept their connection request to start exchanging direct messages."}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Programming Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    selectedUser.skills || [
                      "Frontend",
                      "Backend",
                      "React",
                      "NodeJS",
                    ]
                  ).map((skill, idx) => (
                    <span
                      key={idx}
                      className="badge badge-outline border-slate-800 hover:border-rose-500 hover:text-rose-455 transition-colors duration-200 text-xs text-slate-200 py-2.5 px-3 font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mock Developer Coordinates */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Developer Coordinates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <span>🐙 GitHub:</span>
                    <span className="text-rose-400 font-bold">
                      github.com/{selectedUser.firstName?.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <span>📧 Email:</span>
                    <span className="text-slate-300 font-semibold">
                      {selectedUser.firstName?.toLowerCase()}@devtinder.io
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop bg-slate-950/85 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Requests;
