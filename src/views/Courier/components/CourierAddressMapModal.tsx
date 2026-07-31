import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, Button, addToast } from "@heroui/react";
import LocationAutoComplete from "@/components/Location/LocationAutoComplete";
import GoogleMap from "@/components/Location/GoogleMap";
import { checkDeliveryZone } from "@/routes/api";
import type { LocationAutoCompleteRef } from "@/components/Location/types/LocationAutoComplete.types";

interface CourierAddressMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (address: string, lat: number, lng: number) => void;
    initialCoords: { lat: number; lng: number };
    initialAddress: string;
    zones: any[];
    requiredZoneId?: number | null;
    isPickup?: boolean;
    oppositeZoneId?: number | null;
}

const CourierAddressMapModal: React.FC<CourierAddressMapModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialCoords,
    initialAddress,
    zones,
    requiredZoneId,
    isPickup = false,
    oppositeZoneId,
}) => {
    const { t } = useTranslation();
    const [deliveryCheckLoading, setDeliveryCheckLoading] = useState(false);
    const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number }>(initialCoords);
    const [tempAddress, setTempAddress] = useState<string>(initialAddress);
    const tempAutocompleteRef = useRef<LocationAutoCompleteRef>(null);

    // Sync temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempCoords(initialCoords);
            setTempAddress(initialAddress);
            if (initialAddress) {
                setTimeout(() => {
                    tempAutocompleteRef.current?.setInputValue(initialAddress);
                }, 150);
            } else if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
                // Automatically reverse-geocode default/initial location to populate address
                (async () => {
                    try {
                        const geocoder = new window.google.maps.Geocoder();
                        const response = await geocoder.geocode({ location: initialCoords });
                        if (response?.results?.[0]) {
                            const address = response.results[0].formatted_address;
                            setTempAddress(address);
                            tempAutocompleteRef.current?.setInputValue(address);
                        }
                    } catch (error) {
                        console.error("Auto-geocoding on open error:", error);
                    }
                })();
            }
        }
    }, [isOpen, initialCoords, initialAddress]);

    const handleTempMapLocationUpdate = async (coords: { lat: number; lng: number }) => {
        setTempCoords(coords);
        try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location: coords });
            if (response?.results?.[0]) {
                const address = response.results[0].formatted_address;
                setTempAddress(address);
                tempAutocompleteRef.current?.setInputValue(address);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
    };

    const handleConfirmMapLocation = async () => {
        if (!tempAddress) return;
        setDeliveryCheckLoading(true);
        try {
            const res = await checkDeliveryZone({ latitude: tempCoords.lat, longitude: tempCoords.lng });
            const isDeliverable = res.success && res.data?.is_deliverable;
            
            if (!isDeliverable) {
                addToast({
                    title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                    description: t("locationSelector.deliveryNotAvailableDescription", "This location is outside our supported delivery zones."),
                    color: "danger",
                });
                return;
            }

            // For drop-off (not isPickup), validate it against the required zone ID
            if (!isPickup && requiredZoneId && res.data?.zone_id !== requiredZoneId) {
                addToast({
                    title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                    description: t("locationSelector.dropOutsideZone", "Drop-off location is too far. Deliveries must be within the same operational zone as the pickup."),
                    color: "danger",
                });
                return;
            }

            // For pickup (isPickup), check if there's a mismatch with the existing drop zone
            const isMismatch = isPickup && oppositeZoneId && res.data?.zone_id !== oppositeZoneId;

            // Only show success toast if there is no mismatch
            if (!isMismatch) {
                addToast({
                    title: t("locationSelector.deliveryAvailable", "Delivery Available"),
                    color: "success",
                });
            }

            onConfirm(tempAddress, tempCoords.lat, tempCoords.lng);
            onClose();
        } catch (error) {
            console.error("Error confirming location:", error);
            addToast({
                title: t("locationSelector.checkingError", "Error checking delivery zone"),
                color: "danger",
            });
        } finally {
            setDeliveryCheckLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            classNames={{
                base: "w-full mx-4",
                body: "px-2 md:px-4 pb-6",
                header: "p-4 border-b border-gray-100 dark:border-gray-800",
            }}
            size="2xl"
            backdrop="blur"
        >
            <ModalContent>
                <ModalHeader className="flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-800 dark:text-gray-100">{t("locationSelector.modalTitle", "Select Location")}</span>
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <div className="pt-2">
                        <LocationAutoComplete
                            ref={tempAutocompleteRef}
                            onLocationSelect={(loc) => {
                                setTempCoords(loc.latLng);
                                const fullAddress = loc.placeDescription
                                    ? `${loc.placeName}, ${loc.placeDescription}`
                                    : loc.placeName;
                                setTempAddress(fullAddress);
                            }}
                            initialLocation={tempAddress ? { placeName: tempAddress, latLng: tempCoords, placeDescription: "" } : null}
                            placeholder={t("courier.enterAddressPlaceholder", "Enter your address")}
                        />
                    </div>
                    {isOpen && (
                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-[350px] relative">
                            <GoogleMap
                                latLng={tempCoords}
                                height={350}
                                onLocationUpdate={handleTempMapLocationUpdate}
                                zones={zones}
                            />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 p-4">
                    <Button
                        variant="light"
                        onPress={onClose}
                        className="font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {t("common.cancel", "Cancel")}
                    </Button>
                    <Button
                        onPress={handleConfirmMapLocation}
                        isDisabled={!tempAddress || deliveryCheckLoading}
                        isLoading={deliveryCheckLoading}
                        color="primary"
                        className="font-semibold"
                    >
                        {t("locationSelector.confirmLocation", "Confirm Location")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CourierAddressMapModal;
