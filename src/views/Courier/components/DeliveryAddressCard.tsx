import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "@heroui/react";
import { Edit2, Map } from "lucide-react";
// import LocationAutoComplete from "@/components/Location/LocationAutoComplete";
import { useSettings } from "@/contexts/SettingsContext";
import CourierAddressMapModal from "./CourierAddressMapModal";
import type { LocationAutoCompleteRef } from "@/components/Location/types/LocationAutoComplete.types";
import dynamic from "next/dynamic";

const PhoneInput = dynamic(() => import("@/components/Functional/PhoneInput"), { ssr: false });
import type { AddressDetails } from "./PickupAddressCard";

interface DeliveryAddressCardProps {
    drop: AddressDetails;
    setDrop: React.Dispatch<React.SetStateAction<AddressDetails>>;
    dropConfirmed: boolean;
    setDropConfirmed: (confirmed: boolean) => void;
    pickupConfirmed: boolean;
    savedAddresses: any[];
    fillFromSaved: (addr: any, type: "pickup" | "drop") => void;
    dropAutoCompleteRef: React.RefObject<LocationAutoCompleteRef | null>;
    zones?: any[];
    zoneId?: number | null;
}

const DeliveryAddressCard: React.FC<DeliveryAddressCardProps> = ({
    drop,
    setDrop,
    dropConfirmed,
    setDropConfirmed,
    pickupConfirmed,
    savedAddresses,
    fillFromSaved,
    dropAutoCompleteRef,
    zones = [],
    zoneId,
}) => {
    const { t } = useTranslation();
    const { defaultLocation } = useSettings();
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleConfirmMapLocation = (address: string, lat: number, lng: number) => {
        setDrop(prev => ({
            ...prev,
            address,
            lat,
            lng
        }));
        if (errors.address) setErrors(e => ({ ...e, address: "" }));
        dropAutoCompleteRef.current?.setInputValue(address);
    };

    return (
        <div className="flex gap-4 items-start relative">
            {/* Timeline tag Column */}
            <div className="hidden sm:flex items-center justify-end gap-3 w-20 pt-5 shrink-0 select-none z-10">
                <span className="font-semibold text-lightText text-lg">{t("courier.to")}</span>
                <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
            </div>

            {/* Card container */}
            <Card className={`flex-1 bg-white dark:bg-content1 rounded-3xl border border-gray-200 dark:border-default-100 transition-all duration-300 ${(pickupConfirmed && !dropConfirmed)
                ? "shadow-lg shadow-gray-100/50 dark:shadow-none"
                : "shadow-sm"
                }`}>
                <CardBody className="p-8 md:p-10 space-y-6">
                    <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-xl text-gray-800 dark:text-foreground tracking-tight flex items-center gap-2">
                            {t("courier.deliveryAddress")}
                            {dropConfirmed && (
                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs animate-scaleIn">✓</span>
                            )}
                        </h3>
                        {dropConfirmed && (
                            <button
                                type="button"
                                className="p-1.5 rounded-lg text-lightText hover:text-primary hover:bg-gray-50 transition-colors"
                                onClick={() => setDropConfirmed(false)}
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
                                onClick={() => { if(!dropConfirmed) setIsMapModalOpen(true); }}
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 text-foreground flex items-center cursor-pointer transition-colors ${errors.address ? 'border-red-500' : 'border-default-200/50 dark:border-default-100/50 hover:border-primary'} ${dropConfirmed ? 'opacity-70 pointer-events-none bg-gray-50 dark:bg-content3' : ''}`}
                            >
                                <div className="flex items-center gap-2 w-full overflow-hidden">
                                    <Map className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className={`line-clamp-1 flex-1 ${drop.address ? 'text-foreground font-medium' : 'text-gray-400'}`}>
                                        {drop.address || t("courier.enterAddressPlaceholder", "Select location on map")}
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
                                disabled={dropConfirmed}
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-default-200/50 dark:border-default-100/50 focus:border-primary'}`}
                                placeholder={t("courier.emailPlaceholder")}
                                value={drop.email}
                                onChange={(e) => {
                                    setDrop(p => ({ ...p, email: e.target.value }));
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
                                    defaultValue={drop.phone}
                                    isReadOnly={dropConfirmed}
                                    variant="bordered"
                                    onPhoneChange={(countryCode, phoneNumber, dialCode, name) => {
                                        setDrop(p => ({ ...p, phone: phoneNumber, countryCode: dialCode }));
                                        if (errors.phone) setErrors(e => ({ ...e, phone: "" }));
                                    }}
                                    className={`w-full ${errors.phone ? '[&_[data-slot=input-wrapper]]:!border-danger' : ''}`}
                                />
                                {errors.phone && <span className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</span>}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.recipientNameLabel", "Recipient Name")} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    disabled={dropConfirmed}
                                    className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-default-200/50 dark:border-default-100/50 focus:border-primary'}`}
                                    placeholder={t("courier.recipientNamePlaceholder")}
                                    value={drop.name}
                                    onChange={(e) => {
                                        setDrop(p => ({ ...p, name: e.target.value }));
                                        if (errors.name) setErrors(e => ({ ...e, name: "" }));
                                    }}
                                />
                                {errors.name && <span className="text-xs text-red-500 mt-1 ml-1">{errors.name}</span>}
                            </div>
                        </div>



                        {/* Special Instructions for Rider (Receiver) */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                                {t("courier.receiverInstructionsLabel", "Special Instructions for Rider")}
                            </label>
                            <input
                                type="text"
                                disabled={dropConfirmed}
                                className="w-full h-12 px-4 border border-default-200/50 dark:border-default-100/50 rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-content3 disabled:text-gray-400 dark:disabled:text-default-400 disabled:cursor-not-allowed"
                                placeholder={t("courier.receiverNotePlaceholder", "e.g. Leave at gate, building B (optional)")}
                                value={drop.note}
                                onChange={(e) => setDrop(p => ({ ...p, note: e.target.value }))}
                            />
                        </div>

                        {/* Aligned Save CTA */}
                        {!dropConfirmed && (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    className="px-8 h-11 text-sm font-semibold text-white bg-primary hover:bg-primary-600 active:scale-98 disabled:bg-gray-100 dark:disabled:bg-default-100 disabled:text-gray-400 dark:disabled:text-default-400 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                                    onClick={() => {
                                        const newErrors: Record<string, string> = {};
                                        if (!drop.address || drop.address.length < 5) newErrors.address = t("courier.error.address", "Please enter a valid address");
                                        if (drop.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(drop.email)) newErrors.email = t("courier.error.email", "Please enter a valid email");
                                        const phoneRegex = /^\+?[0-9]{6,15}$/;
                                        if (!drop.phone || !phoneRegex.test(drop.phone)) newErrors.phone = t("courier.error.phone", "Please enter a valid phone number");
                                        if (!drop.name || drop.name.trim().length < 2) newErrors.name = t("courier.error.name", "Please enter a valid name");
                                        setErrors(newErrors);
                                        if (Object.keys(newErrors).length === 0) setDropConfirmed(true);
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
                    lat: drop.lat || defaultLocation?.lat || 18.5204,
                    lng: drop.lng || defaultLocation?.lng || 73.8567
                }}
                initialAddress={drop.address || ""}
                zones={zones}
                requiredZoneId={zoneId}
                isPickup={false}
                oppositeZoneId={zoneId}
            />
        </div>
    );
};

export default DeliveryAddressCard;
