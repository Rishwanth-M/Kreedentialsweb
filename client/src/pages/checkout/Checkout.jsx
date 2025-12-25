import {
  isCheckoutFormEmpty,
  validateEmail,
  validateMobile,
  validatePinCode
} from "../../utils/formValidator";

import { CheckoutOrderSummary } from "../../components/checkout/CheckoutOrderSummary";
import { CheckoutForm } from "../../components/checkout/CheckoutForm";
import {
  Box,
  Checkbox,
  Flex,
  Text,
  useToast
} from "@chakra-ui/react";
import { setToast } from "../../utils/extraFunctions";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { initPayment } from "../payment/razorpay";
import { useEffect, useState } from "react";
import axios from "axios";
import { updateCartDetails } from "../../redux/features/cart/actions";
import { useNavigate } from "react-router-dom";

export const Checkout = () => {
  const { orderSummary, cartProducts } = useSelector(
    (state) => state.cartReducer,
    shallowEqual
  );
  const token = useSelector((state) => state.authReducer.token);

  const initState = {
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    locality: "",
    pinCode: "",
    state: "",
    country: "",
    email: "",
    mobile: "",
  };

  const [form, setForm] = useState(initState);
  const [saveAddress, setSaveAddress] = useState(false);

  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleInputChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  // 🔹 Save address ONLY if checkbox is checked
  const saveAddressIfNeeded = async () => {
    if (!saveAddress) {
      console.log("➡️ Save address unchecked — skipping DB save");
      return;
    }

    try {
      console.log("📤 Saving address to DB:", form);

      await axios.post("/users/addresses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Address saved in MongoDB");

      toast({
        title: "Address saved to your account",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("❌ Failed to save address", error);
      toast({
        title: "Failed to save address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 🔹 Validation
  const handleFormValidation = (form) => {
    const isEmpty = isCheckoutFormEmpty(form);
    if (!isEmpty.status) {
      setToast(toast, isEmpty.message, "error");
      return false;
    }

    const isEmail = validateEmail(form.email);
    if (!isEmail.status) {
      setToast(toast, isEmail.message, "error");
      return false;
    }

    const isPinCode = validatePinCode(form.pinCode);
    if (!isPinCode.status) {
      setToast(toast, isPinCode.message, "error");
      return false;
    }

    const isMobile = validateMobile(form.mobile);
    if (!isMobile.status) {
      setToast(toast, isMobile.message, "error");
      return false;
    }

    return true;
  };

  // 🔹 Submit checkout
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!handleFormValidation(form)) return;

    // ✅ Save address only if checkbox is checked
    await saveAddressIfNeeded();

    try {
      const { data } = await axios.post("/api/payment/order", {
        amount: orderSummary.total,
      });

      if (data.demo) {
        await axios.post(
          "/order",
          {
            cartProducts,
            shippingDetails: form,
            paymentDetails: {
              paymentMode: "DEMO",
              paymentStatus: "SUCCESS",
            },
            orderSummary,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        dispatch(updateCartDetails());
        setToast(toast, "Order placed successfully", "success");
        navigate("/orders");
        return;
      }

      initPayment(
        form,
        data,
        orderSummary,
        cartProducts,
        token,
        toast,
        dispatch,
        navigate
      );
    } catch (error) {
      console.error("❌ Checkout failed", error);
      setToast(toast, "Checkout failed", "error");
    }
  };

  return (
    <Box
      p="20px"
      my="30px"
      mx="auto"
      maxW="1200px"
      display="grid"
      gap="10%"
      gridTemplateColumns={["100%", "100%", "55% 35%"]}
    >
      {/* 🔹 LEFT */}
      <Box>
        <CheckoutForm onChange={handleInputChange} />

        <Flex mt="5">
          <Checkbox
            isChecked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
          >
            Save this address to my account
          </Checkbox>
        </Flex>
      </Box>

      {/* 🔹 RIGHT */}
      <CheckoutOrderSummary
        onClick={handleFormSubmit}
        orderSummary={orderSummary}
      />
    </Box>
  );
};
