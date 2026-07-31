import React, { FC, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Chip,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import useSWR from "swr";
import { getParcelTypes } from "@/routes/api";

export interface CourierFilters {
  parcel_type: string;
  status: string;
  date: string;
  search: string;
}

interface CourierFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: CourierFilters) => void;
  initialFilters?: CourierFilters;
}

const CourierFiltersModal: FC<CourierFiltersModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<CourierFilters>({
    parcel_type: "",
    status: "",
    date: "",
    search: "",
  });

  const { data: parcelTypesRes } = useSWR(
    isOpen ? "parcelTypes" : null,
    getParcelTypes,
    { revalidateOnFocus: false }
  );

  let parcelTypes: any[] = [];
  if (parcelTypesRes?.data) {
    const d = parcelTypesRes.data as any;
    if (Array.isArray(d)) {
      parcelTypes = d;
    } else if (Array.isArray(d.parcel_types)) {
      parcelTypes = d.parcel_types;
    } else if (Array.isArray(d.data)) {
      parcelTypes = d.data;
    }
  }

  // Sync initial filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(
        initialFilters || {
          parcel_type: "",
          status: "",
          date: "",
          search: "",
        }
      );
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      parcel_type: "",
      status: "",
      date: "",
      search: "",
    });
    // We don't automatically close, we let the user click Apply or they can just apply the cleared state.
    // Actually, usually Clear immediately applies and closes, or just clears the UI. Let's just clear UI.
  };

  const statusOptions = [
    { value: "", label: t("filters.all", "All") },
    { value: "Pending", label: t("filters.pending", "Pending") },
    { value: "Assigned", label: t("filters.assigned", "Assigned") },
    { value: "Picked Up", label: t("filters.picked_up", "Picked Up") },
    { value: "In Transit", label: t("filters.in_transit", "In Transit") },
    { value: "Delivered", label: t("filters.delivered", "Delivered") },
    { value: "Cancelled", label: t("filters.cancelled", "Cancelled") },
    { value: "Failed Delivery", label: t("filters.failed_delivery", "Failed Delivery") },
    { value: "Return to Sender", label: t("filters.return_to_sender", "Return to Sender") },
    { value: "Returned", label: t("filters.returned", "Returned") },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      size="md"
    >
      <ModalContent>
        <ModalHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t("filters.title", "Filters")}
          </h2>
        </ModalHeader>
        <ModalBody className="py-6 space-y-6">
          {/* Parcel Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("filters.parcel_type", "Parcel Type")}
            </label>
            <Select
              aria-label={t("filters.parcel_type", "Parcel Type")}
              placeholder={t("filters.parcel_type_placeholder", "Select Parcel Type")}
              selectedKeys={filters.parcel_type ? [filters.parcel_type] : []}
              onChange={(e) =>
                setFilters({ ...filters, parcel_type: e.target.value })
              }
              variant="bordered"
              radius="sm"
            >
              {parcelTypes.map((type: any) => (
                <SelectItem key={type.name} textValue={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("filters.status", "Status")}
            </label>
            <div className="w-full">
              <Swiper
                slidesPerView="auto"
                spaceBetween={8}
                freeMode={true}
                modules={[FreeMode]}
                className="w-full"
              >
                {statusOptions.map((opt) => {
                  const isSelected = filters.status === opt.value;
                  return (
                    <SwiperSlide key={opt.value} className="!w-auto">
                      <Chip
                        variant={isSelected ? "solid" : "bordered"}
                        color={isSelected ? "primary" : "default"}
                        className="cursor-pointer transition-colors"
                        onClick={() =>
                          setFilters({ ...filters, status: opt.value })
                        }
                      >
                        {opt.label}
                      </Chip>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("filters.date", "Date")}
            </label>
            <Input
              type="date"
              placeholder="DD/MM/YY"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              variant="bordered"
              radius="sm"
            />
          </div>

          {/* Sender Or Recipient Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("filters.sender_or_recipient", "Sender Or Recipient Name")}
            </label>
            <Input
              placeholder={t("filters.enter_name", "Enter Name")}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              variant="bordered"
              radius="sm"
            />
          </div>
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 dark:border-gray-800 pt-4 pb-6 flex gap-4">
          <Button
            variant="bordered"
            color="primary"
            className="flex-1 font-semibold"
            onPress={handleClear}
          >
            {t("filters.clear_filter", "Clear filter")}
          </Button>
          <Button
            color="primary"
            className="flex-1 font-semibold shadow-md shadow-primary/30"
            onPress={handleApply}
          >
            {t("filters.apply", "Apply")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CourierFiltersModal;
