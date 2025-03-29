import React, { useState, useEffect } from "react";
import "./CheckoutModal.css";
import { useUserData } from "../../../../contexts/UserDataProvider.js";
import { useAuth } from "../../../../contexts/AuthProvider.js";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaCreditCard, FaRegAddressCard, FaCheck, FaTimes } from "react-icons/fa";

export const CheckoutModal = ({ isOpen, setIsOpen }) => {
  const { userDataState, dispatch, clearCartHandler } = useUserData();
  const { auth, setCurrentPage } = useAuth();
  const navigate = useNavigate();

  const {
    cartProducts,
    addressList,
    orderDetails: { cartItemsDiscountTotal, orderAddress },
  } = userDataState;

  const totalAmount = cartItemsDiscountTotal;

  // Form state for payment details
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  // Validation states
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle changes to payment form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format credit card number with spaces
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      setPaymentDetails({ ...paymentDetails, [name]: formatted.substring(0, 19) });
    } else if (name === "cvv") {
      setPaymentDetails({ ...paymentDetails, [name]: value.substring(0, 3) });
    } else {
      setPaymentDetails({ ...paymentDetails, [name]: value });
    }
  };

  // Validate the payment form
  const validateForm = () => {
    const newErrors = {};
    
    // Card Name validation
    if (!paymentDetails.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }
    
    // Card Number validation
    const cardNumberRegex = /^[\d\s]{19}$/;
    if (!cardNumberRegex.test(paymentDetails.cardNumber)) {
      newErrors.cardNumber = "Enter a valid 16-digit card number";
    }
    
    // Expiration date validation
    if (!paymentDetails.expMonth) {
      newErrors.expMonth = "Month is required";
    }
    
    if (!paymentDetails.expYear) {
      newErrors.expYear = "Year is required";
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (
      parseInt(paymentDetails.expYear) < currentYear || 
      (parseInt(paymentDetails.expYear) === currentYear && 
       parseInt(paymentDetails.expMonth) < currentMonth)
    ) {
      newErrors.expDate = "Card has expired";
    }
    
    // CVV validation
    if (!/^\d{3}$/.test(paymentDetails.cvv)) {
      newErrors.cvv = "Enter a valid 3-digit CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process the order
  const processOrder = () => {
    if (validateForm()) {
      setIsProcessing(true);
      
      // Simulate order processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        
        // Place the order
        const paymentId = uuid();
        const orderId = uuid();
        const order = {
          paymentId,
          orderId,
          amountPaid: totalAmount,
          orderedProducts: [...cartProducts],
          deliveryAddress: { ...orderAddress },
        };

        dispatch({ type: "SET_ORDERS", payload: order });
        clearCartHandler(auth.token);
        
        // Wait a bit before redirecting
        setTimeout(() => {
          setCurrentPage("orders");
          navigate("/profile/orders");
          setIsOpen(false);
        }, 2000);
      }, 2000);
    }
  };

  // Go to the next step
  const goToNextStep = () => {
    if (activeStep === 1 && orderAddress) {
      setActiveStep(2);
    } else if (!orderAddress) {
      toast.error("Please select a delivery address");
    }
  };

  // Go back to the previous step
  const goToPreviousStep = () => {
    setActiveStep(1);
  };

  // Close the modal and reset state
  const handleClose = () => {
    setIsOpen(false);
    setActiveStep(1);
    setIsProcessing(false);
    setIsSuccess(false);
    setPaymentDetails({
      cardName: "",
      cardNumber: "",
      expMonth: "",
      expYear: "",
      cvv: "",
    });
    setErrors({});
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Create an array of years (current year + 10 years)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i);
  
  // Create an array of months (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: { 
        duration: 0.2 
      } 
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { 
        duration: 0.2 
      } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="checkout-modal-overlay">
          <motion.div 
            className="checkout-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="checkout-modal-header">
              <h2>Complete Your Order</h2>
              <button className="close-button" onClick={handleClose}>
                <FaTimes />
              </button>
            </div>
            
            <div className="checkout-modal-steps">
              <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">
                  {activeStep > 1 ? <FaCheck /> : 1}
                </div>
                <span>Delivery Address</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">
                  {activeStep > 2 ? <FaCheck /> : 2}
                </div>
                <span>Payment Details</span>
              </div>
            </div>

            <div className="checkout-modal-content">
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div 
                    key="address"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="address-step"
                  >
                    <div className="address-icon">
                      <FaRegAddressCard />
                    </div>
                    
                    <h3>Delivery Address</h3>
                    
                    {orderAddress ? (
                      <div className="selected-address">
                        <p className="address-name">{orderAddress.name}</p>
                        <p className="address-details">
                          {orderAddress.street}, {orderAddress.city}, {orderAddress.state}, {orderAddress.country}, {orderAddress.pincode}
                        </p>
                        <p className="address-phone">Phone: {orderAddress.phone}</p>
                      </div>
                    ) : (
                      <p className="no-address">Please select an address on the checkout page to continue.</p>
                    )}
                    
                    <div className="summary-container">
                      <h3>Order Summary</h3>
                      <div className="summary-item">
                        <span>Subtotal:</span>
                        <span>${userDataState.orderDetails?.cartItemsTotal}</span>
                      </div>
                      <div className="summary-item">
                        <span>Discount:</span>
                        <span>
                          ${(
                            userDataState.orderDetails?.cartItemsTotal -
                            userDataState.orderDetails?.cartItemsDiscountTotal
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="summary-item">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-item total">
                        <span>Total:</span>
                        <span>${userDataState.orderDetails?.cartItemsDiscountTotal}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="next-button"
                      onClick={goToNextStep}
                      disabled={!orderAddress}
                    >
                      Continue to Payment
                    </button>
                  </motion.div>
                )}
                
                {activeStep === 2 && (
                  <motion.div 
                    key="payment"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="payment-step"
                  >
                    <div className="payment-icon">
                      <FaCreditCard />
                    </div>
                    
                    <h3>Payment Details</h3>
                    
                    <div className="payment-form">
                      <div className="form-group">
                        <label htmlFor="cardName">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          placeholder="John Doe"
                          value={paymentDetails.cardName}
                          onChange={handleChange}
                          className={errors.cardName ? 'error' : ''}
                        />
                        {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentDetails.cardNumber}
                          onChange={handleChange}
                          className={errors.cardNumber ? 'error' : ''}
                        />
                        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group expiry">
                          <label>Expiration Date</label>
                          <div className="expiry-inputs">
                            <select
                              name="expMonth"
                              value={paymentDetails.expMonth}
                              onChange={handleChange}
                              className={errors.expMonth || errors.expDate ? 'error' : ''}
                            >
                              <option value="">Month</option>
                              {months.map(month => (
                                <option key={month} value={month}>
                                  {month < 10 ? `0${month}` : month}
                                </option>
                              ))}
                            </select>
                            
                            <select
                              name="expYear"
                              value={paymentDetails.expYear}
                              onChange={handleChange}
                              className={errors.expYear || errors.expDate ? 'error' : ''}
                            >
                              <option value="">Year</option>
                              {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                          {errors.expMonth && <span className="error-message">{errors.expMonth}</span>}
                          {errors.expYear && <span className="error-message">{errors.expYear}</span>}
                          {errors.expDate && <span className="error-message">{errors.expDate}</span>}
                        </div>
                        
                        <div className="form-group cvv">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentDetails.cvv}
                            onChange={handleChange}
                            className={errors.cvv ? 'error' : ''}
                          />
                          {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="final-price">
                      <span>Total Amount:</span>
                      <span className="price">${totalAmount}</span>
                    </div>
                    
                    <div className="button-group">
                      <button 
                        className="back-button"
                        onClick={goToPreviousStep}
                        disabled={isProcessing}
                      >
                        Back
                      </button>
                      <button 
                        className={`pay-button ${isProcessing ? 'processing' : ''} ${isSuccess ? 'success' : ''}`}
                        onClick={processOrder}
                        disabled={isProcessing || isSuccess}
                      >
                        {isProcessing ? 
                          'Processing...' : 
                          isSuccess ? 
                            'Payment Successful!' : 
                            `Pay $${totalAmount}`
                        }
                        {isSuccess && <FaCheck className="success-icon" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 