import React from "react";
import useSWR from "swr";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Avatar } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { RootState } from "@/lib/redux/store";
import { getMyCourierRequests } from "@/routes/api";
import { isRTL } from "@/helpers/functionalHelpers";
import CourierActiveShipmentSkeleton from "@/components/Skeletons/CourierActiveShipmentSkeleton";
import CourierRecentShipmentSkeleton from "@/components/Skeletons/CourierRecentShipmentSkeleton";

const getStatusLabel = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/ /g, '_') || '';
    switch (normalizedStatus) {
        case "pending": return "Awaiting Rider";
        case "assigned": return "Assigned";
        case "picked_up": return "Picked Up";
        case "in_transit": return "In Transit";
        case "delivered": return "Delivered";
        case "cancelled": return "Cancelled";
        case "failed_delivery": return "Failed";
        case "return_to_sender": return "Returning to Sender";
        case "returned": return "Returned";
        default: return "On The Way";
    }
};

const getDisplayETA = (booking: any) => {
    const normalizedStatus = booking.status?.toLowerCase().replace(/ /g, '_') || '';
    const dist = booking.distance_away_km;
    if ((normalizedStatus === "assigned" || normalizedStatus === "picked_up" || normalizedStatus === "in_transit") && dist > 0) {
        return `${dist} km Away`;
    }
    return getStatusLabel(booking.status);
};

const formatShortAddress = (address: string) => {
    if (!address) return "N/A";
    const parts = address.split(",");
    return parts[0].trim();
};

const ShipmentsTracker: React.FC = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const user = useSelector((state: RootState) => state.auth.user);

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const currentLang = i18n.resolvedLanguage || i18n.language;
    const rtl = isRTL(currentLang);

    // 1. Poll Active/Current Shipments (filter=active on backend)
    const { data: activeRes, isLoading: isActiveLoading } = useSWR(
        isLoggedIn && isMounted ? "/api/courier/requests/active" : null,
        async () => {
            const res = await getMyCourierRequests({ page: 1, filter: "active" });
            if (res.success && res.data?.data) {
                return res.data.data;
            }
            return [];
        },
        { refreshInterval: 10000 }
    );

    // 2. Poll Recent/Completed Shipments (filter=completed on backend)
    const { data: recentRes, isLoading: isRecentLoading } = useSWR(
        isLoggedIn && isMounted ? "/api/courier/requests/recent" : null,
        async () => {
            const res = await getMyCourierRequests({ page: 1, filter: "completed" });
            if (res.success && res.data?.data) {
                return res.data.data.slice(0, 5); // limit to top 5
            }
            return [];
        },
        { refreshInterval: 20000 }
    );

    if (!isMounted) return null;
    if (!isLoggedIn) return null;

    const activeShipments = activeRes || [];
    const recentShipments = recentRes || [];

    const showActive = isActiveLoading || activeShipments.length > 0;
    const showRecent = isRecentLoading || recentShipments.length > 0;

    if (!showActive && !showRecent) return null;

    return (
        <div className="space-y-10 mt-10 text-start">

            {/* 2. Current Shipments Section */}
            {showActive && (
                <div className="space-y-5">
                    <div className="flex justify-between items-center select-none">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-foreground tracking-tight">
                            {t("courier.home.currentShipments", "Current Shipments")}
                        </h3>
                        {!isActiveLoading && (
                            <button
                                onClick={() => router.push("/my-account/couriers?filter=active")}
                                className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                            >
                                <span>{t("seeAll", "See All")}</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Horizontal Swiper list container */}
                    <div className="w-full pb-2 pt-2 select-none">
                        <Swiper
                            key={rtl ? "rtl-st" : "ltr-st"}
                            dir={rtl ? "rtl" : "ltr"}
                            spaceBetween={24}
                            slidesPerView={1}
                            breakpoints={{
                                315: {
                                    slidesPerView: 1,
                                    spaceBetween: 12,
                                },
                                640: {
                                    slidesPerView: 2,
                                    spaceBetween: 16,
                                },
                                1024: {
                                    slidesPerView: 3,
                                    spaceBetween: 24,
                                },
                            }}
                            className="w-full shadow-none"
                        >
                            {isActiveLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <SwiperSlide key={`active-skeleton-${index}`} className="pb-4">
                                        <CourierActiveShipmentSkeleton />
                                    </SwiperSlide>
                                ))
                            ) : (
                                activeShipments.map((booking: any) => {
                                    const riderPos = `${booking.percentage ?? 0}%`;

                                    console.log(riderPos);

                                    return (
                                        <SwiperSlide key={booking.id} className="pb-4">
                                            <div
                                                onClick={() => {
                                                    const userId = user?.id || "0";
                                                    const uniquePart = booking.created_at ? Math.floor(new Date(booking.created_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
                                                    router.push(`/my-account/bookings/courier-${uniquePart}-${userId}-${booking.id}`);
                                                }}
                                                className="w-full bg-white dark:bg-content1 rounded-[24px] border border-gray-100 dark:border-default-100 shadow-[0_8px_30px_rgb(0,0,0,0.025)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 text-start p-6 relative overflow-hidden cursor-pointer flex flex-col justify-between gap-6"
                                            >
                                                {/* Top Section (Avatar, ID, Item Description, and Status Tag) */}
                                                <div className="flex items-center justify-between select-none pr-20">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={booking.delivery_boy?.user?.profile_image || undefined}
                                                            showFallback
                                                            className="w-12 h-12 border-2 border-gray-50 shadow-sm shrink-0 select-none bg-gray-100 text-gray-400"
                                                        />
                                                        <div className="flex flex-col text-start">
                                                            <span className="text-lg font-bold text-gray-900 dark:text-foreground tracking-tight leading-tight">
                                                                ID: #{booking.id}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-400 mt-0.5">
                                                                {booking.item_description || "Courier Delivery"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Floating Status Tag at the top-right */}
                                                    <div className="absolute top-6 right-6">
                                                        <span className="bg-primary-100 text-primary-600 dark:bg-sky-950/40 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary-200/50">
                                                            {getStatusLabel(booking.status)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Middle Section (Progress Timeline with primary color blue #019CBF - pushed down to pt-7 to prevent overlap) */}
                                                <div className="w-full pr-24 sm:pr-28 pt-7 select-none">
                                                    <div className="flex items-center gap-1 select-none">
                                                        {/* Left Double Circle */}
                                                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-white dark:bg-content1 flex items-center justify-center shrink-0 z-10 shadow-xs">
                                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                                        </div>

                                                        {/* Track Path */}
                                                        <div className="flex-1 relative flex items-center h-6 mx-0.5">
                                                            {/* Base grey line */}
                                                            <div className="w-full border-t-[2px] border-dashed border-gray-200 dark:border-gray-600" />
                                                            {/* Active primary blue line */}
                                                            <div
                                                                className="absolute top-[11px] left-0 border-t-[2px] border-dashed border-primary transition-all duration-1000 ease-in-out"
                                                                style={{ width: riderPos }}
                                                            />

                                                            {/* Active rider container */}
                                                            {booking.status?.toLowerCase() !== "pending" && (
                                                                <div
                                                                    className="absolute -top-[17px] -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-in-out z-20"
                                                                    style={{ left: riderPos }}
                                                                >
                                                                    {/* Tooltip bubble */}
                                                                    <div className="absolute -top-7 flex flex-col items-center">
                                                                        <div className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                                                                            {getDisplayETA(booking)}
                                                                        </div>
                                                                        <div className="w-1 h-1 bg-primary rotate-45 -mt-0.5" />
                                                                    </div>
                                                                    {/* Mini delivery boy from Figma */}
                                                                    <img
                                                                        src="/assets/courier_boy_mini.png"
                                                                        alt="Mini Scooter Rider"
                                                                        className="w-10 h-10 object-contain select-none"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right Double Circle */}
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-content1 flex items-center justify-center shrink-0 z-10 shadow-xs">
                                                            <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-500" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Section (Addresses) */}
                                                <div className="w-full pr-24 sm:pr-28 select-none">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 flex flex-col text-start min-w-0">
                                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                                {t("courier.pickup", "Pick up from")}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-foreground truncate mt-0.5">
                                                                {formatShortAddress(booking.pickup_details?.address)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 flex flex-col text-start min-w-0">
                                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                                                {t("courier.dropTo", "Drop To")}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-foreground truncate mt-0.5">
                                                                {formatShortAddress(booking.drop_details?.address)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Background Cardboard Box Illustration - Large & Half Showing */}
                                                <div className="absolute right-0 bottom-0 top-0 w-[210px] flex items-center justify-end overflow-hidden select-none pointer-events-none z-0">
                                                    <img
                                                        src="/assets/courier-hero.png"
                                                        alt="Package Box Large"
                                                        className="w-[190px] h-[190px] object-contain object-right-bottom transform translate-y-14 translate-x-10 select-none"
                                                    />
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                }))}
                        </Swiper>
                    </div>
                </div>
            )}

            {/* 3. Recent Shipments Section */}
            {showRecent && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center select-none">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-foreground tracking-tight">
                            {t("courier.home.recentShipments", "Recent Shipments")}
                        </h3>
                        {!isRecentLoading && (
                            <button
                                onClick={() => router.push("/my-account/couriers?filter=completed")}
                                className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                            >
                                <span>{t("seeAll", "See All")}</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Vertical cards list matching Figma */}
                    <div className="grid grid-cols-1 gap-4">
                        {isRecentLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <CourierRecentShipmentSkeleton key={`recent-skeleton-${index}`} />
                            ))
                        ) : (
                            recentShipments.map((booking: any) => (
                                <div
                                    key={booking.id}
                                    onClick={() => {
                                        const userId = user?.id || "0";
                                        const uniquePart = booking.created_at ? Math.floor(new Date(booking.created_at).getTime() / 1000) : Math.floor(Date.now() / 1000);
                                        router.push(`/my-account/bookings/courier-${uniquePart}-${userId}-${booking.id}`);
                                    }}
                                    className="flex justify-between items-center p-6 border border-gray-100 dark:border-default-100 rounded-[24px] bg-white dark:bg-content1 hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.025)] shadow-[0_4px_20px_rgb(0,0,0,0.01)] cursor-pointer transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            src={booking.delivery_boy?.user?.profile_image || undefined}
                                            showFallback
                                            className="w-12 h-12 border-2 border-gray-50 shadow-sm shrink-0 select-none bg-gray-100 text-gray-400"
                                        />
                                        <div className="flex flex-col text-start">
                                            <span className="text-base font-extrabold text-gray-900 dark:text-foreground tracking-tight leading-tight">
                                                ID: #{booking.id}
                                            </span>
                                            <span className="text-xs text-lightText font-semibold mt-1">
                                                {booking.item_description || "Courier Delivery"}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border select-none shrink-0 ${booking.status === "delivered"
                                        ? "bg-primary-100 text-primary-600 dark:bg-sky-950/40 dark:text-sky-400 border-primary-200/50"
                                        : "bg-red-50 text-red-500 border-red-100/50"
                                        }`}>
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>
                            )))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ShipmentsTracker;
