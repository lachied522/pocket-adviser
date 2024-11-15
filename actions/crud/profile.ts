"use server";
import { updateProfile } from "@/utils/crud/profile";

import type { Profile } from "@prisma/client";

export async function updateProfileAction(userId: string, profile: Partial<Profile>) {
    return await updateProfile(userId, profile);
}