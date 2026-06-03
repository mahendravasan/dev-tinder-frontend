import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser, removeUser } from "../utils/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const fetchUser = async () => {
    if (userData) {
      setIsAuthChecked(true);
      return;
    }
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err?.response?.status === 401) {
        dispatch(removeUser());
        navigate("/login");
      }
      console.error(err);
    } finally {
      setIsAuthChecked(true);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // empty deps → run once on mount

  useEffect(() => {
    if (isAuthChecked) {
      if (!userData && location.pathname !== "/login") {
        navigate("/login");
      } else if (userData && location.pathname === "/login") {
        navigate("/");
      }
    }
  }, [location.pathname, userData, isAuthChecked, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
