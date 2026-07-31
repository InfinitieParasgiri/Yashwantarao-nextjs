import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the valid module type
export type AppModule = "grocery" | "restaurant" | "courier";

interface ModuleState {
  activeModule: AppModule;
}

const initialState: ModuleState = {
  activeModule: "grocery", //Default
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    // Action to switch between modules
    setActiveModule: (state, action: PayloadAction<AppModule>) => {
      state.activeModule = action.payload;
    },
  },
});

export const { setActiveModule } = moduleSlice.actions;
export default moduleSlice.reducer;
