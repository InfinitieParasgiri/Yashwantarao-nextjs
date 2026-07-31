import { GetServerSideProps } from "next";
import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import DynamicSEO from "@/SEO/DynamicSEO";
import RestaurantDetail from "@/views/restaurant/RestaurantDetail/RestaurantDetail";
import { isSSR } from "@/helpers/getters";
import { loadTranslations } from "../../../i18n";
import { getSpecificStore, getProducts, getSettings } from "@/routes/api";
import { NextPageWithLayout } from "@/types";
import useSWR from "swr";
import { getAccessTokenFromContext } from "@/helpers/auth";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import { PaginatedResponse, Product, Store } from "@/types/ApiResponse";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";

interface RestaurantPageProps {
  initialRestaurant: Store | null;
  initialProducts: PaginatedResponse<Product[]> | null;
  initialSettings: any | null;
  slug: string;
}

const RestaurantDetailPage: NextPageWithLayout<RestaurantPageProps> = ({
  initialRestaurant,
  initialProducts,
  initialSettings,
  slug,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const resolvedSlug = slug || (router.query.slug as string);

  // Fetch restaurant data on client-side if not provided by SSR
  const location = getCookie("userLocation") as UserLocation | undefined;
  const { lat = "", lng = "" } = location || {};
  const { data: storeData } = useSWR(
    !initialRestaurant && resolvedSlug ? `/stores/${resolvedSlug}?latitude=${lat}&longitude=${lng}` : null,
    () => getSpecificStore(resolvedSlug, lat, lng).then((res) => res.data),
    { revalidateOnFocus: false },
  );

  const restaurant = initialRestaurant || storeData;

  if (!restaurant) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <DynamicSEO
        title={`${restaurant.name} - Order Online`}
        description={`Order from ${restaurant.name} with fast delivery. Check out the menu and offers.`}
      />
      <RestaurantDetail restaurant={restaurant} initialProducts={initialProducts} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps | undefined = isSSR()
  ? async (context) => {
    const { slug } = context.params || {};
    const access_token = (await getAccessTokenFromContext(context)) || "";
    const { lat = "", lng = "" } = (await getUserLocationFromContext(context)) || {};
    await loadTranslations(context);

    try {
      const apiParams: any = {
        page: 1,
        per_page: 100, // Load full menu for restaurant
        store: slug,
        latitude: lat,
        longitude: lng,
        access_token,
        include_child_categories: 0,
        business_type: "restaurant",
      };

      const [storeRes, productsRes, settingsRes] = await Promise.all([
        getSpecificStore(slug as string, lat, lng),
        getProducts(apiParams),
        getSettings()
      ]);

      return {
        props: {
          initialRestaurant: storeRes.data || null,
          initialProducts: productsRes || null,
          initialSettings: settingsRes.data || null,
          slug: slug as string,
        },
      };
    } catch (error) {
      return {
        props: {
          initialRestaurant: null,
          initialProducts: null,
          initialSettings: null,
          slug: slug as string,
        },
      };
    }
  }
  : undefined;

export default RestaurantDetailPage;
