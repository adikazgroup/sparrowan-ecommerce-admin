import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openMenu: true,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.openMenu = !state.openMenu;
    },
    setOpenMenu: (state, action) => {
      state.openMenu = action.payload;
    },
  },
});

export const { toggleMenu, setOpenMenu } = menuSlice.actions;
export default menuSlice.reducer;
