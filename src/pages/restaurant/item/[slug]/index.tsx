import { GetServerSideProps } from "next";
import { getSlugFromContext, isSSR } from "@/helpers/getters";
import { Product } from "@/types/ApiResponse";
import { NextPageWithLayout } from "@/types";
import { getAccessTokenFromContext } from "@/helpers/auth";
import { getUserLocationFromContext } from "@/helpers/functionalHelpers";
import useSWR from "swr";
import { fetchProductDetailPageData } from "@/services/ProductDetailPageService";
import { useRouter } from "next/router";
import { staticLat, staticLng } from "@/config/constants";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
import { loadTranslations } from "../../../../../i18n";
import { useTranslation } from "react-i18next";
import NoProductsFound from "@/components/NoProductsFound";
import { Button } from "@heroui/react";
import DynamicSEO from "@/SEO/DynamicSEO";
import { generateProductMeta, generateProductSchema, generateBreadcrumbSchema } from "@/helpers/seo";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { getProductBySlug, getProducts } from "@/routes/api";
import RestaurantItemDetailView from "@/views/restaurant/RestaurantItemDetail/RestaurantItemDetailView";

export interface RestaurantItemPageProps {
  initialProduct?: Product;
  initialSimilarProducts?: Product[];
  slug?: string;
  error?: string;
}

const PER_PAGE = 20;



// SWR fetcher for the menu item
const fetcher = async (slug: string) => {
  try {
    const userLocation = getCookie("userLocation") as UserLocation | null;
    const lat = userLocation?.lat || staticLat;
    const lng = userLocation?.lng || staticLng;
    const res = await getProductBySlug({ slug, latitude: lat, longitude: lng, business_type: "restaurant" });
    if (!res.success || !res.data) {
      console.error(res.message || "Failed to fetch product");
      return null;
    }
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (e) {
    console.error("API Error fetching product detail", e);
    return null;
  }
};

// SWR fetcher for related items (same category)
const relatedItemsFetcher = async (slug: string) => {
  const userLocation = getCookie("userLocation") as UserLocation | null;
  const lat = userLocation?.lat || staticLat;
  const lng = userLocation?.lng || staticLng;
  const res = await getProducts({
    exclude_product: slug,
    per_page: PER_PAGE,
    latitude: lat,
    longitude: lng,
    include_child_categories: 0,
    business_type: "restaurant",
  });
  if (!res.success || !res.data) {
    console.error(res.message || "Failed to fetch related items");
  }
  return res.data?.data || [];
};

const RestaurantItemPage: NextPageWithLayout<RestaurantItemPageProps> = ({
  initialProduct,
  initialSimilarProducts,
  slug,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const itemSlug = slug || (router.query.slug as string);

  const {
    data: product,
    isLoading,
    mutate: refetchProduct,
  } = useSWR(
    itemSlug ? `/restaurant/item/${itemSlug}` : null,
    () => fetcher(itemSlug!),
    {
      fallbackData: isSSR() ? initialProduct : undefined,
      revalidateOnFocus: false,
      revalidateOnMount: !isSSR() && (!!getCookie("userLocation") || !!initialProduct),
    },
  );

  const {
    data: relatedItems,
    isLoading: isRelatedLoading,
    mutate: refetchRelated,
  } = useSWR(
    itemSlug ? `/restaurant/item/related/${itemSlug}` : null,
    () => relatedItemsFetcher(itemSlug!),
    {
      fallbackData: isSSR() ? initialSimilarProducts : undefined,
      revalidateOnFocus: false,
      revalidateOnMount: !isSSR() && (!!getCookie("userLocation") || !!initialSimilarProducts),
    },
  );

  const isItemMissing = !product || (Array.isArray(product) && product.length === 0);

  // SSR SEO — rendered server-side for crawlers
  const ssrMeta = initialProduct ? generateProductMeta(initialProduct) : null;
  const ssrProductSchema = initialProduct ? generateProductSchema(initialProduct) : null;
  const ssrBreadcrumbSchema = initialProduct
    ? generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Restaurants", url: "/restaurant" },
      { name: initialProduct.category_name, url: `/restaurant/item/${initialProduct.slug}` },
    ])
    : null;
  const ssrJsonLd = [ssrProductSchema, ssrBreadcrumbSchema].filter(Boolean);

  // Client-side SEO refresh after SWR re-fetch
  const productMeta = product ? generateProductMeta(product) : null;

  return (
    <>
      {/* SSR SEO block */}
      {ssrMeta && initialProduct ? (
        <DynamicSEO
          title={ssrMeta.title}
          description={ssrMeta.description}
          keywords={ssrMeta.keywords}
          canonical={`/restaurant/item/${initialProduct.slug}`}
          ogType="product"
          ogTitle={ssrMeta.title}
          ogDescription={ssrMeta.description}
          ogImage={ssrMeta.image}
          ogImageAlt={ssrMeta.title}
          twitterCard="summary_large_image"
          twitterTitle={ssrMeta.title}
          twitterDescription={ssrMeta.description}
          twitterImage={ssrMeta.image}
          productPrice={
            initialProduct.variants?.[0]?.special_price?.toString() ||
            initialProduct.variants?.[0]?.price?.toString()
          }
          productCurrency="USD"
          productAvailability={
            initialProduct.variants?.some((v) => v.stock > 0) ? "in stock" : "out of stock"
          }
          productCondition="new"
          jsonLd={ssrJsonLd}
        />
      ) : !initialProduct ? (
        <DynamicSEO title={t("not_found")} description={t("no_product_available")} robots="noindex, follow" />
      ) : null}

      {/* Client-side SEO refresh */}
      {product && productMeta && product.slug !== initialProduct?.slug && (
        <DynamicSEO
          title={productMeta.title}
          description={productMeta.description}
          ogImage={productMeta.image}
          canonical={`/restaurant/item/${product.slug}`}
        />
      )}

      <div className="min-h-screen">
        {/* Hidden refetch triggers used by cart helpers */}
        <button onClick={() => refetchRelated()} className="hidden" id="similar-products-refetch" />
        <button onClick={() => refetchProduct()} className="hidden" id="specific-product-refetch" />

        {!isLoading && isItemMissing ? (
          <NoProductsFound
            icon={ShoppingCart}
            title={t("no_product_found")}
            description={t("no_product_available")}
            customActions={
              <div className="flex w-full justify-center items-center">
                <Button
                  color="primary"
                  className="h-8"
                  variant="solid"
                  onPress={() => router.back()}
                  endContent={<ArrowRight size={16} />}
                >
                  {t("go_back")}
                </Button>
              </div>
            }
          />
        ) : (
          <RestaurantItemDetailView
            initialProduct={product!}
            initialRelatedItems={relatedItems || []}
            isLoading={isLoading}
            isRelatedLoading={isRelatedLoading}
          />
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps | undefined = isSSR()
  ? async (context) => {
    try {
      const access_token = (await getAccessTokenFromContext(context)) || "";
      const userLocation = (await getUserLocationFromContext(context)) || ({} as any);
      const lat = userLocation.lat || staticLat;
      const lng = userLocation.lng || staticLng;
      await loadTranslations(context);
      const slug = getSlugFromContext(context);

      const data = await fetchProductDetailPageData({ slug, access_token, lat, lng, PER_PAGE, business_type: "restaurant" });

      return { props: { ...data, slug } };
    } catch (err) {
      console.error("Unexpected error in getServerSideProps:", err);
      return {
        props: {
          error: err instanceof Error ? err.message : "An unexpected SSR error occurred",
        },
      };
    }
  }
  : undefined;

export default RestaurantItemPage;
