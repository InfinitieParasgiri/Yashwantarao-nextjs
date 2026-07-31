import { FC } from "react";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Skeleton } from "@heroui/react";
import { getBannerImages } from "@/routes/api";
import { isSSR } from "@/helpers/getters";
import { BannerData } from "@/types/ApiResponse";
import Link from "next/link";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { useTranslation } from "react-i18next";
import { isRTL } from "@/helpers/functionalHelpers";

type CourierTopSliderProps = {
  initialBanners?: BannerData;
};

// Fetcher function for SWR
const fetcher = async () => {
  const location = getCookie("userLocation") as UserLocation | undefined;
  const { lat = "", lng = "" } = location || {};

  if (!lat || !lng) {
    return { top: [], carousel: [] };
  }

  const response = await getBannerImages({
    business_type: "courier",
    per_page: 50,
    latitude: lat,
    longitude: lng,
  });

  if (!response.success || !response.data) {
    console.error(response.message || "Failed to fetch banner images");
  }

  return response.data?.data ?? { top: [], carousel: [] };
};

const CourierTopSlider: FC<CourierTopSliderProps> = ({
  initialBanners = { top: [], carousel: [] },
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language;
  const rtl = isRTL(currentLang);

  const {
    data: bannerImages,
    isLoading,
    isValidating,
  } = useSWR("/banners/courier", fetcher, {
    fallbackData: isSSR() ? initialBanners : undefined,
    revalidateOnFocus: false,
    revalidateOnMount: !isSSR(),
  });

  if (isLoading || !bannerImages || isValidating) {
    return (
      <div className="w-full my-4 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Mobile – 1 skeleton */}
          <Skeleton className="w-full aspect-409/240 rounded-2xl animate-pulse block sm:hidden" />

          {/* Tablet & Desktop – 2 skeletons */}
          {[...Array(2)].map((_, index) => (
            <Skeleton
              key={`sm-lg-${index}`}
              className="w-full aspect-409/240 rounded-2xl animate-pulse hidden sm:block"
            />
          ))}
        </div>
      </div>
    );
  }

  const shouldHide = bannerImages?.top?.length === 0;
  const canLoopTop = (bannerImages?.top?.length ?? 0) > 2;

  return (
    <section id="courier-slider" className="mt-4 px-4">
      {!shouldHide && (
        <div className="w-full mb-4">
          <Swiper
            key={rtl ? "rtl-cs" : "ltr-cs"}
            dir={rtl ? "rtl" : "ltr"}
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={canLoopTop}
            spaceBetween={12}
            slidesPerView={1}
            breakpoints={{
              315: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 2,
              },
            }}
            className="rounded-2xl shadow-none"
          >
            {bannerImages?.top &&
              bannerImages.top.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <Link
                    href={
                      banner.type === "brand"
                        ? `/brands/${banner.brand_slug}`
                        : banner.type === "category"
                          ? `/categories/${banner.category_slug}`
                          : banner.type === "product"
                            ? `/products/${banner.product_slug}`
                            : banner.type === "custom" && banner.custom_url
                              ? banner.custom_url
                              : "#"
                    }
                    className="block w-full focus:outline-hidden"
                  >
                    <div className="relative w-full aspect-409/240 overflow-hidden rounded-2xl">
                      <img
                        src={banner.banner_image}
                        alt={banner.title}
                        loading="eager"
                        className="w-full h-full object-cover rounded-2xl select-none"
                      />
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      )}
    </section>
  );
};

export default CourierTopSlider;
