const Stripe = require("stripe");
const Campground = require("../models/Campground");
const Booking = require("../models/Booking");

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover", // or your account's API version
});

const ensureUrlString = (rawUrl, fallbackUrl) => {
  try {
    return new URL(rawUrl || fallbackUrl).toString();
  } catch (err) {
    console.warn("Invalid Stripe redirect URL, using fallback", err);
    return new URL(fallbackUrl).toString();
  }
};

const ensureStatusParam = (href, statusValue) => {
  if (!statusValue) return href;
  const url = new URL(href);
  if (!url.searchParams.has("status")) {
    url.searchParams.set("status", statusValue);
  }
  return url.toString();
};

const ensureSessionPlaceholder = (href) => {
  const url = new URL(href);
  if (url.searchParams.has("session_id")) {
    return href;
  }
  const [base, hash] = href.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return (
    `${base}${separator}session_id={CHECKOUT_SESSION_ID}` +
    (hash ? `#${hash}` : "")
  );
};

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Public (or Private depending on usage, currently no protect middleware in original for this route?)
// Note: Original code didn't have protect on create-payment-intent, but usually it should.
// I will keep it as is from the route file.
exports.createPaymentIntent = async (req, res) => {
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
};

// @desc    Create checkout session
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
  try {
    const { campgroundId, bookingDate, customerEmail } = req.body || {};

    if (!campgroundId || !bookingDate) {
      return res
        .status(400)
        .json({ error: "campgroundId and bookingDate are required" });
    }

    const campground = await Campground.findById(campgroundId);
    if (!campground) {
      return res.status(404).json({ error: "Campground not found" });
    }

    if (typeof campground.price !== "number") {
      return res
        .status(400)
        .json({ error: "Campground price is not configured" });
    }

    const unitAmount = Math.max(0, Math.round(campground.price * 100));
    const imageUrl =
      campground.image ||
      `https://source.unsplash.com/featured/800x600/?camping,${encodeURIComponent(
        campground.province
      )}`;

    const successUrl = ensureSessionPlaceholder(
      ensureStatusParam(
        ensureUrlString(
          process.env.STRIPE_SUCCESS_URL,
          "http://localhost:8080/my-bookings"
        ),
        "success"
      )
    );
    const cancelUrl = ensureStatusParam(
      ensureUrlString(
        process.env.STRIPE_CANCEL_URL,
        `http://localhost:8080/book/${campgroundId}`
      ),
      "cancelled"
    );

    const metadata = {
      campgroundId,
      bookingDate,
      campgroundName: campground.name,
      userId: req.user.id,
    };

    const session = await stripe.checkout.sessions.create({
      submit_type: "book",
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `${campground.name} booking`,
              description: `${campground.district}, ${
                campground.province
              } — ${new Date(bookingDate).toDateString()}`,
              images: imageUrl ? [imageUrl] : undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ["card"],
      customer_email: req.user?.email || customerEmail || undefined,
      metadata,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Unable to create checkout session" });
  }
};

// @desc    Finalize booking after payment
// @route   POST /api/v1/payments/finalize-booking
// @access  Private
exports.finalizeBooking = async (req, res) => {
  try {
    const { sessionId } = req.body || {};

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.error("Stripe session retrieval failed", err);
      return res.status(400).json({ error: "Invalid checkout session" });
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(400).json({ error: "Checkout session not paid" });
    }

    const { campgroundId, bookingDate, userId } = session.metadata || {};

    if (!campgroundId || !bookingDate || !userId) {
      return res
        .status(400)
        .json({ error: "Session metadata incomplete for booking" });
    }

    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Checkout session does not belong to this user" });
    }

    const normalizedDate = new Date(bookingDate);
    if (Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ error: "Invalid booking date" });
    }

    const campground = await Campground.findById(campgroundId);
    if (!campground) {
      return res.status(404).json({ error: "Campground not found" });
    }

    let booking = await Booking.findOne({
      user: req.user.id,
      campground: campgroundId,
      bookingDate: normalizedDate,
    });
    const hadExistingBooking = Boolean(booking);

    if (!booking) {
      booking = await Booking.create({
        user: req.user.id,
        campground: campgroundId,
        bookingDate: normalizedDate,
        paymentStatus: "paid",
      });
    } else if (booking.paymentStatus !== "paid") {
      booking.paymentStatus = "paid";
      await booking.save();
    }

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: "campground",
      select:
        "name address district province postalcode region tel image price",
    });

    return res.status(200).json({
      success: true,
      alreadyExists: hadExistingBooking,
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Finalize booking error:", error);
    return res
      .status(500)
      .json({ error: "Unable to finalize booking for this session" });
  }
};
