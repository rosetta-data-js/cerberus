import { createSlice } from "@reduxjs/toolkit";

export const implantsSlice = createSlice({
  name: "implants",
  initialState: {
    implants: [],
    selected: { id: "" },
  },
  reducers: {
    setImplants: (state, action) => {
      state.implants = action.payload;
    },
    setSelectedImplant: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setImplants, setSelectedImplant } = implantsSlice.actions;
export default implantsSlice.reducer;