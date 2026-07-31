// web/src/components/Modals/CourierPaymentModal.tsx
import { FC, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
} from "@heroui/react";
import PaymentMethods from "../PaymentMethods";
import RazorPay from "../PaymentGateway/RazorPay";
import Stripe from "../PaymentGateway/Stripe";
import { useTranslation } from "react-i18next";
import PayStack from "../PaymentGateway/Paystack";
import FlutterwavePayment from "../PaymentGateway/FlutterwavePayment";
import { createCourierRequest } from "@/routes/api";
import { useSettings } from "@/contexts/SettingsContext";

interface CourierPaymentModalProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  formData: any;
  payableAmount: number;
  onSuccess: (res: any) => void;
}

const CourierPaymentModal: FC<CourierPaymentModalProps> = ({ 
  open, 
  onOpenChange, 
  formData, 
  payableAmount,
  onSuccess
}) => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { paymentSettings } = useSettings();

  const preparePayload = (baseData: any) => {
    if (!baseData.item_image) return baseData;
    const fd = new FormData();
    Object.keys(baseData).forEach((key) => {
      if (baseData[key] === undefined || baseData[key] === null) return;
      if (key === "pickup_details" || key === "drop_details") {
        Object.keys(baseData[key]).forEach((subKey) => {
          if (baseData[key][subKey] !== undefined) {
            fd.append(`${key}[${subKey}]`, baseData[key][subKey]);
          }
        });
      } else {
        fd.append(key, baseData[key]);
      }
    });
    return fd;
  };

  const handleContinue = async () => {
    if (!selectedPayment) {
      return addToast({
        title: t("please_select_payment_method"),
        color: "warning",
      });
    }

    if (selectedPayment === "cod" || selectedPayment === "wallet") {
      setIsLoading(true);
      try {
        const submitData = preparePayload({
          ...formData,
          payment_type: selectedPayment,
        });
        const res = await createCourierRequest(submitData);
        if (res.success) {
          onOpenChange(false);
          onSuccess(res);
        } else {
            addToast({
                title: res.message || t("courier.toast.error"),
                color: "danger"
            });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsLoading(true);
    try {
        const submitData = preparePayload({
            ...formData,
            payment_type: selectedPayment,
            ...paymentData
        });
        const res = await createCourierRequest(submitData);
        if (res.success) {
            onOpenChange(false);
            onSuccess(res);
        } else {
            addToast({
                title: res.message || t("courier.toast.error"),
                color: "danger"
            });
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleError = () => {
    setIsLoading(false);
  };

  return (
    <>
      <Modal
        isOpen={open}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="font-semibold">{t("select_payment_method")}</h2>
          </ModalHeader>

          <ModalBody>
            <PaymentMethods
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
              hideCOD={false}
              isLoading={isLoading}
              extraMethods={!!paymentSettings?.wallet ? [{
                id: "wallet",
                name: t("payments.wallet.name"),
                tagline: t("payments.wallet.tagline"),
                icon: "/Payments/cod.png", // fallback icon
                isEnabled: true,
              }] : []}
            />
          </ModalBody>

          <ModalFooter className="flex flex-col gap-2">
            {(selectedPayment === "cod" || selectedPayment === "wallet") && (
              <Button
                color="primary"
                onPress={handleContinue}
                isLoading={isLoading}
                className="w-full"
              >
                {t("continue")}
              </Button>
            )}

            {selectedPayment === "stripePayment" && (
              <Stripe
                onSuccess={(data) => handlePaymentSuccess(data)}
                onError={handleError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                usageType="courier"
                amount={payableAmount}
              />
            )}

            {selectedPayment === "razorpayPayment" && (
              <RazorPay
                onSuccess={(data: any) => handlePaymentSuccess(data)}
                onError={handleError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                usageType="courier"
                amount={payableAmount}
              />
            )}

            {selectedPayment === "paystackPayment" && (
              <PayStack
                onSuccess={(data: any) => handlePaymentSuccess(data)}
                onError={handleError}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                usageType="courier"
                amount={payableAmount}
              />
            )}

            {selectedPayment === "flutterwavePayment" && (
              <FlutterwavePayment
                onSuccess={() => handlePaymentSuccess({})}
                onError={handleError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CourierPaymentModal;
