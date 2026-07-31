import React from "react";
import { getCategories } from "@/routes/api";
import { useInfiniteData } from "@/hooks/useInfiniteData";
import { Category } from "@/types/ApiResponse";
import { Button, Image, ScrollShadow } from "@heroui/react";
import { Grid3X3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

interface Props {
  parentSlug: string;
  selectedSubcategory?: string;
  onSelect?: (slug: string) => void;
  onClear?: () => void;
  className?: string;
}

const PER_PAGE = 12;

const SubcategorySidebar: React.FC<Props> = ({
  parentSlug,
  selectedSubcategory = "",
  onSelect,
  onClear,
  className = "",
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const activeModule = useSelector((state: RootState) => state.module?.activeModule);
  const business_type = (router.query.business_type as string) || (activeModule === "courier" ? undefined : activeModule);

  const {
    data: subcategories = [],
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useInfiniteData<Category>({
    fetcher: getCategories,
    perPage: PER_PAGE,
    extraParams: {
      slug: parentSlug,
      scope_category_slug: parentSlug,
      business_type,
    },
    passLocation: true,
    dataKey: `subcategories-${parentSlug}-${business_type || ""}`,
    forceFetchOnMount: true,
  });

  const handleClick = (slug: string) => {
    onSelect?.(slug);
  };

  const handleClear = () => {
    onClear?.();
  };
  return (
    <aside
      className={`block w-20 md:w-24 min-w-20 md:min-w-24 sticky top-20 md:top-24 h-[calc(100vh-160px)] md:h-[75vh] overflow-hidden ${className}`}
      aria-label={t("subcategories")}
    >
      <div className="border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-black py-1">
        {/* Content */}
        <ScrollShadow className="flex-1 h-full px-0.5 md:px-1 py-1 no-scrollbar">
          {/* All Products Option */}
          <div
            title={t("all_products")}
            className={`relative flex flex-col items-center justify-center p-1 md:p-1.5 rounded-xl cursor-pointer transition-all duration-200 mb-2 group ${
              !selectedSubcategory ? "text-primary-600 dark:text-primary-400 font-bold" : "text-foreground/70 hover:text-foreground"
            }`}
            onClick={handleClear}
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 mb-1 ${
                !selectedSubcategory
                  ? "bg-primary-50 dark:bg-primary-950/60 ring-2 ring-primary-500 shadow-xs"
                  : "bg-gray-100 dark:bg-gray-800/80 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              }`}
            >
              <Grid3X3
                size={20}
                className={!selectedSubcategory ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}
              />
            </div>
            <div className="text-[10px] md:text-[11px] text-center font-medium leading-tight">
              {t("all") || "All"}
            </div>

            {!selectedSubcategory && (
              <div className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-l-full" />
            )}
          </div>

          {/* Subcategories List */}
          <div className="space-y-2 md:space-y-2.5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center p-1 animate-pulse">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 dark:bg-gray-800 rounded-xl md:rounded-2xl mb-1" />
                    <div className="w-8 md:w-10 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))
              : subcategories.map((cat) => {
                  const isSelected = selectedSubcategory === cat.slug;
                  return (
                    <div
                      key={cat.id}
                      title={cat.title}
                      className={`relative flex flex-col items-center justify-center p-0.5 md:p-1 rounded-xl cursor-pointer transition-all duration-200 group ${
                        isSelected ? "text-primary-600 dark:text-primary-400 font-bold" : "text-foreground/80 hover:text-foreground"
                      }`}
                      onClick={() => handleClick(cat.slug)}
                    >
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200 mb-1 p-0.5 md:p-1 ${
                          isSelected
                            ? "bg-primary-50 dark:bg-primary-950/60 ring-2 ring-primary-500 shadow-xs"
                            : "bg-gray-100 dark:bg-gray-800/80 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                        }`}
                      >
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.title}
                            className="object-contain w-full h-full"
                            radius="none"
                            classNames={{
                              wrapper: "w-full h-full flex items-center justify-center",
                            }}
                          />
                        ) : (
                          <Grid3X3 size={18} className="text-gray-400" />
                        )}
                      </div>

                      <div className="text-[10px] md:text-[11px] text-center font-medium leading-tight line-clamp-2 px-0.5">
                        {cat.title}
                      </div>

                      {isSelected && (
                        <div className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-l-full" />
                      )}
                    </div>
                  );
                })}
          </div>
        </ScrollShadow>

        {/* Load More Button */}
        {hasMore && (
          <div className="p-1 pt-1.5 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <Button
              size="sm"
              variant="light"
              className="text-[10px] h-6 px-1 text-primary-500"
              isLoading={isLoadingMore}
              onPress={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "..." : "+ More"}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SubcategorySidebar;
