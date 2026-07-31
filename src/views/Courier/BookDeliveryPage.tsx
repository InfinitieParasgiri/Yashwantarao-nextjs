import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import { getAddresses, getParcelTypes, calculateCourierFare, getDeliveryZones, checkDeliveryZone } from "@/routes/api";
import type { LocationAutoCompleteRef } from "@/components/Location/types/LocationAutoComplete.types";
import { setCourierBookingData } from "@/lib/redux/slices/checkoutSlice";
import Link from "next/link";

// Modular Child Subcomponents
import PickupAddressCard from "./components/PickupAddressCard";
import DeliveryAddressCard from "./components/DeliveryAddressCard";
import ItemDetailsCard from "./components/ItemDetailsCard";

export interface AddressDetails {
    name: string;
    phone: string;
    countryCode?: string;
    address: string;
    flatNo: string;
    landmark?: string;
    lat: number;
    lng: number;
    note: string;
    date: string;
    email: string;
}

export interface ParcelDetails {
    typeId: string;
    typeName?: string;
    weight: number;
    customWeight: string;
    size: "small" | "medium" | "large" | "custom";
    height: string;
    width: string;
    length: string;
    description: string;
    itemCount: number;
    image?: File | null;
}



const parcelPresets = {
    small: { height: "41", width: "46", length: "56", weight: 1 },
    medium: { height: "41", width: "41", length: "41", weight: 10 },
    large: { height: "61", width: "36", length: "51", weight: 20 },
    custom: { height: "", width: "", length: "", weight: 1 },
};

const BookDeliveryPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const user = useSelector((state: RootState) => state.auth.user);

    const bookingData = useSelector((state: RootState) => state.checkout.courierBookingData);

    const pickupAutoCompleteRef = useRef<LocationAutoCompleteRef>(null);
    const dropAutoCompleteRef = useRef<LocationAutoCompleteRef>(null);

    const [pickup, setPickup] = useState<AddressDetails>(() => {
        if (bookingData?.pickup) {
            return bookingData.pickup;
        }
        return { name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" };
    });
    const [drop, setDrop] = useState<AddressDetails>(() => {
        if (bookingData?.drop) {
            return bookingData.drop;
        }
        return { name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" };
    });
    const [parcel, setParcel] = useState<ParcelDetails>(() => {
        if (bookingData?.parcel) {
            return bookingData.parcel;
        }
        return {
            typeId: "",
            weight: 10,
            customWeight: "",
            size: "medium",
            height: "40",
            width: "55",
            length: "45",
            description: "",
            itemCount: 1,
            image: null,
        };
    });

    const [pickupConfirmed, setPickupConfirmed] = useState(() => !!bookingData?.pickup?.address);
    const [dropConfirmed, setDropConfirmed] = useState(() => !!bookingData?.drop?.address);

    const [loadingFare, setLoadingFare] = useState(false);
    const [zoneId, setZoneId] = useState<number | null>(() => bookingData?.zoneId || null);
    const [dropZoneId, setDropZoneId] = useState<number | null>(null);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;

        // If not returning from checkout, clear residual data to ensure a fresh start
        if (router.query.edit !== 'true' && bookingData) {
            dispatch(setCourierBookingData(null));
            setPickup({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
            setDrop({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
            setParcel({
                typeId: "", weight: 10, customWeight: "", size: "medium", height: "40", width: "55", length: "45", description: "", itemCount: 1, image: null,
            });
            setPickupConfirmed(false);
            setDropConfirmed(false);
            setZoneId(null);
            setDropZoneId(null);

            // Clear autocomplete inputs as well
            pickupAutoCompleteRef.current?.setInputValue("");
            dropAutoCompleteRef.current?.setInputValue("");
        }

        setIsMounted(true);
    }, [router.isReady, router.query.edit]);

    useEffect(() => {
        if (!isMounted) return;
        if (bookingData?.pickup?.address) {
            pickupAutoCompleteRef.current?.setInputValue(bookingData.pickup.address);
        }
        if (bookingData?.drop?.address) {
            dropAutoCompleteRef.current?.setInputValue(bookingData.drop.address);
        }
    }, [bookingData, isMounted]);

    useEffect(() => {
        if (!pickup.lat || !pickup.lng) {
            setZoneId(null);
            return;
        }

        const resolveZone = async () => {
            try {
                const res = await checkDeliveryZone({ latitude: pickup.lat, longitude: pickup.lng });
                if (res.success && res.data?.is_deliverable) {
                    if (dropZoneId && res.data.zone_id !== dropZoneId) {
                        addToast({
                            title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                            description: t("locationSelector.dropOutsideZone", "Drop-off location is too far. Deliveries must be within the same operational zone as the pickup."),
                            color: "danger",
                        });
                        setPickupConfirmed(false);
                        setPickup({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
                        pickupAutoCompleteRef.current?.setInputValue("");
                        setZoneId(null);
                        return;
                    }
                    setZoneId(res.data.zone_id);
                } else {
                    setZoneId(null);
                    addToast({
                        title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                        description: t("locationSelector.deliveryNotAvailableDescription", "Pickup location is outside our supported delivery zones."),
                        color: "danger",
                    });
                    setPickupConfirmed(false);
                    setPickup({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
                    pickupAutoCompleteRef.current?.setInputValue("");
                }
            } catch (error) {
                console.error("Error resolving zone for pickup:", error);
                setZoneId(null);
            }
        };

        resolveZone();
    }, [pickup.lat, pickup.lng, dropZoneId, t]);

    // Resolve drop zone ID when drop coordinates change
    useEffect(() => {
        if (!drop.lat || !drop.lng) {
            setDropZoneId(null);
            return;
        }

        const resolveDropZone = async () => {
            try {
                const res = await checkDeliveryZone({ latitude: drop.lat, longitude: drop.lng });
                if (res.success && res.data?.is_deliverable) {
                    setDropZoneId(res.data.zone_id);
                } else {
                    setDropZoneId(null);
                }
            } catch (error) {
                console.error("Error resolving zone for drop:", error);
                setDropZoneId(null);
            }
        };

        resolveDropZone();
    }, [drop.lat, drop.lng]);

    // Validate drop-off location is in the same zone
    useEffect(() => {
        if (!drop.lat || !drop.lng || !zoneId) {
            return;
        }

        const validateDropZone = async () => {
            try {
                const res = await checkDeliveryZone({ latitude: drop.lat, longitude: drop.lng });
                if (res.success && res.data?.is_deliverable) {
                    if (res.data.zone_id !== zoneId) {
                        addToast({
                            title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                            description: t("locationSelector.dropOutsideZone", "Drop-off location is too far. Deliveries must be within the same operational zone as the pickup."),
                            color: "danger",
                        });
                        setDropConfirmed(false);
                        setDrop({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
                        dropAutoCompleteRef.current?.setInputValue("");
                    }
                } else {
                    addToast({
                        title: t("locationSelector.deliveryNotAvailable", "Delivery Not Available"),
                        description: t("locationSelector.deliveryNotAvailableDescription", "Drop-off location is outside our supported delivery zones."),
                        color: "danger",
                    });
                    setDropConfirmed(false);
                    setDrop({ name: "", phone: "", address: "", flatNo: "", lat: 0, lng: 0, note: "", date: "", email: "" });
                    dropAutoCompleteRef.current?.setInputValue("");
                }
            } catch (error) {
                console.error("Error validating drop zone:", error);
            }
        };

        validateDropZone();
    }, [drop.lat, drop.lng, zoneId, t]);

    const { data: parcelTypes = [] } = useSWR(["parcel-types", zoneId], async ([_, zId]) => {
        const res = await getParcelTypes(zId as number | null);
        if (res.success && res.data) {
            const data = res.data as any;
            if (Array.isArray(data)) {
                return data;
            }
            if (data.parcel_types && Array.isArray(data.parcel_types)) {
                return data.parcel_types;
            }
            return [];
        }
        return [];
    });

    const { data: savedAddresses = [] } = useSWR(isLoggedIn ? "saved-addresses" : null, async () => {
        const res = await getAddresses({ per_page: 20 });
        return res.success ? res.data.data || [] : [];
    });

    const { data: zones = [] } = useSWR("delivery-zones-courier", async () => {
        const res = await getDeliveryZones({ per_page: 100 });
        return res.success ? res.data?.data || [] : [];
    });

    const fillFromSaved = (addr: any, type: "pickup" | "drop") => {
        const details = {
            name: addr.name || user?.name || "",
            phone: addr.mobile || user?.mobile || "",
            address: addr.address_line1 || addr.address || "",
            flatNo: addr.address_line2 || "",
            lat: Number(addr.latitude),
            lng: Number(addr.longitude),
            note: addr.note || addr.sender_note || addr.receiver_note || "",
            date: addr.date || "",
            email: addr.email || user?.email || "",
        };
        if (type === "pickup") {
            setPickup(details);
            pickupAutoCompleteRef.current?.setInputValue(details.address);
        } else {
            setDrop(details);
            dropAutoCompleteRef.current?.setInputValue(details.address);
        }
    };

    const handleSizeChange = (size: "small" | "medium" | "large" | "custom") => {
        setParcel(prev => {
            const updates = size !== "custom" ? { ...parcelPresets[size] } : {};
            // Never overwrite the user's explicit weight when changing box dimensions
            if ('weight' in updates) {
                delete updates.weight;
            }
            return {
                ...prev,
                size,
                ...updates
            };
        });
    };

    const triggerFareCalculation = async () => {
        if (!isLoggedIn) {
            document.getElementById("login-btn")?.click();
            return;
        }
        if (!pickup.lat || !drop.lat) return;
        if (!zoneId) {
            addToast({
                title: t("courier.toast.error", "Error"),
                description: t("courier.zoneRequired", "A valid delivery zone is required. Please re-select the pickup location."),
                color: "danger",
            });
            return;
        }
        setLoadingFare(true);
        const weight_kg = parcel.customWeight ? (Number(parcel.customWeight) || 1) : parcel.weight;
        try {
            const res = await calculateCourierFare({
                pickup_lat: pickup.lat,
                pickup_lng: pickup.lng,
                drop_lat: drop.lat,
                drop_lng: drop.lng,
                zone_id: zoneId,
                parcel_type_id: parcel.typeId,
                parcel_size: parcel.size,
                weight_kg,
            });
            if (res.success) {
                dispatch(setCourierBookingData({
                    pickup,
                    drop,
                    parcel,
                    fareData: res.data,
                    zoneId
                }));
                router.push("/courier/checkout");
            } else {
                addToast({
                    title: res.message || t("courier.toast.error", "Calculation failed"),
                    color: "danger",
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingFare(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
            <div className="flex items-center gap-3">
                <Link
                    href="/courier"
                    className="flex items-center justify-center text-gray-900 dark:text-white hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none outline-none p-1 -ml-1"
                >
                    <ArrowLeft className="w-7 h-7" />
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight dark:text-white">
                    {t("courier.bookDeliveryTitle")}
                </h1>
            </div>

            {/* Vertical Stepper timeline layout container */}
            <div className="relative space-y-12">
                <div className="hidden sm:block absolute left-[68px] rtl:right-[68px] rtl:left-auto top-[48px] bottom-[48px] border-l border-dashed border-gray-200 z-0" />

                <PickupAddressCard
                    pickup={pickup}
                    setPickup={setPickup}
                    pickupConfirmed={pickupConfirmed}
                    setPickupConfirmed={setPickupConfirmed}
                    savedAddresses={savedAddresses}
                    fillFromSaved={fillFromSaved}
                    pickupAutoCompleteRef={pickupAutoCompleteRef}
                    zones={zones}
                    zoneId={dropZoneId}
                />

                <DeliveryAddressCard
                    drop={drop}
                    setDrop={setDrop}
                    dropConfirmed={dropConfirmed}
                    setDropConfirmed={setDropConfirmed}
                    pickupConfirmed={pickupConfirmed}
                    savedAddresses={savedAddresses}
                    fillFromSaved={fillFromSaved}
                    dropAutoCompleteRef={dropAutoCompleteRef}
                    zones={zones}
                    zoneId={zoneId}
                />
            </div>

            <ItemDetailsCard
                parcel={parcel}
                setParcel={setParcel}
                parcelTypes={parcelTypes}
                pickup={pickup}
                drop={drop}
                pickupConfirmed={pickupConfirmed}
                dropConfirmed={dropConfirmed}
                handleSizeChange={handleSizeChange}
                loadingFare={loadingFare}
                triggerFareCalculation={triggerFareCalculation}
                parcelPresets={parcelPresets}
            />
        </div>
    );
};

export default BookDeliveryPage;
