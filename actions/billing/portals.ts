"use server";
import { headers } from "next/headers";

import { stripe } from "@/utils/stripe/server";

import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient;

export async function createBillingPortalSession(
    user: User,
) {
    if (!user.stripeCustomerId) {
        // user is not set up with stripe
        // direct to checkout session instead
        return await createCheckoutSession(user);
    }

    // create billingportal object
    const billingPortalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
    });

    return {
        url: billingPortalSession.url,
    };
}

export async function createCheckoutSession(
    user: User
) {
    // see https://github.com/vercel/next.js/blob/canary/examples/with-stripe-typescript/app/actions/stripe.ts
    const PRICE_ID = process.env.STRIPE_PRICE_ID;
    if (!PRICE_ID) {
        throw new Error('Price id undefined');
    }

    if (!user.email) {
        throw new Error('User email is not defined');
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
        // create a new stripe customer
        const customer = await stripe.customers.create({
            ...(user.name? {name: user.name}: {}),
            email: user.email,
        });

        stripeCustomerId = customer.id;
    }

    const origin: string = headers().get("origin") as string;

    // create checkout object
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
            {
              price: PRICE_ID,
              quantity: 1,
            },
        ],
        success_url: origin,
        customer: stripeCustomerId,
    });

    if (!user.stripeCustomerId) {
        // update stripe customer id in db
        await prisma.user.update({
            where: { id: user.id },
            data: {
                stripeCustomerId,
            }
        });
    }
        
    return {
        client_secret: session.client_secret,
        url: session.url,
    };
}