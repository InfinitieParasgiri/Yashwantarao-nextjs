import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Card, CardBody, Spinner, Select, SelectItem } from "@heroui/react";
import type { AddressDetails, ParcelDetails } from "../BookDeliveryPage";

interface ItemDetailsCardProps {
    parcel: ParcelDetails;
    setParcel: React.Dispatch<React.SetStateAction<ParcelDetails>>;
    parcelTypes: any[];
    pickup: AddressDetails;
    drop: AddressDetails;
    pickupConfirmed: boolean;
    dropConfirmed: boolean;
    handleSizeChange: (size: "small" | "medium" | "large" | "custom") => void;
    loadingFare: boolean;
    triggerFareCalculation: () => Promise<void>;
    parcelPresets: {
        small: { height: string; width: string; length: string; weight: number };
        medium: { height: string; width: string; length: string; weight: number };
        large: { height: string; width: string; length: string; weight: number };
        custom: { height: string; width: string; length: string; weight: number };
    };
}

const ItemDetailsCard: React.FC<ItemDetailsCardProps> = ({
    parcel,
    setParcel,
    parcelTypes,
    pickup,
    drop,
    pickupConfirmed,
    dropConfirmed,
    handleSizeChange,
    loadingFare,
    triggerFareCalculation,
    parcelPresets,
}) => {
    const { t } = useTranslation();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setParcel(p => ({ ...p, image: e.target.files![0] }));
        }
    };

    const removeImage = () => {
        setParcel(p => ({ ...p, image: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCalculate = () => {
        const newErrors: Record<string, string> = {};
        if (!parcel.typeId) newErrors.typeId = t("courier.error.typeId", "Please select an item type");
        if (!parcel.description || !parcel.description.trim()) newErrors.description = t("courier.error.description", "Please enter an item description");
        if (parcel.size === "custom") {
            const h = parseFloat(parcel.height);
            const w = parseFloat(parcel.width);
            const l = parseFloat(parcel.length);
            if (isNaN(h) || h <= 0) newErrors.height = t("courier.error.height", "Invalid height");
            if (isNaN(w) || w <= 0) newErrors.width = t("courier.error.width", "Invalid width");
            if (isNaN(l) || l <= 0) newErrors.length = t("courier.error.length", "Invalid length");
        }

        if (parcel.customWeight !== "") {
            const wt = parseFloat(parcel.customWeight);
            if (isNaN(wt) || wt <= 0) {
                newErrors.customWeight = t("courier.error.weight", "Invalid weight");
            }
        } else if (!parcel.weight || parcel.weight <= 0) {
            newErrors.customWeight = t("courier.error.emptyWeight", "Please select or enter a weight");
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            triggerFareCalculation();
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight dark:text-white">
                {t("courier.addItemDetailTitle")}
            </h2>

            <Card className={`bg-white dark:bg-content1 rounded-3xl border border-gray-200 dark:border-default-100 transition-all duration-300 ${(pickupConfirmed && dropConfirmed)
                ? "shadow-lg shadow-gray-100/50 dark:shadow-none"
                : "shadow-sm"
                }`}>
                <CardBody className="p-8 md:p-10 space-y-8">
                    {/* Weight pill selectors layout */}
                    <div className="space-y-4">
                        <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                            {t("courier.parcelWeightQuestion")} <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-wrap items-center gap-3">
                            {[1, 5, 10, 15, 20].map((wt) => {
                                const isSelected = parcel.weight === wt && !parcel.customWeight;
                                return (
                                    <button
                                        key={wt}
                                        type="button"
                                        className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-all cursor-pointer ${isSelected
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-white dark:bg-content2 text-gray-700 dark:text-foreground border-gray-200 dark:border-default-100 hover:bg-gray-50 dark:hover:bg-default-100"
                                            }`}
                                        onClick={() => {
                                            const targetSize = wt <= 1 ? "small" : wt <= 10 ? "medium" : "large";

                                            const selectedType = parcel.typeId && Array.isArray(parcelTypes)
                                                ? parcelTypes.find((pt: any) => pt.id.toString() === parcel.typeId.toString())
                                                : null;

                                            if (selectedType && selectedType.max_weight_kg) {
                                                const maxWt = parseFloat(selectedType.max_weight_kg);
                                                if (wt > maxWt) {
                                                    setErrors(errs => ({ ...errs, customWeight: t("courier.error.weightExceedsLimit", "Weight exceeds maximum limit for this parcel type ({{max}} kg)", { max: maxWt }) }));
                                                    return;
                                                }
                                            }

                                            if (errors.customWeight) setErrors(errs => ({ ...errs, customWeight: "" }));

                                            setParcel(p => {
                                                if (p.size === "custom" || p.customWeight) {
                                                    return { ...p, weight: wt, customWeight: "" };
                                                }
                                                return {
                                                    ...p,
                                                    size: targetSize,
                                                    ...parcelPresets[targetSize],
                                                    weight: wt,
                                                    customWeight: ""
                                                };
                                            });
                                        }}
                                    >
                                        Upto {wt} Kg
                                    </button>
                                );
                            })}

                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number" min="0" step="any"
                                        className={`w-16 h-10 text-sm font-extrabold rounded-xl border text-center transition-all focus:outline-none focus:border-primary ${parcel.customWeight !== ""
                                            ? "bg-primary text-white border-primary shadow-sm placeholder-white/70"
                                            : "bg-white dark:bg-content2 text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-default-100 placeholder-gray-400"
                                            } ${errors.customWeight ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`}
                                        placeholder="?"
                                        value={parcel.customWeight}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const numVal = Number(val) || 0;

                                            let weightError = "";
                                            const selectedType = parcel.typeId && Array.isArray(parcelTypes)
                                                ? parcelTypes.find((pt: any) => pt.id.toString() === parcel.typeId.toString())
                                                : null;

                                            if (selectedType && selectedType.max_weight_kg && val !== "") {
                                                const maxWt = parseFloat(selectedType.max_weight_kg);
                                                if (numVal > maxWt) {
                                                    weightError = t("courier.error.weightExceedsLimit", "Weight exceeds maximum limit for this parcel type ({{max}} kg)", { max: maxWt });
                                                }
                                            }

                                            setParcel(p => ({
                                                ...p,
                                                customWeight: val,
                                                weight: numVal
                                            }));

                                            setErrors(errs => ({
                                                ...errs,
                                                customWeight: weightError
                                            }));
                                        }}
                                    />
                                    <span className="text-sm font-bold text-gray-800 dark:text-white">Kg</span>
                                </div>
                                {errors.customWeight && <span className="text-xs text-red-500 mt-1 whitespace-nowrap">{errors.customWeight}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Cardboard Box Presets Grid Column */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {([
                            { id: "small", name: t("courier.sizeSmall") },
                            { id: "medium", name: t("courier.sizeMedium") },
                            { id: "large", name: t("courier.sizeLarge") }
                        ] as const).map(({ id, name }) => {
                            const isSelected = parcel.size === id;
                            return (
                                <div
                                    key={id}
                                    onClick={() => handleSizeChange(id)}
                                    className={`relative overflow-hidden p-6 border rounded-3xl cursor-pointer text-center bg-white dark:bg-content1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${isSelected
                                        ? "border-primary ring-4 ring-primary/5 shadow-md shadow-primary/5"
                                        : "border-gray-100 dark:border-default-100 hover:border-gray-200 dark:hover:border-default-200"
                                        }`}
                                >
                                    <div className="mb-4 relative overflow-hidden rounded-2xl bg-gray-50/50 dark:bg-default-100/50 flex items-center justify-center h-40 transition-transform duration-300 group-hover:scale-105">
                                        <img
                                            src={`/assets/${id}.png`}
                                            alt={name}
                                            className="h-32 w-auto object-contain select-none transition-transform duration-500"
                                        />
                                    </div>

                                    <h4 className={`font-semibold text-lg transition-colors duration-300 ${isSelected ? "text-primary" : "text-gray-800 dark:text-foreground"}`}>
                                        {name}
                                    </h4>

                                </div>
                            );
                        })}
                    </div>

                    {/* Dimension custom specifications & Item Type selections */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col w-full">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.itemTypeQuestion")} <span className="text-red-500">*</span></label>
                            <Select
                                aria-label={t("courier.itemTypePlaceholder", "Item Type")}
                                placeholder={t("courier.itemTypePlaceholder", "Item Type")}
                                selectedKeys={parcel.typeId ? [parcel.typeId.toString()] : []}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedType = Array.isArray(parcelTypes) ? parcelTypes.find((pt: any) => pt.id.toString() === selectedId) : null;

                                    let updatedWeight = parcel.weight;
                                    let updatedCustomWeight = parcel.customWeight;
                                    let weightError = "";

                                    if (selectedType && selectedType.max_weight_kg) {
                                        const maxWt = parseFloat(selectedType.max_weight_kg);
                                        const currentWt = parcel.customWeight !== "" ? parseFloat(parcel.customWeight) : parcel.weight;

                                        if (!isNaN(currentWt) && currentWt > maxWt) {
                                            updatedWeight = 0;
                                            updatedCustomWeight = "";
                                            weightError = t("courier.error.weightExceedsLimit", "Weight exceeds maximum limit for this parcel type ({{max}} kg)", { max: maxWt });
                                        }
                                    }

                                    setParcel(p => ({
                                        ...p,
                                        typeId: selectedId,
                                        typeName: selectedType ? selectedType.name : "",
                                        weight: updatedWeight,
                                        customWeight: updatedCustomWeight
                                    }));

                                    setErrors(errs => ({
                                        ...errs,
                                        typeId: "",
                                        ...(weightError ? { customWeight: weightError } : {})
                                    }));
                                }}
                                variant="bordered"
                                radius="lg"
                                isInvalid={!!errors.typeId}
                                errorMessage={errors.typeId}
                                classNames={{
                                    trigger: `h-12 bg-white dark:bg-content2 hover:border-primary data-[hover=true]:border-primary transition-colors ${errors.typeId ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`,
                                }}
                            >
                                {Array.isArray(parcelTypes) ? parcelTypes.map((pt: any) => (
                                    <SelectItem key={pt.id.toString()} textValue={pt.name}>
                                        {pt.name}
                                    </SelectItem>
                                )) : []}
                            </Select>
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.itemHeightQuestion")} (cm) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" step="any"
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary transition-colors ${errors.height ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`}
                                placeholder={t("courier.itemHeightPlaceholder", "Item Height")}
                                value={parcel.height}
                                onChange={(e) => {
                                    setParcel(p => ({ ...p, height: e.target.value, size: "custom" }));
                                    if (errors.height) setErrors(errs => ({ ...errs, height: "" }));
                                }}
                            />
                            {errors.height && <span className="text-xs text-red-500 mt-1 ml-1">{errors.height}</span>}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.itemWidthQuestion")} (cm) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" step="any"
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary transition-colors ${errors.width ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`}
                                placeholder={t("courier.itemWidthPlaceholder", "Item Width")}
                                value={parcel.width}
                                onChange={(e) => {
                                    setParcel(p => ({ ...p, width: e.target.value, size: "custom" }));
                                    if (errors.width) setErrors(errs => ({ ...errs, width: "" }));
                                }}
                            />
                            {errors.width && <span className="text-xs text-red-500 mt-1 ml-1">{errors.width}</span>}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">{t("courier.itemLengthQuestion", "Item Length")} (cm) <span className="text-red-500">*</span></label>
                            <input
                                type="number" min="0" step="any"
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary transition-colors ${errors.length ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`}
                                placeholder={t("courier.itemLengthPlaceholder", "Item Length")}
                                value={parcel.length}
                                onChange={(e) => {
                                    setParcel(p => ({ ...p, length: e.target.value, size: "custom" }));
                                    if (errors.length) setErrors(errs => ({ ...errs, length: "" }));
                                }}
                            />
                            {errors.length && <span className="text-xs text-red-500 mt-1 ml-1">{errors.length}</span>}
                        </div>
                    </div>

                    {/* Item Count and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col w-full md:col-span-3">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                                {t("courier.itemDescriptionLabel", "Item Description")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary transition-colors ${errors.description ? 'border-red-500' : 'border-gray-200 dark:border-default-100'}`}
                                placeholder={t("courier.itemDescriptionPlaceholder", "e.g. Books, Clothes, Electronics")}
                                value={parcel.description || ""}
                                onChange={(e) => {
                                    setParcel(p => ({ ...p, description: e.target.value }));
                                    if (errors.description) setErrors(errs => ({ ...errs, description: "" }));
                                }}
                            />
                            {errors.description && <span className="text-xs text-red-500 mt-1 ml-1">{errors.description}</span>}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                                {t("courier.itemCountLabel", "Item Count")} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                className={`w-full h-12 px-4 border rounded-xl text-sm bg-white dark:bg-content2 placeholder-gray-400 dark:placeholder-default-400 text-foreground focus:outline-none focus:border-primary transition-colors border-gray-200 dark:border-default-100`}
                                placeholder={t("courier.itemCountPlaceholder", "Number of items")}
                                value={parcel.itemCount || 1}
                                onChange={(e) => {
                                    setParcel(p => ({ ...p, itemCount: parseInt(e.target.value) || 1 }));
                                }}
                            />
                        </div>
                    </div>

                    {/* Upload Parcel Image Section */}
                    <div className="flex flex-col w-full">
                        <label className="text-xs font-semibold text-lightText uppercase tracking-wider mb-2 block">
                            {t("courier.uploadParcelImage", "Upload Parcel Image")}
                        </label>
                        <div
                            className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${parcel.image ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-default-100 hover:bg-gray-50 dark:hover:bg-default-100'}`}
                            onClick={() => !parcel.image && fileInputRef.current?.click()}
                        >
                            {parcel.image ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(parcel.image)}
                                        alt="Parcel"
                                        className="h-full w-full object-contain p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-default-200 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Review and Calculate button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            className="px-8 h-12 text-sm font-bold text-white bg-primary hover:bg-primary-600 active:scale-98 disabled:bg-gray-100 dark:disabled:bg-default-100 disabled:text-gray-400 dark:disabled:text-default-400 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                            disabled={!pickupConfirmed || !dropConfirmed}
                            onClick={handleCalculate}
                        >
                            {loadingFare ? (
                                <div className="flex items-center gap-2">
                                    <Spinner size="sm" color="white" />
                                    <span>Calculating...</span>
                                </div>
                            ) : (
                                t("courier.proceedToCheckout", "Proceed to Checkout")
                            )}
                        </button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default ItemDetailsCard;
