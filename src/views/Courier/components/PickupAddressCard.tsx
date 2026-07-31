import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "@heroui/react";
import { Edit2, Map } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import CourierAddressMapModal from "./CourierAddressMapModal";
import type { LocationAutoCompleteRef } from "@/components/Location/types/LocationAutoComplete.types";
import dynamic from "next/dynamic";

const PhoneInput = dynamic(() => import("@/components/Functional/PhoneInput"), { ssr: false });

export interface AddressDetails {
    name: string;
    phone: string;
    countryCode?: string;
    address: string;
    flatNo: string;
    lat: number;
    lng: number;
    note: string;
    date: string;
    email: string;
}

interface PickupAddressCardProps {
    pickup: AddressDetails;
    setPickup: React.Dispatch<React.SetStateAction<AddressDetails>>;
    pickupConfirmed: boolean;
    setPickupConfirmed: (confirmed: boolean) => void;
    savedAddresses: any[];
    fillFromSaved: (addr: any, type: "pickup" | "drop") => void;
    pickupAutoCompleteRef: React.RefObject<LocationAutoCompleteRef | null>;
    zones?: any[];
    zoneId?: number | null;
}

const PickupAddressCard: React.FC<PickupAddressCardProps> = ({
    pickup,
    setPickup,
    pickupConfirmed,
    setPickupConfirmed,
    savedAddresses,
    fillFromSaved,
    pickupAutoCompleteRef,
    zones = [],
    zoneId,
}) => {
    const { t } = useTranslation();
    const { defaultLocation } = useSettings();
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleConfirmMapLocation = (address: string, lat: number, lng: number) => {
        setPickup(prev => ({
            ...prev,
            address,
            lat,
            lng
        }));
        if (errors.address) setErrors(e => ({ ...e, address: "" }));
        pickupAutoCompleteRef.current?.setInputValue(address);
    };

    return (
        <div className="flex gap-4 items-start relative">
            {/* Timeline tag Column */}
            <div className="hidden sm:flex items-center justify-end gap-3 w-20 pt-5 shrink-0 select-none z-10">
                <span className="font-semibold text-lightText text-lg">{t("courier.from")}</span>
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
            </div>

            {/* Card container */}
            <Card className={`flex-1 bg-white dark:bg-content1 rounded-3xl border border-gray-200 dark:border-default-100 transition-all duration-300 ${!pickupConfirmed
                ? "shadow-lg shadow-gray-100/50 dark:shadow-none"
                : "shadow-sm"
                }`}>
                <CardBody className="p-8 md:p-10 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-xl text-gray-800 dark:text-foreground tracking-tight flex items-center gap-2">
                            {t("courier.pickUpAddress")}
                            {pickupConfirmed && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs animate-scaleIn">✓</span>
                            )}
                        </h3>
                        {pickupConfirmed && (
                            <button
                                type="button"
                                className="p-1.5 rounded-lg text-lightText hover:text-primary hover:bg-gray-50 transition-colors"
                                onClick={() => setPickupConfirmed(false)}
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Location Selection Box */}
                        <div className="flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-lightText uppercase tracking-wider">
                                    {t("courier.locationLabel", "Location")} <span className="text-red-500">*</span>
                                </span>
                            </div>
                            <div
                                onClick={() => { if (!pickupConfirmed) setIsMapModalOpen(true); }}
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 text-foreground flex items-center cursor-pointer transition-colors ${errors.address ? 'border-red-500' : 'border-default-200/50 dark:border-default-100/50 hover:border-primary'} ${pickupConfirmed ? 'opacity-70 pointer-events-none bg-gray-50 dark:bg-content3' : ''}`}
                            >
                                <div className="flex items-center gap-2 w-full overflow-hidden">
                                    <Map className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className={`line-clamp-1 flex-1 ${pickup.address ? 'text-foreground font-medium' : 'text-gray-400'}`}>
                                        {pickup.address || t("courier.enterAddressPlaceholder", "Select location on map")}
                                    </span>
                                </div>
                            </div>
                            {errors.address && <span className="text-xs text-red-500 mt-1 ml-1">{errors.address}</span>}
                        </div>


                        {/* E-Mail layout */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.emailLabel")}</label>
                            <input
                                type="email"
                                disabled={pickupConfirmed}
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-default-200/50 dark:border-default-100/50 focus:border-primary'}`}
                                placeholder={t("courier.emailPlaceholder")}
                                value={pickup.email}
                                onChange={(e) => {
                                    setPickup(p => ({ ...p, email: e.target.value }));
                                    if (errors.email) setErrors(e => ({ ...e, email: "" }));
                                }}
                            />
                            {errors.email && <span className="text-xs text-red-500 mt-1 ml-1">{errors.email}</span>}
                        </div>

                        {/* 2-Column layout: Mobile and Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.mobileNumberLabel")} <span className="text-red-500">*</span></label>
                                <PhoneInput
                                    label=""
                                    defaultCountry="IN"
                                    defaultValue={pickup.phone}
                                    isReadOnly={pickupConfirmed}
                                    variant="bordered"
                                    onPhoneChange={(countryCode, phoneNumber, dialCode, name) => {
                                        setPickup(p => ({ ...p, phone: phoneNumber, countryCode: dialCode }));
                                        if (errors.phone) setErrors(e => ({ ...e, phone: "" }));
                                    }}
                                    className={`w-full ${errors.phone ? '[&_[data-slot=input-wrapper]]:!border-danger' : ''}`}
                                />
                                {errors.phone && <span className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</span>}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.senderNameLabel")} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    disabled={pickupConfirmed}
                                    className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-default-200/50 dark:border-default-100/50 focus:border-primary'}`}
                                    placeholder={t("courier.senderNamePlaceholder")}
                                    value={pickup.name}
                                    onChange={(e) => {
                                        setPickup(p => ({ ...p, name: e.target.value }));
                                        if (errors.name) setErrors(e => ({ ...e, name: "" }));
                                    }}
                                />
                                {errors.name && <span className="text-xs text-red-500 mt-1 ml-1">{errors.name}</span>}
                            </div>
                        </div>



                        {/* Special Instructions for Rider (Sender) */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                                {t("courier.senderInstructionsLabel", "Special Instructions for Rider")}
                            </label>
                            <input
                                type="text"
                                disabled={pickupConfirmed}
                                className="w-full h-12 px-4 border border-default-200/50 dark:border-default-100/50 rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed"
                                placeholder={t("courier.senderNotePlaceholder", "e.g. Call before arriving, fragile item (optional)")}
                                value={pickup.note}
                                onChange={(e) => setPickup(p => ({ ...p, note: e.target.value }))}
                            />
                        </div>

                        {/* Aligned Save CTA */}
                        {!pickupConfirmed && (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    className="px-8 h-11 text-sm font-semibold text-white bg-primary hover:bg-primary-600 active:scale-98 disabled:bg-gray-100 dark:disabled:bg-default-100 disabled:text-gray-400 dark:disabled:text-default-400 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                                    onClick={() => {
                                        const newErrors: Record<string, string> = {};
                                        if (!pickup.address || pickup.address.length < 5) newErrors.address = t("courier.error.address", "Please enter a valid address");
                                        if (pickup.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pickup.email)) newErrors.email = t("courier.error.email", "Please enter a valid email");
                                        const phoneRegex = /^\+?[0-9]{6,15}$/;
                                        if (!pickup.phone || !phoneRegex.test(pickup.phone)) newErrors.phone = t("courier.error.phone", "Please enter a valid phone number");
                                        if (!pickup.name || pickup.name.trim().length < 2) newErrors.name = t("courier.error.name", "Please enter a valid name");
                                        setErrors(newErrors);
                                        if (Object.keys(newErrors).length === 0) setPickupConfirmed(true);
                                    }}
                                >
                                    {t("courier.confirm")}
                                </button>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Premium Blurred Backdrop Map Selection Modal */}
            <CourierAddressMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onConfirm={handleConfirmMapLocation}
                initialCoords={{
                    lat: pickup.lat || defaultLocation?.lat || 18.5204,
                    lng: pickup.lng || defaultLocation?.lng || 73.8567
                }}
                initialAddress={pickup.address || ""}
                zones={zones}
                isPickup={true}
                oppositeZoneId={zoneId}
            />
        </div>
    );
};

export default PickupAddressCard;
