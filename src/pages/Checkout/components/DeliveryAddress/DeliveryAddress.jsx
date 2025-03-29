import "./DeliveryAddress.css";
import { useUserData } from "../../../../contexts/UserDataProvider.js";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckoutModal } from "../CheckoutModal/CheckoutModal";

export const DeliveryAddress = () => {
  const { userDataState } = useUserData();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const {
    orderDetails: { orderAddress },
  } = userDataState;

  const placeOrderHandler = () => {
    if (orderAddress) {
      setIsCheckoutModalOpen(true);
    } else {
      toast.error("Please select an address!");
    }
  };

  return (
    <div className="delivery-address-container">
      <p>Delivering To</p>

      <div className="delivery-address-description">
        <span className="name">
          Name: {userDataState.orderDetails?.orderAddress?.name}
        </span>
        <span className="address">
          Address: {orderAddress?.street}, {orderAddress?.city},{" "}
          {orderAddress?.state}, {orderAddress?.country},{" "}
          {orderAddress?.pincode}
        </span>
        <span className="contact">Contact: {orderAddress?.phone}</span>
        <button onClick={placeOrderHandler} className="place-order-btn">
          Place Order
        </button>
      </div>

      <CheckoutModal isOpen={isCheckoutModalOpen} setIsOpen={setIsCheckoutModalOpen} />
    </div>
  );
};
