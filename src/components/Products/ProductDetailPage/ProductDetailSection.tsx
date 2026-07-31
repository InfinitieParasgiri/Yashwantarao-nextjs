import { Button, Card, Chip, Divider, Link, addToast, useDisclosure } from "@heroui/react";
import {
  Clock,
  MoveRight,
  ShoppingBag,
  Star,
  Store,
  Users,
  Share2,
  Heart,
} from "lucide-react";
import { FC, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import QtyInput from "./QtyInput";
import AdditionalSection from "./AdditionalSection";
import { Product, ProductVariant } from "@/types/ApiResponse";
import {
  handleAddToCart,
  makeTabClick,
  handleOfflineAddToCart,
} from "@/helpers/functionalHelpers";
import { useSettings } from "@/contexts/SettingsContext";
import AttributeSelector from "@/components/Functional/AttributeSelector";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import ProductIndicator from "@/components/Functional/ProductIndicator";

const WishlistModal = dynamic(
  () => import("@/components/Modals/WishlistModal"),
  { ssr: false }
);

interface ProductDetailSectionProps {
  initialProduct: Product;
  onVariantChange?: (variant: ProductVariant) => void;
  onOpenModal?: () => void;
}

const ProductDetailSection: FC<ProductDetailSectionProps> = ({
  initialProduct,
  onVariantChange,
  onOpenModal,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  const [quantity, setQuantity] = useState(() => {
    const minQty = Number(initialProduct?.minimum_order_quantity) || 1;
    const step = Number(initialProduct?.quantity_step_size) || 1;
    return Math.ceil(minQty / step) * step;
  });

  const [loading, setLoading] = useState({ buyNow: false, add: false });
  const router = useRouter();
  const { t } = useTranslation();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  const [localFavorites, setLocalFavorites] = useState(initialProduct?.favorite || []);

  useEffect(() => {
    setLocalFavorites(initialProduct?.favorite || []);
  }, [initialProduct?.favorite]);

  const {
    isOpen: isWishlistOpen,
    onOpen: onWishlistOpen,
    onClose: onWishlistClose,
  } = useDisclosure();

  const handleWishlistOpen = () => {
    if (isLoggedIn) {
      onWishlistOpen();
    } else {
      const btn = document.getElementById("login-btn");
      btn?.click();
      addToast({
        title: t("please_login"),
        color: "warning",
      });
    }
  };

  const handleWishlistUpdate = (wishlistId: string, action: "add" | "remove") => {
    if (action === "add") {
      setLocalFavorites([...localFavorites, { wishlist_id: wishlistId || "new" } as any]);
    } else {
      setLocalFavorites(localFavorites.filter(fav => fav.wishlist_id.toString() !== wishlistId.toString()));
    }
  };

  const cartData = useSelector((state: RootState) => state.cart.cartData);
  const offlineCartItems = useSelector((state: RootState) => state.offlineCart.items);

  const cartItem = useMemo(() => {
    if (isLoggedIn) {
      return cartData?.items?.find((item) => item.product_variant_id === selectedVariant?.id);
    } else {
      return offlineCartItems?.find((item) => item.product_variant_id === selectedVariant?.id);
    }
  }, [cartData, offlineCartItems, selectedVariant?.id, isLoggedIn]);

  // Sync quantity with cart if item is already present
  useEffect(() => {
    if (cartItem && cartItem.quantity > 0) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  const cartCount = Number(initialProduct.item_count_in_cart) || 0;

  const {
    category = "",
    category_name = "",
    brand = "",
    brand_name = "",
    title = "",
    short_description = "",
    ratings = 0,
    rating_count = 0,
    variants,
    is_inclusive_tax,
    quantity_step_size = 1,
    minimum_order_quantity = 1,
    featured = "0",
    indicator,
  } = initialProduct;

  const { currencySymbol } = useSettings();
  const isStoreOpen = initialProduct?.store_status?.is_open;
  const activeModule = useSelector((state: RootState) => state.module?.activeModule);

  const isOutOfStock = selectedVariant
    ? activeModule !== "restaurant" && (!selectedVariant.availability || selectedVariant.stock <= 0)
    : false;

  // Grocery-only: product_display_status is not 'online' — cart/buy blocked, navigation allowed
  const isGroceryOffline =
    activeModule !== "restaurant" &&
    initialProduct.product_display_status !== undefined &&
    initialProduct.product_display_status !== "online";

  // Initialize selected attributes and variant when product changes
  useEffect(() => {
    if (variants && variants.length > 0) {
      const defaultVariant = variants.find((v) => v.is_default) || variants[0];

      if (defaultVariant) {
        setSelectedVariant(defaultVariant);
        setSelectedAttributes(defaultVariant.attributes || {});
      }
    }
  }, [variants]);

  // Find variant based on selected attributes
  useEffect(() => {
    if (variants && Object.keys(selectedAttributes).length > 0) {
      const matchingVariant = variants.find((variant) => {
        return Object.entries(selectedAttributes).every(([key, value]) => {
          return variant.attributes && variant.attributes[key] === value;
        });
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        const minQ = Number(initialProduct?.minimum_order_quantity) || 1;
        const step = Number(initialProduct?.quantity_step_size) || 1;
        const validMin = Math.ceil(minQ / step) * step;

        // Reset quantity if it exceeds new variant's stock (except for restaurant module)
        if (activeModule !== "restaurant") {
          setQuantity((prev) => Math.max(validMin, Math.min(prev, matchingVariant.stock)));
        } else {
          // For restaurant, just ensure it's at least validMin
          setQuantity((prev) => Math.max(validMin, prev));
        }
        // Notify parent component about variant change
        onVariantChange?.(matchingVariant);
      }
    }
  }, [selectedAttributes, variants, onVariantChange, activeModule]);

  const handleAttributeChange = (attributeSlug: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeSlug]: value,
    }));
  };

  const AddToCart = async (buyNow = false) => {
    setLoading({ add: !buyNow, buyNow });
    try {
      if (quantity <= 0) {
        addToast({
          title: t("invalid_quantity", "Invalid Quantity"),
          description: t("quantity_must_be_greater_than_zero", "Quantity must be greater than zero"),
          color: "danger",
        });
        setLoading({ buyNow: false, add: false });
        return;
      }
      if (!selectedVariant) {
        addToast({
          title: t("please_select_variant"),
          color: "warning",
        });
        return;
      }

      // Check for addons — if present, open the customization modal
      const hasAddons = selectedVariant.addon_groups && selectedVariant.addon_groups.length > 0;
      if (hasAddons) {
        onOpenModal?.();
        return;
      }

      // Handle offline cart when user is not logged in
      if (!isLoggedIn) {
        // Add to offline cart
        const res = handleOfflineAddToCart({
          product: initialProduct,
          variant: selectedVariant,
          quantity: quantity,
          replace_quantity: true,
          renderToast: true,
        });

        if (buyNow && res?.success) {
          router.push("/cart");
        }
        return;
      }

      // Handle online cart when user is logged in
      const res = await handleAddToCart({
        product_variant_id: selectedVariant?.id || "",
        store_id: selectedVariant?.store_id || "",
        quantity: quantity,
        replace_quantity: true,
        onClose: () => { },
        renderToast: true,
        dark_store_id: activeModule === "grocery" ? selectedVariant?.dark_store_id : undefined,
      });

      if (res?.success) {
        // Re-fetch the product so item_count_in_cart updates live (no page refresh needed)
        document.getElementById("specific-product-refetch")?.click();

        if (buyNow) {
          router.push("/cart");
        }
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setLoading({ buyNow: false, add: false });
    }
  };
  return (
    <div className="md:px-4 w-full flex flex-col gap-2">
      <div className="flex gap-4 items-center">
        {/* Product Category */}
        <Link
          href={`/categories/${category}`}
          className="text-foreground/50 text-xs md:text-medium capitalize"
        >
          {category_name}
        </Link>
        {featured == "1" && (
          <Chip
            className="text-xxs bg-linear-to-r from-secondary-300 to-secondary-400 capitalize text-white font-semibold shadow-sm tracking-wide"
            classNames={{
              base: "p-1 h-5",
              content: "p-1 text-xs",
            }}
            radius="sm"
            startContent={<Star size={10} className="fill-current" />}
            title={t("featured")}
          >
            {t("featured")}
          </Chip>
        )}
      </div>

      <div className="flex justify-between items-start gap-4">
        <h1 className="font-semibold text-medium md:text-3xl flex-1">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={handleWishlistOpen}
            className="text-gray-400 hover:text-red-500 transition-all shrink-0"
            aria-label="Wishlist item"
            title={t("pageTitle.wishlists")}
          >
            <Heart
              size={20}
              className={
                localFavorites.length > 0
                  ? "fill-red-500 text-red-500"
                  : "text-foreground/60"
              }
            />
          </Button>
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => {
              const baseUrl = window.location.origin;
              const cookieLoc = document.cookie
                .split("; ")
                .find((row) => row.startsWith("userLocation="));
              const userLocStr = cookieLoc
                ? decodeURIComponent(cookieLoc.split("=")[1])
                : null;
              let lat = "";
              let lng = "";
              if (userLocStr) {
                try {
                  const parsed = JSON.parse(userLocStr);
                  lat = parsed.lat || "";
                  lng = parsed.lng || "";
                } catch (e) { console.error("Failed to parse user location from cookie:", e); }
              }
              let shareUrl = `${baseUrl}/share/products/${initialProduct.slug}`;
              if (lat && lng) {
                shareUrl += `?lat=${lat}&lng=${lng}`;
              }

              if (navigator.share) {
                navigator
                  .share({
                    title: title,
                    text: `Check out ${title} on Hyper Local!`,
                    url: shareUrl,
                  })
                  .catch(console.error);
              } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(shareUrl);
                addToast({
                  title: "Link copied to clipboard",
                  color: "success",
                });
              }
            }}
            className="text-foreground/50 hover:text-primary shrink-0"
            aria-label="Share item"
          >
            <Share2 size={20} />
          </Button>
        </div>
      </div>
      <p className="text-foreground/50 text-xs md:text-medium">
        {short_description}
      </p>

      <div className="flex gap-4 items-center mt-2">
        {/* Rating and Reviews */}
        <article className="flex items-center gap-2">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 md:w-5 md:h-5" />
          <p className="font-medium text-xs md:text-medium">{`${ratings} Rating`}</p>
          <Link
            onPress={() => {
              makeTabClick("reviews");
            }}
            className="text-foreground/50 underline cursor-pointer text-xs md:text-medium"
          >
            {`(${rating_count} ${t("reviews")})`}
          </Link>
        </article>
        {brand_name && (
          <>
            <span className="text-foreground/40">|</span>

            <Link
              href={`/brands/${brand}`}
              className="text-primary text-xs md:text-medium capitalize font-semibold"
            >
              {brand_name}
            </Link>
          </>
        )}

        {indicator && (
          <>
            <span className="text-foreground/40">|</span>

            <ProductIndicator indicator={indicator} size={18} />
          </>
        )}
      </div>

      {cartCount > 0 && (
        <div className="flex items-center gap-1.5 py-1">
          <Chip
            className="text-xs bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold shadow-sm"
            classNames={{
              base: "h-5 px-2",
              content: "px-1 text-xs flex items-center gap-1",
            }}
            radius="sm"
            startContent={<Users size={14} className="shrink-0" />}
          >
            {cartCount > 99 ? "99+" : cartCount} {t("product_modal.in_cart")}
          </Chip>
        </div>
      )}
      {/* Price Section */}
      <div className="mt-3 flex gap-2 items-center">
        <div>
          {selectedVariant && selectedVariant?.special_price > 0 ? (
            <div className="flex items-center gap-2">
              <div
                // className="text-xl md:text-3xl text-white font-bold bg-[#329537]  px-2 py-1 rounded-lg
                // shadow-[4px_4px_0px_rgba(0,0,0,0.6)]"
                className="text-xl md:text-3xl font-bold"
              >
                <span className="text-2xl"> {currencySymbol}</span>
                <span className=" ml-1">
                  {Number(selectedVariant?.special_price || 0).toFixed(2)}
                </span>
              </div>

              <span className="text-xs md:text-medium text-foreground/50 line-through mt-2">
                {currencySymbol}
                {Number(selectedVariant?.price || 0).toFixed(2)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-lg font-semibold text-primary">
                {currencySymbol}
                {Number(selectedVariant?.price || 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {is_inclusive_tax && (
          <span className="text-xs md:text-sm text-foreground/50">
            {t("inclusiveTax")}
          </span>
        )}
      </div>
      <Divider className="my-4" />

      {variants && variants.length > 1 && initialProduct.attributes && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("selectOptions")}
          </h3>
          <div className="flex items-center justify-between text-xxs sm:text-xs">
            <div className="flex flex-col">
              {activeModule !== "restaurant" && (
                <span className="text-foreground/50">
                  {t("stockAvailable", { stock: selectedVariant?.stock })}
                </span>
              )}
              {(minimum_order_quantity > 1 || quantity_step_size > 1) && (
                <span className="text-foreground/50 text-xs">
                  {t("minStep", {
                    min: minimum_order_quantity,
                    stepText:
                      quantity_step_size > 1
                        ? `, Step: ${quantity_step_size}`
                        : "",
                  })}
                </span>
              )}
            </div>
            {selectedVariant?.sku && (
              <span className="text-foreground/50">
                {t("sku")}: {selectedVariant.sku}
              </span>
            )}
          </div>
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

      {/* Stock and SKU info for single variant products */}
      {variants && variants.length === 1 && selectedVariant && (
        <div className="flex items-center justify-between text-xxs sm:text-xs mb-2">
          <div className="flex flex-col">
            {activeModule !== "restaurant" && (
              <span className="text-foreground/50">
                {t("stockAvailable", { stock: selectedVariant.stock })}
              </span>
            )}
            {(minimum_order_quantity > 1 || quantity_step_size > 1) && (
              <span className="text-foreground/50 text-xs">
                {t("minStep", {
                  min: minimum_order_quantity,
                  stepText:
                    quantity_step_size > 1
                      ? `, Step: ${quantity_step_size}`
                      : "",
                })}
              </span>
            )}
          </div>
          {selectedVariant.sku && (
            <span className="text-foreground/50">
              {t("sku")}: {selectedVariant.sku}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-between max-w-md items-center">
            {!isOutOfStock ? (
              <>
                <div className="flex items-center gap-4 w-full">
                  <label htmlFor="qty-input" className="font-medium">
                    {t("quantity")}
                  </label>
                  <QtyInput
                    quantity={quantity}
                    setQuantity={setQuantity}
                    min={
                      Math.ceil(
                        (Number(initialProduct.minimum_order_quantity) || 1) /
                          (Number(initialProduct.quantity_step_size) || 1)
                      ) * (Number(initialProduct.quantity_step_size) || 1)
                    }
                    step={Number(initialProduct.quantity_step_size) > 0 ? Number(initialProduct.quantity_step_size) : 1}
                    max={Number(initialProduct.total_allowed_quantity) > 0 ? Number(initialProduct.total_allowed_quantity) : 9999}
                    stock={activeModule === "restaurant" ? 999999 : selectedVariant?.stock}
                  />
                </div>
                {/* Estimated Delivery Time on right side */}
                {initialProduct?.estimated_delivery_time ? (
                  <div className="flex gap-4">
                    <Button
                      variant="flat"
                      color="primary"
                      as={"div"}
                      size="sm"
                      className="text-xs"
                      startContent={
                        <Clock className="w-4 h-4 text-primary-500" />
                      }
                    >
                      <div className="text-xs text-primary-500 font-semibold whitespace-nowrap flex items-center">
                        <span className="mr-2">{t("delivery")}:</span>
                        {initialProduct.estimated_delivery_time} {t("mins")}
                      </div>
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {(!isStoreOpen || isGroceryOffline) ? (
          <div className="max-w-md shadow-sm rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full">
                <Store className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1">
                  {t("store_currently_closed")}
                </h3>
                <p className="text-foreground/50 text-xs mb-3">
                  {t("store_closed_message")}
                </p>
                {initialProduct?.store_status?.next_opening_time && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm max-w-fit text-foreground/80">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium ">
                      {t("opens_at", {
                        time: initialProduct.store_status.next_opening_time,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : isOutOfStock ? (
          <Card
            shadow="none"
            className="max-w-md border p-3 border-gray-100 dark:border-default-100"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full">
                <ShoppingBag className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1 text-red-600">
                  {t("out_of_stock")}
                </h3>
                <p className="text-foreground/50 text-xs">
                  {t("out_of_stock_message")}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          // Store is OPEN - Show normal buttons
          <div className="flex justify-between items-center max-w-md gap-4">
            <Button
              color="primary"
              fullWidth
              startContent={<ShoppingBag className="w-4 h-4" />}
              isLoading={loading.add}
              isDisabled={loading.buyNow}
              onPress={() => AddToCart(false)}
            >
              {t("addToBucket")}
            </Button>
            <Button
              endContent={<MoveRight className="w-4 h-4" />}
              color="secondary"
              fullWidth
              isLoading={loading.buyNow}
              isDisabled={loading.add}
              onPress={() => AddToCart(true)}
            >
              {t("buyNow")}
            </Button>
          </div>
        )}

        {/* Product Tags */}
        {initialProduct?.tags && initialProduct.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {initialProduct.tags.map((tag: string, index: number) => (
              <Chip
                title={`# ${tag}`}
                color="primary"
                variant="flat"
                key={index}
                radius="sm"
              >
                {`# ${tag}`}
              </Chip>
            ))}
          </div>
        )}

        <div>
          <AdditionalSection product={initialProduct} />
        </div>
      </div>

      {isWishlistOpen && (
        <WishlistModal
          isOpen={isWishlistOpen}
          onClose={onWishlistClose}
          productId={initialProduct.id}
          productVariantId={selectedVariant?.id || initialProduct.variants?.[0]?.id}
          storeId={selectedVariant?.store_id || initialProduct.variants?.[0]?.store_id}
          favorite={localFavorites}
          onWishlistUpdate={handleWishlistUpdate}
        />
      )}
    </div>
  );
};

export default ProductDetailSection;
