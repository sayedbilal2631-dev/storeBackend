exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Payment Completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    await admin.firestore().collection("orders").add({
      sessionId: session.id,
      customerEmail: session.customer_details.email,
      amount: session.amount_total / 100,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "paid",
    });
  }

  res.json({ received: true });
});
