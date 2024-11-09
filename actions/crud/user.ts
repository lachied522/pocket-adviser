"use server";
import { createUser, getUserDataByUserId, updateUser } from "@/utils/crud/user";

import type { User } from "@prisma/client";

export async function createUserAction(data: any) {
    return await createUser(data);
}

export async function getUserDataAction(id: string) {
    return await getUserDataByUserId(id);
}

export async function updateUserAction(userId: string, data: Partial<User>) {
    return await updateUser(userId, data);
}