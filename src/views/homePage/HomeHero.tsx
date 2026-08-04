import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const HomeHero = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const modulesData = [
    {
      id: "grocery",
      nameKey: "nav.grocery",
      defaultName: "Grocery",
      titleKey: "hero.grocery_title",
      defaultTitle: "Daily Essentials, <br />Delivered Instantly",
      subtitleKey: "hero.grocery_subtitle",
      defaultSubtitle: "Your daily needs, right on time. Fast, reliable and delivered to your doorstep.",
      buttonIcon: "/assets/grocery-3d.png",
      heroImage: "/assets/fresh-produce-groceries-reusable-shopping-bag 1.png",
      path: "/grocery",
    },
    {
      id: "restaurant",
      nameKey: "nav.restaurant",
      defaultName: "Restaurant",
      titleKey: "hero.restaurant_title",
      defaultTitle: "Discover the Best Food <br />Around You",
      subtitleKey: "hero.restaurant_subtitle",
      defaultSubtitle: "Delicious meals from your favorite restaurants, delivered hot & fresh.",
      buttonIcon: "/assets/restaurant-3d.png",
      heroImage: "/assets/restaurant-hero-plate.png",
      path: "/restaurant",
    },
    {
      id: "courier",
      nameKey: "nav.courier",
      defaultName: "Courier",
      titleKey: "hero.courier_title",
      defaultTitle: "Reliable Courier Services <br />at Your Doorstep",
      subtitleKey: "hero.courier_subtitle",
      defaultSubtitle: "Send documents, parcels & gifts quickly and securely in minutes.",
      buttonIcon: "/assets/courier-3d.png",
      heroImage: "/assets/courier-hero.png",
      path: "/courier",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modulesData.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [modulesData.length]);

  const currentModule = modulesData[activeIndex];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getTranslation = (key: string, defaultText: string) => {
    const translated = t(key);
    return !translated || translated === key ? defaultText : translated;
  };

  return (
    <div 
      className="relative z-0 w-[100vw] left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-visible mt-[-70px]"
      style={{
        background: "linear-gradient(180deg, #019CBF 0%, #036A81 100%)"
      }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "url('/assets/hero-pattern-grocery.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Container */}
      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 pt-[200px] sm:pt-[210px] md:pt-36 lg:pt-40 pb-12 lg:pb-16 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center lg:items-start"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 lg:mb-5 tracking-tight">
                <div dangerouslySetInnerHTML={{ __html: getTranslation(currentModule.titleKey, currentModule.defaultTitle) }} />
              </h1>
              <p className="text-white/90 text-base sm:text-lg max-w-lg mb-4 sm:mb-6 font-medium">
                {getTranslation(currentModule.subtitleKey, currentModule.defaultSubtitle)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* 3 Big White Module Buttons (Image 1 style) with Animation & Active Highlight */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 w-full my-4 sm:my-6 z-20">
            {modulesData.map((m, idx) => {
              const isActive = idx === activeIndex;
              const arrowBg =
                m.id === "grocery"
                  ? "bg-[#84cc16]"
                  : m.id === "restaurant"
                  ? "bg-[#f97316]"
                  : "bg-[#a855f7]";

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    handleNavigation(m.path);
                  }}
                  className={`flex items-center gap-2 sm:gap-3 bg-white hover:bg-gray-50 text-gray-900 rounded-full px-2 py-2 pr-3 sm:pr-5 shadow-lg hover:shadow-xl transition-all duration-300 ease-out group cursor-pointer ${
                    isActive
                      ? "ring-4 ring-white/70 scale-105 shadow-2xl"
                      : "opacity-85 hover:opacity-100 hover:scale-102"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-12 sm:h-12 relative bg-gray-100 rounded-full overflow-hidden flex items-center justify-center p-1 sm:p-1.5 shrink-0">
                    <Image
                      src={m.buttonIcon}
                      alt={getTranslation(m.nameKey, m.defaultName)}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <span className="font-bold text-xs sm:text-base lg:text-lg capitalize whitespace-nowrap px-0.5 sm:px-1">
                    {getTranslation(m.nameKey, m.defaultName)}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full ${arrowBg} text-white flex items-center justify-center ml-0.5 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300 ease-out shrink-0`}
                  >
                    <ArrowRight size={16} strokeWidth={3} className="sm:w-5 sm:h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content - Animated Module Hero Image */}
        <div className="w-full lg:w-5/12 relative flex justify-center items-center mx-auto mt-4 lg:mt-0 min-h-[220px] sm:min-h-[320px] lg:min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule.id}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[420px] lg:h-[420px] mx-auto flex items-center justify-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative flex items-center justify-center"
              >
                <Image
                  src={currentModule.heroImage}
                  alt={getTranslation(currentModule.nameKey, currentModule.defaultName)}
                  layout="fill"
                  objectFit="contain"
                  priority
                  className="drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
