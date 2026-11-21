import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { user: null, token: null },
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setWishList: (state, action) => {
      if (state.user) state.user.wishList = action.payload || [];
    },
  },
});

export const { setLogin, setLogout, setWishList } = userSlice.actions;

export default userSlice.reducer;
