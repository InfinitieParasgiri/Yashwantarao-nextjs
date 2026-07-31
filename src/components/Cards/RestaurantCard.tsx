import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Store } from "@/types/ApiResponse";
import { useSettings } from "@/contexts/SettingsContext";
import HTMLRenderer from "@/components/Functional/HTMLRenderer";
import { Chip } from "@heroui/react";

interface RestaurantCardProps {
  restaurant: Store;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const { t } = useTranslation();
  const { currencySymbol } = useSettings();

  const deliveryTime = restaurant.timing
    ? String(restaurant.timing).toLowerCase().includes("min")
      ? restaurant.timing
      : `${restaurant.timing} ${t("mins") || "mins"}`
    : "30 mins";

  const getStatusColor = () => {
    if (!restaurant.status.is_open) return "danger";
    return restaurant.status.status === "online" ? "success" : "default";
  };

  const getStatusText = () => {
    if (!restaurant.status.is_open) return "Closed";
    return restaurant.status.status === "online" ? "Open Now" : "Offline";
  };

  return (
    <Link href={`/restaurant/${restaurant.slug}`} className="block h-full">
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900/50 rounded-[20px] p-3 pb-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-zinc-800 group/card cursor-pointer m-1">
        <div className="relative h-44 sm:h-48 md:h-52 w-full mb-3 shrink-0">
          <Image
            src={
              restaurant.banner ||
              restaurant.logo ||
              "/assets/restaurants/res1.png"
            }
            alt={restaurant.name}
            layout="fill"
            className="object-cover group-hover/card:scale-105 transition-transform duration-500 rounded-[16px]"
          />
        </div>

        <div className="px-1 flex flex-col gap-3 flex-1">
          {/* Rating Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-green-600 px-2 py-0.5 rounded-md shadow-sm">
              <Star className="w-3 h-3 text-white fill-white mr-1" />
              <span className="text-[11px] font-bold text-white">
                {Number(restaurant.avg_store_rating || 0).toFixed(1)}
              </span>
            </div>
            <Chip
              size="sm"
              color={getStatusColor()}
              variant="dot"
              className="text-xxs border-none bg-transparent"
              classNames={{ base: "border-none px-0 gap-1", content: "px-0" }}
            >
              {getStatusText()}
            </Chip>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
              {restaurant.name}
            </h3>

            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <span className="text-green-600">{deliveryTime}</span>
              <span className="text-gray-300 dark:text-zinc-700">|</span>
              <span className="text-gray-500 dark:text-zinc-400">
                {Number(restaurant.distance) < 1
                  ? `${Number(restaurant.distance).toFixed(2)} ${t("km") || "km"}`
                  : `${Number(restaurant.distance).toFixed(1)} ${t("km") || "km"}`}
              </span>
            </div>

            <div className="mt-0.5">
              <HTMLRenderer
                html={restaurant.description || ""}
                className="text-xs sm:text-sm font-bold text-gray-400 dark:text-zinc-500 tracking-tight line-clamp-1 min-h-4"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
