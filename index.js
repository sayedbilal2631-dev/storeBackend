const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test route (IMPORTANT)
app.get("/", (req, res) => {
    res.send("Backend is running ");
});

// Checkout route
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { product, sellerStripeAccountId } = req.body;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Test Product",
                        },
                        unit_amount: 2000,
                    },
                    quantity: 1,
                },
            ],
            // payment_intent_data: {
            //     transfer_data: {
            //         destination: "acct_1N2abcXYZdummy123", 
            //     },
            // },
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });


        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Start server (ONLY THIS)
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
