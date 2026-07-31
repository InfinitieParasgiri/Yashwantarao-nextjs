import React from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const HomeModuleCards = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getTranslation = (key: string, defaultText: string) => {
    const translated = t(key);
    return translated === key ? defaultText : translated;
  };

  const modules = [
    {
      id: "grocery",
      title: getTranslation("nav.grocery", "Grocery"),
      description: getTranslation(
        "grocery.module_description",
        "Fresh produce, daily essentials & more, delivered to your door."
      ),
      features: [
        getTranslation("grocery.feature1", "Wide Range Of Products"),
        getTranslation("grocery.feature2", "Fresh & Quality Assured"),
        getTranslation("grocery.feature3", "Fast Delivery"),
      ],
      image: "/assets/home image-1.png",
      topBg: "bg-green-50 dark:bg-green-950/30",
      buttonColor: "bg-[#65a30d] hover:bg-[#4d7c0f]", // Lime green
      iconColor: "text-[#65a30d]",
      path: "/grocery",
      buttonText: getTranslation("grocery.shop_now", "Shop Grocery"),
    },
    {
      id: "restaurant",
      title: getTranslation("nav.restaurant", "Restaurant"),
      description: getTranslation(
        "restaurant.module_description",
        "Delicious meals from your favorite restaurant, delivered hot & fresh."
      ),
      features: [
        getTranslation("restaurant.feature1", "Top Restaurants"),
        getTranslation("restaurant.feature2", "Hot & Fresh Delivery"),
        getTranslation("restaurant.feature3", "Safe & Hygienic"),
      ],
      image: "/assets/home image-3.png",
      topBg: "bg-orange-50 dark:bg-orange-950/30",
      buttonColor: "bg-[#f97316] hover:bg-[#ea580c]", // Orange
      iconColor: "text-[#f97316]",
      path: "/restaurant",
      buttonText: getTranslation("restaurant.order_now", "Order Now"),
    },
    {
      id: "courier",
      title: getTranslation("nav.courier", "Courier"),
      description: getTranslation(
        "courier.module_description",
        "Send documents, parcels & gifts quickly and securely."
      ),
      features: [
        getTranslation("courier.feature1", "Secure & Reliable"),
        getTranslation("courier.feature2", "Real - Time Tracking"),
        getTranslation("courier.feature3", "On - Time Delivery"),
      ],
      image: "/assets/home image-2.png",
      topBg: "bg-purple-50 dark:bg-purple-950/30",
      buttonColor: "bg-[#a855f7] hover:bg-[#9333ea]", // Purple
      iconColor: "text-[#a855f7]",
      path: "/courier",
      buttonText: getTranslation("courier.send_now", "Send Now"),
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold text-[#0097A7] uppercase tracking-wider mb-2">
            {getTranslation("home.what_we_deliver", "What We Deliver")}
          </h3>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
            {getTranslation("home.three_services_title", "Three Services, One Promise")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {getTranslation("home.three_services_subtitle", "Whatever you need, whenever you need it.")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleNavigation(module.path)}
              className="group flex flex-col rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-out bg-white dark:bg-zinc-900 cursor-pointer"
            >
              {/* Top Image Section */}
              <div
                className={`relative w-full h-64 flex items-center justify-center ${module.topBg}`}
              >
                <div className="relative w-48 h-48 drop-shadow-xl transition-transform hover:scale-105 duration-300">
                  <Image
                    src={module.image}
                    alt={module.title}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>

              {/* Bottom Content Section */}
              <div className="flex flex-col flex-1 p-8">
                <h3 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-3">
                  {module.title}
                </h3>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed h-10">
                  {module.description}
                </p>

                {/* Features List */}
                <ul className="space-y-4 mb-10 flex-1">
                  {module.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${module.iconColor} fill-${module.iconColor.split("-")[1]}-100 dark:fill-transparent`}
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-300 ${module.buttonColor}`}
                >
                  {module.buttonText}
                  <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeModuleCards;
