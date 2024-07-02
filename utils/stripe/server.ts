import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY!,
    {
    // https://github.com/stripe/stripe-node#configuration
        appInfo: {
            name: "loyalty-exchange",
            url: "https://loyaltyexchange.com.au",
        },
    }
);