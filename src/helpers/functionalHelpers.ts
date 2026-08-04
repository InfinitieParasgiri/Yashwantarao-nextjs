import { setUserDataRedux } from "@/lib/redux/slices/authSlice";
import { store } from "@/lib/redux/store";
import {
  addToCart,
  checkDeliveryZone,
  createOrder,
  getUserData,
  updateCartItem,
} from "@/routes/api";
import {
  ApiResponse,
  CartResponse,
  Product,
  ProductVariant,
  userData,
} from "@/types/ApiResponse";
import { addToast } from "@heroui/react";
import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";
// Import the new actions
import {
  setCartData,
  setCartLoading,
  setError,
} from "@/lib/redux/slices/cartSlice";
import { fallbackApiRes } from "@/config/constants";
import i18n from "../../i18n";
import { isValidUrl } from "./validator";
import {
  setPromoCode,
  setRusDelivery,
  setSelectedAddress,
  setUseWallet,
} from "@/lib/redux/slices/checkoutSlice";
import { updateCartData } from "./updators";
import {
  addOfflineCartItem,
  updateOfflineCartItem,
  updateOfflineCartItemQuantity,
} from "@/lib/redux/slices/offlineCartSlice";
import { trackPurchase } from "@/lib/analytics";

export const makeTabClick = (dataKey: string): void => {
  // Select the button using the data-key attribute
  const button = document.querySelector<HTMLButtonElement>(
    `button[data-key="${dataKey}"]`,
  );

  // Check if the button exists
  if (!button) {
    console.error(`Button with data-key="${dataKey}" not found.`);
    return;
  }

  // Trigger a click event on the button
  button.click();

  // Scroll the button into view
  button.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "start",
  });
};

export const updateUserDataInRedux = async () => {
  try {
    const res: ApiResponse<userData> = await getUserData();

    if (res.success) {
      store.dispatch(setUserDataRedux(res.data || {}));
    } else {
      console.error(
        "Failed to update user data in Redux:",
        res.message || "Unknown error",
      );
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error("An error occurred while updating user data:", error);
  }
};

export const handleCheckZone = async (
  latitude: string | number,
  longitude: string | number,
): Promise<boolean> => {
  try {
    const activeModule = store.getState().module?.activeModule;
    const business_type = activeModule === "courier" ? undefined : activeModule;
    const res = await checkDeliveryZone({ latitude, longitude, business_type });

    if (res.success && res.data?.is_deliverable) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking delivery zone:", error);
    return false;
  }
};

export const isAxiosError = (
  error: unknown,
): error is AxiosError<{ message?: string }> => {
  return axios.isAxiosError(error);
};

export const getUserLocationFromContext = async (
  context: GetServerSidePropsContext,
): Promise<{ lat: string; lng: string } | null> => {
  try {
    const raw = context.req.cookies.userLocation;
    if (raw) {
      let parsedLocation: { lat: string; lng: string } | null = null;
      try {
        parsedLocation = JSON.parse(decodeURIComponent(raw));
      } catch {
        parsedLocation = JSON.parse(raw);
      }
      return parsedLocation;
    }
    return null;
  } catch (error) {
    console.error("Error getting user Location from context:", error);
    return null;
  }
};

export const handleUpdateCartItem = async (params: {
  cartItemId: string | number;
  quantity: string | number;
  addons: { addon_group_id: number; addon_item_id: number }[];
  dark_store_id?: number | null;
  onClose: () => void;
  renderToast: boolean;
}) => {
  const { onClose = () => {}, renderToast = true } = params;

  try {
    store.dispatch(setCartLoading(true));

    const activeModule = store.getState().module?.activeModule || "restaurant";
    const business_type = activeModule === "courier" ? undefined : activeModule;

    const updateRes = await updateCartItem({
      cartItemId: params.cartItemId,
      quantity: params.quantity,
      addons: params.addons,
      business_type: business_type,
      dark_store_id: params.dark_store_id,
    });

    if (updateRes.success) {
      onClose();
      if (renderToast) {
        addToast({
          title: i18n.t("cart_updated_title"),
          color: "success",
        });
      }

      let passAddress = false;
      if (
        window.location.pathname === "/cart" ||
        window.location.pathname === "/cart/"
      ) {
        passAddress = true;
      }

      const cartRes = await updateCartData(passAddress, true, 0, false);
      if (cartRes?.success && cartRes.data) {
        store.dispatch(setCartData(cartRes.data));
      }
    } else {
      if (renderToast) {
        addToast({
          title: i18n.t("update_failed_title"),
          description: updateRes.message || i18n.t("update_failed_description"),
          color: "danger",
        });
      }
    }
    return updateRes;
  } catch (error) {
    console.error("handleUpdateCartItem error", error);
    if (renderToast) {
      addToast({
        title: i18n.t("cart.error_title"),
        description: i18n.t("cart.error_description"),
        color: "danger",
      });
    }
    return { success: false, message: "Error updating cart item", data: null };
  } finally {
    store.dispatch(setCartLoading(false));
  }
};

export const handleAddToCart = async (params: {
  product_variant_id: string | number;
  store_id: string | number;
  quantity: string | number;
  onClose?: () => void;
  renderToast?: boolean;
  replace_quantity?: boolean;
  addons?: { addon_group_id: number; addon_item_id: number }[];
  dark_store_id?: number | null;
}) => {
  const { onClose = () => {}, renderToast = true } = params;

  try {
    const isLoggedIn = store.getState().auth.isLoggedIn;

    if (!isLoggedIn) {
      onClose();
      const btn = document.getElementById("login-btn");
      btn?.click();
      addToast({
        title: i18n.t("cart.login_required"),
        color: "warning",
      });

      return {
        success: false,
        message: `${i18n.t("cart.login_required")}`,
        data: null,
      };
    }

    store.dispatch(setCartLoading(true));

    const activeModule = store.getState().module?.activeModule;
    const business_type = activeModule === "courier" ? undefined : activeModule;

    const { lat = "", lng = "" } =
      (getCookie("userLocation") as UserLocation) || {};

    const addRes: ApiResponse<CartResponse> = await addToCart({ 
      ...params, 
      business_type,
      latitude: lat || undefined,
      longitude: lng || undefined,
    });

    if (addRes.success) {
      // Only dispatch if the response contains a full cart (with payment_summary).
      // The addToCart API may return an incomplete cart; updateCartData fetches the full one.
      if (addRes.data?.payment_summary) {
        store.dispatch(setCartData(addRes.data));
      }
      onClose();
      if (renderToast) {
        addToast({
          title: i18n.t("cart.add_success"),
          color: "success",
        });
      }
      let passAddress = false;

      if (
        window.location.pathname === "/cart" ||
        window.location.pathname === "/cart/"
      ) {
        passAddress = true;
      }

      const cartRes = await updateCartData(passAddress, true, 0, false);

      if (cartRes?.success && cartRes.data) {
        store.dispatch(setCartData(cartRes.data));
        if (window.location.pathname.startsWith("/cart")) {
          document.getElementById("refetch-similar-products")?.click();
        }
      } else {
        store.dispatch(setError(i18n.t("cart.fetch_failed")));

        if (renderToast) {
          addToast({
            title: i18n.t("cart.fetch_failed_title"),
            description: i18n.t("cart.fetch_failed_description"),
            color: "warning",
          });
        }
      }
    } else {
      store.dispatch(setError(addRes.message || i18n.t("cart.add_failed")));
      if (renderToast) {
        addToast({
          title: i18n.t("cart.add_failed_title"),
          description: addRes.message || i18n.t("cart.add_failed_description"),
          color: "danger",
        });
      }
    }

    return addRes;
  } catch (error) {
    console.error("handleAddToCart error", error);
    store.dispatch(setError(i18n.t("cart.error_message")));
    if (renderToast) {
      addToast({
        title: i18n.t("cart.error_title"),
        description: i18n.t("cart.error_description"),
        color: "danger",
      });
    }

    return {
      success: false,
      message: i18n.t("cart.error_description"),
      data: {
        id: null,
        uuid: null,
        user_id: null,
        items_count: 0,
        total_quantity: 0,
        items: [],
        payment_summary: {
          items_total: null,
          per_store_drop_off_fee: null,
          is_rush_delivery: false,
          is_rush_delivery_available: false,
          delivery_charges: 0,
          handling_charges: 0,
          delivery_distance_charges: 0,
          delivery_distance_km: 0,
          total_stores: 0,
          total_delivery_charges: 0,
          estimated_delivery_time: 0,
          use_wallet: false,
          wallet_balance: 0,
          wallet_amount_used: 0,
          payable_amount: 0,

          promo_code: "",
          promo_discount: 0,
          promo_applied: [],
          promo_error: null,
        },
        created_at: "",
        updated_at: "",
      },
    };
  } finally {
    store.dispatch(setCartLoading(false));
  }
};

export const handleOfflineAddToCart = (params: {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  replace_quantity?: boolean;
  onClose?: () => void;
  renderToast?: boolean;
  addons?: {
    addon_group_id: number;
    addon_item_id: number;
    title: string;
    price: number;
  }[];

}) => {
  const {
    product,
    variant,
    quantity,
    replace_quantity = false,
    onClose,
    renderToast = true,
    addons = [],
  } = params;
  const rawMin = product.minimum_order_quantity || 1;
  const stepSize = product.quantity_step_size || 1;
  const minQuantity = Math.ceil(rawMin / stepSize) * stepSize;
  const maxAllowed = product.total_allowed_quantity || 1;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isRestaurant =
    currentPath.startsWith("/restaurant") ||
    product.business_type === "restaurant" ||
    store.getState().module?.activeModule === "restaurant";
  const stock = isRestaurant ? Number.MAX_SAFE_INTEGER : (variant.stock || 0);
  const maxQuantity = Math.min(maxAllowed, stock);
  const finalPrice =
    Number(variant.special_price) > 0 &&
    Number(variant.special_price) < Number(variant.price)
      ? Number(variant.special_price)
      : Number(variant.price);
  const addonSuffix =
    addons.length > 0
      ? `-${addons
          .map((a) => a.addon_item_id)
          .sort()
          .join("-")}`
      : "";
  const itemId = `${variant.id}${addonSuffix}`;

  const existingItem = store.getState().offlineCart.items.find(item => item.id === itemId);

  if (existingItem && replace_quantity) {
    store.dispatch(
      updateOfflineCartItemQuantity({
        id: itemId,
        quantity: quantity || minQuantity,
      })
    );
  } else {
    store.dispatch(
      addOfflineCartItem({
        id: itemId,
        name: product.title || variant.title,
        slug: product.slug,
        image: variant.image || product.main_image,
        price: finalPrice,
        quantity: quantity || minQuantity,
        storeName: variant.store_name,
        storeSlug: variant.store_slug,
        minQuantity: minQuantity,
        maxQuantity: maxQuantity,
        stepSize: stepSize || 1,
        stock: stock,
        product_variant_id: variant.id,
        store_id: variant.store_id,
        business_type: isRestaurant ? "restaurant" : (product.business_type || store.getState().module?.activeModule || "grocery"),
        addons: addons,
      }),
    );
  }

  if (renderToast) {
    addToast({
      title: i18n.t("cart.add_success"),
      description: i18n.t("cart.login_required"),
      color: "primary",
    });
  }

  onClose?.();

  return {
    success: true,
    data: null,
    message: "offline_cart_updated",
  };
};

export const handleUpdateOfflineCartItem = (params: {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  oldId: string;
  onClose?: () => void;
  renderToast?: boolean;
  addons?: {
    addon_group_id: number;
    addon_item_id: number;
    title: string;
    price: number;
  }[];
}) => {
  const {
    product,
    variant,
    quantity,
    oldId,
    onClose,
    renderToast = true,
    addons = [],
  } = params;
  const rawMin = product.minimum_order_quantity || 1;
  const stepSize = product.quantity_step_size || 1;
  const minQuantity = Math.ceil(rawMin / stepSize) * stepSize;
  const maxAllowed = product.total_allowed_quantity || 1;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isRestaurant =
    currentPath.startsWith("/restaurant") ||
    product.business_type === "restaurant" ||
    store.getState().module?.activeModule === "restaurant";
  const stock = isRestaurant ? Number.MAX_SAFE_INTEGER : (variant.stock || 0);
  const maxQuantity = Math.min(maxAllowed, stock);
  const finalPrice =
    Number(variant.special_price) > 0 &&
    Number(variant.special_price) < Number(variant.price)
      ? Number(variant.special_price)
      : Number(variant.price);

  const addonSuffix =
    addons.length > 0
      ? `-${addons
          .map((a) => a.addon_item_id)
          .sort()
          .join("-")}`
      : "";
  const nextId = `${variant.id}${addonSuffix}`;

  store.dispatch(
    updateOfflineCartItem({
      id: oldId,
      newItem: {
        id: nextId,
        name: product.title || variant.title,
        slug: product.slug,
        image: variant.image || product.main_image,
        price: finalPrice,
        quantity: quantity || minQuantity,
        storeName: variant.store_name,
        storeSlug: variant.store_slug,
        minQuantity: minQuantity,
        maxQuantity: maxQuantity,
        stepSize: stepSize || 1,
        stock: stock,
        product_variant_id: variant.id,
        store_id: variant.store_id,
        business_type: isRestaurant ? "restaurant" : (product.business_type || store.getState().module?.activeModule || "grocery"),
        addons: addons,
      },
    }),
  );

  if (renderToast) {
    addToast({
      title: i18n.t("cart_updated_title"),
      color: "primary",
    });
  }

  onClose?.();

  return {
    success: true,
    data: null,
    message: "offline_cart_updated",
  };
};

export const resetCheckOutState = () => {
  store.dispatch(setPromoCode(""));
  store.dispatch(setRusDelivery(false));
  store.dispatch(setUseWallet(false));
  store.dispatch(setSelectedAddress(null));
  // Clear attachments from window
  if (typeof window !== "undefined") {
    (window as any).__cartAttachments = {};
  }
};

export const handleCheckout = async (
  payment_type: string = "cod",
  extra_params: object,
) => {
  try {
    const state = store.getState();
    const address_id = state?.checkout?.selectedAddress?.id || "";
    const order_note = state?.checkout?.orderNote || "";
    const use_wallet = state?.checkout?.useWallet || false;
    const rush_delivery = state?.checkout?.rushDelivery || false;
    const promo_code = state?.checkout?.promoCode || "";
    const activeModule = state?.module?.activeModule;
    const business_type = activeModule === "courier" ? undefined : activeModule;

    if (!address_id) {
      console.error(i18n.t("checkout.no_address"));
      return fallbackApiRes;
    }

    // Get attachments from window
    const attachments = (window as any).__cartAttachments || {};

    // Always use FormData
    const formData = new FormData();
    formData.append("payment_type", payment_type);
    formData.append("promo_code", promo_code);
    formData.append("gift_card", "");
    formData.append("gift_card_discount", "");
    formData.append("rush_delivery", rush_delivery ? "1" : "0");
    formData.append("use_wallet", use_wallet ? "1" : "0");
    formData.append("address_id", address_id.toString());
    formData.append("order_note", order_note);
    if (business_type) {
      formData.append("business_type", business_type);
    }
    formData.append(
      "redirect_url",
      `${window.location.origin}/my-account/orders`,
    );

    // Add extra params
    Object.entries(extra_params).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Add attachments if any
    Object.entries(attachments).forEach(
      ([productId, attachment]: [string, any]) => {
        if (Array.isArray(attachment)) {
          attachment.forEach((fileItem) => {
            if (fileItem && fileItem.file) {
              formData.append(`attachments[${productId}][]`, fileItem.file);
            }
          });
        } else if (attachment && attachment.file) {
          formData.append(`attachments[${productId}][]`, attachment.file);
        }
      },
    );

    // Clear the other module's cart to prevent mixing items
    // Commented out to prevent losing cart items of another business module when placing an order
    /*
    if (business_type) {
      try {
        const otherModule = business_type === "grocery" ? "restaurant" : "grocery";
        await clearCart(otherModule);
      } catch (e) {
        console.error("Failed to clear other module cart before checkout", e);
      }
    }
    */

    const response = await createOrder(formData);

    if (response.success) {
      const { data } = response;

      if (data) {
        trackPurchase(
          data?.id?.toString?.() || "",
          data?.final_total || 0,
          data?.currency_code || "",
          data?.promo_code || "",
          data?.delivery_charge,
          data?.items || [],
        );
      }

      const paymentLink = response?.data?.payment_response?.link || "";

      if (payment_type === "flutterwavePayment") {
        if (isValidUrl(paymentLink)) {
          resetCheckOutState();
          window.location.href = paymentLink;

          return { success: true, data: null, message: "Redirected" };
        } else {
          addToast({
            title: i18n.t("checkout.flutterwave_link_invalid"),
            description:
              i18n.t("checkout.flutterwave_link_error_message") ||
              "Payment link is invalid or missing. Please try again.",
            color: "danger",
          });
          console.error("Invalid Flutterwave payment link:", paymentLink);
          return response; // stop here if invalid
        }
      }

      addToast({
        title: i18n.t("checkout.success"),
        size: "lg",
      });
      document.getElementById("confetti-btn")?.click();
      resetCheckOutState();
    } else {
      addToast({
        title: response.message || i18n.t("checkout.error_title"),
        color: "danger",
      });
      console.error(response.message || i18n.t("checkout.error_console"));
    }
    return response;
  } catch (error) {
    console.error("Checkout error:", error);
    return fallbackApiRes;
  }
};

export const formatAmount = (value: number | string) => {
  if (!value) return "0.00";
  return Number(value).toFixed(2);
};

export const urlToFile = async (
  url: string,
  filename: string,
): Promise<File> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error);
    throw error;
  }
};

export const isRTL = (currentLang: string = "") => {
  return ["ar", "fa", "ur"].includes(currentLang);
};

export const cleanAddress = (address?: string): string => {
  if (!address) return "";
  return address.replace(/^[A-Za-z0-9]{2,8}\+[A-Za-z0-9]{2,4}(,\s*|\s+)/, "").trim();
};
