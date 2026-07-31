import React from "react";
import { Card, CardBody } from "@heroui/react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function ServiceSelector() {
  const router = useRouter();
  const { t } = useTranslation();

  const services = [
    {
      id: "grocery",
      title: t("nav.grocery") || "Grocery",
      icon: <span className="text-3xl">🛒</span>,
      desc: t("home.grocery_desc") || "Fresh essentials",
      path: "/",
      color: "bg-green-50",
    },
    {
      id: "restaurant",
      title: t("nav.food") || "Food",
      icon: <span className="text-3xl">🍔</span>,
      desc: t("home.food_desc") || "Delicious meals",
      path: "/stores",
      color: "bg-orange-50",
    },
    {
      id: "courier",
      title: t("courier.title") || "Courier",
      icon: <span className="text-3xl">📦</span>,
      desc: t("courier.subtitle") || "Send anything",
      path: "/courier",
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            isPressable
            onPress={() => router.push(service.path)}
            className={`border-none shadow-sm hover:shadow-md transition-all ${service.color}`}
          >
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                {service.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-default-800">
                  {service.title}
                </h3>
                <p className="text-xs text-default-500">{service.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
