import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

import { COOKIE_NAME_FOR_USER_ID, COOKIE_NAME_FOR_IS_GUEST } from "@/constants/cookies";

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
        return new NextResponse("User already exists", { status: 400 });
    }

    // create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    // check if user exists as a guest
    const isGuestCookie = cookieStore.get(COOKIE_NAME_FOR_IS_GUEST);
    if (isGuestCookie && isGuestCookie.value === "true") {
        // add credentials to existing user
        const userCookie = cookieStore.get(COOKIE_NAME_FOR_USER_ID);
        user = await prisma.user.update({
            where: { id: userCookie!.value },
            data: {
                name,
                email,
                hashedPassword,
                guest: false,
            }
        });

        // set is guest cookie to false
        cookieStore.set(COOKIE_NAME_FOR_IS_GUEST, "false");
    } else {
        // create brand new user
        user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
            }
        });
    }

    return NextResponse.json(user);
}