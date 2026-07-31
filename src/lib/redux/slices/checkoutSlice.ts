import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/ApiResponse";

export interface CourierBookingData {
  pickup: any;
  drop: any;
  parcel: any;
  fareData: any;
  zoneId: number | null;
}

export interface CheckoutState {
  selectedAddress: Address | null;
  orderNote: string;
  useWallet: boolean;
  rushDelivery: boolean;
  promoCode: string;
  courierBookingData: CourierBookingData | null;
}

const initialState: CheckoutState = {
  selectedAddress: null,
  orderNote: "",
  useWallet: false,
  rushDelivery: false,
  promoCode: "",
  courierBookingData: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
    setUseWallet: (state, action: PayloadAction<boolean>) => {
      state.useWallet = action.payload;
    },
    setRusDelivery: (state, action: PayloadAction<boolean>) => {
      state.rushDelivery = action.payload;
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = action.payload;
    },
    setCourierBookingData: (state, action: PayloadAction<CourierBookingData | null>) => {
      state.courierBookingData = action.payload;
    },
  },
});

export const {
  setSelectedAddress,
  setOrderNote,
  setUseWallet,
  setRusDelivery,
  setPromoCode,
  setCourierBookingData,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
