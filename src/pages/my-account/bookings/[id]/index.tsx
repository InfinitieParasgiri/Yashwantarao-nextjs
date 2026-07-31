import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Avatar,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  addToast,
  useDisclosure,
} from "@heroui/react";
import {
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  Truck,
  ReceiptText,
  CreditCard,
  Map,
} from "lucide-react";
import UserLayout from "@/layouts/UserLayout";
import MyBreadcrumbs from "@/components/custom/MyBreadcrumbs";
import PageHead from "@/SEO/PageHead";
import { getCourierDetails, getCourierTracking, cancelCourierRequest } from "@/routes/api";
import { useSettings } from "@/contexts/SettingsContext";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { getFormattedDate } from "@/helpers/getters";
import TrackCourierModal from "@/components/Modals/TrackCourierModal";
import RatingModal from "@/components/Modals/RatingModal";
import { Star, Edit } from "lucide-react";

const CourierBookingDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { currencySymbol } = useSettings();
  const activeModule = useSelector((state: RootState) => state.module.activeModule);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const {
    isOpen: isDeliveryRatingOpen,
    onClose: onDeliveryRatingClose,
    onOpen: onDeliveryRatingOpen,
  } = useDisclosure();

  // Extract real numerical ID from slug-like parameter
  // Supports: plain id (e.g. "62"), 3-part (courier-{ts}-{id}), 4-part (courier-{ts}-{userId}-{id})
  const resolvedId = React.useMemo(() => {
    if (!id) return "";
    const idStr = String(id);
    if (idStr.includes("-")) {
      const parts = idStr.split("-");
      // Always take the last segment — it is always the real courier_request ID
      return parts[parts.length - 1];
    }
    return idStr;
  }, [id]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {

    setIsMounted(true);
  }, []);

  const isCourier = isMounted && activeModule === "courier";
  const backPath = isCourier ? "/my-account/couriers" : "/my-account/orders";
  const backLabel = isCourier ? t("userLayout.myCouriers", "My Couriers") : t("pageTitle.orders", "Orders");

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return t("courier.status.pendingLabel", "Awaiting Rider");
      case "assigned": return t("courier.status.assignedLabel", "Assigned");
      case "picked_up": return t("courier.status.pickedUpLabel", "Picked Up");
      case "in_transit": return t("courier.status.inTransitLabel", "In Transit");
      case "delivered": return t("courier.status.deliveredLabel", "Delivered");
      case "cancelled": return t("courier.status.cancelledLabel", "Cancelled");
      case "failed_delivery": return t("courier.status.failedLabel", "Failed");
      case "return_to_sender": return t("courier.status.returningLabel", "Returning to Sender");
      case "returned": return t("courier.status.returnedLabel", "Returned");
      default: return status;
    }
  };

  const getBadgeColor = (status: string): "success" | "danger" | "warning" | "primary" | "default" => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "returned":
        return "success";
      case "cancelled":
      case "failed_delivery":
        return "danger";
      case "return_to_sender":
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

  const shouldFetch = typeof window !== "undefined" && !!resolvedId;

  // 1. Poll dynamic booking details and status
  const { data: bookingRes, error: bookingError } = useSWR(
    shouldFetch ? `/api/courier/requests/${resolvedId}` : null,
    async () => {
      const res = await getCourierDetails(resolvedId as string);
      if (!res.success) throw new Error(res.message || "Failed to load details");
      return res.data;
    },
    { refreshInterval: 10000 }
  );

  const booking = bookingRes?.courier_request;

  // 2. Poll live rider coordinates and ETA
  const { data: trackingRes, isLoading: isTrackingLoading } = useSWR(
    shouldFetch && !["delivered", "cancelled", "returned", "failed_delivery"].includes(booking?.status || "")
      ? `/api/courier/requests/${resolvedId}/tracking`
      : null,
    async () => {
      const res = await getCourierTracking(resolvedId as string);
      return res.success ? res.data : null;
    },
    { refreshInterval: 5000 }
  );

  const tracking = trackingRes;

  // Status mapping to helper steps
  const getActiveStep = (status: string) => {
    switch (status?.toLowerCase().replace(/ /g, '_')) {
      case "pending": return 0;
      case "assigned": return 1;
      case "picked_up": return 2;
      case "in_transit": return 3;
      case "return_to_sender": return 3; // Treat as "In Transit" (back to sender)
      case "delivered": return 4;
      case "returned": return 4;
      default: return 0;
    }
  };

  const bookingStatus = booking?.status?.toLowerCase().replace(/ /g, '_') || "";
  const isFailed = bookingStatus === "cancelled" || bookingStatus === "failed" || bookingStatus === "failed_delivery" || bookingStatus === "returned";

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      addToast({ title: "Validation Error", description: t("courier.provideCancelReason", "Please provide a reason for cancellation"), color: "danger" });
      return;
    }
    setIsCancelling(true);
    const res = await cancelCourierRequest(resolvedId as string, cancelReason);
    setIsCancelling(false);
    if (res.success) {
      addToast({ title: "Success", description: res.message || t("courier.cancelSuccess", "Booking cancelled successfully"), color: "success" });
      setIsCancelModalOpen(false);
      // Re-fetch booking details
      router.replace(router.asPath);
    } else {
      addToast({ title: "Error", description: res.message || t("courier.cancelFailed", "Failed to cancel booking"), color: "danger" });
    }
  };

  const renderContent = (content: React.ReactNode) => (
    <>
      <MyBreadcrumbs
        homeHref={isCourier ? "/courier" : "/"}
        breadcrumbs={[
          { href: backPath, label: backLabel },
          { href: "#", label: `${t("courier.booking", "Courier Booking")} #${resolvedId}` },
        ]}
      />
      <PageHead pageTitle={`Courier Booking #${resolvedId}`} />
      <UserLayout activeTab={isCourier ? "couriers" : "orders"}>
        <div className="w-full space-y-6">
          <div className="flex items-center select-none pt-2">
            <button
              onClick={() => router.push(backPath)}
              className="flex items-center gap-2 text-default-800 dark:text-white font-semibold text-sm hover:opacity-85 transition-opacity cursor-pointer bg-transparent border-none outline-none"
            >
              <ArrowLeft className="w-4 h-4 text-default-800 dark:text-white" />
              <span>{isCourier ? t("courier.backToBookings", "Back to My Couriers") : t("courier.backToBookings", "Back to Orders")}</span>
            </button>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            {content}
          </div>
        </div>
      </UserLayout>
    </>
  );

  if (bookingError) {
    return renderContent(
      <div className="text-center py-10 space-y-4">
        <h3 className="text-lg font-semibold text-danger">{t("courier.errorLoading", "Error Loading Booking Details")}</h3>
        <p className="text-sm text-gray-500">{bookingError.message}</p>
        <Button color="primary" onPress={() => router.push(backPath)}>
          {isCourier ? t("courier.backToBookings", "Back to My Couriers") : t("courier.backToBookings", "Back to Orders")}
        </Button>
      </div>
    );
  }

  if (!booking) {
    return renderContent(
      <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" color="primary" />
        <span className="text-sm text-gray-500 font-medium">{t("courier.loadingDetails", "Loading booking details...")}</span>
      </div>
    );
  }

  const deliveryBoy = booking.delivery_boy || (booking as any).deliveryBoy;

  const steps = [
    { label: t("courier.status.placed", "Placed"), status: "pending" },
    { label: t("courier.status.assigned", "Assigned"), status: "assigned" },
    { label: t("courier.status.pickedUp", "Picked Up"), status: "picked_up" },
    { label: t("courier.status.inTransit", "In Transit"), status: "in_transit" },
    { label: t("courier.status.delivered", "Delivered"), status: "delivered" },
  ];

  const currentStepIndex = getActiveStep(booking.status);

  const isHeadingToPickup = bookingStatus === "assigned" || bookingStatus === "pending" || bookingStatus === "return_to_sender";
  const mapCustomerLocation = isHeadingToPickup
    ? { lat: Number(booking?.pickup_details?.lat || 0), lng: Number(booking?.pickup_details?.lng || 0) }
    : { lat: Number(booking?.drop_details?.lat || 0), lng: Number(booking?.drop_details?.lng || 0) };

  const mapCustomerAddress = isHeadingToPickup ? (booking?.pickup_details?.address || "") : (booking?.drop_details?.address || "");

  const riderLocationCoords = tracking?.latitude && tracking?.longitude
    ? { lat: Number(tracking.latitude), lng: Number(tracking.longitude) }
    : null;

  return (
    <>
      <MyBreadcrumbs
        homeHref={isCourier ? "/courier" : "/"}
        breadcrumbs={[
          { href: backPath, label: backLabel },
          { href: "#", label: `${t("courier.booking", "Courier Booking")} #${booking.id}` },
        ]}
      />
      <PageHead pageTitle={`Courier Booking #${booking.id}`} />

      <UserLayout activeTab={isCourier ? "couriers" : "orders"}>
        <div className="w-full space-y-6 pb-20 text-start">

          {/* Header Title with Back button and Status Badge matching Order Detail page layout */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4 border-b border-gray-100 dark:border-default-100 pb-4">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="flat"
                color="default"
                size="sm"
                onPress={() => router.push(backPath)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t("courier.bookingDetail", "Courier Booking")} #{booking.id}
                  </h1>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("courier.placedOn", "Placed on")} {getFormattedDate(booking.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {["assigned", "picked_up", "in_transit"].includes(bookingStatus) && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  className="font-semibold text-xs h-8"
                  onPress={() => setIsTrackModalOpen(true)}
                >
                  {t("track", "Track Live")}
                </Button>
              )}
              {(bookingStatus === "pending" || bookingStatus === "assigned") && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="font-semibold text-xs h-8"
                  onPress={() => setIsCancelModalOpen(true)}
                >
                  {t("courier.cancelBooking", "Cancel Booking")}
                </Button>
              )}
              <Chip
                color={getBadgeColor(booking.status)}
                variant="flat"
                size="sm"
                radius="sm"
                className="text-xs h-8 cursor-pointer font-semibold uppercase tracking-wider px-3"
                title={getStatusLabel(booking.status)}
              >
                {getStatusLabel(booking.status)}
              </Chip>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Specifications, Addresses & Tracking Maps */}
            <div className="lg:col-span-2 space-y-4">

              {/* Status Stepper Timeline Component */}
              {!isFailed && (
                <Card shadow="sm" radius="sm">
                  <CardBody className="p-6">
                    <div className="w-full">
                      {/* Stepper Steps UI */}
                      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-4 select-none">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;
                          const isActive = idx === currentStepIndex;

                          return (
                            <div key={idx} className="flex-1 flex sm:flex-col items-center gap-4 sm:gap-2 w-full text-start sm:text-center relative">
                              {/* Visual Progress Connector bar */}
                              {idx < steps.length - 1 && (
                                <div className="hidden sm:block absolute left-1/2 top-4 w-full h-0.5 bg-gray-100 dark:bg-default-100 -z-10">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: idx < currentStepIndex ? "100%" : "0%" }}
                                  />
                                </div>
                              )}

                              {/* Circle Pin indicator */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isCompleted
                                ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                                : "bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
                                }`}>
                                {idx <= currentStepIndex ? "✓" : idx + 1}
                              </div>

                              {/* Label */}
                              <div className="flex flex-col">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-primary" : isCompleted ? "text-gray-800 dark:text-gray-200" : "text-gray-400"
                                  }`}>
                                  {step.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Parcel Specifications Card matching Order Items layout */}
              <Card shadow="sm" radius="sm">
                <CardHeader className="pb-3 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("courier.packageDetails", "Parcel Specifications")}
                    </h3>
                  </div>
                </CardHeader>
                <Divider className="my-0 opacity-50" />
                <CardBody className="py-4 px-4">
                  {/* Dedicated full-width wrapping container for Item Description */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4 text-start">
                    <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-1">
                      {t("courier.checkout.itemName", "Item Description")}
                    </span>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed break-words whitespace-pre-line">
                      {booking.item_description || t("courier.defaultItemDesc", "Courier Delivery")}
                    </p>
                  </div>

                  {/* Balanced 4-column responsive grid layout for physical parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-1">
                        {t("courier.parcelType", "Parcel Type")}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block capitalize">
                        {typeof booking.parcel_type === "object" && booking.parcel_type !== null
                          ? (booking.parcel_type as any).name || t("na")
                          : (booking.parcel_type || (booking as any).parcel_type_data?.name || t("na"))}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-1">
                        {t("courier.parcelSize", "Parcel Size")}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block capitalize">
                        {booking.parcel_size || t("na")}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-1">
                        {t("courier.checkout.itemWeight", "Parcel Weight")}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                        {booking.weight_kg} Kg
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-1">
                        {t("courier.dimensions", "Dimensions (L x W x H)")}
                      </span>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                        {booking.length_cm || "0"} x {booking.width_cm || "0"} x {booking.height_cm || "0"} cm
                      </span>
                    </div>
                  </div>

                  {/* Uploaded Parcel Image */}
                  {booking.item_image && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center flex flex-col items-center">
                      <span className="text-xxs text-lightText font-semibold uppercase tracking-wider block mb-2 w-full text-start">
                        {t("courier.parcelImage", "Parcel Image")}
                      </span>
                      <img
                        src={booking.item_image}
                        alt="Parcel"
                        className="max-h-48 w-auto rounded-lg object-contain shadow-sm border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Delivery Locations details card matching ShippingAddress layout */}
              <Card shadow="sm" radius="sm">
                <CardHeader className="pb-3 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("courier.deliveryLocations", "Delivery Route")}
                    </h3>
                  </div>
                  {/* Track Modal Trigger */}
                  <div className="flex items-center gap-1 text-xs">
                    <Map className="w-3.5 h-3.5 text-primary-500" />
                    <button
                      onClick={() => setIsTrackModalOpen(true)}
                      className="text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                      title={t("viewOnMap")}
                    >
                      {t("viewOnMap")}
                    </button>
                  </div>
                </CardHeader>
                <Divider className="my-0 opacity-50" />
                <CardBody className="py-4 px-4 space-y-4">
                  {/* Sender details */}
                  <div className="flex items-start gap-3">
                    <Avatar
                      showFallback
                      name={booking.sender_name || booking.user?.name}
                      size="sm"
                      className="shrink-0 w-8 h-8 text-[10px]"
                      title={booking.sender_name || booking.user?.name}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t("courier.checkout.sender", "Sender")} - {booking.sender_name || booking.user?.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 leading-snug space-y-1">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" />
                          <span>{booking?.pickup_details?.address}</span>
                        </div>
                      </div>
                      {(booking.sender_phone || booking.user?.mobile) && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{booking.sender_phone || booking.user?.mobile}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider className="opacity-50 my-2" />

                  {/* Recipient details */}
                  <div className="flex items-start gap-3">
                    <Avatar
                      showFallback
                      name={booking.receiver_name}
                      size="sm"
                      className="shrink-0 w-8 h-8 text-[10px]"
                      title={booking.receiver_name}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t("courier.checkout.recipient", "Recipient")} - {booking.receiver_name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 leading-snug space-y-1">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" />
                          <span>{booking?.drop_details?.address}</span>
                        </div>
                      </div>
                      {booking.receiver_phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mt-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{booking.receiver_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

            </div>

            {/* Right Column - Receipt Breakdown & Rider Details */}
            <div className="space-y-4">

              {/* Receipt Breakdown Card matching OrderSummary */}
              <Card shadow="sm" radius="lg" className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {t("orderSummary", "Order Summary")}
                    </h3>
                  </div>
                </CardHeader>
                <Divider className="my-0" />
                <CardBody className="py-4 px-4 space-y-0">
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-start">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t("courier.checkout.baseFare", "Base Fare")}</span>
                        <span className="text-xxs text-lightText">
                          {(booking as any).weight_pricing_enabled
                            ? t("checkout.includesFirstKmKg", "Includes first 1 km & 1 kg")
                            : t("checkout.includesFirstKm", "Includes first 1 km")}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {currencySymbol}{Number(booking.base_fare).toFixed(2)}
                      </span>
                    </div>

                    {Number(booking.distance_charge) > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col text-start">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t("courier.checkout.distanceCharge", "Distance Charge")}</span>
                          <span className="text-xxs text-lightText">
                            {Math.max(0, Number(booking.distance_km) - 1).toFixed(2)} extra km x {currencySymbol}{Number(booking.distance_rate).toFixed(2)}/km
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {currencySymbol}{Number(booking.distance_charge).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(booking.weight_charge) > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col text-start">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t("courier.checkout.weightCharge", "Weight Charge")}</span>
                          <span className="text-xxs text-lightText">
                            {Math.max(0, Number(booking.weight_kg) - 1).toFixed(2)} extra kg x {currencySymbol}{Number(booking.per_kg_rate).toFixed(2)}/kg
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {currencySymbol}{Number(booking.weight_charge).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {(() => {
                      const surgeAmount = Number(booking.surge_charge || 0);

                      return (
                        <>
                          {surgeAmount > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col text-start">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t("courier.checkout.surgeFee", "Surge/Demand Fee")}</span>
                                <span className="text-xxs text-lightText">{Number(booking.surge_multiplier || 1).toFixed(2)}x Multiplier applied</span>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {currencySymbol}{surgeAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {booking.extra_rto_charge !== undefined && booking.extra_rto_charge !== null && (
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col text-start">
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t("courier.checkout.extraRtoCharge", "Extra RTO Charge")}</span>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                + {currencySymbol}{Number(booking.extra_rto_charge).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <Divider className="mb-3" />

                  {/* Final Total */}
                  <div className="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3">
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {t("finalTotal") || "Final Total"}
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {currencySymbol}{Number(booking.total_price).toFixed(2)}
                    </span>
                  </div>

                  {/* Total Paid or Total Payable depending on state */}
                  <div className="flex justify-between items-center py-2 px-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {booking.payment_status === "paid" ? t("checkout.totalAmount", "Total Paid") : t("totalPayable", "Total Payable")}
                    </span>
                    <span className={`text-base font-bold ${booking.payment_status === "paid" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {currencySymbol}{Number(booking.total_price).toFixed(2)}
                    </span>
                  </div>

                  {booking.already_payable_amount !== undefined && booking.already_payable_amount !== null && (
                    <div className="flex justify-between items-center py-2 px-3 border-t border-dashed border-default-200 dark:border-default-700/50 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("courier.alreadyPayableAmount", "Already Paid")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {currencySymbol}{Number(booking.already_payable_amount).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {booking.remaining_pending_amount !== undefined && booking.remaining_pending_amount !== null && (
                    <div className="flex justify-between items-center py-2 px-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("courier.remainingPendingAmount", "Remaining Pending Amount")}
                      </span>
                      <span className="text-sm font-semibold text-danger-600 dark:text-danger-400">
                        {currencySymbol}{Number(booking.remaining_pending_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* RTO Warning Notice */}
              {booking.extra_rto_charge !== undefined && booking.extra_rto_charge !== null && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 mt-4 mb-4">
                  <div className="mt-0.5 text-amber-600 dark:text-amber-500 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                      {t("courier.rtoNoticeTitle", "Courier Delivery Failure Charge")}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                      {t("courier.rtoNoticeBody", `If delivery fails due to receiver issues (e.g., incorrect address, unavailable), a revised total fee of ${currencySymbol}${Number(booking.extra_rto_charge).toFixed(2)} (including original charge) will apply.`)}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Details Card matching PaymentInfo */}
              <Card shadow="sm" radius="sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("paymentDetails", "Payment Details")}
                    </h3>
                  </div>
                </CardHeader>
                <Divider className="my-0 opacity-50" />
                <CardBody className="py-3 px-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {t("courier.paymentType", "Payment Method")}
                    </span>
                    <Chip size="sm" radius="sm" variant="flat" color="primary" className="text-xxs font-bold uppercase">
                      {booking.payment_method}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {t("paymentStatus", "Payment Status")}
                    </span>
                    <Chip
                      size="sm"
                      radius="sm"
                      variant="flat"
                      color={booking.payment_status === "paid" ? "success" : "warning"}
                      className="text-xxs font-bold uppercase"
                    >
                      {booking.payment_status || "Pending"}
                    </Chip>
                  </div>
                  {(() => {
                    const txId =
                      (booking as any).transaction_id ||
                      (booking as any).transactionId ||
                      (booking as any).payment_transaction_id ||
                      (booking as any).transaction_ref ||
                      "";
                    if (!txId || String(txId).trim() === "") return null;
                    return (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {t("transactionId", "Transaction ID")}
                        </span>
                        <span className="font-mono font-medium text-gray-800 dark:text-gray-200 select-all">
                          {String(txId).trim()}
                        </span>
                      </div>
                    );
                  })()}
                </CardBody>
              </Card>

              {/* Rider / Delivery Info Card matching DeliveryInfo */}
              <Card shadow="sm" radius="sm">
                <CardHeader className="pb-2 flex justify-between w-full items-start">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("deliveryInfo", "Delivery Info")}
                    </h3>
                  </div>
                  {booking.delivery_otp && (
                    <div className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-md border border-primary/20 dark:border-primary/30">
                      <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        OTP
                      </span>
                      <span className="text-sm font-bold tracking-widest text-primary-700 dark:text-primary-300">
                        {booking.delivery_otp}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <Divider className="my-0 opacity-50" />
                <CardBody className="py-3 px-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {t("fulfillmentType", "Fulfillment Type")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {t("courier.hyperlocal", "Hyperlocal Courier")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {t("estDeliveryTime", "Est. Delivery")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {booking.distance_km ? `${booking.distance_km} km` : t("na")}
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Delivery Partner Details Card matching Orders exactly */}
              {deliveryBoy && (
                <Card shadow="sm" radius="sm">
                  <CardHeader className="pb-2 flex justify-between w-full items-start">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t("deliveryPartner", "Delivery Partner")}
                      </h3>
                    </div>
                    {booking.status?.toLowerCase() === "delivered" &&
                      !booking.is_delivery_feedback_given && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          className="text-xs"
                          onPress={onDeliveryRatingOpen}
                          startContent={<Truck className="w-4 h-4" />}
                          title={t("deliveryReview")}
                        >
                          {t("deliveryReview")}
                        </Button>
                      )}
                  </CardHeader>
                  <Divider className="my-0 opacity-50" />
                  <CardBody className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <Avatar
                        showFallback
                        name={deliveryBoy.user?.name}
                        size="sm"
                        className="shrink-0 w-10 h-10 text-xs font-bold"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {deliveryBoy.user?.name}
                        </div>
                        {deliveryBoy.user?.mobile && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <a href={`tel:${deliveryBoy.user.mobile}`} className="text-primary-600 hover:underline">
                              {deliveryBoy.user.mobile}
                            </a>
                          </div>
                        )}
                        <Chip size="sm" variant="flat" color="success" className="text-xxs font-bold capitalize">
                          {deliveryBoy.vehicle_type || "Bike"}
                        </Chip>

                        {booking.delivery_feedback && (
                          <div className="flex items-start w-full justify-between gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md mt-2">
                            <div className="flex items-start gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">
                                  {booking.delivery_feedback.rating}/5
                                </span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="text-xs font-medium">
                                  {booking.delivery_feedback.title}
                                </div>
                                <div className="text-xxs text-foreground/50 block ml-1">
                                  {booking.delivery_feedback.description}
                                </div>
                              </div>
                            </div>
                            <Button
                              isIconOnly
                              variant="light"
                              color="primary"
                              size="sm"
                              className="p-0"
                              onPress={onDeliveryRatingOpen}
                              startContent={<Edit className="w-4 h-4" />}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Cancellation Info Card matching Order Note layout */}
              {isFailed && (
                <Card shadow="sm" radius="sm">
                  <CardHeader className="pb-2">
                    <h3 className="text-sm font-medium text-danger">{t("courier.cancellationReason", "Cancellation Info")}</h3>
                  </CardHeader>
                  <Divider className="my-0 opacity-50" />
                  <CardBody className="py-3 px-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{booking.cancellation_reason || t("courier.defaultCancelReason", "Booking was cancelled.")}</p>
                  </CardBody>
                </Card>
              )}

            </div>

          </div>

          {/* Modals */}
          {booking && (
            <TrackCourierModal
              isOpen={isTrackModalOpen}
              onClose={() => setIsTrackModalOpen(false)}
              courierRequest={booking as any}
            />
          )}

        </div>
      </UserLayout>

      {isTrackModalOpen && (
        <TrackCourierModal
          isOpen={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
          courierRequest={booking}
        />
      )}

      {/* Cancel Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("courier.cancelBooking", "Cancel Booking")}
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("courier.cancelConfirmMsg", "Are you sure you want to cancel this booking? Please provide a reason below.")}
                </p>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={t("courier.cancelReasonPlaceholder", "Reason for cancellation")}
                  minRows={3}
                  className="mt-2"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={isCancelling}>
                  {t("close")}
                </Button>
                <Button color="danger" onPress={handleCancelBooking} isLoading={isCancelling}>
                  {t("courier.confirmCancel", "Confirm Cancel")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Rating Modal */}
      {booking.status?.toLowerCase() === "delivered" && deliveryBoy?.id && (
        <RatingModal
          isOpen={isDeliveryRatingOpen}
          onClose={onDeliveryRatingClose}
          deliveryBoyId={deliveryBoy.id}
          courierRequestId={booking.id}
          type="delivery"
          existingReview={
            booking.is_delivery_feedback_given && booking.delivery_feedback
              ? {
                id: booking.delivery_feedback.id,
                rating: booking.delivery_feedback.rating,
                title: booking.delivery_feedback.title,
                comment: booking.delivery_feedback.description,
              }
              : null
          }
        />
      )}
    </>
  );
};

export default CourierBookingDetailPage;
