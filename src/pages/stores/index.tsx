import { GetServerSideProps } from "next";
import { getStores, getSettings } from "@/routes/api";
import { isSSR } from "@/helpers/getters";
import MyBreadcrumbs from "@/components/custom/MyBreadcrumbs";
import PageHeader from "@/components/custom/PageHeader";
import { Store, PaginatedResponse } from "@/types/ApiResponse";
import RestaurantCard from "@/components/Cards/RestaurantCard";
import RestaurantCardSkeleton from "@/components/Skeletons/RestaurantCardSkeleton";
import InfiniteScroll from "@/components/Functional/InfiniteScroll";
import { useInfiniteData } from "@/hooks/useInfiniteData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { NextPageWithLayout } from "@/types";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import InfiniteScrollStatus from "@/components/Functional/InfiniteScrollStatus";
import { loadTranslations } from "../../../i18n";
import { useTranslation } from "react-i18next";
import PageHead from "@/SEO/PageHead";
import { Input } from "@heroui/react";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSettings } from "@/contexts/SettingsContext";
import { useHomeRoute } from "@/hooks/useHomeRoute";
import { getCookieFromContext } from "@/helpers/getters";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

interface StoresPageProps {
  initialStores: PaginatedResponse<Store[]> | null;
  error?: string;
}

// Items per page
const PER_PAGE = 24;

const StoresPage: NextPageWithLayout<StoresPageProps> = ({ initialStores }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSingleVendor } = useSettings();
  const homeRoute = useHomeRoute();
  const activeModule = useSelector((state: RootState) => state.module.activeModule);

  const isFirstRender = useRef(true);
  const [searchQuery, setSearchQuery] = useState(
    (router.query.search as string) || "",
  );
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const {
    data: stores,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    loadMore,
    refetch,
  } = useInfiniteData<Store>({
    fetcher: getStores,
    perPage: PER_PAGE,
    initialData: initialStores?.data?.data || [],
    initialTotal: initialStores?.data?.total || 0,
    passLocation: true,
    extraParams: { search: debouncedSearch },
  });

  useEffect(() => {
    if (isSingleVendor) {
      router.replace(homeRoute);
    }
  }, [isSingleVendor, router, homeRoute]);

  // /stores is restaurant-only — redirect grocery module users back to grocery
  useEffect(() => {
    if (activeModule === "grocery") {
      router.replace("/grocery");
    }
  }, [activeModule, router]);

  // Update URL when debounced search changes
  useEffect(() => {
    // Skip refetch on initial render since we already have SSR data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = { ...router.query };
    if (debouncedSearch) {
      query.search = debouncedSearch;
    } else {
      delete query.search;
    }
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
    refetch();

  }, [debouncedSearch]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render any content if single vendor or grocery module – avoids flash before redirect
  if (!mounted || isSingleVendor || activeModule === "grocery") return null;

  return (
    <>
      <PageHead pageTitle={t("pageTitle.restaurants", "Restaurants")} />
      <button
        id="refetch-store-page"
        className="hidden"
        onClick={() => {
          refetch();
        }}
      />

      <MyBreadcrumbs
        breadcrumbs={[{ href: "/stores", label: t("pageTitle.restaurants", "Restaurants") }]}
      />

      <PageHeader
        title={t("pages.restaurants.title", "All Restaurants")}
        subtitle={t(
          "pages.stores.subtitle",
          "Explore our complete collection of",
        )}
        highlightText={
          total ? t("pages.stores.highlight_restaurants", { count: total, defaultValue: `${total} Restaurants` }) : ""
        }
      />

      <div className="mb-4 sm:mb-6 w-full flex justify-start">
        <Input
          type="text"
          placeholder={t("pages.restaurants.search_placeholder", "Search restaurants...")}
          value={searchQuery}
          size="sm"
          onValueChange={setSearchQuery}
          startContent={<Search className="w-4 h-4 text-default-400" />}
          isClearable
          autoFocus
          onClear={() => setSearchQuery("")}
          classNames={{
            input: "text-sm",
            inputWrapper: `h-10 group-data-[focus-visible=true]:ring-0
            group-data-[focus-visible=true]:ring-offset-0
            outline-none focus:outline-none`,
            base: "max-w-md",
          }}
        />
      </div>

      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoadingMore}
        onLoadMore={loadMore}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading && stores.length === 0
            ? Array.from({ length: PER_PAGE }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))
            : stores.map((store) => <RestaurantCard key={store.id} restaurant={store} />)}
        </div>

        {isLoadingMore && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <RestaurantCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}

        {stores.length > 0 && (
          <InfiniteScrollStatus
            entityType="restaurant"
            total={total}
            hasMore={hasMore}
          />
        )}
      </InfiniteScroll>
    </>
  );
};

export const getServerSideProps: GetServerSideProps | undefined = isSSR()
  ? async (context) => {
    try {
      const { lat = "", lng = "" } =
        (await getUserLocationFromContext(context)) || {};
      const searchQuery = (context.query?.search as string) || "";
      await loadTranslations(context);

      const settings = await getSettings();

      // Server-side redirect for single vendor mode
      const systemSettings = settings?.data?.find(
        (s: { variable: string }) => s.variable === "system",
      )?.value as { systemVendorType?: string } | undefined;
      if (systemSettings?.systemVendorType === "single") {
        const activeModule = (getCookieFromContext(context, "activeModule") as string) || undefined;
        const redirectDestination = activeModule === "grocery" ? "/grocery" : activeModule === "restaurant" ? "/restaurant" : activeModule === "courier" ? "/courier" : "/";
        return { redirect: { destination: redirectDestination, permanent: false } };
      }

      // Server-side redirect: /stores is restaurant-only, redirect grocery users
      const activeModuleCookie = (getCookieFromContext(context, "activeModule") as string) || undefined;
      if (activeModuleCookie === "grocery") {
        return { redirect: { destination: "/grocery", permanent: false } };
      }

      // Load initial batch of stores for SSR
      const stores = await getStores({
        page: 1,
        per_page: PER_PAGE,
        latitude: lat,
        longitude: lng,
        search: searchQuery,
      });

      return {
        props: {
          initialStores: stores,
          initialSettings: settings.data,
        },
      };
    } catch (err) {
      console.error("Error in getServerSideProps:", err);
      return {
        props: {
          initialStores: null,
          initialSettings: null,
          error:
            err instanceof Error
              ? err.message
              : "An error occurred during SSR",
        },
      };
    }
  }
  : undefined;

export default StoresPage;
