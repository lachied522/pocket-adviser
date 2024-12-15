import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getProfileByUserId } from "@/utils/crud/profile";

import { H3 } from "@/components/ui/typography";

import { ProfileProvider } from "./context";
import ProfileForm from "./components/profile-form";

export default async function ProfilePage() {
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        redirect('/login');
    }

    const profile = await getProfileByUserId(userId);

    return (
        <ProfileProvider initialProfile={profile}>
            <div className='flex-1 p-3 overflow-y-scroll'>
                <div className='w-full max-w-6xl mx-auto'>
                    <div className='flex flex-col gap-3'>
                        <H3>My Profile</H3>
                        <p>Tell Pocket Adviser about yourself so it can provide accurate suggestions.</p>
                    </div>

                    <ProfileForm />
                </div>
            </div>
        </ProfileProvider>
    )
}