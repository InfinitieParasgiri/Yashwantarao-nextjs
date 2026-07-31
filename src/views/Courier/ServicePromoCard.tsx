import { Button, Image } from "@heroui/react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/router"

const ServicePromoCard = () => {
    const { t } = useTranslation()
    const router = useRouter()

    return (
        <section className="px-4">
            <div className="mx-auto">

                {/* Card Container */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-8 p-6 sm:p-10 md:p-12 border border-gray-300 dark:border-zinc-900 bg-linear-to-br from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[24px] shadow-xs">

                    {/* Left: 3D Illustration */}
                    <div className="flex justify-center items-center w-full md:w-1/2">
                        <Image
                            src="/assets/courier-boy.png"
                            alt={t("courier.title")}
                            className="w-64 h-64 sm:w-80 sm:h-80 md:w-[350px] md:h-[350px] object-contain transition-transform duration-500 hover:scale-102"
                        />
                    </div>

                    {/* Right: Text & Action Button */}
                    <div className="flex flex-col justify-center items-center md:items-start gap-6 md:gap-8 w-full md:w-1/2 text-center md:text-start">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                            {t("courier.promoCardHeadlinePart1")}{" "}
                            <span className="text-primary dark:text-primary-400">
                                {t("courier.promoCardHeadlineHighlight")}
                            </span>{" "}
                            {t("courier.promoCardHeadlinePart2")}
                        </h2>

                        <Button
                            onPress={() => router.push("/courier/book")}
                            color="primary"
                            className="text-white font-semibold text-base sm:text-lg h-12 sm:h-14 pl-6 pr-3 rounded-full flex items-center gap-4 transition-all duration-300 hover:scale-103 shadow-md shadow-primary/15 self-center md:self-start"
                        >
                            <span>{t("courier.promoCardButton")}</span>
                            <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white shrink-0">
                                <span className="text-3axl font-light leading-none -mt-1">+</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicePromoCard

