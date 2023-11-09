import { createSlice } from "@reduxjs/toolkit";

// TODO Include an is-admin status
export const usersSlice = createSlice({
  name: "users",
  initialState: {
    username: "",
    isAdmin: false,
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    },
  },
});

export const { setUsername, setIsAdmin } = usersSlice.actions;
export default usersSlice.reducer;
