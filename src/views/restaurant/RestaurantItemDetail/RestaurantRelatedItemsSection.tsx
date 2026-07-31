import { FC, useMemo, useState } from "react";
import { Product } from "@/types/ApiResponse";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import Link from "next/link";
import ProductIndicator from "@/components/Functional/ProductIndicator";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { addToast } from "@heroui/react";
import {
  handleAddToCart,
  handleOfflineAddToCart,
} from "@/helpers/functionalHelpers";

const RestaurantProductModal = dynamic(() => import("./RestaurantProductModal"), {
  ssr: false,
});

interface RestaurantRelatedItemsSectionProps {
  initialRelatedItems: Product[];
  isLoading: boolean;
}

/**
 * RestaurantRelatedItemsSection
 * Displays related menu items in a responsive CSS grid (not a Swiper),
 * matching the Figma design with horizontal cards showing title, price,
 * description, ratings, and a teal ADD + button.
 * The section title dynamically reads "Similar Products".
 */
const RestaurantRelatedItemsSection: FC<RestaurantRelatedItemsSectionProps> = ({
  initialRelatedItems,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { currencySymbol } = useSettings();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  const sectionTitle = t("similarProducts");

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 flex gap-4"
        >
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/3 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse mt-2" />
          </div>
          <div className="w-28 h-28 bg-gray-200 dark:bg-zinc-700 rounded-xl animate-pulse flex-shrink-0" />
        </div>
      )),
    [],
  );

  const handleAddClick = async (product: Product) => {
    const defaultVariant = product.variants?.find((v) => v.is_default) ?? product.variants?.[0];
    if (!defaultVariant) {
      addToast({ title: t("product_modal.out_of_stock") || "Out of stock", color: "warning" });
      return;
    }

    const hasVariants = product.variants?.length > 1;
    const hasAddons = defaultVariant.addon_groups && defaultVariant.addon_groups.length > 0;

    // If item has sizes or customizable addons, open the premium popup
    if (hasVariants || hasAddons) {
      setSelectedProduct(product);
      return;
    }

    // Direct Add for simple items (no customizations required)
    setAddingId(product.id);
    try {
      if (!isLoggedIn) {
        handleOfflineAddToCart({
          product,
          variant: defaultVariant,
          quantity: 1,
          renderToast: true,
        });
      } else {
        await handleAddToCart({
          product_variant_id: defaultVariant.id,
          store_id: defaultVariant.store_id,
          quantity: 1,
          onClose: () => {},
          renderToast: true,
        });
      }
    } catch (err) {
      console.error("Direct add to cart failed:", err);
    } finally {
      setAddingId(null);
    }
  };

  if (!isLoading && initialRelatedItems.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
        {sectionTitle}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8">
        {isLoading
          ? skeletons
          : initialRelatedItems.map((product) => {
              const defaultVariant =
                product.variants?.find((v) => v.is_default) ??
                product.variants?.[0];
              const price = Number(defaultVariant?.price) || 0;
              const specialPrice = Number(defaultVariant?.special_price) || 0;
              const displayPrice =
                specialPrice > 0 && specialPrice < price ? specialPrice : price;

              return (
                <article
                  key={product.id}
                  className="
                    bg-white dark:bg-zinc-900
                    rounded-[16px]
                    border border-gray-200/80 dark:border-zinc-700/70
                    flex
                    shadow-[0_4px_14px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]
                    dark:shadow-[0_4px_18px_rgba(0,0,0,0.25)]
                    transition-all duration-300
                    group
                    overflow-hidden
                    h-[160px]
                    "
                >
                  {/* Left: Info Section (60%) */}
                  <div className="flex-[3] p-3 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/restaurant/item/${product.slug}`}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-1 mb-0.5">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="text-base font-black text-gray-900 dark:text-white mb-1">
                        {currencySymbol}
                        {displayPrice.toFixed(2)}
                      </div>

                      {product.short_description && (
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-1.5 font-medium">
                          {product.short_description}
                        </p>
                      )}

                      {/* Ratings */}
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2 h-2 ${i < Math.floor(Number(product.ratings)) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400">
                          ({product.rating_count || 0})
                        </span>
                      </div>
                    </div>

                    <div className="mt-1">
                      <button
                        onClick={() => handleAddClick(product)}
                        disabled={addingId === product.id}
                        className="bg-[#019CBF] hover:bg-[#018ba8] text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1 uppercase"
                        aria-label={`Add ${product.title} to cart`}
                      >
                        {addingId === product.id
                          ? t("adding") || "Adding..."
                          : (t("add") || "Add")}
                        <Plus size={10} strokeWidth={4} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Image Section (45%) */}
                  <div className="flex-[2.5] relative m-2 overflow-hidden rounded-[12px] bg-gray-50 dark:bg-zinc-800">
                    <Link
                      href={`/restaurant/item/${product.slug}`}
                      className="block h-full w-full relative bg-gray-200 dark:bg-zinc-800"
                    >
                      {product.main_image ? (
                        <Image
                          src={product.main_image}
                          alt={product.title}
                          layout="fill"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                           <span className="text-gray-400 dark:text-zinc-500 font-medium text-[10px] text-center">
                             {t("no_image_available") || "No Image Available"}
                           </span>
                        </div>
                      )}
                    </Link>

                    {/* Indicator Overlay */}
                    {product.indicator && (
                      <div className="absolute top-1.5 right-1.5">
                        <ProductIndicator
                          indicator={product.indicator}
                          size={12}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
      </div>

      {/* Render the customization modal for customizable items */}
      {selectedProduct && (
        <RestaurantProductModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          selectedVariant={
            selectedProduct.variants?.find((v) => v.is_default) ??
            selectedProduct.variants?.[0]
          }
        />
      )}
    </div>
  );
};

export default RestaurantRelatedItemsSection;
