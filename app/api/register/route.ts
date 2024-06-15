import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Body = {
    name?: string
    email: string
    password: string 
}

export async function POST(req: Request) {
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

    // create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword,
        }
    });

    return NextResponse.json(user);
}