import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { setActiveModule, AppModule } from "@/lib/redux/slices/moduleSlice";
import GlobalSearchBar from "@/components/Functional/GlobalSearchbar";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { setCookie } from "@/lib/cookies";
import { ArrowRight } from "lucide-react";

const ModuleSwitcherHero = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const activeModule = useSelector(
    (state: RootState) => state.module.activeModule,
  );

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!router.isReady) return;

    ["/grocery", "/restaurant", "/courier"].forEach((path) => {
      void router.prefetch(path);
    });
  }, [router]);

  const displayedModule = React.useMemo(() => {
    if (router.pathname.startsWith("/restaurant")) return "restaurant";
    if (router.pathname.startsWith("/grocery")) return "grocery";
    if (router.pathname.startsWith("/courier")) return "courier";
    if (!isMounted) return "grocery";
    return activeModule;
  }, [isMounted, router.pathname, activeModule]);

  const config = {
    grocery: {
      title: t("hero.grocery_title") || "Daily Essentials, Delivered Instantly",
      placeholder:
        t("hero.grocery_placeholder") || "Search fresh groceries near you",
      icon: "/assets/grocery-3d.png",
      pattern: "/assets/hero-pattern-grocery.png",
    },
    restaurant: {
      title: t("hero.restaurant_title") || "Discover the Best Food Around You.",
      placeholder:
        t("hero.restaurant_placeholder") || "Search for restaurants or dishes",
      icon: "/assets/restaurant-3d.png",
      pattern: "/assets/hero-pattern-restaurant.png",
    },
    courier: {
      title:
        t("hero.courier_title") ||
        "Reliable Courier Services at Your Fingertips",
      placeholder: t("hero.courier_placeholder") || "Enter pickup address",
      icon: "/assets/courier-3d.png",
      pattern: "/assets/hero-pattern-courier.png",
    },
  };

  const handleModuleSwitch = (mod: AppModule) => {
    dispatch(setActiveModule(mod));
    setCookie("homeCategory", mod);
  };

  const handleModuleNavigate = (mod: AppModule, path: string) => {
    handleModuleSwitch(mod);
    if (router.pathname !== path) {
      void router.push(path);
    }
  };

  const getBgClass = (mod: AppModule, isActive: boolean) => {
    if (!isActive) return "bg-white";
    if (mod === "grocery") return "bg-white bg-gradient-to-r from-white to-[#A3FF9A]/30";
    if (mod === "restaurant") return "bg-white bg-gradient-to-r from-white to-[#FFA686]/30";
    if (mod === "courier") return "bg-white bg-gradient-to-r from-white to-[#AF94FF]/30";
    return "bg-white";
  };

  const modules = [
    {
      id: "grocery",
      title: "Grocery",
      subtitle: "Fresh essentials at your doorstep",
      image: "/assets/home image-1.png",
      path: "/grocery",
    },
    {
      id: "restaurant",
      title: "Restaurant",
      subtitle: "Meals from your favorite restaurants",
      image: "/assets/home image-3.png",
      path: "/restaurant",
    },
    {
      id: "courier",
      title: "Courier",
      subtitle: "Pickup & Delivery in minutes",
      image: "/assets/home image-2.png",
      path: "/courier",
    },
  ];

  return (
    <div className="relative w-[100vw] left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-visible">
      <div
        className={`relative w-full min-h-[320px] md:min-h-[420px] ${
          router.pathname === "/" ? "pt-[200px] sm:pt-[210px]" : "pt-[120px] sm:pt-[130px]"
        } md:pt-[140px] pb-4 sm:pb-8 md:pb-16 flex flex-col items-center overflow-hidden`}
        style={{
          background: "linear-gradient(180deg, #019CBF 0%, #036A81 100%)",
        }}
      >
        {/* Dynamic Pattern Overlay Layers for Smooth Cross-fade */}
        {(Object.keys(config) as AppModule[]).map((mod) => {
          const isActive = displayedModule === mod;
          const theme = config[mod];
          return (
            <div
              key={mod}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none z-0"
              style={{
                opacity: isActive ? 0.5 : 0,
                backgroundImage: `url('${theme.pattern}')`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "overlay",
                filter: mod === "courier" ? "brightness(0) invert(1)" : "none",
              }}
            ></div>
          );
        })}

        {/* Decorative Assets - Condition Based */}
        {displayedModule === "grocery" && (
          <>
            <motion.div
              className="absolute left-[20px] top-[60px] md:top-[80px] w-[220px] h-[240px] md:w-[260px] md:h-[280px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/assets/fresh-produce-groceries-reusable-shopping-bag 2.png"
                alt="Grocery Basket"
                width={260}
                height={280}
                objectFit="contain"
                className="drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              className="absolute right-[4px] top-[0px] w-[425px] h-[425px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Image
                src="/assets/fresh-produce-groceries-reusable-shopping-bag 1.png"
                alt="Shopping Bag"
                width={425}
                height={425}
                objectFit="contain"
                className="drop-shadow-2xl"
              />
            </motion.div>
          </>
        )}

        {displayedModule === "restaurant" && (
          <>
            <motion.div
              className="absolute right-[-10px] top-[10%] w-[35%] max-w-[400px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/assets/restaurant-hero-side.png"
                alt="Side Dish"
                width={500}
                height={500}
                objectFit="contain"
                className="drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              className="absolute left-[10px] bottom-[-5%] w-[25%] max-w-[350px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Image
                src="/assets/restaurant-hero-plate.png"
                alt="Delicious Meal"
                width={350}
                height={350}
                objectFit="contain"
                className="drop-shadow-2xl opacity-90"
              />
            </motion.div>
          </>
        )}
        {displayedModule === "courier" && (
          <>
            <motion.div
              className="absolute right-[-10px] top-[20%] w-[35%] max-w-[300px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/assets/courier-hero.png"
                alt="Box"
                width={500}
                height={500}
                objectFit="contain"
                className="drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              className="absolute left-[10px] bottom-[2%] w-[25%] max-w-[350px] hidden lg:block z-10 pointer-events-none"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <Image
                src="/assets/delivery-partener-hero.png"
                alt="Delivery Partener"
                width={350}
                height={350}
                objectFit="contain"
                className="drop-shadow-2xl opacity-90"
              />
            </motion.div>
          </>
        )}

        <div className="text-center text-white z-20 w-full px-4 max-w-[750px] mx-auto">
          <h1 className="text-[32px] sm:text-[44px] md:text-[62px] font-bold mb-4 md:mb-6 tracking-tight leading-[1.1] drop-shadow-md font-inter">
            {config[displayedModule].title}
          </h1>

          {/* 3 Module Buttons - Mobile View */}
          <div className="flex md:hidden items-center justify-center gap-2 my-4 w-full flex-wrap">
            {router.pathname === "/" ? (
              // Image 1 style for Landing Page (/)
              [
                {
                  id: "grocery",
                  name: !t("nav.grocery") || t("nav.grocery").toLowerCase().includes("nav.") ? "Grocery" : t("nav.grocery"),
                  image: "/assets/grocery-3d.png",
                  path: "/grocery",
                  arrowBg: "bg-[#84cc16]",
                },
                {
                  id: "restaurant",
                  name: !t("nav.restaurant") || t("nav.restaurant").toLowerCase().includes("nav.") ? "Restaurant" : t("nav.restaurant"),
                  image: "/assets/restaurant-3d.png",
                  path: "/restaurant",
                  arrowBg: "bg-[#f97316]",
                },
                {
                  id: "courier",
                  name: !t("nav.courier") || t("nav.courier").toLowerCase().includes("nav.") ? "Courier" : t("nav.courier"),
                  image: "/assets/courier-3d.png",
                  path: "/courier",
                  arrowBg: "bg-[#a855f7]",
                },
              ].map((m) => {
                const mod = m.id as AppModule;
                const isActive = displayedModule === mod;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleModuleNavigate(mod, m.path)}
                    className={`flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 rounded-full px-2 py-1.5 pr-3 shadow-md transition-all cursor-pointer group ${
                      isActive
                        ? "ring-4 ring-white/70 scale-105 shadow-xl"
                        : "opacity-85 hover:opacity-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="w-8 h-8 relative bg-gray-100 rounded-full overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <Image
                        src={m.image}
                        alt={m.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-xs capitalize whitespace-nowrap px-0.5">
                      {m.name}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full ${m.arrowBg} text-white flex items-center justify-center ml-0.5 group-hover:translate-x-0.5 transition-transform shrink-0`}
                    >
                      <ArrowRight size={13} strokeWidth={3} />
                    </div>
                  </button>
                );
              })
            ) : (
              // Image 2 style for Module pages (/grocery, /restaurant, /courier)
              [
                {
                  id: "grocery",
                  name: !t("nav.grocery") || t("nav.grocery").toLowerCase().includes("nav.") ? "Grocery" : t("nav.grocery"),
                  image: "/assets/grocery-3d.png",
                  path: "/grocery",
                },
                {
                  id: "restaurant",
                  name: !t("nav.restaurant") || t("nav.restaurant").toLowerCase().includes("nav.") ? "Restaurant" : t("nav.restaurant"),
                  image: "/assets/restaurant-3d.png",
                  path: "/restaurant",
                },
                {
                  id: "courier",
                  name: !t("nav.courier") || t("nav.courier").toLowerCase().includes("nav.") ? "Courier" : t("nav.courier"),
                  image: "/assets/courier-3d.png",
                  path: "/courier",
                },
              ].map((m) => {
                const mod = m.id as AppModule;
                const isActive = displayedModule === mod;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleModuleNavigate(mod, m.path)}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/25 border-2 border-white text-white font-bold shadow-md"
                        : "border-white/40 text-white/90 hover:bg-white/10"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="w-5 h-5 relative shrink-0">
                      <Image
                        src={m.image}
                        alt={m.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {m.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {displayedModule !== "courier" && (
            <div className="max-w-[430px] mx-auto z-20 shadow-2xl rounded-2xl overflow-hidden light">
              <GlobalSearchBar />
            </div>
          )}
        </div>

        {/* 3 Module Cards - Commented out as requested */}
        {/*
        <div className="relative md:absolute mt-8 md:mt-0 md:bottom-[30px] left-0 right-0 flex flex-col md:flex-row gap-4 md:gap-6 z-30 px-4 w-full justify-center max-w-[1200px] mx-auto items-center">
          {modules.map((module) => {
            const mod = module.id as AppModule;
            const isActive = displayedModule === mod;
            return (
              <Link
                key={mod}
                href={`/${mod}`}
                onClick={() => handleModuleSwitch(mod)}
                className={`cursor-pointer flex flex-row items-center justify-between relative overflow-hidden rounded-[24.31px] shadow-lg p-4 md:p-5 w-full max-w-[264px] h-[120px] md:h-[144px] transition-all duration-500 transform ${isActive
                  ? `${getBgClass(mod, isActive)} scale-105 z-10 shadow-2xl`
                  : `${getBgClass(mod, isActive)} opacity-90 hover:opacity-100 hover:scale-102`
                  }`}
              >
                <div className="flex flex-col justify-between h-full z-10 w-[55%] text-left">
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                      {module.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-[#AEAEAE] font-medium leading-snug">
                      {module.subtitle}
                    </p>
                  </div>
                  {!isActive && (
                    <div className="mt-1.5 md:mt-2.5">
                      <span className="inline-flex items-center justify-center bg-[#0097a7] hover:bg-[#00838f] text-white text-[8px] md:text-[9px] font-bold px-3 py-1 md:px-3.5 md:py-1.5 rounded-full transition-colors">
                        Explore Now
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 right-0 w-[85px] h-[85px] md:w-[120px] md:h-[120px] shrink-0 pointer-events-none">
                  <Image
                    src={module.image}
                    alt={module.title}
                    layout="fill"
                    objectFit="contain"
                    className="drop-shadow-2xl"
                  />
                </div>
              </Link>
            );
          })}
        </div>
        */}
      </div>
    </div>
  );
};

export default ModuleSwitcherHero;
