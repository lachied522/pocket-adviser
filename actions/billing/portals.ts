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

    const origin: string = headers().get("origin") as string;

    // create checkout object
    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
            {
              price: PRICE_ID,
              quantity: 1,
            },
        ],
        success_url: origin,
        ...(
            user.stripeCustomerId ? {
                customer: user.stripeCustomerId
            } : {
                ...(
                    user.email? {
                        customer_email: user.email
                    } : {}
                )
            }
        ),
    });

    return {
        client_secret: checkoutSession.client_secret,
        url: checkoutSession.url,
    };
}

export async function handleCheckoutSuccess(
    user: User,
    checkoutSessionID: string,
) {
    // retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionID);

    if (!session.customer) {
        console.error(`Something went wrong generating Stripe customer ID for client ${user.id}`);
        return;
    }

    // update db
    if (user.stripeCustomerId !== session.customer.toString()) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                stripeCustomerId: session.customer.toString(),
            }
        });
    }
}