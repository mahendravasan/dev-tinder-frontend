import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const EditProfile = ({ user, setPreviewUser }) => {
  const dispatch = useDispatch();

  // Initialize form fields with user data
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [about, setAbout] = useState(user?.about || "");
  const [skills, setSkills] = useState(
    user?.skills ? user.skills.join(", ") : "",
  );

  // Status and feedback states
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Dynamic preview synchronizer: updates parent state on every input keystroke
  useEffect(() => {
    // Gracefully handle parsing of comma-separated skills
    const parsedSkills = skills
      ? skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    setPreviewUser({
      ...user,
      firstName,
      lastName,
      age: age ? Number(age) : "",
      gender,
      photoUrl:
        photoUrl ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", // visual fallback
      about,
      skills: parsedSkills,
    });
  }, [
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills,
    setPreviewUser,
    user,
  ]);

  // Self-dismiss alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Form Reset handler
  const handleReset = (e) => {
    e.preventDefault();
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setAge(user?.age || "");
    setGender(user?.gender || "male");
    setPhotoUrl(user?.photoUrl || "");
    setAbout(user?.about || "");
    setSkills(user?.skills ? user.skills.join(", ") : "");
    setValidationErrors({});
    setAlert({
      type: "success",
      message: "Form reset to current profile spec.",
    });
  };

  // Client-side validations
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.trim().length < 3) {
      errors.firstName = "First name must be at least 3 characters";
    }

    if (age && (Number(age) < 18 || Number(age) > 100)) {
      errors.age = "Developer age must be between 18 and 100";
    }

    if (
      photoUrl &&
      !photoUrl.startsWith("http://") &&
      !photoUrl.startsWith("https://")
    ) {
      errors.photoUrl =
        "Please provide a valid image URL starting with http/https";
    }

    if (about && about.length > 300) {
      errors.about = "Bio must be less than 300 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile updates to backend API
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      setAlert({
        type: "error",
        message: "Please correct the form fields validation errors.",
      });
      return;
    }

    setLoading(true);
    try {
      const parsedSkills = skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          age: age ? Number(age) : null,
          gender,
          photoUrl,
          about,
          skills: parsedSkills,
        },
        {
          withCredentials: true,
        },
      );

      // Support backend variations of res structure
      const updatedUser = res?.data?.data || res?.data;

      if (updatedUser) {
        dispatch(addUser(updatedUser));
        setAlert({
          type: "success",
          message: "Profile updated successfully! Keep matching!",
        });
      } else {
        throw new Error("Invalid server response format");
      }
    } catch (err) {
      console.error("Profile Edit Error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setAlert({
        type: "error",
        message: `Failed to update profile: ${serverMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Absolute Toast Notification Container */}
      {alert && (
        <div className="absolute -top-14 left-0 right-0 z-50 px-2 animate-bounce">
          <div
            className={`alert ${
              alert.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/30 text-rose-200"
            } border backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] rounded-2xl flex justify-between items-center py-3 px-5 transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">
                {alert.type === "success" ? "✨" : "⚠️"}
              </span>
              <span className="text-xs font-semibold tracking-wide">
                {alert.message}
              </span>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-slate-400 hover:text-white font-bold text-xs pl-2 cursor-pointer focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Glassmorphism Profile Editor Container */}
      <div className="card bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-[0_0_80px_rgba(168,85,247,0.1)] rounded-3xl p-6 md:p-8 transition-all duration-500 hover:border-purple-500/10">
        {/* Editor Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Edit Developer Spec
            </span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            Keep your profile details fresh to attract high-quality code
            collaborators
          </p>
        </div>

        {/* Edit Profile Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FIRST NAME */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  First Name <span className="text-pink-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Bill"
                value={firstName}
                className={`input input-bordered w-full bg-slate-950/40 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ${
                  validationErrors.firstName
                    ? "border-rose-500/50 focus:border-rose-500"
                    : "border-slate-800 focus:border-purple-500"
                }`}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              {validationErrors.firstName && (
                <p className="text-[10px] text-rose-400 font-semibold mt-1 pl-1">
                  {validationErrors.firstName}
                </p>
              )}
            </div>

            {/* LAST NAME */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Last Name
                </span>
              </label>
              <input
                type="text"
                placeholder="Gates"
                value={lastName}
                className="input input-bordered w-full bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AGE */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Age
                </span>
              </label>
              <input
                type="number"
                placeholder="25"
                min="18"
                max="120"
                value={age}
                className={`input input-bordered w-full bg-slate-950/40 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ${
                  validationErrors.age
                    ? "border-rose-500/50 focus:border-rose-500"
                    : "border-slate-800 focus:border-purple-500"
                }`}
                onChange={(e) => setAge(e.target.value)}
              />
              {validationErrors.age && (
                <p className="text-[10px] text-rose-400 font-semibold mt-1 pl-1">
                  {validationErrors.age}
                </p>
              )}
            </div>

            {/* GENDER */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Gender Identification
                </span>
              </label>
              <select
                value={gender}
                className="select select-bordered w-full bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* PHOTO URL */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Photo Image URL
              </span>
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              className={`input input-bordered w-full bg-slate-950/40 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ${
                validationErrors.photoUrl
                  ? "border-rose-500/50 focus:border-rose-500"
                  : "border-slate-800 focus:border-purple-500"
              }`}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            {validationErrors.photoUrl && (
              <p className="text-[10px] text-rose-400 font-semibold mt-1 pl-1">
                {validationErrors.photoUrl}
              </p>
            )}
          </div>

          {/* SKILLS */}
          <div className="form-control w-full">
            <label className="label py-1 flex justify-between items-baseline">
              <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Developer Tech Stack (Skills)
              </span>
              <span className="text-[9px] text-slate-500 italic">
                Separate with commas
              </span>
            </label>
            <input
              type="text"
              placeholder="React, JavaScript, Node.js, TailwindCSS"
              value={skills}
              className="input input-bordered w-full bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* BIO / ABOUT */}
          <div className="form-control w-full">
            <div className="flex justify-between items-center py-1">
              <label className="label p-0">
                <span className="label-text text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Bio / About Me
                </span>
              </label>
              <span
                className={`text-[10px] font-semibold ${about.length > 300 ? "text-rose-400" : "text-slate-500"}`}
              >
                {about.length}/300
              </span>
            </div>
            <textarea
              placeholder="Tell other developers about your code philosophy, side projects, and ideal tech stacks..."
              value={about}
              maxLength="320"
              className={`textarea textarea-bordered w-full bg-slate-950/40 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 h-24 min-h-[80px] ${
                validationErrors.about
                  ? "border-rose-500/50 focus:border-rose-500"
                  : "border-slate-800 focus:border-purple-500"
              }`}
              onChange={(e) => setAbout(e.target.value)}
            />
            {validationErrors.about && (
              <p className="text-[10px] text-rose-400 font-semibold mt-1 pl-1">
                {validationErrors.about}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* RESET / RESTORE SPEC */}
            <button
              onClick={handleReset}
              className="btn btn-outline border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl py-3 h-auto min-h-0 order-2 sm:order-1 flex-1 transition-all duration-200"
              disabled={loading}
            >
              Reset Form
            </button>

            {/* SAVE PROFILE */}
            <button
              onClick={handleSaveProfile}
              className={`btn bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] text-white font-bold text-xs uppercase tracking-wider border-none rounded-xl py-3 h-auto min-h-0 order-1 sm:order-2 flex-1 transition-all duration-300 transform active:scale-[0.98] ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span>Saving Specs...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Save Specs</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
