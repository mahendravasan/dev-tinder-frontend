import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlic";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(removeFeed());
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="navbar bg-base-300 shadow-sm">
      <div className="flex-1">
        <Link to="/">
          <span className="btn btn-ghost text-xl">👨‍💻DevTinder</span>
        </Link>
      </div>
      {user && (
        <div className="flex items-center gap-2 me-4">
          <span className="text-sm font-bold">{user?.firstName}</span>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt={user?.firstName} src={user?.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-gray-800 rounded-box z-1 mt-3 w-40 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="py-1.5">
                  Profile
                </Link>
              </li>
              <li>
                <a className="py-1.5">Settings</a>
              </li>
              <li onClick={() => handleLogout()}>
                <a className="py-1.5 text-red-500 font-bold">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
