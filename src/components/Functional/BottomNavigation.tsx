import { useState, useEffect, useMemo } from "react";
import { Home, ShoppingCart, User, Package, Store, History } from "lucide-react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { addToast, useDisclosure } from "@heroui/react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useSettings } from "@/contexts/SettingsContext";

const OfflineCartDrawer = dynamic(() => import("../Cart/OfflineCartDrawer"), {
  ssr: false,
});

const BottomNavigation = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { t } = useTranslation();
  const { isSingleVendor } = useSettings();
  const activeModule = useSelector(
    (state: RootState) => state.module.activeModule,
  );
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const cartCount =
    useSelector((state: RootState) => state.cart.cartData?.items_count) ||
    undefined;

  const offLineCartCount =
    useSelector((state: RootState) => state.offlineCart.items)?.length || 0;

  const {
    isOpen: isOfflineCartOpen,
    onOpen: openOfflineCart,
    onClose: closeOfflineCart,
  } = useDisclosure();

  const homePath = useMemo(() => {
    if (activeModule === "restaurant") return "/restaurant";
    if (activeModule === "courier") return "/courier";
    return "/grocery";
  }, [activeModule]);

  const activeTab = useMemo(() => {
    const currentPath = router.pathname;
    if (
      currentPath === "/" ||
      currentPath.startsWith("/grocery") ||
      currentPath.startsWith("/restaurant") ||
      (currentPath.startsWith("/courier") && !currentPath.startsWith("/my-account/couriers"))
    ) {
      return "home";
    }
    if (currentPath.startsWith("/my-account/couriers")) {
      return activeModule === "courier" ? "history" : "profile";
    }
    if (currentPath.startsWith("/categories")) return "categories";
    if (currentPath.startsWith("/cart")) return "cart";
    if (currentPath.startsWith("/stores")) return "stores";
    if (currentPath.startsWith("/my-account")) return "profile";
    return "";
  }, [router.pathname, activeModule]);

  const activeTabColorClass = "text-primary bg-primary/10 dark:bg-primary/20 font-semibold";

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }

        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => window.removeEventListener("scroll", controlNavbar);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (isLoggedIn && isOfflineCartOpen) {
      closeOfflineCart();
    }
  }, [isLoggedIn, isOfflineCartOpen, closeOfflineCart]);

  const navItems = useMemo(() => {
    if (activeModule === "courier") {
      return [
        { id: "home", label: t("home_title"), icon: Home, path: "/courier" },
        {
          id: "history",
          label: t("history") || "History",
          icon: History,
          path: "/my-account/couriers",
          protected: true,
        },
        {
          id: "profile",
          label: t("profile"),
          icon: User,
          path: "/my-account",
          protected: true,
        },
      ];
    }

    return [
      { id: "home", label: t("home_title"), icon: Home, path: homePath },
      {
        id: "categories",
        label: t("categories"),
        icon: Package,
        path: "/categories",
      },
      {
        id: "cart",
        label: t("cart_title"),
        icon: ShoppingCart,
        path: "/cart",
        protected: true,
      },
      {
        id: "stores",
        label: t("nav.restaurant"),
        icon: Store,
        path: "/stores",
        protected: false,
      },
      {
        id: "profile",
        label: t("profile"),
        icon: User,
        path: "/my-account",
        protected: true,
      },
    ].filter(
      (item) =>
        !(item.id === "stores" && (isSingleVendor || activeModule !== "restaurant")),
    );
  }, [activeModule, homePath, isSingleVendor, t]);

  const handleTabClick = (
    itemId: string,
    path?: string,
    protectedTab?: boolean,
  ) => {
    if (itemId === "home") {
      router.push(homePath);
      return;
    }
    if (itemId === "cart" && !isLoggedIn) {
      openOfflineCart();
      return;
    }
    if (protectedTab && !isLoggedIn) {
      document.getElementById("login-btn")?.click();
      addToast({ title: "Please Login to Continue !", color: "warning" });
      return;
    }
    if (path) router.push(path);
  };

  if (router.pathname === "/") {
    return null;
  }

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="shadow-lg bg-background">
        <div className="max-w-md mx-auto">
          <nav className="flex justify-around items-center py-2 px-1 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    handleTabClick(item.id, item.path, item.protected)
                  }
                  className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                    isActive
                      ? activeTabColorClass
                      : "text-foreground/50 hover:text-foreground/70"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`mb-1 transition-all duration-200 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                  {item.id === "cart" &&
                  (isLoggedIn ? cartCount : offLineCartCount) ? (
                    <span className="absolute top-0 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {isLoggedIn ? cartCount : offLineCartCount}
                    </span>
                  ) : null}
                  <span
                    className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <OfflineCartDrawer
        isOpen={isOfflineCartOpen}
        onClose={closeOfflineCart}
      />
    </div>
  );
};

export default BottomNavigation;
