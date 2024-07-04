// import Cors from "micro-cors";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/utils/stripe/server";

import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient;

// const cors = Cors({
//   allowMethods: ["POST", "HEAD"],
// });

const secret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        
        const signature = headers().get("stripe-signature");

        if (!signature) {
            throw new Error("No stripe signature found");
        }
        
        const event = stripe.webhooks.constructEvent(body, signature, secret);
        
        switch (event.type) {
            case "checkout.session.completed": {
                // update user accountType
                // get user
                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: event.data.object.customer!.toString() }
                });

                if (!user) {
                    throw new Error("User not found for event");
                }

                // update stripe account type in db
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        accountType: "PAID",
                    }
                });

                console.log("user updated");
            }
            case "customer.subscription.deleted": {
                // update user accountType
                // get user
                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: event.data.object.customer!.toString() }
                });

                if (!user) {
                    throw new Error("User not found for event");
                }

                // update stripe account type in db
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        accountType: "FREE",
                    }
                });

                console.log("user updated");
            }
        }
        
        return NextResponse.json({ result: event, ok: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                message: "something went wrong",
                ok: false,
            },
            { status: 500 }
        );
    }
}