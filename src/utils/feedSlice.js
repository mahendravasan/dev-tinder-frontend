import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: null,
  reducers: {
    addFeed: (state, action) => {
      return action.payload;
    },
    removeUserFromFeed: (state, action) => {
      const updatedFeed = state.filter((user) => user._id !== action.payload);
      return updatedFeed;
    },
    clearFeed: (state) => {
      return null;
    },
    promoteUserToFront: (state, action) => {
      if (!state) return state;
      const index = state.findIndex((user) => user._id === action.payload);
      if (index > 0) {
        const userToPromote = state[index];
        const filtered = state.filter((user) => user._id !== action.payload);
        return [userToPromote, ...filtered];
      }
      return state;
    },
  },
});

export const { addFeed, removeUserFromFeed, clearFeed, promoteUserToFront } =
  feedSlice.actions;
export default feedSlice.reducer;
