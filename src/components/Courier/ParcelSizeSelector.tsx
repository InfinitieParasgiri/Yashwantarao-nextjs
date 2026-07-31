import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Box, Package, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

export type ParcelSize = "small" | "medium" | "large" | "custom";

interface ParcelSizeOption {
  id: ParcelSize;
  name: string;
  description: string;
  icon: React.ReactNode;
  suggestedWeight: number;
  dimensions: { l: number; w: number; h: number };
}

interface ParcelSizeSelectorProps {
  selectedSize: ParcelSize;
  onSelect: (size: ParcelSizeOption) => void;
}

const ParcelSizeSelector: React.FC<ParcelSizeSelectorProps> = ({ selectedSize, onSelect }) => {
  const { t } = useTranslation();

  const options: ParcelSizeOption[] = [
    {
      id: "small",
      name: t("courier.size.small.name", "Small"),
      description: t("courier.size.small.desc", "Up to 5kg"),
      icon: <Box size={32} className="text-primary" />,
      suggestedWeight: 2,
      dimensions: { l: 20, w: 20, h: 20 },
    },
    {
      id: "medium",
      name: t("courier.size.medium.name", "Medium"),
      description: t("courier.size.medium.desc", "Up to 15kg"),
      icon: <Package size={32} className="text-secondary" />,
      suggestedWeight: 10,
      dimensions: { l: 40, w: 40, h: 40 },
    },
    {
      id: "large",
      name: t("courier.size.large.name", "Large"),
      description: t("courier.size.large.desc", "Up to 30kg"),
      icon: <Truck size={32} className="text-warning" />,
      suggestedWeight: 25,
      dimensions: { l: 60, w: 60, h: 60 },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {options.map((option) => (
        <Card
          key={option.id}
          isPressable
          onPress={() => onSelect(option)}
          className={`border-2 transition-all ${
            selectedSize === option.id 
              ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
              : "border-transparent hover:border-default-200"
          }`}
        >
          <CardBody className="flex flex-col items-center justify-center p-6 text-center">
            <div className={`p-4 rounded-full mb-3 ${selectedSize === option.id ? "bg-primary/10" : "bg-default-100"}`}>
              {option.icon}
            </div>
            <h3 className="text-lg font-bold text-default-900">{option.name}</h3>
            <p className="text-sm text-default-500">{option.description}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default ParcelSizeSelector;
