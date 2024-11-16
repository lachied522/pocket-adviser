"use server";
import { createUser, updateUser } from "@/utils/crud/user";

import type { User } from "@prisma/client";

export async function createUserAction(data: Partial<User>) {
    return await createUser(data);
}

export async function updateUserAction(userId: string, data: Partial<User>) {
    return await updateUser(userId, data);
}