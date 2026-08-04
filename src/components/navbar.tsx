import React, { FC, useEffect, useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Image,
  useDisclosure,
  Button,
} from "@heroui/react";
import LocationSelector from "./Location/LocationSelector";
import { ThemeSwitch } from "./theme-switch";
import GlobalSearchbar from "./Functional/GlobalSearchbar";
import { ShoppingCart, Home, Tags, HelpCircle, Info, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useRouter } from "next/router";
import { useSettings } from "@/contexts/SettingsContext";
import LanguageSwitcher from "./Functional/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import NextLink from "next/link";
import { useHomeRoute } from "@/hooks/useHomeRoute";
const FallbackCartIcon = () => (
  <NextLink href="/cart">
    <ShoppingCart className="text-default-500 cursor-pointer" />
  </NextLink>
);

const Badge = dynamic(() => import("@heroui/react").then((mod) => mod.Badge), {
  ssr: false,
  loading: () => <FallbackCartIcon />,
});

const ProfileBtn = dynamic(() => import("./ProfileBtn"), { ssr: false });
const LoginModal = dynamic(() => import("./Modals/LoginModal"), { ssr: false });
const OfflineCartDrawer = dynamic(() => import("./Cart/OfflineCartDrawer"), {
  ssr: false,
});

export const Navbar: FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDemoWarning, setShowDemoWarning] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);
  }, []);

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const activeModule = useSelector(
    (state: RootState) => state.module.activeModule,
  );
  const { webSettings, demoMode, systemSettings } = useSettings();
  const router = useRouter();
  const homeRoute = useHomeRoute();

  // The navbar should be transparent and absolute on all module home pages
  const isHome =
    router.pathname === "/" ||
    router.pathname === "/restaurant" ||
    router.pathname === "/grocery" ||
    router.pathname === "/courier";
  const cartCount =
    useSelector((state: RootState) => state.cart.cartData?.items_count) || 0;

  const offLineCartCount =
    useSelector((state: RootState) => state.offlineCart.items)?.length || 0;

  const hideSearchBar =
    isHome ||
    activeModule === "courier" ||
    router.pathname.startsWith("/courier") ||
    (router.pathname.startsWith("/my-account/bookings/") &&
      router.asPath.includes("courier-"));

  const isLandingPage = router.pathname === "/";

  const hideCartIcon =
    isLandingPage ||
    activeModule === "courier" ||
    router.pathname.startsWith("/courier") ||
    (router.pathname.startsWith("/my-account/bookings/") &&
      router.asPath.includes("courier-"));

  const {
    isOpen: isOfflineCartOpen,
    onOpen: openOfflineCart,
    onClose: closeOfflineCart,
  } = useDisclosure();
  const {
    siteHeaderLogo = "https://placehold.co/160x40?text=Logo",
    siteHeaderDarkLogo = "https://placehold.co/160x40?text=Logo",
    siteName = "Site Logo",
  } = webSettings || {};

  useEffect(() => {
    if (webSettings?.headerScript) {
      const temp = document.createElement("div");
      temp.innerHTML = webSettings.headerScript;

      // Append each <script> dynamically
      Array.from(temp.querySelectorAll("script")).forEach((oldScript) => {
        const newScript = document.createElement("script");
        if (oldScript.src) {
          newScript.src = oldScript.src;
        }
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        document.head.appendChild(newScript);
      });
    }
  }, [webSettings?.headerScript]);

  useEffect(() => {
    if (isLoggedIn && isOfflineCartOpen) {
      closeOfflineCart();
    }
  }, [isLoggedIn, isOfflineCartOpen, closeOfflineCart]);

  // Menu items with translation keys
  const navMenuItems = [
    { label: t("nav.home"), href: homeRoute, icon: Home },
    { label: t("nav.brands"), href: "/brands", icon: Tags },
    { label: t("nav.faqs"), href: "/faqs", icon: HelpCircle },
    { label: t("nav.about_us"), href: "/about-us", icon: Info },
  ];
  return (
    <>
      <div
        className={`w-full flex flex-col items-start transition-all duration-300 ${isHome ? "absolute top-0 left-0 z-50 bg-transparent" : "bg-[#0097A7] shadow-sm sticky top-0 z-50"}`}
      >
        {demoMode && showDemoWarning && (
          <div className="w-full bg-primary-50 dark:bg-content1 text-warning-700 text-xs sm:text-sm px-3 py-1 flex items-center justify-center gap-2 relative">
            ℹ️
            <span className="font-medium flex items-center gap-2">
              {systemSettings?.customerDemoModeMessage
                ? systemSettings.customerDemoModeMessage
                : "Currently running in Demo Mode"}
            </span>
            <Button
              onPress={() => setShowDemoWarning(false)}
              aria-label="Close demo mode warning"
              isIconOnly
              size="sm"
              radius="full"
              color="primary"
              variant="flat"
              className="min-w-1 w-6 h-6"
            >
              <X size={16} className="text-warning-700 rounded-full" />
            </Button>
          </div>
        )}

        <HeroUINavbar
          maxWidth="2xl"
          isBlurred={false}
          position="sticky"
          className={`p-0 transition-all duration-300 z-50 ${isHome ? "!bg-transparent" : "bg-[#0097A7]"}`}
          style={isHome ? { backgroundColor: "transparent" } : {}}
          classNames={{
            wrapper: "p-0 px-2 md:px-4 !bg-transparent",
            base: "!bg-transparent shadow-none",
          }}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
        >
          {/* Logo and Location */}
          <NavbarContent className="md:basis-1/4 w-full" justify="start">
            <NavbarMenuToggle
              className="md:hidden"
              aria-label={
                isMenuOpen ? t("aria.close_menu") : t("aria.open_menu")
              }
            />
            <div className="flex justify-between w-full md:min-w-32">
              <NavbarBrand className="gap-3 w-full min-w-32">
                <NextLink href={homeRoute} title={t("nav.home")}>
                  <Image
                    loading="eager"
                    src={siteHeaderDarkLogo}
                    alt={siteName}
                    radius="none"
                    className="object-contain"
                    classNames={{
                      img: "h-8 sm:h-10 md:h-12 w-full sm:min-w-5 md:min-w-32",
                      wrapper: "cursor-pointer",
                    }}
                  />
                </NextLink>
              </NavbarBrand>
              <div className="flex items-center gap-4 md:hidden">
                {!isLandingPage && (
                  <NavbarItem>
                    {isLoggedIn ? (
                      <ProfileBtn />
                    ) : (
                      <LoginModal triggerView="icon" />
                    )}
                  </NavbarItem>
                )}
              </div>
            </div>
            <div className="hidden md:flex w-full flex-start">
              {isHome && <LocationSelector variant="white" />}
            </div>
          </NavbarContent>

          {/* Search Bar - Desktop */}
          <NavbarContent
            className="hidden md:flex md:basis-1/2"
            justify="center"
          >
            <div className="w-full max-w-xl">
              {mounted && !hideSearchBar && <GlobalSearchbar />}
            </div>
          </NavbarContent>

          {/* Right Side Actions - Desktop */}
          <NavbarContent className="hidden md:flex" justify="end">
            {/* 3 Module Buttons (Hidden on Landing Page) */}
            {router.pathname !== "/" && (
              <NavbarItem className="flex items-center gap-1.5 mr-1 sm:mr-2">
                {[
                  {
                    id: "grocery",
                    name: !t("nav.grocery") || t("nav.grocery") === "nav.grocery" ? "Grocery" : t("nav.grocery"),
                    image: "/assets/grocery-3d.png",
                    path: "/grocery",
                  },
                  {
                    id: "restaurant",
                    name: !t("nav.restaurant") || t("nav.restaurant") === "nav.restaurant" ? "Restaurant" : t("nav.restaurant"),
                    image: "/assets/restaurant-3d.png",
                    path: "/restaurant",
                  },
                  {
                    id: "courier",
                    name: !t("nav.courier") || t("nav.courier") === "nav.courier" ? "Courier" : t("nav.courier"),
                    image: "/assets/courier-3d.png",
                    path: "/courier",
                  },
                ].map((m) => {
                  const isActive =
                    router.pathname === m.path ||
                    router.pathname.startsWith(m.path) ||
                    (activeModule === m.id && router.pathname !== "/");
                  return (
                    <NextLink
                      key={m.id}
                      href={m.path}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                        isActive
                          ? "border-2 border-white bg-white/25 text-white font-bold shadow-xs"
                          : "border border-white/35 bg-black/10 hover:bg-white/15 text-white/90 font-medium"
                      }`}
                    >
                      <div className="w-5 h-5 relative shrink-0">
                        <Image
                          src={m.image}
                          alt={m.name}
                          className="w-5 h-5 object-contain"
                          radius="none"
                        />
                      </div>
                      <span>{m.name}</span>
                    </NextLink>
                  );
                })}
              </NavbarItem>
            )}

            <NavbarItem className="flex items-end gap-2">
              <LanguageSwitcher variant="transparent" />
            </NavbarItem>
            <NavbarItem className="flex items-end gap-2">
              <ThemeSwitch variant="white" />
            </NavbarItem>
            {!hideCartIcon && (
              <NavbarItem>
                <div className="flex items-center">
                  <Badge
                    color="primary"
                    isInvisible={
                      (isLoggedIn ? cartCount : offLineCartCount) === 0
                    }
                    content={
                      isLoggedIn
                        ? cartCount || undefined
                        : offLineCartCount || undefined
                    }
                    variant="solid"
                    classNames={{ badge: "text-xs" }}
                  >
                    <button
                      type="button"
                      title={t("cart_title")}
                      onClick={(event) => {
                        event.preventDefault();
                        if (isLoggedIn) {
                          router.push("/cart");
                        } else {
                          openOfflineCart();
                        }
                      }}
                      className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center"
                    >
                      <ShoppingCart className="text-white cursor-pointer" />
                    </button>
                  </Badge>
                </div>
              </NavbarItem>
            )}
            {!isLandingPage && (
              <NavbarItem>
                {isLoggedIn ? <ProfileBtn /> : <LoginModal variant="white" />}
              </NavbarItem>
            )}
          </NavbarContent>

          {/* Mobile Menu */}
          <NavbarMenu>
            <NavbarMenuItem className="flex justify-between items-center gap-4 pb-4 border-b border-divider">
              <LanguageSwitcher />
              <ThemeSwitch variant="switch" />
            </NavbarMenuItem>
            <div className="flex flex-col gap-1 mt-2">
              {navMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavbarMenuItem key={`${item.label}-${index}`}>
                    <NextLink
                      href={item.href}
                      className="w-full flex items-center gap-3 py-2 px-2 rounded-lg text-foreground hover:bg-default-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={20} className="text-default-500" />
                      <span>{item.label}</span>
                    </NextLink>
                  </NavbarMenuItem>
                );
              })}
            </div>
          </NavbarMenu>
        </HeroUINavbar>

        {/* Mobile Search & Location */}
        {!isMenuOpen && (
          <div className="w-full md:hidden px-2 flex flex-col gap-2 relative z-40 mb-2">
            {isHome && <LocationSelector variant="white" />}
            {mounted && !hideSearchBar && <GlobalSearchbar />}
          </div>
        )}

        {/* CategoryTabs */}
        {/* {router.pathname === "/" && (
          <div
            className={`w-full max-w-screen-2xl mx-auto px-2 md:px-6 ${
              router.pathname !== "/" ? "hidden" : ""
            }`}
          >
            <CategoryTabs className="w-full" />
          </div>
        )} */}
      </div>
      <OfflineCartDrawer
        isOpen={isOfflineCartOpen}
        onClose={closeOfflineCart}
      />
    </>
  );
};
