import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import GlobalSearchBar from "@/components/Functional/GlobalSearchbar";

const GlobalLandingHero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative w-[100vw] left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-visible bg-white dark:bg-zinc-950">
      <div 
        className="relative w-full min-h-[400px] sm:min-h-[500px] pt-[120px] pb-12 md:pb-16 flex flex-col items-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)" // Swiggy Orange
        }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{ 
            backgroundImage: "url('/assets/hero-pattern.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '400px',
            backgroundPosition: 'center'
          }}
        ></div>

        <div className="text-center text-white z-20 w-full px-4 max-w-[800px] mx-auto mb-10">
          <h1 className="text-[40px] md:text-[54px] font-black mb-6 tracking-tight leading-[1.1] drop-shadow-sm font-inter">
            Delivering Joy to Your Doorstep
          </h1>
          <p className="text-lg md:text-xl font-medium mb-8 opacity-90">
            Order food from top restaurants or fresh groceries instantly.
          </p>
          
          <div className="max-w-[600px] mx-auto shadow-2xl rounded-2xl overflow-hidden light">
            <GlobalSearchBar />
          </div>
        </div>

        {/* Large Navigation Cards */}
        <div className="relative z-30 flex flex-col md:flex-row gap-6 px-4 w-full justify-center max-w-[1000px] mx-auto mt-6">
          
          {/* Restaurant Card */}
          <Link href="/restaurant" className="w-full md:w-1/2">
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative min-h-[220px] group border border-gray-100 dark:border-zinc-800">
              <div className="relative z-10 w-[65%]">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                  Food Delivery
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm md:text-base">
                  FROM RESTAURANTS
                </p>
                <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-md mb-6">
                  UPTO 60% OFF
                </div>
                <div>
                  <button className="bg-[#ea580c] text-white font-bold py-2 px-6 rounded-full hover:bg-[#c2410c] transition-colors flex items-center gap-2">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] md:w-[200px] md:h-[200px] group-hover:scale-105 transition-transform duration-500">
                <Image 
                  src="/assets/restaurant-hero-plate.png"
                  alt="Food Delivery" 
                  layout="fill" 
                  objectFit="contain" 
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </Link>

          {/* Grocery Card */}
          <Link href="/grocery" className="w-full md:w-1/2">
            <div className="bg-white dark:bg-zinc-900 rounded-[24px] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative min-h-[220px] group border border-gray-100 dark:border-zinc-800">
              <div className="relative z-10 w-[65%]">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                  Instamart
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 text-sm md:text-base">
                  INSTANT GROCERY
                </p>
                <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-md mb-6">
                  UPTO 60% OFF
                </div>
                <div>
                  <button className="bg-[#ea580c] text-white font-bold py-2 px-6 rounded-full hover:bg-[#c2410c] transition-colors flex items-center gap-2">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] w-[160px] h-[160px] md:w-[180px] md:h-[180px] group-hover:scale-105 transition-transform duration-500">
                <Image 
                  src="/assets/fresh-produce-groceries-reusable-shopping-bag 2.png" 
                  alt="Grocery Delivery" 
                  layout="fill" 
                  objectFit="contain" 
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default GlobalLandingHero;
