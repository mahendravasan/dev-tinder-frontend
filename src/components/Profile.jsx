import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import UserCard from "./UserCard";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const [previewUser, setPreviewUser] = useState(null);

  // Initialize and synchronize preview user state with the authenticated Redux user
  useEffect(() => {
    if (user) {
      setPreviewUser(user);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="relative min-h-[85vh] w-full flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Glow behind loader */}
        <div className="absolute w-60 h-60 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col items-center gap-4 z-10">
          <span className="loading loading-spinner loading-lg text-purple-500"></span>
          <span className="text-slate-400 text-sm font-semibold tracking-wider animate-pulse">
            Loading developer credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden py-12 px-4 md:px-8 bg-slate-950">
      {/* Ambient Glowing Background Elements matching the login page */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[150px] pointer-events-none"></div>

      {/* Main Responsive Grid Layout */}
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start justify-center">
        {/* Column 1: Edit Profile Card (left-hand side) */}
        <div className="w-full lg:col-span-7">
          <EditProfile user={user} setPreviewUser={setPreviewUser} />
        </div>

        {/* Column 2: Interactive Live Preview Card (right-hand side) */}
        {previewUser && (
          <div className="w-full lg:col-span-5 flex flex-col items-center animate-fade-in">
            <div className="text-center lg:text-left w-full max-w-sm sm:max-w-md mb-5 px-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center justify-center lg:justify-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Card Preview</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                This is how other developer matches see you on DevTinder.
              </p>
            </div>
            <div className="w-full max-w-sm sm:max-w-md">
              <UserCard user={previewUser} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;