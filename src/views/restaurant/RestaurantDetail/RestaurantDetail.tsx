import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import RestaurantHeader from "./RestaurantHeader";
import RestaurantMenuItem from "./RestaurantMenuItem";
import {
  ShoppingCart,
  FilterX,
  UtensilsCrossed,
} from "lucide-react";
import { useDisclosure, addToast } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Product } from "@/types/ApiResponse";
import Link from "next/link";
import useSWR from "swr";
import { getProducts, getStoreWiseProducts } from "@/routes/api";
import { isSSR } from "@/helpers/getters";
import { handleAddToCart, handleOfflineAddToCart } from "@/helpers/functionalHelpers";

import { getCookie } from "@/lib/cookies";
import { UserLocation } from "@/components/Location/types/LocationAutoComplete.types";

const RestaurantProductModal = dynamic(
  () => import("@/views/restaurant/RestaurantItemDetail/RestaurantProductModal"),
  { ssr: false }
);

interface RestaurantDetailProps {
  restaurant: any;
  initialProducts?: any;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, initialProducts }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: RootState) => state.auth?.isLoggedIn);
  const onlineCartCount = useSelector((state: RootState) => state.cart.cartData?.items_count) || 0;
  const offlineCartCount = useSelector((state: RootState) => state.offlineCart?.totalQuantity) || 0;
  const cartCount = isLoggedIn ? onlineCartCount : offlineCartCount;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "veg" | "non_veg">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = getCookie("userLocation") as UserLocation | undefined;
  const { lat = "", lng = "" } = location || {};

  const { data: productsData } = useSWR(
    restaurant?.slug
      ? ["/products/store-wise", restaurant.slug, restaurant.id, lat, lng, searchQuery]
      : null,
    () =>
      getStoreWiseProducts({
        store_slug: restaurant.slug,
        store_id: restaurant.id,
        per_page: 100,
        page: 1,
        latitude: lat,
        longitude: lng,
        search: searchQuery || undefined,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnMount: !isSSR(),
      fallbackData: !searchQuery ? initialProducts : undefined,
    }
  );

  let rawProducts =
    productsData?.data?.data ||
    (Array.isArray(productsData?.data) ? productsData.data : []);
  if (!rawProducts.length && !searchQuery && initialProducts?.data?.data) {
    rawProducts = initialProducts.data.data;
  }

  // Filter products based on search and veg/non-veg toggle
  const products = React.useMemo(() => {
    return rawProducts.filter(p => {
      // Veg / Non-veg
      if (filterMode === "veg" && p.indicator !== "veg") return false;
      if (filterMode === "non_veg" && p.indicator !== "non_veg") return false;

      // Search
      if (searchQuery && !(p.title || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [rawProducts, filterMode, searchQuery]);

  const menuData = React.useMemo(() => {
    const grouped: Record<string, Product[]> = {};
    products.forEach(p => {
      const cat = p.category_name || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });

    return Object.keys(grouped).map(cat => ({
      category: cat,
      count: grouped[cat].length,
      items: grouped[cat]
    }));
  }, [products]);

  const categories = ["All", ...menuData.map(m => m.category)];
  const [activeTab, setActiveTab] = useState("All");

  React.useEffect(() => {
    // Keep active tab valid if search filters it out
    if (!categories.includes(activeTab) && categories.length > 0) {
      setActiveTab("All");
    } else if (categories.length === 0) {
      setActiveTab("All");
    }
  }, [categories, activeTab]);

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddClick = async (item: Product) => {
    const defaultVariant = item.variants?.find((v) => v.is_default) || item.variants?.[0];
    const hasAddons = (defaultVariant?.addon_groups?.length ?? 0) > 0;
    const isSimpleProduct = item.type === "simple" || (item.variants?.length ?? 0) <= 1;

    if (!isSimpleProduct || hasAddons) {
      setSelectedProduct(item);
      onOpen();
      return;
    }

    if (!defaultVariant) {
      addToast({ title: t("please_select_variant") || "Please select variant", color: "warning" });
      return;
    }

    try {
      if (isLoggedIn) {
        await handleAddToCart({
          product_variant_id: defaultVariant?.id || "",
          store_id: defaultVariant?.store_id || "",
          quantity: item.minimum_order_quantity || 1,
          onClose: () => { },
          renderToast: true,
        });
      } else {
        handleOfflineAddToCart({
          product: item,
          variant: defaultVariant,
          quantity: item.minimum_order_quantity || 1,
          renderToast: true,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-32">
      <RestaurantHeader
        restaurant={restaurant}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
      />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="hidden md:flex items-center gap-3 overflow-x-auto scrollbar-hide py-6 mb-8 border-b border-gray-50 dark:border-zinc-900">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(cat)}
              className={`flex flex-shrink-0 items-center justify-center font-medium rounded-md px-4 h-9 transition-colors text-sm shadow-sm border ${activeTab === cat
                ? "bg-[#019CBF] border-[#019CBF] text-white hover:bg-[#018ba8]"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {cat === "All" ? t("all") || "All" : cat}
            </button>
          ))}
        </div>

        <div className="space-y-16">
          {menuData.filter(section => activeTab === "All" || section.category === activeTab).map((section) => (
            <div key={section.category}>
              <div className="divide-y divide-gray-50 dark:divide-zinc-900">
                {section.items.map((item) => (
                  <RestaurantMenuItem
                    key={item.id}
                    item={item}
                    onAdd={handleAddClick}
                  />
                ))}
              </div>
            </div>
          ))}

          {menuData.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 dark:text-zinc-600 mb-4 flex justify-center">
                <FilterX className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t("no_items_found") || "No items found"}
              </h3>
              <p className="text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                {t("try_adjusting_filters") || "Try adjusting your filters or search query."}
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mounted && cartCount > 0 && (
          <motion.div
            key="cart-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
          >
            <div className="max-w-6xl mx-auto bg-[#0097A7] rounded-xl overflow-hidden shadow-2xl flex items-center justify-between h-14">
              <div className="px-6 text-sm font-bold text-white uppercase tracking-wider">
                {cartCount}{" "}
                {cartCount === 1
                  ? t("item_added")
                  : t("items_added") || "items added"}
              </div>

              <Link
                href="/cart"
                className="h-full bg-[#0097A7] hover:bg-[#00838F] px-8 flex items-center gap-3 text-sm font-bold text-white uppercase tracking-wider transition-colors border-l border-white/20"
              >
                {t("view_cart") || "View Cart"}
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <RestaurantProductModal
          isOpen={isOpen}
          onClose={onClose}
          product={selectedProduct}
          selectedVariant={selectedProduct.variants?.find(v => v.is_default) || selectedProduct.variants?.[0]}
        />
      )}

      {/* Mobile View Floating Menu Button & Popover Category List */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Semi-transparent backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
              />

              {/* Floating Menu Popover (Glassmorphism effect) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-16 right-0 w-64 bg-[#141821]/80 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-white/15 z-50 max-h-[60vh] overflow-y-auto scrollbar-hide ring-1 ring-black/20"
              >
                <div className="divide-y divide-white/10">
                  {/* All Categories Row */}
                  <div
                    onClick={() => {
                      setActiveTab("All");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between cursor-pointer py-2.5 text-sm font-semibold transition-colors ${
                      activeTab === "All" ? "text-[#019CBF]" : "text-zinc-200 hover:text-white"
                    }`}
                  >
                    <span>{t("all") || "All"}</span>
                    <span className="text-[#019CBF] font-bold text-xs">({products.length})</span>
                  </div>

                  {/* Category Rows */}
                  {menuData.map((item) => (
                    <div
                      key={item.category}
                      onClick={() => {
                        setActiveTab(item.category);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between cursor-pointer py-2.5 text-sm font-medium transition-colors ${
                        activeTab === item.category ? "text-[#019CBF] font-bold" : "text-zinc-200 hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-2">{item.category}</span>
                      <span className="text-zinc-400 font-normal text-xs">({item.count})</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Menu Button with Glassmorphism */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 bg-[#019CBF]/85 hover:bg-[#019CBF] backdrop-blur-md active:scale-95 text-white px-5 py-3 rounded-full shadow-2xl shadow-cyan-500/35 border border-white/25 transition-all font-bold text-sm z-50"
        >
          <UtensilsCrossed size={18} />
          <span>{t("menu") || "Menu"}</span>
        </button>
      </div>
    </div>
  );
};

export default RestaurantDetail;
