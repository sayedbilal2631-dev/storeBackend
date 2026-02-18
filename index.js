const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Stripe Setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running successfully ");
});

// Checkout Session Route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { product, sellerStripeAccountId } = req.body;

    // Validation
    if (!product || !product.price || !product.name) {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required",
      });
    }

    if (!sellerStripeAccountId) {
      return res.status(400).json({
        success: false,
        message: "Seller Stripe Account ID is required",
      });
    }

    // Convert price to cents
    const price = Math.round(Number(product.price) * 100);

    // Platform fee 5%
    const applicationFee = Math.round(price * 0.05);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],

      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      },

      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

//  Payment Verification Route
app.get("/verify-payment/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    if (session.payment_status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment Verified Successfully ",
        session,
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment Not Completed ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

//  Stripe Webhook (Best Practice)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Payment Success
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log(" Payment Successful:", session.id);

    }

    res.json({ received: true });
  }
);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} `);
});
