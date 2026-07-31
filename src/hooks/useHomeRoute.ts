import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export const useHomeRoute = () => {
  const activeModule = useSelector((state: RootState) => state.module?.activeModule);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return "/grocery";
  }

  if (activeModule === "grocery") return "/grocery";
  if (activeModule === "restaurant") return "/restaurant";
  if (activeModule === "courier") return "/courier";
  
  return "/";
};
