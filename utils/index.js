const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});
