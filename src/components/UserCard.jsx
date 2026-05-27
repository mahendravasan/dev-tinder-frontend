import React from "react";

const UserCard = ({ user }) => {
  const { firstName, lastName, gender, age, photoUrl, about, skills } = user;

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

  return (
    <div className="card w-full bg-base-100 shadow-2xl border border-base-200/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] flex flex-col max-w-sm sm:max-w-md mx-auto">
      {/* Immersive Image Container */}
      <figure className="relative h-[360px] sm:h-[400px] w-full overflow-hidden select-none bg-base-300">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-105"
        />

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
            {skills.map((skill, index) => (
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
        <div className="card-actions justify-center items-center gap-6 mt-3 pt-2 border-t border-base-200/50 select-none">
          {/* Dislike/Ignore Button */}
          <button
            aria-label="Pass"
            className="btn btn-circle btn-lg border-2 border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-md hover:shadow-rose-500/20"
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

          {/* Super Like Button */}
          {/* <button
            aria-label="Super Like"
            className="btn btn-circle btn-md border-2 border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:border-amber-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-amber-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button> */}

          {/* Interested Button */}
          <button
            aria-label="Interested"
            className="btn btn-circle btn-lg border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-md hover:shadow-emerald-500/20"
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
      </div>
    </div>
  );
};

export default UserCard;
