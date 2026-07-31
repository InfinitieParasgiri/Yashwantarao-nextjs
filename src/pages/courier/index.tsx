import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setActiveModule } from "@/lib/redux/slices/moduleSlice";
import DynamicSEO from "@/SEO/DynamicSEO";
import ModuleSwitcherHero from "@/views/homePage/ModuleSwitcherHero";
import DeliveryBanner from "@/views/homePage/DeliveryBanner";
import AppDownloadSection from "@/views/homePage/AppDownloadSection";
import { useTranslation } from "react-i18next";
import { isSSR } from "@/helpers/getters";
import { GetServerSideProps } from "next";
import { getHomePageData } from "@/services/homePageService";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import { getAccessTokenFromContext } from "@/helpers/auth";
import { BannerData } from "@/types/ApiResponse";
import CourierTopSlider from "@/views/Courier/components/CourierTopSlider";
import ServicePromoCard from "@/views/Courier/ServicePromoCard";
import ShipmentsTracker from "@/views/Courier/components/ShipmentsTracker";

type CourierPageProps = {
  initialBanners?: BannerData;
}

const CourierPage: React.FC<CourierPageProps> = ({ initialBanners }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Ensure Redux knows we are in the restaurant module when this page loads
    dispatch(setActiveModule("courier"));
  }, [dispatch]);

  return (
    <>
      <DynamicSEO title="Reliable Courier Services at Your Fingertips" />

      <div className="flex flex-col gap-0 pb-16">
        <ModuleSwitcherHero />


        <ServicePromoCard />
        <CourierTopSlider initialBanners={initialBanners} />

        <ShipmentsTracker />
        {/* Existing landing footer sections */}
        
        <DeliveryBanner />
        <AppDownloadSection />

      </div>
    </>
  );
};


export const getServerSideProps: GetServerSideProps<CourierPageProps> | undefined =
  isSSR()
    ? async (context) => {
        try {
          const access_token = (await getAccessTokenFromContext(context)) || "";
          const { lat = "", lng = "" } = (await getUserLocationFromContext(context)) || {};

          const homeCategory = "courier";

          const { banners } = await getHomePageData({ lat, lng, access_token, homeCategory });

          return {
            props: {
              initialBanners: banners || null
            }
          };
        } catch (err) {
          console.log("Error in getServerSideProps for Courier Page:", err);

          return {
            props: {
              initialBanners: undefined,
            }
          };
        }
      }
    : undefined;


export default CourierPage;
