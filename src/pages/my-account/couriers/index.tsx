import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Button,
  Pagination,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Chip,
  Accordion,
  AccordionItem,
  Skeleton,
} from "@heroui/react";
import {
  Package,
  MapPin,
  Calendar,
  Truck,
  Navigation,
  AlertCircle,
  Eye,
  CreditCard,
  HandCoins,
} from "lucide-react";
import UserLayout from "@/layouts/UserLayout";
import MyBreadcrumbs from "@/components/custom/MyBreadcrumbs";
import PageHeader from "@/components/custom/PageHeader";
import PageHead from "@/SEO/PageHead";
import { getMyCourierRequests, getSettings } from "@/routes/api";
import { formatAmount } from "@/helpers/functionalHelpers";
import { useSettings } from "@/contexts/SettingsContext";
import { isSSR, getCookieFromContext, getFormattedDate } from "@/helpers/getters";
import { getAccessTokenFromContext } from "@/helpers/auth";
import { loadTranslations } from "../../../../i18n";
import { CourierRequest, PaginatedResponse } from "@/types/ApiResponse";
import { RootState } from "@/lib/redux/store";
import TrackCourierModal from "@/components/Modals/TrackCourierModal";
import CourierFiltersModal, { CourierFilters } from "@/components/Modals/CourierFiltersModal";
import { Filter } from "lucide-react";

const PER_PAGE = 8;

interface CouriersData {
  data: CourierRequest[];
  current_page: number;
  per_page: number;
  total: number;
}

interface CouriersPageProps {
  initialCouriers?: CouriersData;
  error?: string | null;
  isSSR: boolean;
}

// Fetcher for client SWR
const couriersFetcher = async (url: string) => {
  const [, queryString = ""] = url.split("?");
  const urlParams = new URLSearchParams(queryString);
  const page = parseInt(urlParams.get("page") || "1");
  const filter = urlParams.get("filter") || undefined;
  const status = urlParams.get("status") || undefined;
  const parcel_type = urlParams.get("parcel_type") || undefined;
  const date = urlParams.get("date") || undefined;
  const search = urlParams.get("search") || undefined;

  const response: PaginatedResponse<CourierRequest[]> = await getMyCourierRequests({
    page,
    filter,
    status,
    parcel_type,
    date,
    search,
  });

  if (response.success && response.data) {
    return {
      data: response.data.data ?? [],
      current_page: response.data.current_page ?? 1,
      per_page: response.data.per_page ?? PER_PAGE,
      total: response.data.total ?? 0,
    };
  } else {
    throw new Error(response.message || "Failed to fetch couriers");
  }
};

const CouriersLayout = ({ children, rightContent }: { children: React.ReactNode; rightContent?: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <>
      <MyBreadcrumbs
        homeHref="/courier"
        breadcrumbs={[
          { href: "/my-account/couriers", label: t("userLayout.myCouriers", "My Couriers") },
        ]}
      />
      <UserLayout activeTab="couriers">
        <div className="w-full space-y-6">
          <PageHeader
            title={t("userLayout.myCouriers", "My Couriers")}
            subtitle={t("courier.listings.subtitle", "Track and manage your hyperlocal courier shipments")}
            rightContent={rightContent}
          />
          {children}
        </div>
      </UserLayout>
    </>
  );
};

// Shimmer Loader for Listings matching OrderCardSkeleton grid exactly
const CouriersLoading = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <Card key={index} shadow="sm" radius="sm">
            <CardHeader className="flex flex-col justify-between w-full">
              <div className="flex items-start justify-between mb-3 w-full gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-4 w-24 rounded-md shrink-0" />
                      <Skeleton className="h-5 w-16 rounded-md shrink-0" />
                    </div>
                    <div className="flex gap-1 items-center">
                      <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </div>

              <Divider className="mb-2 opacity-50" />

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody className="pb-1 overflow-hidden">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-28 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            </CardBody>

            <CardFooter className="grid grid-cols-6 gap-2 w-full pt-0">
              <Skeleton className="h-8 rounded-md col-span-3" />
              <Skeleton className="h-8 rounded-md col-span-3" />
            </CardFooter>
          </Card>
        ))}
    </div>
  );
};

// Empty State View
const CouriersEmpty = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-center min-h-[400px] border border-dashed border-gray-200 dark:border-default-200 rounded-3xl bg-default-50/20 p-8">
      <div className="text-center max-w-sm space-y-6">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary">
          <Truck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("courier.listings.emptyTitle", "No Shipments Yet")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("courier.listings.emptyDesc", "You haven't placed any courier requests yet. Book a premium courier to send items quickly across town.")}
          </p>
        </div>
        <Button
          color="primary"
          className="font-bold px-6 py-2.5 rounded-xl shadow-sm shadow-primary/20"
          onPress={() => router.push("/courier/book")}
        >
          {t("courier.listings.bookNow", "Book a Courier")}
        </Button>
      </div>
    </div>
  );
};

// Main content list component matching standard OrderCard structure
const CouriersContent = ({ couriers }: { couriers: CouriersData }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { currencySymbol } = useSettings();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || "0";

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CourierRequest | null>(null);

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/ /g, '_') || '';
    switch (normalizedStatus) {
      case "pending": return t("courier.status.pendingLabel", "Awaiting Rider");
      case "assigned": return t("courier.status.assignedLabel", "Assigned");
      case "picked_up": return t("courier.status.pickedUpLabel", "Picked Up");
      case "in_transit": return t("courier.status.inTransitLabel", "In Transit");
      case "delivered": return t("courier.status.deliveredLabel", "Delivered");
      case "cancelled": return t("courier.status.cancelledLabel", "Cancelled");
      case "failed_delivery": return t("courier.status.failedLabel", "Failed");
      case "return_to_sender": return t("courier.status.returnedLabel", "Returned");
      default: return status;
    }
  };

  const getBadgeColor = (status: string): "success" | "danger" | "warning" | "primary" | "default" => {
    const normalizedStatus = status?.toLowerCase().replace(/ /g, '_') || '';
    switch (normalizedStatus) {
      case "delivered":
        return "success";
      case "cancelled":
      case "failed_delivery":
      case "return_to_sender":
        return "danger";
      case "pending":
        return "warning";
      case "assigned":
      case "picked_up":
      case "in_transit":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Courier Request List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {couriers.data.map((booking) => {
          const normalizedStatus = booking.status?.toLowerCase().replace(/ /g, '_') || '';
          const isLive = ["assigned", "picked_up", "in_transit"].includes(normalizedStatus);

          return (
            <Card
              key={booking.id}
              shadow="sm"
              radius="sm"
            >
              <CardHeader className="flex flex-col justify-between w-full text-start">
                <div className="flex items-start justify-between mb-3 w-full gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md shrink-0">
                      <Package className="w-4 h-4 text-foreground/50" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                        <h3 className="font-semibold text-sm sm:text-medium text-foreground whitespace-nowrap">
                          {t("courier.listings.cardTitle", "Courier: #{{id}}", { id: booking.id })}
                        </h3>
                        <Chip
                          size="sm"
                          radius="sm"
                          variant="flat"
                          color={getBadgeColor(booking.status)}
                          classNames={{
                            content: "text-xxs font-semibold",
                            base: "p-0 shrink-0 max-w-full",
                          }}
                          title={getStatusLabel(booking.status)}
                        >
                          <span className="truncate">{getStatusLabel(booking.status)}</span>
                        </Chip>
                      </div>

                      <div className="flex gap-1 items-center min-w-0 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-foreground/50 shrink-0" />
                        <a
                          href={`https://www.google.com/maps?q=${booking.drop_details?.lat},${booking.drop_details?.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={booking.drop_details?.address}
                          className="text-xxs text-foreground/50 truncate hover:cursor-pointer hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {booking.drop_details?.address}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider className="mb-2 opacity-50" />

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-foreground/50" />
                    <div>
                      <p className="text-xxs sm:text-xs text-foreground/50">
                        {t("date")}
                      </p>
                      <p className="text-xxs sm:text-xs font-medium text-foreground">
                        {getFormattedDate(booking.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-foreground/50" />
                    <div>
                      <p className="text-xxs sm:text-xs text-foreground/50">
                        {t("checkout.totalAmount", "Total Price")}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {currencySymbol}
                        {formatAmount(booking.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pb-1 overflow-hidden text-start">
                <div className="mb-4">
                  <Accordion
                    variant="light"
                    className="px-0"
                    itemClasses={{
                      base: "px-0",
                      title: "text-xs font-medium text-gray-900 dark:text-gray-100",
                      trigger: "px-0 py-0 h-5",
                      content: "px-0 pb-0",
                      indicator: "text-gray-400 dark:text-gray-500",
                    }}
                  >
                    <AccordionItem
                      key="courier-details"
                      aria-label={t("courier.listings.detailsLabel", "Parcel Specifications")}
                      title={t("courier.listings.detailsLabel", "Parcel Specifications")}
                      startContent={
                        <Package className="w-4 h-4 text-foreground/50" />
                      }
                    >
                      <div className="space-y-3 mt-2 w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                        {/* Description */}
                        <div>
                          <span className="font-bold text-foreground/50 block text-[10px] uppercase tracking-wider leading-none mb-1">
                            {t("courier.itemDesc", "Item Description")}
                          </span>
                          <p className="font-medium text-foreground">
                            {booking.item_description || t("courier.defaultItemDesc", "Courier Delivery")}
                          </p>
                        </div>

                        {/* Weight and Type grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-bold text-foreground/50 block text-[10px] uppercase tracking-wider leading-none mb-1">
                              {t("courier.weight", "Weight")}
                            </span>
                            <p className="font-medium text-foreground">
                              {booking.weight_kg} kg
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-foreground/50 block text-[10px] uppercase tracking-wider leading-none mb-1">
                              {t("courier.type", "Parcel Type")}
                            </span>
                            <p className="font-medium text-foreground capitalize">
                              {typeof booking.parcel_type === "object" && booking.parcel_type !== null
                                ? (booking.parcel_type as any).name || t("na")
                                : (booking.parcel_type || t("na"))}
                            </p>
                          </div>
                        </div>

                        <Divider className="opacity-50 my-1" />

                        {/* Sender & Recipient Location Steps */}
                        <div className="space-y-3 relative select-none pl-1 pt-1">
                          {/* Vertical dotted line connector */}
                          <div className="absolute left-[11px] top-[14px] bottom-[14px] border-l border-dashed border-gray-300 dark:border-default-200 z-0" />

                          {/* Pickup point details */}
                          <div className="flex gap-2.5 items-start relative z-10">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <div className="w-1 h-1 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <span className="text-[9px] uppercase font-bold text-primary tracking-wider block leading-none">
                                {t("courier.checkout.sender", "Sender")}
                              </span>
                              <p className="text-xxs font-bold text-gray-800 dark:text-white truncate">
                                {booking.sender_name || booking.user?.name || t("na")} ({booking.sender_phone || t("na")})
                              </p>
                              <p className="text-[10px] text-gray-500 truncate" title={booking.pickup_details?.address}>
                                {booking.pickup_details?.address}
                              </p>
                            </div>
                          </div>

                          {/* Drop point details */}
                          <div className="flex gap-2.5 items-start relative z-10">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <div className="w-1 h-1 rounded-full bg-red-500" />
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider block leading-none">
                                {t("courier.checkout.recipient", "Recipient")}
                              </span>
                              <p className="text-xxs font-bold text-gray-800 dark:text-white truncate">
                                {booking.receiver_name || t("na")} ({booking.receiver_phone || t("na")})
                              </p>
                              <p className="text-[10px] text-gray-500 truncate" title={booking.drop_details?.address}>
                                {booking.drop_details?.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-foreground/50" />
                        <div className="flex gap-1 items-center">
                          <p className="text-xxs sm:text-xs text-foreground">
                            {t("distance", "Distance")}
                          </p>
                          <p className="text-xxs sm:text-xs font-medium text-foreground">
                            {booking.distance_km ? `${booking.distance_km} km` : t("na")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {booking.payment_method === "cod" ? (
                        <HandCoins className="w-4 h-4 text-foreground/50" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-foreground/50" />
                      )}
                      <p className="text-xs text-foreground capitalize">
                        {booking.payment_method}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>

              <CardFooter className="grid grid-cols-6 gap-2 w-full pt-0">
                <Button
                  size="sm"
                  variant="bordered"
                  onClick={() => {
                    const uniquePart = booking.created_at ? Math.floor(new Date(booking.created_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
                    router.push(`/my-account/bookings/courier-${uniquePart}-${userId}-${booking.id}`);
                  }}
                  startContent={<Eye className="w-3.5 h-3.5" />}
                  className={`text-xs font-medium w-full ${isLive ? "col-span-3" : "col-span-6"}`}
                  title={t("details")}
                >
                  {t("details")}
                </Button>

                {isLive && (
                  <Button
                    size="sm"
                    variant="bordered"
                    onClick={() => {
                      setSelectedBooking(booking as any);
                      setIsTrackModalOpen(true);
                    }}
                    startContent={<Navigation className="w-3.5 h-3.5 animate-pulse" />}
                    className="text-xs font-medium w-full col-span-3"
                    title={t("track")}
                  >
                    {t("track", "Track Live")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Pagination controls */}
      {couriers.total > couriers.per_page && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={Math.ceil(couriers.total / couriers.per_page)}
            initialPage={couriers.current_page}
            showControls
            size="sm"
            isCompact
            classNames={{
              item: "text-sm",
              cursor: "text-sm",
              next: "text-sm",
              prev: "text-sm",
            }}
            onChange={(page) => {
              const currentQuery = { ...router.query };
              currentQuery.page = page.toString();
              router.push({
                pathname: "/my-account/couriers",
                query: currentQuery,
              });
            }}
          />
        </div>
      )}

      {selectedBooking && (
        <TrackCourierModal
          isOpen={isTrackModalOpen}
          onClose={() => {
            setIsTrackModalOpen(false);
            setTimeout(() => setSelectedBooking(null), 300);
          }}
          courierRequest={selectedBooking}
        />
      )}
    </div>
  );
};

const CouriersPage: React.FC<CouriersPageProps> = ({
  initialCouriers,
  error: initialError,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || "0";

  const [isSSR, setIsSSR] = useState(true);
  useEffect(() => {
    setIsSSR(false);
  }, []);

  const [page, setPage] = useState(parseInt(router.query.page as string) || 1);
  const [filter, setFilter] = useState<string>("active");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CourierFilters>({
    parcel_type: "",
    status: "",
    date: "",
    search: "",
  });

  // Dynamic SWR polling client-side
  const {
    data: swrCouriers,
    error: swrError,
    isLoading,
    isValidating,
  } = useSWR(
    isSSR || !userId
      ? null
      : `/api/courier/requests?page=${page}&filter=${filter}&status=${currentFilters.status}&parcel_type=${currentFilters.parcel_type}&date=${currentFilters.date}&search=${currentFilters.search}`,
    couriersFetcher,
    {
      fallbackData: initialCouriers,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      refreshInterval: 10000,
    }
  );

  const couriers = swrCouriers || initialCouriers;

  useEffect(() => {
    if (router.isReady) {
      const pageQuery = parseInt(router.query.page as string) || 1;
      setPage(pageQuery);

      const filterQuery = (router.query.filter as string) || "";
      if (filterQuery) {
        setFilter(filterQuery);
      } else {
        setFilter(""); // fallback or empty when advanced filters are used
      }

      // Initialize advanced filters from URL
      setCurrentFilters({
        status: (router.query.status as string) || "",
        parcel_type: (router.query.parcel_type as string) || "",
        date: (router.query.date as string) || "",
        search: (router.query.search as string) || "",
      });
    }
  }, [router.isReady, router.query]);

  const error = swrError ? swrError.message : initialError;

  const handleApplyFilters = (filters: CourierFilters) => {
    setCurrentFilters(filters);
    const currentQuery = { ...router.query };

    delete currentQuery.filter;
    setFilter(""); // disable the simple 'active/completed' filter when using advanced filters

    if (filters.status) currentQuery.status = filters.status;
    else delete currentQuery.status;

    if (filters.parcel_type) currentQuery.parcel_type = filters.parcel_type;
    else delete currentQuery.parcel_type;

    if (filters.date) currentQuery.date = filters.date;
    else delete currentQuery.date;

    if (filters.search) currentQuery.search = filters.search;
    else delete currentQuery.search;

    delete currentQuery.page; // reset to page 1
    router.push({
      pathname: "/my-account/couriers",
      query: currentQuery,
    });
  };

  const renderFilters = () => (
    <div className="flex items-center gap-2">
      <Button
        isIconOnly
        color={(currentFilters.status || currentFilters.date || currentFilters.parcel_type || currentFilters.search) ? "primary" : "default"}
        variant="flat"
        size="lg"
        className="h-12 w-12"
        onPress={() => setIsFilterModalOpen(true)}
      >
        <Filter className="w-5 h-5" />
      </Button>

      <CourierFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={currentFilters}
        onApply={handleApplyFilters}
      />
    </div>
  );

  // Render Page Skeletons while loading initially
  const isPageLoading = !couriers || isLoading;

  if (isPageLoading) {
    return (
      <CouriersLayout rightContent={renderFilters()}>
        <PageHead pageTitle={t("userLayout.myCouriers", "My Couriers")} />
        <CouriersLoading />
      </CouriersLayout>
    );
  }

  // Error boundary response card
  if (error) {
    return (
      <CouriersLayout rightContent={renderFilters()}>
        <PageHead pageTitle={t("userLayout.myCouriers", "My Couriers")} />
        <div className="w-full flex items-center justify-center min-h-[300px]">
          <div className="text-center max-w-sm space-y-4">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <h3 className="text-base font-bold text-danger">{t("courier.errorLoading", "Unable to Load Shipments")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{error}</p>
            <Button size="sm" color="warning" onPress={() => window.location.reload()}>
              {t("try_again", "Reload Page")}
            </Button>
          </div>
        </div>
      </CouriersLayout>
    );
  }

  // Empty List check
  if (!couriers?.data || couriers.data.length === 0) {
    return (
      <CouriersLayout rightContent={renderFilters()}>
        <PageHead pageTitle={t("userLayout.myCouriers", "My Couriers")} />
        <CouriersEmpty />
      </CouriersLayout>
    );
  }

  return (
    <CouriersLayout rightContent={renderFilters()}>
      <PageHead pageTitle={t("userLayout.myCouriers", "My Couriers")} />
      <CouriersContent couriers={couriers} />
    </CouriersLayout>
  );
};

export const getServerSideProps: GetServerSideProps | undefined = isSSR()
  ? async (context) => {
    try {
      const access_token = (await getAccessTokenFromContext(context)) || "";
      const { page = "1", filter = "" } = context.query;
      await loadTranslations(context);

      if (!access_token) {
        const activeModule = (getCookieFromContext(context, "activeModule") as string) || undefined;
        const redirectDestination = activeModule === "grocery" ? "/grocery" : activeModule === "restaurant" ? "/restaurant" : activeModule === "courier" ? "/courier" : "/";
        return {
          redirect: {
            destination: redirectDestination,
            permanent: false,
          },
        };
      }

      // SSR request mapping
      const response: PaginatedResponse<CourierRequest[]> = await getMyCourierRequests({
        page: parseInt(String(page)),
        filter: filter ? String(filter) : undefined,
      });

      const settings = await getSettings();

      if (response.success && response.data) {
        return {
          props: {
            initialCouriers: {
              data: response.data.data ?? [],
              current_page: response.data.current_page ?? 1,
              per_page: response.data.per_page ?? PER_PAGE,
              total: response.data.total ?? 0,
            },
            initialSettings: settings.data ?? null,
            isSSR: true,
          },
        };
      }

      return {
        props: {
          initialCouriers: {
            data: [],
            current_page: 1,
            per_page: PER_PAGE,
            total: 0,
          },
          initialSettings: settings?.data ?? null,
          isSSR: true,
        },
      };
    } catch (error) {
      console.error("SSR Courier Fetch Error:", error);
      return {
        props: {
          initialCouriers: {
            data: [],
            current_page: 1,
            per_page: PER_PAGE,
            total: 0,
          },
          initialSettings: null,
          error: "Unable to load shipments. Please try again later.",
          isSSR: true,
        },
      };
    }
  }
  : undefined;

export default CouriersPage;
