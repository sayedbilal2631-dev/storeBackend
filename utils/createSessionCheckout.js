exports.createCheckoutSession = functions.https.onCall(
    async (data, context) => {

        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Login required"
            );
        }

        const { cartItems, sellerStripeAccountId } = data;

        const line_items = cartItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        // Platform Fee Example (10%)
        const totalAmount = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const platformFee = Math.floor(totalAmount * 0.1 * 100);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],

            line_items,

            success_url: `${data.domain}/success`,
            cancel_url: `${data.domain}/cart`,

            payment_intent_data: {
                application_fee_amount: platformFee,
                transfer_data: {
                    destination: sellerStripeAccountId,
                },
            },
        });

        return { url: session.url };
    }
);
