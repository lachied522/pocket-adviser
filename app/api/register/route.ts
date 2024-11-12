import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

const prisma = new PrismaClient();

type Body = {
    name?: string
    email: string
    password: string
}

export async function POST(req: Request) {
    const cookieStore = cookies();
    const { email, password, name } = await req.json() as Body;

    // check if user already exists
    const exist = await prisma.user.findUnique({
        where: { email },
    });

    if (exist) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // check if user exists as a guest
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;
    if (userId) {
        try {
            // add credentials to existing user
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    name,
                    email,
                    hashedPassword,
                    accountType: "FREE",
                }
            });
            return NextResponse.json(user);
        } catch (e) {
            // something went wrong converting guest account
            console.log("Could not convert guest user: ", e);
        }
    }

    // create brand new user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword,
        }
    });

    // update cookies
    cookieStore.set(COOKIE_NAME_FOR_USER_ID, user.id);
    return NextResponse.json(user);
}