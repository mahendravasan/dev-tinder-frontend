import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlic";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const getFeeds = async () => {
    try {
      if (feed) return;
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addFeed(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFeeds();
  }, []);

  return feed ? (
    <div className="feeds-main flex justify-center items-center grow">
      <UserCard user={feed[0]} />
    </div>
  ) : (
    <div className="flex justify-center items-center grow">
      <h1 className="text-2xl font-bold text-base-content">
        No more profiles to show
      </h1>
    </div>
  );
};

export default Feed;
