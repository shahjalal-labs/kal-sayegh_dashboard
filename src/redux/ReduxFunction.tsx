/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface AuthState {
  token: string;
  role: string;
  email: string | null;
  accessiblePages: string[];
  me?: any | null;
}

// Define the initial state using that type
const initialState: AuthState = {
  role: "",
  token: "",
  email: null,
  accessiblePages: [],
};

export const adminAuth = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.accessiblePages = action.payload.accessiblePages || [];
      state.me = action.payload.me;
    },
    logOut: (state) => {
      state.role = "";
      state.token = "";
      state.email = null;
      state.accessiblePages = [];
      state.me = null;
    },
  },
});

export const { setUser, logOut } = adminAuth.actions;

export default adminAuth.reducer;