import { FC, useEffect, useState, useMemo } from "react";
import { Button, Chip, addToast } from "@heroui/react";
import {
  Star,
  ShoppingBag,
  MoveRight,
  Store,
  Clock,
  Share2,
  Heart,
} from "lucide-react";
import { Product, ProductVariant } from "@/types/ApiResponse";
import {
  handleAddToCart,
  handleOfflineAddToCart,
} from "@/helpers/functionalHelpers";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import QtyInput from "@/components/Products/ProductDetailPage/QtyInput";
import ProductIndicator from "@/components/Functional/ProductIndicator";
import AttributeSelector from "@/components/Functional/AttributeSelector";

interface RestaurantItemDetailSectionProps {
  initialProduct: Product;
  onVariantChange?: (variant: ProductVariant) => void;
  onOpenModal?: (quantity?: number) => void;
}

/**
 * RestaurantItemDetailSection
 * The right-hand info panel for the restaurant item detail page.
 * Styled to match the Figma design: large title, star ratings, teal CTA buttons,
 * and a clean "Back" navigation.
 */
const RestaurantItemDetailSection: FC<RestaurantItemDetailSectionProps> = ({
  initialProduct,
  onVariantChange,
  onOpenModal,
}) => {
  const getInitialVariant = (): ProductVariant | null => {
    if (initialProduct?.variants?.length > 0) {
      return (
        initialProduct.variants.find((v) => v.is_default) ??
        initialProduct.variants[0]
      );
    }
    return null;
  };

  const initialVar = getInitialVariant();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    initialVar,
  );

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(initialVar?.attributes || {});

  const [quantity, setQuantity] = useState(() => {
    const rawMin = Number(initialProduct?.minimum_order_quantity) || 1;
    const step = Number(initialProduct?.quantity_step_size) || 1;
    return Math.ceil(rawMin / step) * step;
  });
  const [loading, setLoading] = useState({ buyNow: false, add: false });
  const [cookingRequest, setCookingRequest] = useState("");
  const [showCookingRequest, setShowCookingRequest] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();
  const { currencySymbol } = useSettings();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const cartData = useSelector((state: RootState) => state.cart.cartData);
  const offlineCartItems = useSelector(
    (state: RootState) => state.offlineCart.items,
  );

  const cartItem = useMemo(() => {
    if (isLoggedIn) {
      return cartData?.items?.find(
        (item) => item.product_variant_id === selectedVariant?.id,
      );
    } else {
      return offlineCartItems?.find(
        (item) => item.product_variant_id === selectedVariant?.id,
      );
    }
  }, [cartData, offlineCartItems, selectedVariant?.id, isLoggedIn]);

  // Sync quantity with cart if item is already present
  useEffect(() => {
    if (cartItem && cartItem.quantity > 0) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  const {
    title = "",
    short_description = "",
    ratings = 0,
    rating_count = 0,
    variants,
    is_inclusive_tax,
    quantity_step_size = 1,
    minimum_order_quantity = 1,
    indicator,
  } = initialProduct;

  console.log(initialProduct);
  const isStoreOpen =
    initialProduct?.store_status?.is_open !== undefined
      ? initialProduct.store_status.is_open
      : true;
  
  const isOutOfStock = selectedVariant ? !selectedVariant.availability : false;

  // Set default variant on load
  useEffect(() => {
    if (variants?.length > 0) {
      const defaultVariant = variants.find((v) => v.is_default) ?? variants[0];
      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedAttributes(defaultVariant.attributes || {});
      }
    }
  }, [variants]);

  // Match variant from selected attributes
  useEffect(() => {
    if (variants && Object.keys(selectedAttributes).length > 0) {
      const match = variants.find((v) =>
        Object.entries(selectedAttributes).every(
          ([key, val]) => v.attributes?.[key] === val,
        ),
      );
      if (match) {
        setSelectedVariant(match);

        onVariantChange?.(match);
      }
    }
  }, [selectedAttributes, variants, onVariantChange]);

  const handleAttributeChange = (attributeSlug: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeSlug]: value }));
  };

  const handleAddToCartAction = async (buyNow = false) => {
    setLoading({ add: !buyNow, buyNow });
    try {
      if (quantity <= 0) {
        addToast({
          title: t("invalid_quantity", "Invalid Quantity"),
          description: t(
            "quantity_must_be_greater_than_zero",
            "Quantity must be greater than zero",
          ),
          color: "danger",
        });
        setLoading({ buyNow: false, add: false });
        return;
      }

      if (!selectedVariant) {
        addToast({ title: t("please_select_variant"), color: "warning" });
        setLoading({ buyNow: false, add: false });
        return;
      }

      const hasAddons = (selectedVariant?.addon_groups?.length ?? 0) > 0;
      const isSimpleProduct =
        initialProduct.type === "simple" ||
        (initialProduct.variants?.length ?? 0) <= 1;

      if (!isSimpleProduct || hasAddons) {
        onOpenModal?.(quantity);
        return;
      }

      if (!isLoggedIn) {
        const res = handleOfflineAddToCart({
          product: initialProduct,
          variant: selectedVariant,
          quantity,
          replace_quantity: true,
          renderToast: true,
        });
        if (buyNow && res?.success) router.push("/cart");
        return;
      }

      const res = await handleAddToCart({
        product_variant_id: selectedVariant?.id || "",
        store_id: selectedVariant?.store_id || "",
        quantity,
        replace_quantity: true,
        onClose: () => {},
        renderToast: true,
      });

      if (res?.success) {
        document.getElementById("specific-product-refetch")?.click();
        if (buyNow) router.push("/cart");
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setLoading({ buyNow: false, add: false });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/restaurant/item/${initialProduct.slug}`;
    if (navigator.share) {
      navigator
        .share({ title, text: `Order ${title} online!`, url: shareUrl })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast({
        title: t("link_copied_to_clipboard") || "Link copied to clipboard",
        color: "success",
      });
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Top Badges: Bestseller / Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {indicator && <ProductIndicator indicator={indicator} size={20} />}
        </div>

        {initialProduct?.estimated_delivery_time && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-zinc-900 rounded-full border border-gray-100 dark:border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-[#019CBF]" />
            <span className="text-xs font-bold text-gray-600 dark:text-zinc-400">
              {initialProduct.estimated_delivery_time} {t("mins")}
            </span>
          </div>
        )}
      </div>

      {/* Title + Share */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex-1">
          {title}
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => setIsBookmarked(!isBookmarked)}
            className={`${isBookmarked ? "text-red-500 fill-red-500" : "text-gray-400"} hover:text-red-500 transition-all`}
            aria-label="Favorite item"
          >
            <Heart size={20} className={isBookmarked ? "fill-red-500 text-red-500" : ""} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={handleShare}
            className="text-gray-400 hover:text-[#019CBF] flex-shrink-0"
            aria-label="Share item"
          >
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      {/* Short description */}
      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4 leading-relaxed">
        {short_description}
      </p>

      {/* Star rating */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(Number(ratings))
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200 dark:text-zinc-700"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-gray-500">
          {ratings} ({rating_count} {t("reviews")})
        </span>
      </div>

      {/* Price Section */}
      <div className="flex items-center gap-3 mb-6">
        {selectedVariant && selectedVariant.special_price > 0 ? (
          <>
            <span className="text-4xl font-black text-gray-900 dark:text-white">
              {currencySymbol}
              {Number(selectedVariant.special_price || 0).toFixed(2)}
            </span>
            <span className="text-base text-gray-400 line-through">
              {currencySymbol}
              {Number(selectedVariant.price || 0).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-4xl font-black text-gray-900 dark:text-white">
            {currencySymbol}
            {Number(selectedVariant?.price || 0).toFixed(2)}
          </span>
        )}
        <span className="text-sm text-gray-400 dark:text-zinc-500 ml-1 font-medium">
          ( {t("inclusiveTax") || "Include All Taxes"} )
        </span>
      </div>

      {/* Variant selector (if applicable) */}
      {variants && variants.length > 1 && initialProduct.attributes && (
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            Customize Your Order
          </h3>
          {initialProduct.attributes.map((attribute) => (
            <AttributeSelector
              key={attribute.slug}
              attribute={attribute}
              selectedAttributes={selectedAttributes}
              onChange={handleAttributeChange}
            />
          ))}
        </div>
      )}

      {/* Out of stock warning (Conditional) */}
      {isOutOfStock && (
        <div className="flex items-center gap-2 mb-6 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
          <span className="text-sm font-bold uppercase">{t("sold_out")}</span>
          <span className="text-xs font-medium">• {t("check_back_later")}</span>
        </div>
      )}

      {/* Quantity + Delivery Badge */}
      {!isOutOfStock && isStoreOpen && (
        <div className="flex items-center gap-4 sm:gap-8 mb-8">
          <div className="flex items-center gap-3">
            <label
              htmlFor="qty-input"
              className="text-sm font-semibold text-gray-700 dark:text-zinc-300"
            >
              {t("quantity")}:
            </label>
            <QtyInput
              quantity={quantity}
              setQuantity={setQuantity}
              min={
                Math.ceil(
                  (Number(minimum_order_quantity) || 1) /
                    (Number(quantity_step_size) || 1),
                ) * (Number(quantity_step_size) || 1)
              }
              step={Number(quantity_step_size) || 1}
              max={Number(initialProduct.total_allowed_quantity) || 9999}
            />
          </div>
        </div>
      )}

      {/* Store closed banner */}
      {!isStoreOpen && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-zinc-900 dark:border-zinc-700 p-4 mb-4 flex items-start gap-3">
          <Store className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {t("store_currently_closed")}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {t("store_closed_message")}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isStoreOpen && !isOutOfStock && (
        <div className="flex gap-4">
          <button
            onClick={() => handleAddToCartAction(false)}
            disabled={loading.add || loading.buyNow}
            className="flex-1 flex items-center justify-center gap-2 h-12 font-bold text-white bg-[#019CBF] border-2 border-[#019CBF] rounded-[10px] shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
          >
            <ShoppingBag className="w-4 h-4" />
            {loading.add ? t("loading") || "Loading..." : "Add to Cart"}
          </button>

          <button
            onClick={() => handleAddToCartAction(true)}
            disabled={loading.add || loading.buyNow}
            className="flex-1 flex items-center justify-center gap-2 h-12 font-bold text-white bg-[#7C3AED] border-2 border-[#7C3AED] rounded-[10px] shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
          >
            {loading.buyNow ? t("loading") || "Loading..." : "Buy Now"}
            <MoveRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Product Tags */}
      {(() => {
        let tagsArray: string[] = [];
        if (Array.isArray(initialProduct?.tags)) {
          tagsArray = initialProduct.tags;
        } else if (typeof initialProduct?.tags === "string") {
          try {
            const parsed = JSON.parse(initialProduct.tags);
            if (Array.isArray(parsed)) tagsArray = parsed;
          } catch (e) {
            tagsArray = (initialProduct.tags as string)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
          }
        }

        if (tagsArray.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-2 mt-8">
            {tagsArray.map((tag: string, index: number) => (
              <Chip
                title={`# ${tag}`}
                color="default"
                variant="flat"
                key={index}
                radius="sm"
                className="text-xs font-bold text-gray-500"
              >
                {`# ${tag}`}
              </Chip>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default RestaurantItemDetailSection;
