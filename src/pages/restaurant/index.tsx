import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setActiveModule } from "@/lib/redux/slices/moduleSlice";
import DynamicSEO from "@/SEO/DynamicSEO";
import ModuleSwitcherHero from "@/views/homePage/ModuleSwitcherHero";
import CategoryTabs from "@/components/Functional/CategoryTabs";
import HomeCategories from "@/views/homePage/HomeCategories";
import RestaurantList from "@/views/restaurant/RestaurantList";
import HomeTopSlider from "@/views/homePage/HomeTopSlider";
import HomeCarouselSlider from "@/views/homePage/HomeCarouselSlider";
import HomeFeaturedSections from "@/views/homePage/HomeFeaturedSections";
import HomeServiceHighlights from "@/views/homePage/HomeServiceHighlights";
import DeliveryBanner from "@/views/homePage/DeliveryBanner";
import AppDownloadSection from "@/views/homePage/AppDownloadSection";
import { useTranslation } from "react-i18next";
import { GetServerSideProps } from "next";
import { getHomePageData } from "@/services/homePageService";
import { isSSR, getCookieFromContext } from "@/helpers/getters";
import { getAccessTokenFromContext } from "@/helpers/auth";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import { loadTranslations } from "../../../i18n";
import type {
  Category,
  FeaturedSection,
  Store,
  Settings,
  BannerData,
  Product,
  Brand,
} from "@/types/ApiResponse";
import { NextPageWithLayout } from "@/types";

type RestaurantPageProps = {
  initialSettings?: Settings | null;
  initialCategories?: Category[];
  initialBanners?: BannerData;
  initialProducts?: Product[];
  initialBrands?: Brand[];
  initialStores?: Store[];
  initialSections?: FeaturedSection[];
  error?: string;
};

const RestaurantPage: NextPageWithLayout<RestaurantPageProps> = ({
  initialCategories,
  initialBanners,
  initialStores,
  initialSections,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Ensure Redux knows we are in the restaurant module when this page loads
    dispatch(setActiveModule("restaurant"));
  }, [dispatch]);

  return (
    <>
      <DynamicSEO title="Order Food Online | Best Restaurants near you" />

      <div className="flex flex-col gap-0">
        <ModuleSwitcherHero />

        <div className="mt-20">
          <CategoryTabs className="w-full" moduleType="restaurant" />
          <HomeCategories moduleType="restaurant" />
          
          <HomeTopSlider initialBanners={initialBanners} moduleType="restaurant" />
          
          <RestaurantList title="Recommended for You" initialStores={initialStores} moduleType="restaurant" />
          
          <HomeCarouselSlider initialBanners={initialBanners} moduleType="restaurant" />
          
          <HomeFeaturedSections initialSections={initialSections} moduleType="restaurant" />
        </div>

        <HomeServiceHighlights />
        <DeliveryBanner />
        <AppDownloadSection />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<RestaurantPageProps> | undefined =
  isSSR()
    ? async (context) => {
      try {
        await loadTranslations(context);

        const access_token = (await getAccessTokenFromContext(context)) || "";

        const { lat = "", lng = "" } =
          (await getUserLocationFromContext(context)) || {};

        const queryCategory = context.query.category as string | undefined;
        const cookieCategory =
          (getCookieFromContext(context, "homeCategory") as string) || "";

        const homeCategory = queryCategory || cookieCategory;

        const {
          settings,
          categories,
          banners,
          products,
          brands,
          stores,
          sections,
        } = await getHomePageData({ lat, lng, access_token, homeCategory, business_type: "restaurant" });

        return {
          props: {
            initialSettings: settings,
            initialCategories: categories,
            initialBanners: banners,
            initialProducts: products,
            initialBrands: brands,
            initialStores: stores,
            initialSections: sections,
          },
        };
      } catch (err) {
        console.error("Error in getServerSideProps:", err);
        return {
          props: {
            initialSettings: null,
            initialCategories: [],
            initialBanners: undefined,
            initialProducts: [],
            initialBrands: [],
            initialStores: [],
            initialSections: [],
            error:
              err instanceof Error
                ? err.message
                : "An error occurred during SSR",
          },
        };
      }
    }
    : undefined;

export default RestaurantPage;
