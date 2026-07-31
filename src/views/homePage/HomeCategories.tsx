import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { AppWindow } from "lucide-react";
import { getCategories, getSubCategories } from "@/routes/api";
import { getActiveCategory, isSSR } from "@/helpers/getters";
import { Category } from "@/types/ApiResponse";
import CategoryCard from "@/components/Cards/CategoryCard";
import CategoryCardSkeleton from "@/components/Skeletons/CategoryCardSkeleton";
import SectionHeading from "@/components/SectionHeading";
import Link from "next/link";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { getCookie } from "@/lib/cookies";
import { isRTL } from "@/helpers/functionalHelpers";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

interface HomeCategoriesProps {
  initialCategories?: Category[];
  moduleType?: string;
}

// SWR fetcher
const fetcher = async ([url, business_type]: [string, string?]) => {
  const validSlug = getActiveCategory();

  const location = getCookie("userLocation") as UserLocation | undefined;
  const { lat = "", lng = "" } = location || {};

  if (!lat || !lng) {
    return [];
  }

  const response = validSlug
    ? await getCategories({
      slug: validSlug,
      scope_category_slug: validSlug,
      latitude: lat,
      longitude: lng,
      business_type,
    } as any)
    : await getSubCategories({
      latitude: lat,
      longitude: lng,
      business_type,
      filter: "top_category",
    });

  if (!response.success || !response.data) {
    console.error(response.message || "Failed to fetch categories");
  }

  return response.data?.data ?? [];
};

const HomeCategories: FC<HomeCategoriesProps> = ({
  initialCategories = [],
  moduleType,
}) => {
  const activeModule = useSelector((state: RootState) => state.module?.activeModule);
  const effectiveModule = moduleType || activeModule;

  const { t, i18n } = useTranslation();

  const currentLang = i18n.resolvedLanguage || i18n.language;
  const rtl = isRTL(currentLang);

  const {
    data: categories = [],
    isLoading,
    isValidating,
    mutate,
  } = useSWR(["/categories", effectiveModule], fetcher, {
    fallbackData: isSSR() ? initialCategories : undefined,
    revalidateOnFocus: false,
    revalidateOnMount: !isSSR(),
  });

  const slides = useMemo(
    () =>
      categories.map((category) => (
        <SwiperSlide key={category.id} className="!w-[84px] sm:!w-[100px] md:!w-[110px]">
          <div className="flex flex-col items-center">
            <CategoryCard category={category} moduleType={effectiveModule} />
          </div>
        </SwiperSlide>
      )),
    [categories, effectiveModule],
  );

  const skeletonSlides = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => (
      <SwiperSlide key={`skeleton-${index}`} className="!w-[84px] sm:!w-[100px] md:!w-[110px]">
        <CategoryCardSkeleton />
      </SwiperSlide>
    ));
  }, []);
  const shouldHide = categories?.length === 0 && !isLoading && !isValidating;
  const validSlug = getActiveCategory();

  return (
    <section id="home-categories">
      <button
        onClick={() => mutate()}
        className="hidden"
        id="home-categories-refetch"
      />
      {!shouldHide && (
        <div className="w-full mb-4 px-4 max-w-screen-2xl mx-auto">
          <div className="flex justify-between w-full items-center mb-4">
            <SectionHeading
              title={t("home.categories.title")}
              description={t("home.categories.description")}
              icon={<AppWindow size={16} className="text-white" />}
            />
            <Link
              href={
                validSlug
                  ? `/categories?slug=${validSlug}${effectiveModule ? `&business_type=${effectiveModule}` : ""}`
                  : `/categories${effectiveModule ? `?business_type=${effectiveModule}` : ""}`
              }
              className="text-xs sm:text-sm"
              title={t("see_all")}
            >
              {t("see_all")}
            </Link>
          </div>
          <Swiper
            key={rtl ? "rtl-hc" : "ltr-hc"}
            dir={rtl ? "rtl" : "ltr"}
            slidesPerView="auto"
            spaceBetween={8}
            breakpoints={{
              0: { spaceBetween: 8 },
              640: { spaceBetween: 12 },
              1024: { spaceBetween: 16 },
            }}
            lazyPreloadPrevNext={0}
            modules={[Navigation, Autoplay]}
            loop={false}
            autoplay={{
              delay: 3200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
          >
            {isLoading ? skeletonSlides : slides}
          </Swiper>
        </div>
      )}
    </section>
  );
};

export default HomeCategories;
