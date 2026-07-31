// src/guards/withAuth.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { addToast } from "@heroui/react";
import { isProtectedRoute } from "./authGuard";
import { useHomeRoute } from "@/hooks/useHomeRoute";

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const homeRoute = useHomeRoute();

    useEffect(() => {
      if (!isLoggedIn && isProtectedRoute(router.pathname)) {
        addToast({
          title: "Authentication Required",
          description: "Please login to access this page",
          color: "warning",
        });
        router.replace(homeRoute);
      }
    }, [isLoggedIn, router, homeRoute]);

    return <WrappedComponent {...props} />;
  };
};
