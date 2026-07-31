import { store } from "@/lib/redux/store";

export const getHomeRoute = () => {
  const activeModule = store.getState().module?.activeModule;

  if (activeModule === "grocery") return "/grocery";
  if (activeModule === "restaurant") return "/restaurant";
  if (activeModule === "courier") return "/courier";
  
  return "/";
};
