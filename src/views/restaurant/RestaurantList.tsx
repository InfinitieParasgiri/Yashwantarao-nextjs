import React, { useRef } from "react";
import { Store as StoreIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

import RestaurantCardSkeleton from "@/components/Skeletons/RestaurantCardSkeleton";
import SwiperNavigation from "@/components/SwiperNavigation";
import SectionHeading from "@/components/SectionHeading";
import { getStores } from "@/routes/api";
import { Store } from "@/types/ApiResponse";
import { getActiveCategory, isSSR } from "@/helpers/getters";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import RestaurantCard from "@/components/Cards/RestaurantCard";

interface RestaurantListProps {
  title: string;
  initialStores?: Store[];
  moduleType?: string;
}

const fetcher = async ([url, business_type]: [string, string?]) => {
  const validSlug = getActiveCategory();
  const location = getCookie("userLocation") as UserLocation | undefined;
  const { lat = "", lng = "" } = location || {};

  if (!lat || !lng) {
    return [];
  }

  const response = await getStores({
    latitude: lat,
    longitude: lng,
    scope_category_slug: validSlug,
    business_type,
    per_page: 15,
  });

  if (!response.success || !response.data) {
    console.error(response.message || "Failed to fetch stores");
  }

  return response.data?.data ?? [];
};

const RestaurantList: React.FC<RestaurantListProps> = ({
  title,
  initialStores = [],
  moduleType,
}) => {
  const activeModule = useSelector((state: RootState) => state.module?.activeModule);
  const effectiveModule = moduleType || activeModule;

  const { t } = useTranslation();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const {
    data: stores = [],
    isLoading,
    isValidating,
    mutate,
  } = useSWR(["/delivery-zone/stores", effectiveModule], fetcher, {
    fallbackData: isSSR() ? initialStores : undefined,
    revalidateOnFocus: false,
    revalidateOnMount: !isSSR(),
  });

  return (
    <div className="w-full py-8 px-4 max-w-screen-2xl mx-auto">
      <button
        onClick={() => mutate()}
        className="hidden"
        id="home-stores-refetch"
      ></button>

      <div className="flex items-center justify-between mb-8">
        <SectionHeading
          title={
            t(`restaurant.${title.toLowerCase().replace(/ /g, "_")}`, { defaultValue: title })
          }
          description={
            t("restaurant.list_subtitle") || "Popular restaurants near you"
          }
          icon={<StoreIcon size={16} className="text-white" />}
        />
        <Link
          href="/stores"
          className="text-primary text-sm font-semibold whitespace-nowrap hover:underline"
        >
          {t("see_all")}
        </Link>
      </div>

      <div className="relative group">
        <SwiperNavigation prevRef={prevRef} nextRef={nextRef} />

        <Swiper
          slidesPerView={1.5}
          spaceBetween={12}
          breakpoints={{
            640: { slidesPerView: 2.5, spaceBetween: 16 },
            1024: { slidesPerView: 3.5, spaceBetween: 16 },
            1280: { slidesPerView: 4, spaceBetween: 20 },
            1536: { slidesPerView: 4, spaceBetween: 24 },
          }}
          modules={[Navigation, Autoplay]}
          onBeforeInit={(swiper) => {
            swiper.params.navigation = {
              ...(swiper.params.navigation as Object),
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            };
          }}
          navigation={true}
          onSwiper={(swiper) => {
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          className="w-full !pt-2 !pb-6 -mx-1 !px-1"
        >
          {isLoading || isValidating
            ? Array.from({ length: 4 }).map((_, index) => (
              <SwiperSlide key={`res-skeleton-${index}`} className="!h-auto">
                <RestaurantCardSkeleton />
              </SwiperSlide>
            ))
            : stores.map((store) => (
              <SwiperSlide key={store.id} className="!h-auto">
                <RestaurantCard restaurant={store} />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RestaurantList;
