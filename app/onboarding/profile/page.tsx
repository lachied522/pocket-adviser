import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getProfileByUserId } from "@/utils/crud/user";

import ProfileForm from "./profile-form";

export default async function Page() {
    // check for existing profile
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        // middleware should handle this
        redirect('/login');
    }

    const profile = await getProfileByUserId(userId);

    return (
        <main className='min-h-screen flex items-center justify-center bg-white'>
            <ProfileForm initialValues={profile} />
        </main>
    )
}