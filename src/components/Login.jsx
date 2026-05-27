import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
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
              <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                👨‍💻
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Developer Sign In
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Welcome back! Connect with peers and collaborate on cool code
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                <a
                  href="#forgot"
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline focus:outline-none transition-colors"
                >
                  Forgot?
                </a>
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
                  className="input input-bordered w-full pl-10 pr-10 bg-slate-950/40 border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  required
                  onChange={(e) => setPassword(e.target.value)}
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
                handleLogin();
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span>Login</span>
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
              Ready to code with matches?
              <a
                href="#signup"
                className="ml-1.5 text-purple-400 hover:text-purple-300 font-bold hover:underline focus:outline-none transition-colors"
              >
                Create Account Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
