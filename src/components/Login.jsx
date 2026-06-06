import React, { useState, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { Terminal } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setErrorMessage("");
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setErrorMessage("Please fill all the fields");
        return;
      }
      const res = await axios.post(
        BASE_URL + "/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );
      const data = res?.data?.data;
      dispatch(addUser(data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data?.message || "Something went wrong");
      setPassword("");
    }
  };

  const handleSignup = async () => {
    if (!firstName.trim()) {
      setErrorMessage("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("Last name is required");
      return;
    }
    if (!age) {
      setErrorMessage("Age is required");
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setErrorMessage("You must be at least 18 years old");
      return;
    } else if (ageNum > 100) {
      setErrorMessage("You must be below 100 years old");
      return;
    }
    if (!gender) {
      setErrorMessage("Gender selection is required");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email address is required");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required");
      return;
    }
    setErrorMessage("");
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        {
          firstName,
          lastName,
          age: ageNum,
          gender,
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );
      const data = res?.data?.data;
      if (data) {
        dispatch(addUser(data));
        navigate("/profile");
      } else {
        throw new Error("Invalid server response format");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error?.response?.data?.message || "Something went wrong");
      setPassword("");
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleFormMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setAge("");
    setGender("");
    setErrorMessage("");
  };

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden py-12 px-4 bg-slate-950">
      {/* Ambient Glowing Background Elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.04] blur-[150px] pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md z-10">
        <div className="card bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-[0_0_80px_rgba(168,85,247,0.15)] rounded-3xl p-6 md:p-10 transition-all duration-500 hover:border-purple-500/20 hover:shadow-[0_0_100px_rgba(168,85,247,0.25)]">
          {/* Brand / Logo and Subtitle */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-purple-500/20 mb-3 shadow-inner">
              <Terminal className="w-8 h-8 text-purple-400 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                {isLogin ? "Developer Sign In" : "Developer Sign Up"}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {isLogin
                ? "Welcome back! Connect with peers and collaborate on cool code"
                : "Join our community! Connect with peers and collaborate on cool code"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            {/* SIGNUP FIELDS (Only for Signup) */}
            {!isLogin && (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                        First Name
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        className="input input-bordered w-full pl-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        onChange={handleInputChange(setFirstName)}
                      />
                    </div>
                  </div>

                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                        Last Name
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        className="input input-bordered w-full pl-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        onChange={handleInputChange(setLastName)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                        Age
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                      <input
                        type="number"
                        placeholder="18"
                        value={age}
                        min="18"
                        max="120"
                        className="input input-bordered w-full pl-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        onChange={handleInputChange(setAge)}
                      />
                    </div>
                  </div>

                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                        Gender
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                          />
                        </svg>
                      </span>
                      <select
                        value={gender}
                        className="select select-bordered w-full pl-10 bg-slate-950/40 border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        required
                        onChange={handleInputChange(setGender)}
                      >
                        <option value="" disabled className="text-slate-600">
                          Select Gender
                        </option>
                        <option
                          value="male"
                          className="text-slate-200 bg-slate-900"
                        >
                          Male
                        </option>
                        <option
                          value="female"
                          className="text-slate-200 bg-slate-900"
                        >
                          Female
                        </option>
                        <option
                          value="others"
                          className="text-slate-200 bg-slate-900"
                        >
                          Others
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* EMAIL ID */}
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4.5 w-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="developer@devtinder.com"
                  value={email}
                  className="input input-bordered w-full pl-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  required
                  onChange={handleInputChange(setEmail)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab" && !e.shiftKey) {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-control w-full">
              <div className="flex justify-between items-center py-1">
                <label className="label p-0">
                  <span className="label-text text-xs font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </span>
                </label>
                {isLogin && (
                  <a
                    href="#forgot"
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline focus:outline-none transition-colors"
                  >
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4.5 w-4.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  ref={passwordInputRef}
                  className="input input-bordered w-full pl-10 pr-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  required
                  onChange={handleInputChange(setPassword)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4.5 h-4.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4.5 h-4.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-sm text-red-500">{`Error : ${errorMessage}`}</p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              className="btn w-full mt-6 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-sm tracking-wider uppercase border-none hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300 transform active:scale-[0.98] py-4 h-auto min-h-0 rounded-2xl"
              onClick={(e) => {
                e.preventDefault();
                if (isLogin) {
                  handleLogin();
                } else {
                  handleSignup();
                }
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span>{isLogin ? "Login" : "Sign Up"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          </form>

          {/* Divider and Signup Link */}
          <div className="divider border-slate-800/80 my-6"></div>

          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
              {isLogin
                ? "Ready to code with matches?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={toggleFormMode}
                className="ml-1.5 text-purple-400 hover:text-purple-300 font-bold hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? "Create Account Here" : "Login Here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
