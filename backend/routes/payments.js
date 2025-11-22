const express = require("express");
const {
  createPaymentIntent,
  createCheckoutSession,
  finalizeBooking,
} = require("../controllers/payments");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/finalize-booking", protect, finalizeBooking);

module.exports = router;
