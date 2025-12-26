const router = require("express").Router();
const authorization = require("../middlewares/authorization");
const Order = require("../models/order.model");

/**
 * CREATE ORDER
 */
router.post("/", authorization, async (req, res) => {
  try {
    console.log("📦 Incoming order payload:", req.body);
    console.log("👤 Order user:", req.user._id);

    const {
      cartProducts,
      orderSummary,
      paymentDetails,
      shippingDetails,
    } = req.body;

    // 🔒 Safety validations
    if (!cartProducts || cartProducts.length === 0) {
      return res.status(400).json({ message: "Cart products missing" });
    }

    if (!orderSummary || !orderSummary.total) {
      return res.status(400).json({ message: "Order summary missing" });
    }

    if (!shippingDetails || !shippingDetails.addressLine1) {
      return res.status(400).json({ message: "Shipping details missing" });
    }

    const order = await Order.create({
      cartProducts,
      orderSummary,
      paymentDetails,
      shippingDetails,
      user: req.user._id,
    });

    console.log("✅ Order created successfully:", order._id);

    return res.status(201).json(order);

  } catch (error) {
    console.error("❌ Order creation failed:", error);

    return res.status(500).json({
      message: "Order creation failed",
      error: error.message, // keep during dev
    });
  }
});

/**
 * GET USER ORDERS
 */
router.get("/", authorization, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json(orders);

  } catch (error) {
    console.error("❌ Fetch orders failed:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});

module.exports = router;
