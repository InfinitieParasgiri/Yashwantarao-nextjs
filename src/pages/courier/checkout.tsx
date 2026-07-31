import DynamicSEO from "@/SEO/DynamicSEO";
import CourierCheckoutPage from "@/views/Courier/CourierCheckoutPage";
import { withAuth } from "@/guards/withAuth";
import { GetServerSideProps } from "next";
import { getSettings } from "@/routes/api";
import { isSSR } from "@/helpers/getters";
import { loadTranslations } from "../../../i18n";
import { useTranslation } from "react-i18next";

const CourierCheckoutRoutePage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <DynamicSEO title={`${t("courier.checkoutTitle", "Checkout")} - Delimo`} />
            <div className="min-h-screen py-8">
                <CourierCheckoutPage />
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps | undefined = isSSR()
    ? async (context) => {
        try {
            const settingsRes = await getSettings();
            await loadTranslations(context);
            return {
                props: {
                    initialSettings: settingsRes.data ?? null,
                },
            };
        } catch (err) {
            console.error("Error in getServerSideProps:", err);
            return {
                props: {
                    initialSettings: null,
                },
            };
        }
    }
    : undefined;

export default withAuth(CourierCheckoutRoutePage);
