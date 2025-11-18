// backend/routes/paymentRoutes.js
const express = require("express");
const Stripe = require("stripe");

const router = express.Router();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover", // or your account's API version
});

// POST /api/create-payment-intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // amount must be in smallest currency unit (e.g. 78800 = ฿788.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "thb",
      //   automatic_payment_methods: { enabled: true },
      payment_method_types: ["card"],
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
