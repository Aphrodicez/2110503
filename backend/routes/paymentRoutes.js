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

router.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    submit_type: "book",
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: "Skibidi",
            images: [
              "https://static.wikitide.net/skibiditoiletwiki/5/5c/Episode_1_thumbnail.png",
            ],
          },
          unit_amount: 19900,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:4242/success",
    payment_intent_data: {
      receipt_email: "chayanin15632@gmail.com",
    },
    payment_method_types: ["card"],
  });

  return res.json({ url: session.url });
});

module.exports = router;
