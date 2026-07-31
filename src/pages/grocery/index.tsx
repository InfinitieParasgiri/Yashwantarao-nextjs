import { useEffect } from "react";
import { getCookieFromContext, isSSR } from "@/helpers/getters";
import HomeTopSlider from "@/views/homePage/HomeTopSlider";
import { GetServerSideProps } from "next";
import { getHomePageData } from "@/services/homePageService";

import DeliveryBanner from "@/views/homePage/DeliveryBanner";
import {
  BannerData,
  Brand,
  Category,
  FeaturedSection,
  Product,
  Settings,
} from "@/types/ApiResponse";
import HomeBrands from "@/views/homePage/HomeBrands";

import { NextPageWithLayout } from "@/types";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import HomeFeaturedSections from "@/views/homePage/HomeFeaturedSections";
import { getAccessTokenFromContext } from "@/helpers/auth";
import HomeCarouselSlider from "@/views/homePage/HomeCarouselSlider";
import { loadTranslations } from "../../../i18n";
import { useTranslation } from "react-i18next";
import DynamicSEO from "@/SEO/DynamicSEO";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/helpers/seo";
import { useSettings } from "@/contexts/SettingsContext";
import { siteConfig } from "@/config/site";
import AppDownloadSection from "@/views/homePage/AppDownloadSection";
import HomeServiceHighlights from "@/views/homePage/HomeServiceHighlights";

import { useDispatch } from "react-redux";
import { setActiveModule } from "@/lib/redux/slices/moduleSlice";
import ModuleSwitcherHero from "@/views/homePage/ModuleSwitcherHero";
import CategoryTabs from "@/components/Functional/CategoryTabs";
import HomeCategories from "@/views/homePage/HomeCategories";

type GroceryPageProps = {
  initialSettings?: Settings | null;
  initialCategories?: Category[];
  initialBanners?: BannerData;
  initialProducts?: Product[];
  initialBrands?: Brand[];
  initialSections?: FeaturedSection[];
  error?: string;
};

const GroceryPage: NextPageWithLayout<GroceryPageProps> = ({
  initialCategories,
  initialBanners,
  initialBrands,
  initialSections,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setActiveModule("grocery"));
  }, [dispatch]);

  const { t } = useTranslation();
  const { webSettings } = useSettings();

  // Generate SEO schemas
  const siteName = webSettings?.siteName || siteConfig.name;
  const siteDescription =
    webSettings?.metaDescription || siteConfig.metaDescription;
  const siteLogo = webSettings?.siteHeaderLogo || "/logo.png";

  const organizationSchema = generateOrganizationSchema(
    siteName,
    siteDescription,
    siteLogo
  );

  const websiteSchema = generateWebsiteSchema(siteName);

  return (
    <>
      <DynamicSEO
        title={t("pageTitle.home") || "Order Groceries Online"}
        description={siteDescription}
        keywords={siteConfig.metaKeywords}
        canonical="/grocery"
        ogType="website"
        ogTitle={siteName}
        ogDescription={siteDescription}
        ogImage={siteLogo}
        jsonLd={[organizationSchema, websiteSchema]}
      />

      <div className="flex flex-col gap-0">
        <ModuleSwitcherHero />

        <div className="mt-20">
          <CategoryTabs className="w-full" moduleType="grocery" />
          <HomeTopSlider initialBanners={initialBanners} moduleType="grocery" />
          <HomeCategories initialCategories={initialCategories} moduleType="grocery" />
          <HomeBrands initialBrands={initialBrands} moduleType="grocery" />
          <HomeCarouselSlider initialBanners={initialBanners} moduleType="grocery" />
          <HomeFeaturedSections initialSections={initialSections} moduleType="grocery" />
        </div>

        <HomeServiceHighlights />
        <DeliveryBanner />
        <AppDownloadSection />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<GroceryPageProps> | undefined =
  isSSR()
    ? async (context) => {
      try {
        await loadTranslations(context);

        const access_token = (await getAccessTokenFromContext(context)) || "";

        const { lat = "", lng = "" } =
          (await getUserLocationFromContext(context)) || {};

        // 1️⃣ take category from query if available, else fallback to cookie
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
          sections,
        } = await getHomePageData({ lat, lng, access_token, homeCategory, business_type: "grocery" });

        return {
          props: {
            initialSettings: settings,
            initialCategories: categories,
            initialBanners: banners,
            initialProducts: products,
            initialBrands: brands,
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

export default GroceryPage;
