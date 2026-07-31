import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "@/types/ApiResponse";
import { Spinner } from "@heroui/react";
import { useSettings } from "@/contexts/SettingsContext";

interface MenuItemProps {
  item: Product;
  onAdd?: (item: Product) => void | Promise<void>;
}

const RestaurantMenuItem = ({ item, onAdd }: MenuItemProps) => {
  const { t } = useTranslation();
  const { currencySymbol } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!onAdd) return;
    setIsLoading(true);
    try {
      await onAdd(item);
    } finally {
      setIsLoading(false);
    }
  };

  // Hide Add & block navigation when restaurant marks item unavailable
  const isUnavailable = item.restaurant_is_product_available === false;

  return (
    <div className="flex items-start justify-between gap-4 sm:gap-12 py-6 sm:py-10 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      {/* Left: Info */}
      <div className="flex-1">
        {/* Veg / non-veg dot */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.indicator === "veg" ? "border-green-600" : "border-red-600"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${item.indicator === "veg" ? "bg-green-600" : "bg-red-600"
                }`}
            />
          </div>
        </div>

        {/* Name — links to item detail page (blocked when unavailable) */}
        {isUnavailable ? (
          <h3 className="text-lg sm:text-2xl font-black text-gray-400 dark:text-zinc-500 mb-1.5 tracking-tight leading-tight cursor-default">
            {item.title}
          </h3>
        ) : (
          <Link href={`/restaurant/item/${item.slug}`}>
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tight hover:text-[#019CBF] transition-colors cursor-pointer leading-tight">
              {item.title}
            </h3>
          </Link>
        )}

        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const defaultVariant = item.variants?.find(v => v.is_default) ?? item.variants?.[0];
            const price = Number(defaultVariant?.price || 0);
            const specialPrice = Number(defaultVariant?.special_price || 0);
            const hasDiscount = specialPrice > 0 && specialPrice < price;
            const finalPrice = hasDiscount ? specialPrice : price;

            return (
              <>
                <span className="text-base sm:text-xl font-black text-gray-900 dark:text-zinc-100">
                  {currencySymbol}{finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-medium text-gray-400 line-through">
                    {currencySymbol}{price.toFixed(2)}
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {/* Star ratings */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center text-orange-500 fill-orange-500 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(item.ratings)
                  ? "fill-current"
                  : "text-gray-200 dark:text-zinc-700"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400">
            ({item.rating_count})
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-gray-400 dark:text-zinc-400 leading-relaxed max-w-xl">
          {item.short_description || item.description}
        </p>
      </div>

      {/* Right: Image + Add button */}
      <div className="relative flex-none pb-4 mt-1">
        {/* Image — blocked when unavailable */}
        {isUnavailable ? (
          <div className="relative w-28 h-28 sm:w-[338px] sm:h-[226px] rounded-[14px] overflow-hidden shadow-sm">
            <Image
              src={item.main_image || "/placeholder-image.png"}
              alt={item.title}
              layout="fill"
              className="object-cover opacity-50"
            />
            {/* Unavailable overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white text-xs sm:text-sm font-bold tracking-wider uppercase bg-black/60 px-3 py-1.5 rounded-md">
                Unavailable
              </span>
            </div>
          </div>
        ) : (
          <Link href={`/restaurant/item/${item.slug}`} className="block">
            <div className="relative w-28 h-28 sm:w-[338px] sm:h-[226px] rounded-[14px] overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
              <Image
                src={item.main_image || "/placeholder-image.png"}
                alt={item.title}
                layout="fill"
                className="object-cover"
              />
            </div>
          </Link>
        )}

        {/* ADD button — hidden when unavailable, replaced with badge */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 sm:w-32">
          {isUnavailable ? (
            <div className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 font-semibold h-8 sm:h-11 rounded-[8px] border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm flex items-center justify-center uppercase tracking-wider">
              Unavailable
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isLoading}
              aria-label={`Add ${item.title} to cart`}
              className="w-full bg-white text-[#019CBF] font-bold h-8 sm:h-11 rounded-[8px] shadow-[0_3px_12px_rgba(0,0,0,0.08)] border border-gray-100 text-xs sm:text-lg hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner size="sm" color="current" /> : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuItem;
