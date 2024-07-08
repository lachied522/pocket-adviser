"use server";
import { updateProfile } from "@/utils/crud/profile";

import type { Profile } from "@prisma/client";

export async function updateProfileAction(profile: Profile) {
    return await updateProfile(profile);
}