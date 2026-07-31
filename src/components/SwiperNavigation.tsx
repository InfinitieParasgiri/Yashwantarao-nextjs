import { FC, RefObject } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwiperNavigationProps {
  prevRef: RefObject<HTMLButtonElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
  rtl?: boolean;
}

const SwiperNavigation: FC<SwiperNavigationProps> = ({
  prevRef,
  nextRef,
  rtl = false,
}) => {
  return (
    <>
      {/* Previous Button */}
      <Button
        isIconOnly
        ref={prevRef}
        size="sm"
        radius="full"
        aria-label="Previous"
        className="flex absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 z-30
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-md 
        disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 
        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95
        w-8 h-8 sm:w-9 sm:h-9 min-w-0"
      >
        {rtl ? (
          <ChevronRight size={18} className="text-gray-700 dark:text-zinc-300" />
        ) : (
          <ChevronLeft size={18} className="text-gray-700 dark:text-zinc-300" />
        )}
      </Button>

      {/* Next Button */}
      <Button
        isIconOnly
        ref={nextRef}
        size="sm"
        radius="full"
        aria-label="Next"
        className="flex absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 z-30
        bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-md 
        disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 
        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95
        w-8 h-8 sm:w-9 sm:h-9 min-w-0"
      >
        {rtl ? (
          <ChevronLeft size={18} className="text-gray-700 dark:text-zinc-300" />
        ) : (
          <ChevronRight size={18} className="text-gray-700 dark:text-zinc-300" />
        )}
      </Button>
    </>
  );
};

export default SwiperNavigation;

