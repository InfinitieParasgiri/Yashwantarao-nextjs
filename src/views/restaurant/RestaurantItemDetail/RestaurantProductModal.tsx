import { FC, useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Image,
  addToast,
  useDisclosure,
} from "@heroui/react";
import dynamic from "next/dynamic";

const WishlistModal = dynamic(
  () => import("@/components/Modals/WishlistModal"),
  { ssr: false },
);

import { ShoppingBag, Plus, Minus, X, Heart, Share2 } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import {
  Product,
  ProductVariant,
  AddonGroup,
  AddonGroupItem,
} from "@/types/ApiResponse";
import {
  handleAddToCart,
  handleOfflineAddToCart,
  handleUpdateCartItem,
  handleUpdateOfflineCartItem,
} from "@/helpers/functionalHelpers";

import AttributeSelector from "@/components/Functional/AttributeSelector";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { addRecentlyViewed } from "@/lib/redux/slices/recentlyViewedSlice";
import { trackProductView } from "@/lib/analytics";

interface RestaurantProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant | null;
  initialSelectedAddons?: Record<number, number[]>;
  editingCartItemId?: number | string | null;
  editingQuantity?: number;
}

/**
 * RestaurantProductModal
 * A highly tailored food-delivery customization modal matching the Figma design.
 * Features a gorgeous full-width cover image, localized dietary tags, bookmark & share icons,
 * high-fidelity toppings & extra lists, and a sticky bottom footer bar.
 */
const RestaurantProductModal: FC<RestaurantProductModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant: initialVariantProp,
  editingCartItemId = null,
  editingQuantity,
  initialSelectedAddons,
}) => {
  const { currencySymbol, systemSettings } = useSettings();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const cartData = useSelector((state: RootState) => state.cart.cartData);
  const {
    isOpen: isWishlistOpen,
    onOpen: onWishlistOpen,
    onClose: onWishlistClose,
  } = useDisclosure();

  const [quantity, setQuantity] = useState(() => {
    const rawMin = Number(product?.minimum_order_quantity) || 1;
    const step = Number(product?.quantity_step_size) || 1;
    return Math.ceil(rawMin / step) * step;
  });
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<
    Record<number, number[]>
  >({});
  const isFirstRender = useRef(true);

  // Initialize selected variant and addons
  useEffect(() => {
    if (!isOpen) {
      isFirstRender.current = true;
      return;
    }
    if (!product) return;

    let initialVariant = null;
    if (product.variants && product.variants.length > 0) {
      const variantToSelect = editingCartItemId
        ? product.variants.find((v) => v.id === selectedVariant?.id) ||
          product.variants.find((v) => v.is_default) ||
          product.variants[0]
        : initialVariantProp || product.variants.find((v) => v.is_default) || product.variants[0];

      if (variantToSelect) {
        initialVariant = variantToSelect;
        setSelectedVariant(variantToSelect);
        setSelectedAttributes(variantToSelect.attributes || {});
        setSelectedAddons(initialSelectedAddons || {});
      }
    }

    // Set quantity regardless of variants
    const variantId =
      initialVariant?.id || selectedVariant?.id || (product.variants && product.variants[0]?.id);
    const cartItem = cartData?.items?.find(
      (item) => item.product_variant_id === variantId,
    );
    const step = Number(product?.quantity_step_size) || 1;
    const minQ = Number(product?.minimum_order_quantity) || 1;
    const validMin = Math.ceil(minQ / step) * step;

    setQuantity(editingQuantity || cartItem?.quantity || validMin);

    dispatch(addRecentlyViewed(product));
    trackProductView(
      product.id.toString(),
      product.title,
      product.category_name,
      initialVariant?.price || selectedVariant?.price || product.variants?.[0]?.price,
    );
  }, [isOpen, product.id]);

  // Handle auto-matching variants based on attribute selections
  useEffect(() => {
    if (product.variants && Object.keys(selectedAttributes).length > 0) {
      const matchingVariant = product.variants.find((variant) => {
        return Object.entries(selectedAttributes).every(([key, value]) => {
          return variant.attributes && variant.attributes[key] === value;
        });
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        setSelectedAddons({});

        const cartItem = cartData?.items?.find(
          (item) => item.product_variant_id === matchingVariant.id,
        );
        const step = Number(product?.quantity_step_size) || 1;
        const minQ = Number(product?.minimum_order_quantity) || 1;
        const validMin = Math.ceil(minQ / step) * step;

        if (isFirstRender.current) {
          const newQuantity = editingQuantity || cartItem?.quantity || validMin;
          setQuantity(newQuantity);
          isFirstRender.current = false;
        }
      }
    }
  }, [selectedAttributes, cartData, product, editingQuantity]);

  const handleWishlistOpen = () => {
    if (isLoggedIn) {
      onWishlistOpen();
    } else {
      const btn = document.getElementById("login-btn");
      btn?.click();
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/restaurant/item/${product.slug}`;
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.short_description || "",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        addToast({
          title: t("link_copied") || "Link copied to clipboard",
          color: "success",
        });
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  if (!selectedVariant) return null;

  const handleAttributeChange = (attributeSlug: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeSlug]: value,
    }));
  };

  const rawMin = Number(product.minimum_order_quantity) || 1;
  const stepSize = Number(product.quantity_step_size) || 1;
  const minQuantity = Math.ceil(rawMin / stepSize) * stepSize;
  const maxQuantity = Number(product.total_allowed_quantity) || 9999;

  const handleQuantityDecrease = () => {
    const newQuantity = quantity - stepSize;
    if (newQuantity < minQuantity) {
      addToast({
        title: t("min_quantity_error_title"),
        description: t("min_quantity_error_description", { min: minQuantity }),
        color: "danger",
      });
      return;
    }
    setQuantity(Math.max(newQuantity, minQuantity));
  };

  const handleQuantityIncrease = () => {
    const newQuantity = quantity + stepSize;
    if (newQuantity > maxQuantity) {
      addToast({
        title: t("max_quantity_error_title"),
        description: t("max_quantity_error_description", { max: maxQuantity }),
        color: "danger",
      });
      return;
    }
    setQuantity(Math.min(newQuantity, maxQuantity));
  };

  const handleAddonChange = (
    group: AddonGroup,
    itemId: number,
    checked: boolean,
  ) => {
    setSelectedAddons((prev) => {
      const current = prev[group.id] || [];
      if (group.selection_type === "single") {
        return { ...prev, [group.id]: checked ? [itemId] : [] };
      }
      if (checked) {
        return { ...prev, [group.id]: [...current, itemId] };
      }
      return { ...prev, [group.id]: current.filter((id) => id !== itemId) };
    });
  };

  const AddToCartAction = async () => {
    // Validate required addon groups
    const missingRequired = (selectedVariant?.addon_groups || []).filter(
      (group) => group.is_required && !(selectedAddons[group.id]?.length > 0),
    );
    if (missingRequired.length > 0) {
      addToast({
        title: t("product_modal.addons_required_title") || "Selection Required",
        description: `${missingRequired.map((g) => g.title).join(", ")} ${
          t("product_modal.addons_required_description") || "is required."
        }`,
        color: "danger",
      });
      return;
    }

    if (quantity <= 0) {
      addToast({
        title: t("invalid_quantity", "Invalid Quantity"),
        description: t(
          "quantity_must_be_greater_than_zero",
          "Quantity must be greater than zero",
        ),
        color: "danger",
      });
      return;
    }

    setLoading(true);

    const addonsForApi = Object.entries(selectedAddons).flatMap(
      ([groupId, itemIds]) => {
        const group = (selectedVariant?.addon_groups || []).find(
          (g) => g.id === Number(groupId),
        );
        return itemIds.map((itemId) => {
          const item = (group?.items || []).find((i) => i.id === itemId);
          return {
            addon_group_id: Number(groupId),
            addon_item_id: Number(itemId),
            title: item?.title || "",
            price: item?.price || 0,
            addon_group_name: group?.title || "",
          };
        });
      },
    );

    try {
      if (editingCartItemId) {
        if (isLoggedIn) {
          await handleUpdateCartItem({
            cartItemId: editingCartItemId,
            quantity: quantity,
            addons: addonsForApi,
            onClose: onClose,
            renderToast: true,
          });
        } else {
          handleUpdateOfflineCartItem({
            product,
            variant: selectedVariant,
            quantity: quantity,
            oldId: String(editingCartItemId),
            onClose,
            addons: addonsForApi,
          });
        }
      } else if (isLoggedIn) {
        await handleAddToCart({
          product_variant_id: selectedVariant.id,
          store_id: selectedVariant.store_id,
          quantity: quantity,
          onClose: onClose,
          renderToast: true,
          addons: addonsForApi,
        });
      } else {
        handleOfflineAddToCart({
          product,
          variant: selectedVariant,
          quantity,
          onClose,
          addons: addonsForApi,
        });
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const addonGroups: AddonGroup[] = selectedVariant?.addon_groups || [];
  const addonTotalPrice = addonGroups.reduce((groupSum, group) => {
    const selectedIds = selectedAddons[group.id] || [];
    return (
      groupSum +
      group.items
        .filter((item) => selectedIds.includes(item.id))
        .reduce((s, item) => s + item.price, 0)
    );
  }, 0);

  const price = Number(selectedVariant?.price) || 0;
  const specialPrice = Number(selectedVariant?.special_price) || 0;
  const hasDiscount = specialPrice > 0 && specialPrice < price;
  const finalPrice = hasDiscount ? specialPrice : price;
  const totalPrice = (finalPrice + addonTotalPrice) * quantity;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          wrapper: "items-end md:items-center justify-center",
        }}
        placement="bottom-center"
        scrollBehavior="normal"
      >
        <ModalContent className="max-w-[390px] w-full mx-auto rounded-t-[24px] md:rounded-[24px] overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl border-none max-h-[90vh] md:max-h-[85vh] flex flex-col">
          {/* Cover Image Header Section - Floating premium card layout with H: 220px */}
          <div className="relative w-full h-[220px] p-2 shrink-0 overflow-hidden bg-gray-55 dark:bg-zinc-900">
            {selectedVariant.image || product.main_image ? (
              <Image
                src={selectedVariant.image || product.main_image || ""}
                alt={product.title}
                className="w-full h-full object-cover rounded-[16px]"
                removeWrapper
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 rounded-[16px] flex items-center justify-center">
                <span className="text-gray-400 dark:text-zinc-500 font-medium text-sm text-center px-4">
                  No Image Available
                </span>
              </div>
            )}

            {/* Circular Glassmorphic Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 hover:scale-105 active:scale-95 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
              aria-label="Close customization modal"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Modal Scrollable Body - Middle area scrolls under top image and above checkout footer */}
          <ModalBody className="p-5 space-y-6 select-none overflow-y-auto flex-1 scrollbar-thin">
            {/* Main Info Section */}
            <div className="border-b border-gray-100 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between">
                {/* Dietary Indicator */}
                {product.indicator && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                        product.indicator === "veg"
                          ? "border-green-600"
                          : "border-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.indicator === "veg"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 capitalize">
                      {product.indicator.replace("_", " ")}
                    </span>
                  </div>
                )}

                {/* Share & Bookmark Actions */}
                <div className="flex items-center gap-3 text-gray-400">
                  <button
                    onClick={handleWishlistOpen}
                    className={`hover:text-gray-900 dark:hover:text-white transition-colors ${
                      Array.isArray(product.favorite) &&
                      product.favorite.length > 0
                        ? "text-orange-500 fill-orange-500"
                        : ""
                    }`}
                  >
                    <Heart
                      size={18}
                      className={
                        Array.isArray(product.favorite) &&
                        product.favorite.length > 0
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-2 leading-tight">
                {product.title}
              </h1>

              {product.short_description && (
                <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 leading-relaxed mt-1">
                  {product.short_description}
                </p>
              )}

              {/* Star Rating Section */}
              {product.ratings !== undefined && (
                <div className="flex items-center gap-1 mt-3">
                  <RatingStars rating={Number(product.ratings)} size={12} />
                  <span className="text-xxs sm:text-xs font-bold text-gray-400 ml-1">
                    ({product.ratings}){" "}
                    {product.rating_count
                      ? `• ${product.rating_count} ${t("reviews") || "Reviews"}`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            {/* ── Attributes Selection (Size, Crust etc.) ── */}
            {product.variants &&
              product.variants.length > 1 &&
              product.attributes && (
                <div className="space-y-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                    {t("product_modal.select_options") ||
                      t("select_options") ||
                      "Select Options"}
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full capitalize">
                      {t("product_modal.required") ||
                        t("required") ||
                        "required"}
                    </span>
                  </h3>
                  {product.attributes.map((attribute) => (
                    <AttributeSelector
                      key={attribute.slug}
                      attribute={attribute}
                      selectedAttributes={selectedAttributes}
                      onChange={handleAttributeChange}
                    />
                  ))}
                </div>
              )}

            {/* ── Addon Groups (Toppings, Extras etc.) ── */}
            {addonGroups.length > 0 && (
              <div className="space-y-6 pb-2">
                {addonGroups.map((group) => {
                  const selectedIds = selectedAddons[group.id] || [];

                  // Format title to Title Case (e.g. "CHOOSE SIZE" -> "Size")
                  const rawTitle = group.title
                    .replace(/\b(choose|select|add|pick)\b/gi, "")
                    .trim();
                  const formattedTitle = rawTitle
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                  return (
                    /* Options list - Table-like single card structure enclosing the header as the first row */
                    <div
                      key={group.id}
                      className="border border-gray-200/80 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-gray-200/50 dark:divide-zinc-800 bg-white dark:bg-zinc-950"
                    >
                      {/* Category Header Row inside the Table Card */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60 dark:bg-zinc-900/30 select-none">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formattedTitle}
                        </span>
                      </div>

                      {/* Options rows */}
                      {group.items
                        .filter((i) => i.is_available)
                        .map((item: AddonGroupItem) => {
                          const isChecked = selectedIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (group.selection_type === "single") {
                                  handleAddonChange(group, item.id, true);
                                } else {
                                  handleAddonChange(group, item.id, !isChecked);
                                }
                              }}
                              className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 text-gray-700 dark:text-zinc-200 transition-all duration-200 select-none"
                            >
                              {/* Left side: Option Title in regular Figma font style (NO bold) */}
                              <span className="text-xs sm:text-sm font-normal text-gray-700 dark:text-zinc-300">
                                {item.title}
                              </span>

                              {/* Right side: Amount only (NO plus symbol) + Custom Circular Green Selector */}
                              <div className="flex items-center gap-3">
                                {item.price > 0 && (
                                  <span className="text-xs sm:text-sm font-normal text-gray-750 dark:text-zinc-300">
                                    {currencySymbol}
                                    {item.price.toFixed(2)}
                                  </span>
                                )}

                                {/* Custom Figma-perfect circular selector with green border & green core dot */}
                                <div className="w-[18px] h-[18px] shrink-0 rounded-full border-2 border-[#1CA600] flex items-center justify-center transition-all bg-white dark:bg-zinc-950">
                                  {isChecked && (
                                    <div className="w-[8px] h-[8px] rounded-full bg-[#1CA600]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            )}
          </ModalBody>

          {/* Sticky Premium Bottom Bar */}
          <div className="sticky bottom-0 z-20 w-full shrink-0 bg-white dark:bg-zinc-950 border-t border-gray-200/60 p-4 space-y-4">
            {/* Row 1: Price and Quantity Selector */}
            <div className="flex items-center justify-between">
              {/* Total Price display */}
              <div className="flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none">
                  {currencySymbol}
                  {totalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-medium text-gray-400 line-through mt-1">
                    {currencySymbol}
                    {((price + addonTotalPrice) * quantity).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity selector button controls with small, square rounded-md buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleQuantityDecrease}
                  disabled={loading}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-[#019CBF] hover:bg-[#018ba8] active:scale-95 disabled:opacity-50 text-white transition-all shadow-sm"
                >
                  <Minus size={12} strokeWidth={3} />
                </button>
                <span className="w-6 text-center text-sm font-black text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={handleQuantityIncrease}
                  disabled={loading || quantity >= maxQuantity}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-[#019CBF] hover:bg-[#018ba8] active:scale-95 disabled:opacity-50 text-white transition-all shadow-sm"
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Row 2: Full-width Add to Cart primary Action Button */}
            <Button
              onClick={AddToCartAction}
              disabled={loading}
              isLoading={loading}
              className="w-full h-12 bg-[#019CBF] hover:bg-[#018ba8] text-white font-black text-sm rounded-[12px] shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} strokeWidth={2.5} />
              {"Add to Cart"}
            </Button>
          </div>
        </ModalContent>
      </Modal>
      {product && selectedVariant && (
        <WishlistModal
          isOpen={isWishlistOpen}
          onClose={onWishlistClose}
          productId={product.id}
          productVariantId={selectedVariant.id}
          storeId={selectedVariant.store_id}
          favorite={product.favorite}
        />
      )}
    </>
  );
};

export default RestaurantProductModal;
