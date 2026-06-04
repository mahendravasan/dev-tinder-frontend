import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, UserPlus, User, LogOut } from "lucide-react";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { clearFeed } from "../utils/feedSlice";
import { addConnection, removeConnection } from "../utils/connectionSlice";
import { addrequest } from "../utils/requestSlice";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connection);
  const requests = useSelector((store) => store.request);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(clearFeed());
      dispatch(removeConnection());
      dispatch(addrequest(null));
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch connections and requests in background to keep badges accurate
  useEffect(() => {
    if (!user) return;

    const fetchNavbarData = async () => {
      try {
        const res = await axios.get(BASE_URL + "/user/connections", {
          withCredentials: true,
        });
        dispatch(addConnection(res?.data?.data || []));
      } catch (error) {
        console.error("Error fetching connections for NavBar:", error);
      }

      try {
        const res = await axios.get(BASE_URL + "/user/requests/received", {
          withCredentials: true,
        });
        dispatch(addrequest(res?.data?.data || []));
      } catch (error) {
        console.error("Error fetching requests for NavBar:", error);
      }
    };

    fetchNavbarData();
  }, [user, dispatch]);

  return (
    <div className="navbar bg-base-300 shadow-md px-4 md:px-8 border-b border-base-200">
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2">
          <span className="btn btn-ghost text-xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            👨‍💻DevTinder
          </span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Quick Navigation Icons */}
          <div className="flex items-center gap-2">
            {/* Connections Link */}
            <div
              className="tooltip tooltip-bottom before:text-xs before:font-bold"
              data-tip="Connections"
            >
              <Link
                to="/connections"
                className="btn btn-ghost btn-circle hover:bg-base-200 hover:text-rose-500 active:scale-95 transition-all duration-200 relative"
              >
                <Heart className="w-5 h-5" />
              </Link>
            </div>

            {/* Requests Link */}
            <div
              className="tooltip tooltip-bottom before:text-xs before:font-bold"
              data-tip="Requests"
            >
              <Link
                to="/requests"
                className="btn btn-ghost btn-circle hover:bg-base-200 hover:text-purple-500 active:scale-95 transition-all duration-200 relative"
              >
                <UserPlus className="w-5 h-5" />
                {requests && requests.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-bold text-white shadow-md shadow-purple-500/20 border border-base-300">
                    {requests.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* User Profile Info & Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold hidden md:inline text-base-content/85">
              {user?.firstName}
            </span>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar border border-base-200 hover:border-rose-500/50 transition-colors duration-300 w-11 h-11"
              >
                <div className="w-10 rounded-full">
                  <img alt={user?.firstName} src={user?.photoUrl} />
                </div>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-44 p-2 shadow-xl border border-base-100"
              >
                <li>
                  <Link
                    to="/profile"
                    className="py-2.5 font-bold flex items-center gap-2.5 hover:bg-base-300 text-base-content/90 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 text-base-content/70" />
                    Profile
                  </Link>
                </li>
                <div className="divider my-0 opacity-20"></div>
                <li onClick={handleLogout}>
                  <a className="py-2.5 text-red-500 font-extrabold flex items-center gap-2.5 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200">
                    <LogOut className="w-4 h-4 text-red-500" />
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
