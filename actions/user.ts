"use server";

import { createUser, getUserById } from "@/utils/crud/user";

import type { User } from "@prisma/client";

export async function createUserAction(data: any) {
    return await createUser(data);
}

export async function getUserDataAction(id: string) {
    return await getUserById(id);
}