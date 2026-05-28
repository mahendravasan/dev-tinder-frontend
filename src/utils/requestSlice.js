import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "request",
  initialState: null,
  reducers: {
    addrequest: (state, action) => {
      return action.payload;
    },
    removeRequest: (state, action) => {
      if (!state) return null;
      return state.filter((req) => req._id !== action.payload);
    },
  },
});

export const { addrequest, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
