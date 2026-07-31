import React, { useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, Button, Switch, addToast } from "@heroui/react";
import { ArrowLeft, Edit2, MapPin, Package, FileText, Truck } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import { useSettings } from "@/contexts/SettingsContext";
import { formatAmount } from "@/helpers/functionalHelpers";
import CourierPaymentModal from "@/components/Modals/CourierPaymentModal";
import { setCourierBookingData } from "@/lib/redux/slices/checkoutSlice";

// Package Graphic using system PNG assets
const PackageGraphic: React.FC<{ size: string }> = ({ size }) => {
    const assetName = size === "small" || size === "medium" || size === "large" ? size : "medium";
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 dark:border-default-200 rounded-2xl w-36 h-36 shrink-0 shadow-sm group">
            <div className="flex-1 flex items-center justify-center overflow-hidden w-full h-24">
                <img
                    src={`/assets/${assetName}.png`}
                    alt={size}
                    className="max-h-full max-w-full object-contain select-none transform group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <span className="text-xs font-extrabold text-gray-500 tracking-wider uppercase mt-2">{size}</span>
        </div>
    );
};

const CourierCheckoutPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { currencySymbol } = useSettings();
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);
    const bookingData = useSelector((state: RootState) => state.checkout.courierBookingData);

    const [useWallet, setUseWallet] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // If no booking data exists, show elegant redirect view
    if (!isMounted) return null;

    if (!bookingData) {
        return (
            <div className="max-w-md mx-auto my-20 text-center space-y-6 px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-default-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Package className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("courier.checkout.emptyTitle", "No Booking Found")}</h2>
                <p className="text-gray-500 text-sm">
                    {t("courier.checkout.emptyDescription", "You haven't filled in any delivery details yet. Please start your booking.")}
                </p>
                <Button
                    color="primary"
                    className="font-bold h-12 w-full rounded-xl"
                    onPress={() => router.push("/courier/book?edit=true")}
                >
                    {t("courier.checkout.startBooking", "Start Booking")}
                </Button>
            </div>
        );
    }

    const { pickup, drop, parcel, fareData, zoneId } = bookingData;

    const getBookingPayload = () => {
        const weight_kg = parcel.size === "custom" ? Number(parcel.customWeight) || 1 : parcel.weight;
        return {
            pickup_details: {
                address: pickup.flatNo ? `${pickup.flatNo}, ${pickup.address}` : pickup.address,
                latitude: pickup.lat,
                longitude: pickup.lng,
                lat: pickup.lat,
                lng: pickup.lng,
                sender_name: pickup.name,
                sender_phone: pickup.phone,
                date: pickup.date,
                email: pickup.email,
            },
            drop_details: {
                address: drop.flatNo ? `${drop.flatNo}, ${drop.address}` : drop.address,
                latitude: drop.lat,
                longitude: drop.lng,
                lat: drop.lat,
                lng: drop.lng,
                receiver_name: drop.name,
                receiver_phone: drop.phone,
                date: drop.date,
                email: drop.email,
            },
            sender_note: pickup.note || "",
            receiver_note: drop.note || "",
            zone_id: zoneId,
            parcel_type_id: parcel.typeId,
            parcel_size: parcel.size,
            weight_kg,
            height_cm: Number(parcel.height) || 0,
            width_cm: Number(parcel.width) || 0,
            length_cm: Number(parcel.length) || 0,
            item_count: parcel.itemCount || 1,
            item_description: parcel.description || "Courier Delivery",
            sender_name: pickup.name,
            sender_phone: `${pickup.countryCode || '+91'}${pickup.phone}`,
            sender_email: pickup.email || undefined,
            receiver_name: drop.name,
            receiver_phone: `${drop.countryCode || '+91'}${drop.phone}`,
            receiver_email: drop.email || undefined,
            item_image: parcel.image || undefined,
        };
    };

    const handlePaymentSuccess = (res: any) => {
        if (res?.data?.courier_request?.id) {
            addToast({
                title: t("courier.toast.placedSuccess", "Booking Placed Successfully"),
                color: "success"
            });
            const userId = user?.id || "0";
            const uniquePart = Math.floor(Date.now() / 1000);
            dispatch(setCourierBookingData(null));
            router.push(`/my-account/bookings/courier-${uniquePart}-${userId}-${res.data.courier_request.id}`);
        }
    };


    const walletBalance = Number(user?.wallet_balance || 0);
    const totalPayable = Number(fareData?.total_price || 0);
    const baseFare = Number(fareData?.base_fare || 0);
    const weightCharge = Number(fareData?.weight_charge || 0);
    // Dynamically calculate distance charge if backend did not supply it directly
    const distanceCharge = fareData?.distance_charge !== undefined
        ? Number(fareData.distance_charge || 0)
        : Math.max(0, totalPayable - baseFare - weightCharge);

    const distanceKm = Number(fareData?.distance_km || 0);
    const distanceRate = Number(fareData?.distance_rate || 0);
    const weightKgUsed = Number(fareData?.weight_kg || 0);
    const perKgRate = Number(fareData?.per_kg_rate || 0);
    const surgeCharge = Number(fareData?.surge_charge || 0);
    const surgeMultiplier = Number(fareData?.surge_multiplier || 1.0);
    const weightPricingEnabled = Boolean(fareData?.weight_pricing_enabled);

    const handleSelectPayment = () => {
        setIsPaymentOpen(true);
    };

    const weight_kg = parcel.size === "custom" ? Number(parcel.customWeight) || 1 : parcel.weight;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 pb-20">
            {/* Figma-Style Header */}
            <div className="flex items-center select-none pt-2">
                <button
                    onClick={() => router.push("/courier/book?edit=true")}
                    className="flex items-center gap-2 text-default-800 dark:text-white font-semibold text-lg hover:opacity-85 transition-opacity cursor-pointer bg-transparent border-none outline-none"
                >
                    <ArrowLeft className="w-5 h-5 text-default-800 dark:text-white" />
                    <span>{t("back", "Back")}</span>
                </button>
            </div>

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Details */}
                <div className="lg:col-span-8 space-y-6">

                    {/* 1. Delivery Address Card */}
                    <Card className="w-full bg-white dark:bg-content1 rounded-2xl border border-gray-200 dark:border-default-100 shadow-md shadow-gray-100/40 dark:shadow-none transition-all duration-300">
                        <CardHeader className="flex gap-3 relative flex-col items-start p-4 pb-0 select-none">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex flex-col text-start">
                                    <h3 className="text-base md:text-lg font-semibold text-foreground">
                                        {t("courier.checkout.deliveryAddress", "Delivery Address")}
                                    </h3>
                                    <p className="text-xs text-lightText font-normal">
                                        {t("courier.checkout.locationsLabel", "Your delivery locations")}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4 p-4 pt-2">
                            {/* Sender Box card */}
                            <div className="relative border border-default-200/50 dark:border-default-100/50 rounded-xl p-4 flex gap-3.5 items-start group text-start">
                                <div className="w-5 h-5 rounded-full border-2 border-primary bg-white dark:bg-content1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-foreground">
                                            {t("courier.checkout.sender", "Sender")} - {pickup.name}
                                        </span>
                                        <button
                                            onClick={() => router.push("/courier/book?edit=true")}
                                            className="p-1 rounded-lg text-default-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none outline-none"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-default-700 leading-relaxed">{pickup.address}</p>
                                    <p className="text-sm text-gray-500 dark:text-default-700">{pickup.countryCode || '+91'} {pickup.phone}</p>
                                </div>
                            </div>

                            {/* Recipient Box card */}
                            <div className="relative border border-default-200/50 dark:border-default-100/50 rounded-xl p-4 flex gap-3.5 items-start group text-start">
                                <div className="w-5 h-5 rounded-full border-2 border-red-500 bg-white dark:bg-content1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-foreground">
                                            {t("courier.checkout.recipient", "Recipient")} - {drop.name}
                                        </span>
                                        <button
                                            onClick={() => router.push("/courier/book?edit=true")}
                                            className="p-1 rounded-lg text-default-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none outline-none"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-default-700 leading-relaxed">{drop.address}</p>
                                    <p className="text-sm text-gray-500 dark:text-default-700">{drop.countryCode || '+91'} {drop.phone}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. Your Item Details Card */}
                    <Card className="w-full bg-white dark:bg-content1 rounded-2xl border border-gray-200 dark:border-default-100 shadow-md shadow-gray-100/40 dark:shadow-none transition-all duration-300">
                        <CardHeader className="flex gap-3 relative flex-col items-start p-4 pb-0 select-none">
                            <div className="flex w-full justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-success-100 rounded-lg">
                                        <Package className="w-5 h-5 text-success-600 dark:text-success-400" />
                                    </div>
                                    <div className="flex flex-col text-start">
                                        <h3 className="text-base md:text-lg font-semibold text-foreground">
                                            {t("courier.checkout.itemDetails", "Your Item Details")}
                                        </h3>
                                        <p className="text-xs text-lightText font-normal">
                                            {t("courier.checkout.guaranteeLabel", "Delivery Guarantee")}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[12px] font-semibold px-2.5 py-0.5 text-lightText tracking-wider">1 Item</span>
                            </div>
                        </CardHeader>
                        <CardBody className="p-4 pt-2">
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-2">
                                {/* Package Graphic using system PNG assets */}
                                <PackageGraphic size={parcel.size} />

                                {/* Figma spec details (Regular styled inline lists!) */}
                                <div className="flex-1 space-y-2 text-start text-sm text-lightText font-medium w-full">
                                    <p>{t("courier.checkout.itemType", "Item Type")} - <span className="text-foreground font-semibold">{parcel.typeName || t("courier.checkout.standardItem", "Standard Item")}</span></p>
                                    {parcel.description && (
                                        <p>{t("courier.checkout.itemDescription", "Description")} - <span className="text-foreground font-semibold">{parcel.description}</span></p>
                                    )}
                                    <p>{t("courier.checkout.itemWeight", "Weight")} - <span className="text-foreground font-semibold">{weight_kg} kg</span></p>
                                    <p>{t("courier.checkout.itemHeight", "Height")} - <span className="text-foreground font-semibold">{parcel.height || "0"} cm</span></p>
                                    <p>{t("courier.checkout.itemWidth", "Width")} - <span className="text-foreground font-semibold">{parcel.width || "0"} cm</span></p>
                                    <p>{t("courier.checkout.itemLength", "Length")} - <span className="text-foreground font-semibold">{parcel.length || "0"} cm</span></p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 3. Note for the delivery rider Card */}
                    <Card className="w-full bg-white dark:bg-content1 rounded-2xl border border-gray-200 dark:border-default-100 shadow-md shadow-gray-100/40 dark:shadow-none transition-all duration-300">
                        <CardHeader className="flex gap-3 relative flex-col items-start p-4 pb-0 select-none">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-warning-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                                </div>
                                <div className="flex flex-col text-start">
                                    <h3 className="text-base md:text-lg font-semibold text-foreground">
                                        {t("courier.checkout.riderNote", "Note for the delivery rider")}
                                    </h3>
                                    <p className="text-xs text-lightText font-normal">
                                        {t("courier.checkout.riderInstructions", "Any instructions")}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="p-4 pt-2 space-y-3">
                            <div className="border border-default-200/50 dark:border-default-100/50 p-4 rounded-xl bg-default-50 dark:bg-content2 text-start">
                                <span className="text-xs font-bold text-lightText uppercase tracking-wider">{t("courier.checkout.senderNote", "Sender Note")}</span>
                                <p className="text-sm text-gray-500 dark:text-default-700 font-medium leading-relaxed mt-1">
                                    {pickup.note || t("courier.checkout.noInstructions", "No specific instructions provided")}
                                </p>
                            </div>
                            <div className="border border-default-200/50 dark:border-default-100/50 p-4 rounded-xl bg-default-50 dark:bg-content2 text-start">
                                <span className="text-xs font-bold text-lightText uppercase tracking-wider">{t("courier.checkout.recipientNote", "Recipient Note")}</span>
                                <p className="text-sm text-gray-500 dark:text-default-700 font-medium leading-relaxed mt-1">
                                    {drop.note || t("courier.checkout.noInstructions", "No specific instructions provided")}
                                </p>
                            </div>
                        </CardBody>
                    </Card>


                </div>

                {/* Right Column: Order Card (Sticky Panel) */}
                <div className="lg:col-span-4 lg:sticky lg:top-6 w-full">
                    <Card className="w-full bg-white dark:bg-content1 rounded-2xl border border-gray-200 dark:border-default-100 shadow-md shadow-gray-100/40 dark:shadow-none transition-all duration-300">
                        <CardHeader className="flex w-full justify-between items-center p-4 pb-2 px-4 select-none">
                            <h2 className="text-base md:text-lg font-semibold text-foreground">
                                {t("checkout.yourOrder")}
                            </h2>
                        </CardHeader>
                        <CardBody className="space-y-4 p-4 pt-0">
                            {/* Receipt card bordered container (Exactly as in Figma!) */}
                            <div className="border border-default-200/50 dark:border-default-100/50 rounded-xl p-4 flex flex-col gap-1 bg-white dark:bg-content2 text-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col text-start">
                                        <span className="text-gray-700 dark:text-default-800 font-medium">{t("courier.checkout.baseFare", "Base Fare")}</span>
                                        <span className="text-xxs text-lightText">
                                            {weightPricingEnabled
                                                ? t("checkout.includesFirstKmKg", "Includes first 1 km & 1 kg")
                                                : t("checkout.includesFirstKm", "Includes first 1 km")}
                                        </span>
                                    </div>
                                    <span className="text-foreground">
                                        {currencySymbol}{formatAmount(baseFare)}
                                    </span>
                                </div>

                                {distanceCharge > 0 && (
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col text-start">
                                            <span className="text-gray-700 dark:text-default-800 font-medium">{t("courier.checkout.distanceCharge", "Distance Charge")}</span>
                                            <span className="text-xxs text-lightText">
                                                {Math.max(0, distanceKm - 1).toFixed(2)} extra km x {currencySymbol}{formatAmount(distanceRate)}/km
                                            </span>
                                        </div>
                                        <span className="text-foreground">
                                            {currencySymbol}{formatAmount(distanceCharge)}
                                        </span>
                                    </div>
                                )}

                                {weightCharge > 0 && (
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col text-start">
                                            <span className="text-gray-700 dark:text-default-800 font-medium">{t("courier.checkout.weightCharge", "Weight Charge")}</span>
                                            <span className="text-xxs text-lightText">
                                                {Math.max(0, weightKgUsed - 1).toFixed(2)} extra kg x {currencySymbol}{formatAmount(perKgRate)}/kg
                                            </span>
                                        </div>
                                        <span className="text-foreground">
                                            {currencySymbol}{formatAmount(weightCharge)}
                                        </span>
                                    </div>
                                )}

                                {surgeCharge > 0 && (
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col text-start">
                                            <span className="text-gray-700 dark:text-default-800 font-medium">{t("courier.checkout.surgeFee", "Surge/Demand Fee")}</span>
                                            <span className="text-xxs text-lightText">
                                                {surgeMultiplier.toFixed(2)}x Multiplier applied
                                            </span>
                                        </div>
                                        <span className="text-foreground">
                                            {currencySymbol}{formatAmount(surgeCharge)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-lightText mt-1">
                                    <span className="font-semibold">{t("courier.checkout.estimatedDelivery", "Estimated Delivery")}</span>
                                    <span className="text-foreground">
                                        {fareData?.eta_minutes ? `${fareData.eta_minutes} Mins` : "20 Mins"}
                                    </span>
                                </div>

                                {/* Wallet Toggle integration */}
                                <div className="flex items-center justify-between pt-3 mt-2 border-t border-default-200 dark:border-default-100">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            isSelected={useWallet}
                                            onValueChange={setUseWallet}
                                            size="sm"
                                            classNames={{ label: "text-xs", thumbIcon: "w-2" }}
                                            color="success"
                                        >
                                            {t("checkout.useWalletBalance")}
                                        </Switch>
                                        <span className="text-xxs text-lightText">
                                            ({currencySymbol}{walletBalance.toFixed(2)})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Amount & Submit Button outside box */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-base font-semibold text-foreground">{t("checkout.totalAmount", "Total Amount")}</span>
                                    <span className="text-lg text-foreground">{currencySymbol}{formatAmount(totalPayable)}</span>
                                </div>

                                <Button
                                    onPress={handleSelectPayment}
                                    color="primary"
                                    className="w-full font-medium py-3 rounded-lg text-sm"
                                >
                                    {useWallet && walletBalance >= totalPayable
                                        ? t("courier.checkout.bookNow", "Book Now")
                                        : t("courier.checkout.selectPayment", "Select Payment Method")}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {fareData?.extra_rto_charge !== undefined && fareData?.extra_rto_charge !== null && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 text-start mt-4">
                            <div className="mt-0.5 text-amber-600 dark:text-amber-500 shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
                                    {t("courier.rtoNoticeTitle", "Courier Delivery Failure Charge")}
                                </h4>
                                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                                    {t("courier.rtoNoticeBody", `If delivery fails due to receiver issues (e.g., incorrect address, unavailable), a revised total fee of ${currencySymbol}${Number(fareData.extra_rto_charge).toFixed(2)} (including original charge) will apply.`)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Payment Integration overlays */}
            {isPaymentOpen && (
                <CourierPaymentModal
                    open={isPaymentOpen}
                    onOpenChange={setIsPaymentOpen}
                    formData={getBookingPayload()}
                    payableAmount={totalPayable}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default CourierCheckoutPage;
