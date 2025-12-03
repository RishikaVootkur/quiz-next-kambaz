"use client";
import { createSlice } from "@reduxjs/toolkit";

const loadCurrentUser = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const initialState = {
  currentUser: loadCurrentUser(),
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("currentUser", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("currentUser");
        }
      }
    },
  },
});

export const { setCurrentUser } = accountSlice.actions;
export default accountSlice.reducer;