import React from "react";
import Image from "next/image";
import { Star, ArrowLeft, Search } from "lucide-react";
import { Input, Chip } from "@heroui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Store } from "@/types/ApiResponse";

interface RestaurantHeaderProps {
  restaurant: Store;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterMode: "all" | "veg" | "non_veg";
  setFilterMode: (mode: "all" | "veg" | "non_veg") => void;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  restaurant,
  searchQuery,
  setSearchQuery,
  filterMode,
  setFilterMode,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const rating = parseFloat(restaurant?.avg_store_rating || "0").toFixed(1);
  const isFreeShipping =
    restaurant?.domestic_shipping_charges === 0 ||
    restaurant?.domestic_shipping_charges === "0" ||
    restaurant?.domestic_shipping_charges === "0.00";

  return (
    <div className="w-full bg-white dark:bg-zinc-950 pb-8 border-b border-gray-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 group hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {t("back") || "Back"}
            </span>
          </button>

          <div className="w-full max-w-[180px] sm:max-w-[280px]">
            <Input
              placeholder={t("search") || "Search"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              variant="bordered"
              radius="md"
              classNames={{
                inputWrapper: "border border-gray-200 bg-white h-10 shadow-sm",
                input: "text-sm text-gray-700",
              }}
            />
          </div>
        </div>

        {/* Info Content */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-3 mb-4">
              {parseFloat(rating) > 0 ? (
                <div className="flex items-center bg-green-600 w-fit px-2 py-0.5 rounded-md shadow-sm">
                  <Star className="w-3.5 h-3.5 text-white fill-white mr-1" />
                  <span className="text-xs font-black text-white">
                    {rating}
                  </span>
                </div>
              ) : null}

              <Chip
                size="sm"
                color={
                  !restaurant.status?.is_open
                    ? "danger"
                    : restaurant.status?.status === "online"
                      ? "success"
                      : "default"
                }
                variant="dot"
                className="text-xs font-bold tracking-wide border-none bg-transparent"
                classNames={{
                  base: "border-none px-0 gap-1.5",
                  content: "px-0",
                }}
              >
                {!restaurant.status?.is_open
                  ? "Currently Closed"
                  : restaurant.status?.status === "online"
                    ? "Open Now"
                    : "Offline"}
              </Chip>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight leading-[1.1]">
              {restaurant.name}
            </h1>

            {(restaurant.address || restaurant.city) && (
              <p className="text-sm font-medium text-gray-500 mb-6">
                {[restaurant.landmark, restaurant.address, restaurant.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-3 text-[15px] font-bold text-green-600 mb-4">
              {restaurant.timing ? (
                <>
                  <span>
                    {String(restaurant.timing).toLowerCase().includes("min")
                      ? restaurant.timing
                      : `${restaurant.timing} ${t("mins") || "Mins"}`}
                  </span>
                  <span className="text-gray-300 font-normal">|</span>
                </>
              ) : null}
              {restaurant.distance !== undefined &&
                restaurant.distance !== null &&
                restaurant.distance !== "" && (
                  <>
                    <span>
                      {Number(restaurant.distance) < 1
                        ? `${Number(restaurant.distance).toFixed(2)} ${t("km") || "km"}`
                        : `${Number(restaurant.distance).toFixed(1)} ${t("km") || "km"}`}
                    </span>
                    <span className="text-gray-300 font-normal">|</span>
                  </>
                )}
              {isFreeShipping && (
                <span>{t("checkout.freeShipping") || "Free"}</span>
              )}
            </div>

            {restaurant.promotional_text && (
              <div
                className="text-lg font-bold text-gray-400 mb-6"
                dangerouslySetInnerHTML={{
                  __html: restaurant.promotional_text,
                }}
              />
            )}

            {restaurant.description && (
              <div
                className="text-sm font-medium text-gray-500 mb-6"
                dangerouslySetInnerHTML={{ __html: restaurant.description }}
              />
            )}

            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest mt-2">
              <div
                onClick={() => setFilterMode("all")}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${filterMode !== "all" ? "opacity-40 hover:opacity-80" : "opacity-100"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-gray-900 dark:text-zinc-200">
                  {t("all") || "All"}
                </span>
              </div>
              <div
                onClick={() => setFilterMode("veg")}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${filterMode !== "veg" ? "opacity-40 hover:opacity-80" : "opacity-100"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                <span className="text-gray-900 dark:text-zinc-200">
                  {t("veg") || "Veg"}
                </span>
              </div>
              <div
                onClick={() => setFilterMode("non_veg")}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${filterMode !== "non_veg" ? "opacity-40 hover:opacity-80" : "opacity-100"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm" />
                <span className="text-gray-900 dark:text-zinc-200">
                  {(t("non_veg") || "Non-Veg").replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full md:w-[486px] h-[231px] rounded-[14px] overflow-hidden shadow-lg ring-1 ring-black/5 flex-shrink-0 bg-gray-100">
            <Image
              src={restaurant.banner || restaurant.logo || "/images/roof.png"}
              alt={restaurant.name}
              layout="fill"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
