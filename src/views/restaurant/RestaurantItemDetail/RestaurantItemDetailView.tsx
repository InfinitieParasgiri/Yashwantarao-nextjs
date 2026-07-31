import { FC, useState } from "react";
import { Product, ProductVariant } from "@/types/ApiResponse";
import {
  BottomSection
} from "@/components/Products/ProductDetailPage";
import ProductImgSectionSkeleton from "@/components/Skeletons/ProductImgSectionSkeleton";
import ProductDetailSectionSkeleton from "@/components/Skeletons/ProductDetailSectionSkeleton";
import { useDisclosure } from "@heroui/react";
import dynamic from "next/dynamic";
import RestaurantItemDetailSection from "./RestaurantItemDetailSection";
import RestaurantRelatedItemsSection from "./RestaurantRelatedItemsSection";
import RestaurantImgSection from "./RestaurantImgSection";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const RestaurantProductModal = dynamic(() => import("./RestaurantProductModal"), {
  ssr: false,
});

interface RestaurantItemDetailViewProps {
  initialProduct: Product;
  initialRelatedItems: Product[];
  isLoading: boolean;
  isRelatedLoading: boolean;
}

/**
 * RestaurantItemDetailView
 * Restaurant-specific layout for the menu item detail page.
 * Mirrors ProductDetailPageView but is fully decoupled from the grocery module
 * to allow independent styling and feature development per module.
 */
const RestaurantItemDetailView: FC<RestaurantItemDetailViewProps> = ({
  initialProduct,
  initialRelatedItems,
  isLoading,
  isRelatedLoading,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalInitialQuantity, setModalInitialQuantity] = useState<number | undefined>(undefined);

  const getInitialVariant = (): ProductVariant | null => {
    if (initialProduct?.variants?.length > 0) {
      return initialProduct.variants.find((v) => v.is_default) ?? initialProduct.variants[0];
    }
    return null;
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    getInitialVariant()
  );

  const mainImage = initialProduct?.main_image || null;
  const otherImages = initialProduct?.additional_images || [];
  const variantImages =
    initialProduct?.variants?.map((v) => v.image).filter(Boolean) || [];

  let allImages = [mainImage, ...otherImages, ...variantImages].filter(Boolean) as string[];

  const variantImagesStartIndex = [mainImage, ...otherImages].filter(Boolean).length;

  const video = initialProduct?.video_link
    ? {
      url: initialProduct.video_link,
      type:
        initialProduct.video_type === "youtube"
          ? ("youtube" as const)
          : initialProduct.video_type === "self_hosted"
            ? ("self_hosted" as const)
            : null,
    }
    : null;

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Figma Back Button position */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 group hover:opacity-70 transition-opacity w-fit cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{t("back") || "Back"}</span>
        </button>

        {/* Top: Image + Info side by side */}
        <section
          id="restaurant-item-top-section"
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-16"
        >
          <div className="w-full">
            {isLoading ? (
              <ProductImgSectionSkeleton isVertical={false} />
            ) : (
              <RestaurantImgSection
                allImages={allImages}
                isLoading={isLoading}
                video={video}
                variants={initialProduct?.variants || []}
                selectedVariant={selectedVariant}
                variantImagesStartIndex={variantImagesStartIndex}
              />
            )}
          </div>

          <div className="w-full flex flex-col justify-start">
            {isLoading ? (
              <ProductDetailSectionSkeleton />
            ) : (
              <RestaurantItemDetailSection
                initialProduct={initialProduct}
                onVariantChange={handleVariantChange}
                onOpenModal={(qty) => {
                  setModalInitialQuantity(qty);
                  onOpen();
                }}
              />
            )}
          </div>
        </section>

        {/* Similar Products Section - Moved above Tabs to match Grocery UI */}
        <section id="restaurant-related-items-section" className="mb-16">
          <RestaurantRelatedItemsSection
            initialRelatedItems={initialRelatedItems}
            isLoading={isRelatedLoading}
          />
        </section>

        {/* Bottom Section (Tabs for Details, Reviews, FAQs) */}
        <section id="restaurant-item-bottom-section" className="mb-16">
          <BottomSection initialProduct={initialProduct} />
        </section>
      </div>

      {isOpen && (
        <RestaurantProductModal
          isOpen={isOpen}
          onClose={onClose}
          product={initialProduct}
          selectedVariant={selectedVariant}
          editingQuantity={modalInitialQuantity}
        />
      )}
    </div>
  );
};

export default RestaurantItemDetailView;
