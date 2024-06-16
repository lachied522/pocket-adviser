import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

import { COOKIE_NAME_FOR_GUEST_USER_ID } from "@/constants/cookies";

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
    const guestCookie = cookieStore.get(COOKIE_NAME_FOR_GUEST_USER_ID);
    if (guestCookie) {
        // add credentials to existing user
        user = await prisma.user.update({
            where: { id: guestCookie.value },
            data: {
                name,
                email,
                hashedPassword,
                guest: false,
            }
        });

        // clear guest user cookie
        cookieStore.delete(COOKIE_NAME_FOR_GUEST_USER_ID);
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